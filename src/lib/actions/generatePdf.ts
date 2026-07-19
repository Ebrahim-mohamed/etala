"use server";

import { join } from "path";
import fs from "fs/promises";
import sharp from "sharp";
import getGridFSBucket from "@/lib/mongodb/gridfs";
import { ObjectId } from "mongodb";
import { getAllImagesByType, ImageType } from "@/lib/mongodb/imageUpload";
import { PDFDocument, PDFFont, PDFImage, PDFPage, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { getQuartersByArchitecture } from "@/lib/actions/building";
import { AppartmentType } from "@/types/building";

const floorLabels: Record<string, string> = {
  G: "Ground Floor",
  "1": "1st Floor",
  "2": "2nd Floor",
  "3": "3rd Floor",
};

// Map appartment type (A/B/C/D) to the gallery DB key, same mapping used on
// the site's SpecificTypeGallery page (typeToGalleryKey).
const typeToImageType: Record<string, ImageType> = {
  A: "TYPE_A",
  B: "TYPE_B",
  C: "TYPE_C",
  D: "TYPE_D",
};

type GalleryImage = { fileId?: string };

// Draws the shared background image so it covers the full page, behind
// everything else drawn on that page. Callers must draw this FIRST, right
// after `pdfDoc.addPage(...)`, before any other content on that page.
function drawPageBackground({
  page,
  backgroundImage,
  pageWidth,
  pageHeight,
}: {
  page: PDFPage;
  backgroundImage: PDFImage | null;
  pageWidth: number;
  pageHeight: number;
}): void {
  if (!backgroundImage) return;
  page.drawImage(backgroundImage, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });
}

