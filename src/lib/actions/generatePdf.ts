"use server";

import { join } from "path";
import fs from "fs/promises";
import sharp from "sharp";
import getGridFSBucket from "@/lib/mongodb/gridfs";
import { ObjectId } from "mongodb";
import { getAllImagesByType } from "@/lib/mongodb/imageUpload";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { getQuartersByArchitecture } from "@/lib/actions/building";
import { AppartmentType } from "@/types/building";

const floorLabels: Record<string, string> = {
  G: "Ground Floor",
  "1": "1st Floor",
  "2": "2nd Floor",
  "3": "3rd Floor",
};

export async function generateAppartmentPdf({
  arch,
  type,
  floor,
  code,
}: {
  arch: number;
  type: string;
  floor: string;
  code: string;
}): Promise<Buffer> {
  try {
    // Fetch appartment data
    const quarters = await getQuartersByArchitecture(arch);
    const quarter = quarters.find((q) => q.appartmentType === type);
    const appartment: AppartmentType | undefined = quarter?.appartments.find(
      (a) => a.floor === floor
    );

    if (!appartment) throw new Error("Appartment not found");

    // Calculate prices
    const appartmentTotal = appartment.space * appartment.pricePerMeter;
    const gardenTotal =
      appartment.floor === "G" &&
      appartment.gardenSpace &&
      appartment.gardenPricePerMeter
        ? appartment.gardenSpace * appartment.gardenPricePerMeter
        : 0;
    const totalPrice = appartmentTotal + gardenTotal;

    // Installment plans
    const plans = [
      { years: 6,  quarters: 24, downRate: 0.05,  quarterlyRate: 0.0375 },
      { years: 7,  quarters: 28, downRate: 0.07,  quarterlyRate: 0.0314 },
      { years: 8,  quarters: 32, downRate: 0.10,  quarterlyRate: 0.0266 },
      { years: 9,  quarters: 36, downRate: 0.12,  quarterlyRate: 0.0231 },
      { years: 10, quarters: 40, downRate: 0.15,  quarterlyRate: 0.02   },
    ];

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const standardFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const arabicFontPath = join(process.cwd(), "public/fonts/Amiri-Regular.ttf");
    const arabicFontBytes = await fs.readFile(arabicFontPath);
    const amiriFont = await pdfDoc.embedFont(arabicFontBytes, {
      subset: false,
      features: { liga: true, rlig: true, calt: true, ccmp: true },
    });

    const pageWidth = 600;
    const pageHeight = 800;

    // ─── Page 1: Floor Plan ───────────────────────────────────────────────────
    // NOTE: File naming is `type-{type}-model-{model}-{ground|ver}.webp`
    // (e.g. type-a-model-a-ground.webp, type-a-model-a-ver.webp, type-a-model-b-ver.webp).
    // There is no "model" field on the appartment data to know which model (a/b, etc.)
    // to pick, so this scans the folder and uses the first matching file for the type
    // and orientation (ground vs. ver). If you track model per-appartment, pass it in
    // and replace the "find" below with an exact filename match.
    try {
      const suffix = floor === "G" ? "ground" : "ver";
      const floorPlansDir = join(process.cwd(), "public/assets/floor_plans");
      const filesInDir = await fs.readdir(floorPlansDir);
      const typeLower = type.toLowerCase();

      const matchingFile = filesInDir.find((f) => {
        const lower = f.toLowerCase();
        return (
          lower.startsWith(`type-${typeLower}-model-`) &&
          lower.endsWith(`-${suffix}.webp`)
        );
      });

      if (!matchingFile) {
        throw new Error(
          `No floor plan file found for type "${type}" with suffix "${suffix}" in ${floorPlansDir}`
        );
      }

      const floorPlanPath = join(floorPlansDir, matchingFile);
      const floorPlanBuffer = await fs.readFile(floorPlanPath);
      const converted = await sharp(floorPlanBuffer).png().toBuffer();
      const floorImage = await pdfDoc.embedPng(converted);
      const floorPage = pdfDoc.addPage([pageWidth, pageHeight]);

      floorPage.drawText("Floor Plan", {
        x: (pageWidth - boldFont.widthOfTextAtSize("Floor Plan", 20)) / 2,
        y: pageHeight - 60,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      const maxWidth = 500;
      const scaleFactor = maxWidth / floorImage.width;
      floorPage.drawImage(floorImage, {
        x: (pageWidth - floorImage.width * scaleFactor) / 2,
        y: pageHeight - 100 - floorImage.height * scaleFactor,
        width: floorImage.width * scaleFactor,
        height: floorImage.height * scaleFactor,
      });
    } catch (e) { console.error("Floor plan error:", e); }

    // ─── Page 2: Appartment Info ──────────────────────────────────────────────
    const infoPage = pdfDoc.addPage([pageWidth, pageHeight]);
    const logoMarginTop = 40;
    const logoWidth = 100;

    // Logos
    try {
      const telalPath = join(process.cwd(), "public/assets/etalaLogo_light.png");
      const telalBuffer = await fs.readFile(telalPath);
      const telalImage = await pdfDoc.embedPng(telalBuffer);
      const telalHeight = (telalImage.height / telalImage.width) * logoWidth;
      infoPage.drawImage(telalImage, {
        x: 40,
        y: pageHeight - telalHeight - logoMarginTop,
        width: logoWidth + 20,
        height: telalHeight,
      });
    } catch (e) { console.error("Telal logo error:", e); }

    try {
      const jeddahPath = join(process.cwd(), "public/assets/elmanara-light.png");
      const jeddahBuffer = await fs.readFile(jeddahPath);
      const jeddahImage = await pdfDoc.embedPng(jeddahBuffer);
      const jeddahHeight = (jeddahImage.height / jeddahImage.width) * logoWidth;
      infoPage.drawImage(jeddahImage, {
        x: pageWidth - logoWidth - 40,
        y: pageHeight - jeddahHeight - logoMarginTop,
        width: logoWidth,
        height: jeddahHeight,
      });
    } catch (e) { console.error("Jeddah logo error:", e); }

    let currentY = pageHeight - logoMarginTop - 80;

    // Title
    infoPage.drawText("Appartment Information", {
      x: (pageWidth - boldFont.widthOfTextAtSize("Appartment Information", 20)) / 2,
      y: currentY,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    currentY -= 40;

    // Info table data
    const tableData: [string, string][] = [
      ["Architecture",    `#${arch}`],
      ["Appartment Type", `Type ${type}`],
      ["Floor",           floorLabels[floor] ?? floor],
      ["Code",            code],
      ["Space",           `${appartment.space} m²`],
      ["Price per m²",    `EGP ${appartment.pricePerMeter.toLocaleString()}`],
      ["Appartment Total",`EGP ${appartmentTotal.toLocaleString()}`],
      ...(appartment.floor === "G" && appartment.gardenSpace
        ? [
            ["Garden Space",        `${appartment.gardenSpace} m²`] as [string, string],
            ["Garden Price/m²",     `EGP ${appartment.gardenPricePerMeter?.toLocaleString() ?? 0}`] as [string, string],
            ["Garden Total",        `EGP ${gardenTotal.toLocaleString()}`] as [string, string],
          ]
        : []),
      ["Total Price",     `EGP ${totalPrice.toLocaleString()}`],
    ];

    const rowHeight = 30;
    const col1 = 250;
    const col2 = 250;
    const tableWidth = col1 + col2;
    const tableX = (pageWidth - tableWidth) / 2;

    for (const [label, value] of tableData) {
      infoPage.drawRectangle({
        x: tableX,
        y: currentY - 5,
        width: col1,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      infoPage.drawRectangle({
        x: tableX + col1,
        y: currentY - 5,
        width: col2,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      infoPage.drawText(label, {
        x: tableX + 10,
        y: currentY + 8,
        size: 13,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      infoPage.drawText(value, {
        x: tableX + col1 + 10,
        y: currentY + 8,
        size: 13,
        font: standardFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= rowHeight;
    }

    // ─── Page 3: Installment Table ────────────────────────────────────────────
    const installPage = pdfDoc.addPage([pageWidth, pageHeight]);
    installPage.drawText("Payment Plans", {
      x: (pageWidth - boldFont.widthOfTextAtSize("Payment Plans", 20)) / 2,
      y: pageHeight - 60,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    const headers = ["Years", "Quarters", "Down %", "Down Value", "Qtr %", "Qtr Value", "Handover 5%", "Maint 8%"];
    const colWidths = [50, 55, 45, 80, 45, 80, 75, 70];
    const installTableX = 20;
    const installRowH = 30;
    let installY = pageHeight - 100;

    // Header row
    let cx = installTableX;
    for (let i = 0; i < headers.length; i++) {
      installPage.drawRectangle({ x: cx, y: installY - 5, width: colWidths[i], height: installRowH, borderColor: rgb(0,0,0), borderWidth: 1 });
      installPage.drawText(headers[i], { x: cx + 4, y: installY + 8, size: 9, font: boldFont, color: rgb(0,0,0) });
      cx += colWidths[i];
    }
    installY -= installRowH;

    // Plan rows
    for (const plan of plans) {
      const downVal   = totalPrice * plan.downRate;
      const qtrVal    = totalPrice * plan.quarterlyRate;
      const handover  = totalPrice * 0.05;
      const maint     = totalPrice * 0.08;

      const rowValues = [
        `${plan.years} Yrs`,
        String(plan.quarters),
        `${(plan.downRate * 100).toFixed(0)}%`,
        `EGP ${Math.round(downVal).toLocaleString()}`,
        `${(plan.quarterlyRate * 100).toFixed(2)}%`,
        `EGP ${Math.round(qtrVal).toLocaleString()}`,
        `EGP ${Math.round(handover).toLocaleString()}`,
        `EGP ${Math.round(maint).toLocaleString()}`,
      ];

      cx = installTableX;
      for (let i = 0; i < rowValues.length; i++) {
        installPage.drawRectangle({ x: cx, y: installY - 5, width: colWidths[i], height: installRowH, borderColor: rgb(0,0,0), borderWidth: 1 });
        installPage.drawText(rowValues[i], { x: cx + 4, y: installY + 8, size: 9, font: standardFont, color: rgb(0.1,0.1,0.1) });
        cx += colWidths[i];
      }
      installY -= installRowH;
    }

    // ─── Pages 4+: Main Gallery ───────────────────────────────────────────────
    // Uses the same "GALLERY" image type as the site's Main Gallery page
    // (see getImagesFromDataBase -> type "Main Gallery" -> getAllImagesByType("GALLERY")).
    try {
      const bucket = await getGridFSBucket();
      const galleryImages = await getAllImagesByType("GALLERY");

      if (galleryImages?.length > 0) {
        const imagesPerPage = 3;
        const imageWidth = 400;
        const imageHeight = 200;
        const spacing = 40;
        const totalHeight = imagesPerPage * imageHeight + (imagesPerPage - 1) * spacing;
        const startX = (pageWidth - imageWidth) / 2;
        const startY = (pageHeight - totalHeight) / 2;

        for (let pageIndex = 0; pageIndex < Math.ceil(galleryImages.length / imagesPerPage); pageIndex++) {
          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          page.drawText("Gallery", {
            x: (pageWidth - boldFont.widthOfTextAtSize("Gallery", 20)) / 2,
            y: pageHeight - 40,
            size: 20,
            font: boldFont,
            color: rgb(0, 0, 0),
          });

          for (let i = 0; i < imagesPerPage; i++) {
            const imageIndex = pageIndex * imagesPerPage + i;
            if (imageIndex >= galleryImages.length) break;
            const image = galleryImages[imageIndex];
            try {
              const fileId = new ObjectId(image.fileId);
              const stream = bucket.openDownloadStream(fileId);
              const chunks: Uint8Array[] = [];
              const imgBuffer = await new Promise<Buffer>((resolve, reject) => {
                stream.on("data", (chunk) => chunks.push(chunk));
                stream.on("error", reject);
                stream.on("end", () => resolve(Buffer.concat(chunks)));
              });
              const pngBuffer = await sharp(imgBuffer).resize({ width: imageWidth, height: imageHeight, fit: "cover" }).png().toBuffer();
              const embedded = await pdfDoc.embedPng(pngBuffer);
              const y = startY + (imagesPerPage - 1 - i) * (imageHeight + spacing);
              page.drawImage(embedded, { x: startX, y, width: imageWidth, height: imageHeight });
              page.drawText(`Image ${imageIndex + 1}`, { x: startX + imageWidth / 2 - 25, y: y - 20, size: 12, font: standardFont, color: rgb(0,0,0) });
            } catch (e) { console.error(`Gallery image ${imageIndex + 1} error:`, e); }
          }
        }
      }
    } catch (e) { console.error("Gallery error:", e); }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error("Failed to generate PDF");
  }
}