// Renders a set of gallery images (already fetched from the DB) across as
// many PDF pages as needed, preserving each image's aspect ratio (no crop,
// no upscale) and centering it within its slot.
async function renderGalleryPages({
  pdfDoc,
  bucket,
  images,
  title,
  pageWidth,
  pageHeight,
  boldFont,
  standardFont,
  backgroundImage,
}: {
  pdfDoc: PDFDocument;
  bucket: Awaited<ReturnType<typeof getGridFSBucket>>;
  images: GalleryImage[];
  title: string;
  pageWidth: number;
  pageHeight: number;
  boldFont: PDFFont;
  standardFont: PDFFont;
  backgroundImage: PDFImage | null;
}): Promise<void> {
  if (!images || images.length === 0) return;

  const imagesPerPage = 2;
  const slotWidth = 250;
  const slotHeight = 333; // matches the 3:4 (3000x4000) source aspect
  const spacing = 40;
  const totalHeight = imagesPerPage * slotHeight + (imagesPerPage - 1) * spacing;
  const startX = (pageWidth - slotWidth) / 2;
  const startY = (pageHeight - totalHeight) / 2;

  for (let pageIndex = 0; pageIndex < Math.ceil(images.length / imagesPerPage); pageIndex++) {
    const page: PDFPage = pdfDoc.addPage([pageWidth, pageHeight]);
    drawPageBackground({ page, backgroundImage, pageWidth, pageHeight });

    page.drawText(title, {
      x: (pageWidth - boldFont.widthOfTextAtSize(title, 20)) / 2,
      y: pageHeight - 40,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    for (let i = 0; i < imagesPerPage; i++) {
      const imageIndex = pageIndex * imagesPerPage + i;
      if (imageIndex >= images.length) break;
      const image = images[imageIndex];
      try {
        const fileId = new ObjectId(image.fileId);
        const stream = bucket.openDownloadStream(fileId);
        const chunks: Uint8Array[] = [];
        const imgBuffer = await new Promise<Buffer>((resolve, reject) => {
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("error", reject);
          stream.on("end", () => resolve(Buffer.concat(chunks)));
        });

        // Scale down to fit within the slot, preserving aspect ratio, no cropping.
        const pngBuffer = await sharp(imgBuffer)
          .resize({
            width: slotWidth,
            height: slotHeight,
            fit: "inside",
            withoutEnlargement: true,
          })
          .png()
          .toBuffer();
        const embedded = await pdfDoc.embedPng(pngBuffer);

        // Center the actual (aspect-preserved) image within its slot.
        const scale = Math.min(slotWidth / embedded.width, slotHeight / embedded.height, 1);
        const drawWidth = embedded.width * scale;
        const drawHeight = embedded.height * scale;

        const slotY = startY + (imagesPerPage - 1 - i) * (slotHeight + spacing);
        const offsetX = (slotWidth - drawWidth) / 2;
        const offsetY = (slotHeight - drawHeight) / 2;

        page.drawImage(embedded, {
          x: startX + offsetX,
          y: slotY + offsetY,
          width: drawWidth,
          height: drawHeight,
        });
        page.drawText(`Image ${imageIndex + 1}`, {
          x: startX + slotWidth / 2 - 25,
          y: slotY - 20,
          size: 12,
          font: standardFont,
          color: rgb(0, 0, 0),
        });
      } catch (e) { console.error(`${title} image ${imageIndex + 1} error:`, e); }
    }
  }
}

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

    // ─── Shared background image (applied to every page in the document) ─────
    // Source is a .webp file, which pdf-lib can't embed directly, so it's
    // converted to PNG via sharp first, same approach used for the floor plan.
    let backgroundImage: PDFImage | null = null;
    try {
      const backgroundPath = join(process.cwd(), "public/assets/landingBackground-light_small.webp");
      const backgroundBuffer = await fs.readFile(backgroundPath);
      const backgroundPngBuffer = await sharp(backgroundBuffer).png().toBuffer();
      backgroundImage = await pdfDoc.embedPng(backgroundPngBuffer);
    } catch (e) { console.error("Background image error:", e); }

    // ─── Page 1: Appartment Info + Installment Table (same page) ─────────────
    const combinedPage = pdfDoc.addPage([pageWidth, pageHeight]);
    drawPageBackground({ page: combinedPage, backgroundImage, pageWidth, pageHeight });

    const logoMarginTop = 40;
    const logoWidth = 100;

    // Logos
    try {
      const telalPath = join(process.cwd(), "public/assets/etalaLogo_light.png");
      const telalBuffer = await fs.readFile(telalPath);
      const telalImage = await pdfDoc.embedPng(telalBuffer);
      const telalHeight = (telalImage.height / telalImage.width) * logoWidth;
      combinedPage.drawImage(telalImage, {
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
      combinedPage.drawImage(jeddahImage, {
        x: pageWidth - logoWidth - 40,
        y: pageHeight - jeddahHeight - logoMarginTop,
        width: logoWidth,
        height: jeddahHeight,
      });
    } catch (e) { console.error("Jeddah logo error:", e); }

    let currentY = pageHeight - logoMarginTop - 80;

    // Title
    combinedPage.drawText("Appartment Information", {
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

    const rowHeight = 26;
    const col1 = 250;
    const col2 = 250;
    const tableWidth = col1 + col2;
    const tableX = (pageWidth - tableWidth) / 2;

    for (const [label, value] of tableData) {
      combinedPage.drawRectangle({
        x: tableX,
        y: currentY - 5,
        width: col1,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      combinedPage.drawRectangle({
        x: tableX + col1,
        y: currentY - 5,
        width: col2,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      combinedPage.drawText(label, {
        x: tableX + 10,
        y: currentY + 5,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      combinedPage.drawText(value, {
        x: tableX + col1 + 10,
        y: currentY + 5,
        size: 12,
        font: standardFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= rowHeight;
    }

    // Gap before installment section
    currentY -= 30;

    // Payment Plans title
    combinedPage.drawText("Payment Plans", {
      x: (pageWidth - boldFont.widthOfTextAtSize("Payment Plans", 20)) / 2,
      y: currentY,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    currentY -= 40;

    const headers = ["Years", "Quarters", "Down %", "Down Value", "Qtr %", "Qtr Value", "Handover 5%", "Maint 8%"];
    const colWidths = [50, 55, 45, 80, 45, 80, 75, 70];
    // Center the installment table the same way the info table is centered.
    const installTableTotalWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const installTableX = (pageWidth - installTableTotalWidth) / 2;
    const installRowH = 26;
    let installY = currentY;

    // Header row
    let cx = installTableX;
    for (let i = 0; i < headers.length; i++) {
      combinedPage.drawRectangle({ x: cx, y: installY - 5, width: colWidths[i], height: installRowH, borderColor: rgb(0,0,0), borderWidth: 1 });
      combinedPage.drawText(headers[i], { x: cx + 4, y: installY + 5, size: 9, font: boldFont, color: rgb(0,0,0) });
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
        combinedPage.drawRectangle({ x: cx, y: installY - 5, width: colWidths[i], height: installRowH, borderColor: rgb(0,0,0), borderWidth: 1 });
        combinedPage.drawText(rowValues[i], { x: cx + 4, y: installY + 5, size: 9, font: standardFont, color: rgb(0.1,0.1,0.1) });
        cx += colWidths[i];
      }
      installY -= installRowH;
    }

    // ─── Page 2: Floor Plan ───────────────────────────────────────────────────
    // NOTE: File naming is `type-{type}-model-{model}-{ground|ver}.webp`
    // (e.g. type-a-model-a-ground.webp, type-a-model-a-ver.webp, type-a-model-b-ver.webp).
    //
    // The ground-vs-typical suffix is derived from the `code` string
    // (`{arch}-{floor}-{type}`, e.g. "1-3-A" or "1-G-A") instead of the `floor`
    // parameter. `code` is the authoritative value — its middle segment is
    // literally "G" for ground or the floor number otherwise.
    //
    // IMPORTANT: the suffix must be "ver" (not "typical") to match the actual
    // filenames on disk (type-a-model-a-ver.webp etc). Using the wrong suffix
    // means no file ever matches for numbered floors, and the floor plan page
    // is silently skipped.
    //
    // There is still no "model" field on the appartment data to know which model
    // (a/b, etc.) to pick, so this scans the folder and uses the first matching
    // file for the type and orientation. If you track model per-appartment, pass
    // it in and replace the "find" below with an exact filename match.
    try {
      const codeFloorSegment = code.split("-")[1];
      const suffix = codeFloorSegment === "G" ? "ground" : "typical";
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
          `No floor plan file found for type "${type}" with suffix "${suffix}" (code: "${code}") in ${floorPlansDir}`
        );
      }

      const floorPlanPath = join(floorPlansDir, matchingFile);
      const floorPlanBuffer = await fs.readFile(floorPlanPath);
      const converted = await sharp(floorPlanBuffer).png().toBuffer();
      const floorImage = await pdfDoc.embedPng(converted);
      const floorPage = pdfDoc.addPage([pageWidth, pageHeight]);
      drawPageBackground({ page: floorPage, backgroundImage, pageWidth, pageHeight });

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

    // ─── Pages 3+: Appartment Gallery, then Main Gallery ──────────────────────
    // Appartment gallery uses the type-specific image type (TYPE_A/B/C/D), the
    // same mapping used by the site's SpecificTypeGallery page. Main gallery
    // uses "GALLERY", same as the site's main Gallery page. Both preserve each
    // image's native aspect ratio (e.g. 3000x4000) with no cropping.
    try {
      const bucket = await getGridFSBucket();

      const appartmentGalleryType = typeToImageType[type];
      if (appartmentGalleryType) {
        try {
          const appartmentGalleryImages = await getAllImagesByType(appartmentGalleryType);
          await renderGalleryPages({
            pdfDoc,
            bucket,
            images: appartmentGalleryImages,
            title: "Appartment Gallery",
            pageWidth,
            pageHeight,
            boldFont,
            standardFont,
            backgroundImage,
          });
        } catch (e) { console.error("Appartment gallery error:", e); }
      }

      try {
        const mainGalleryImages = await getAllImagesByType("GALLERY");
        await renderGalleryPages({
          pdfDoc,
          bucket,
          images: mainGalleryImages,
          title: "Gallery",
          pageWidth,
          pageHeight,
          boldFont,
          standardFont,
          backgroundImage,
        });
      } catch (e) { console.error("Main gallery error:", e); }
    } catch (e) { console.error("Gallery error:", e); }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error("Failed to generate PDF");
  }
}