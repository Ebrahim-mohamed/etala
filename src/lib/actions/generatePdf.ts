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

// Row-shading colors shared by the info table and the installment table so
// both look consistent. Opacity is used (rather than fully opaque fills) so
// the shading reads as a subtle stripe over the page background instead of
// blocking it out completely.
const tableHeaderFill = rgb(1, 1, 1);
const tableRowFillEven = rgb(1, 1, 1);
const tableRowFillOdd = rgb(1, 1, 1);
const tableFillOpacity = 0.85;

type GalleryImage = { fileId?: string };

// Draws the shared background image so it COVERS the full page (like CSS
// background-size: cover), preserving its native aspect ratio instead of
// stretching it to the page's width/height. The image is scaled up just
// enough that both dimensions meet or exceed the page size, then centered —
// any overflow simply falls outside the page's MediaBox and is not rendered,
// which gives the same visual result as a CSS "cover" background.
// Callers must draw this FIRST, right after `pdfDoc.addPage(...)`, before any
// other content on that page.
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

  const imgWidth = backgroundImage.width;
  const imgHeight = backgroundImage.height;
  if (!imgWidth || !imgHeight) return;

  const coverScale = Math.max(pageWidth / imgWidth, pageHeight / imgHeight);
  const drawWidth = imgWidth * coverScale;
  const drawHeight = imgHeight * coverScale;

  page.drawImage(backgroundImage, {
    x: (pageWidth - drawWidth) / 2,
    y: (pageHeight - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });
}

// Renders a set of gallery images (already fetched from the DB) across as
// many PDF pages as needed, laid out in a `cols` x `rows` grid per page,
// preserving each image's aspect ratio (no crop, no upscale) and centering
// it within its slot. `cols`/`rows` let callers use a different density per
// gallery (e.g. 2x2 for the appartment gallery, 2x4 for the main gallery).
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
  cols,
  rows,
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
  cols: number;
  rows: number;
}): Promise<void> {
  if (!images || images.length === 0) return;

  const imagesPerPage = cols * rows;

  const sideMargin = 40;
  const colGap = 20;
  const rowGap = 20; // gap between the rows of slots, in addition to caption space
  const topMargin = 80; // space reserved below the page title
  const bottomMargin = 40;
  // Denser grids (more rows) get a smaller caption so it still fits comfortably.
  const captionFontSize = rows > 2 ? 9 : 12;
  const captionSpace = captionFontSize + 6; // room reserved under each slot for its caption
  const captionOffset = captionFontSize + 3; // distance below the drawn image to the caption baseline

  const slotWidth = (pageWidth - 2 * sideMargin - (cols - 1) * colGap) / cols;
  const availableHeight = pageHeight - topMargin - bottomMargin;
  const slotHeight = (availableHeight - rows * captionSpace - (rows - 1) * rowGap) / rows;

  const gridStartX = sideMargin;
  const gridTopY = pageHeight - topMargin; // top edge of the row-0 slots

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
            width: Math.round(slotWidth),
            height: Math.round(slotHeight),
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

        const col = i % cols;
        const row = Math.floor(i / cols);
        const slotX = gridStartX + col * (slotWidth + colGap);
        const slotTopY = gridTopY - row * (slotHeight + captionSpace + rowGap);
        const slotBottomY = slotTopY - slotHeight;

        const offsetX = (slotWidth - drawWidth) / 2;
        const offsetY = (slotHeight - drawHeight) / 2;

        page.drawImage(embedded, {
          x: slotX + offsetX,
          y: slotBottomY + offsetY,
          width: drawWidth,
          height: drawHeight,
        });

        const captionText = `Image ${imageIndex + 1}`;
        const captionWidth = standardFont.widthOfTextAtSize(captionText, captionFontSize);
        page.drawText(captionText, {
          x: slotX + slotWidth / 2 - captionWidth / 2,
          y: slotBottomY - captionOffset,
          size: captionFontSize,
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
    // drawPageBackground() below scales it with a "cover" fit (preserving
    // aspect ratio) instead of stretching it to the exact page dimensions.
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
    combinedPage.drawText("Apartment Information", {
      x: (pageWidth - boldFont.widthOfTextAtSize("Apartment Information", 20)) / 2,
      y: currentY,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    currentY -= 40;

    // Info table data
    const tableData: [string, string][] = [
      ["Architecture",    `#${arch}`],
      ["Apartment Type", `Type ${type}`],
      ["Floor",           floorLabels[floor] ?? floor],
      ["Code",            code],
      ["Space",           `${appartment.space} m²`],
      ["Price per m²",    `EGP ${appartment.pricePerMeter.toLocaleString()}`],
      ["Apartment Total",`EGP ${appartmentTotal.toLocaleString()}`],
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

    tableData.forEach(([label, value], rowIndex) => {
      const rowFill = rowIndex % 2 === 0 ? tableRowFillEven : tableRowFillOdd;

      combinedPage.drawRectangle({
        x: tableX,
        y: currentY - 5,
        width: col1,
        height: rowHeight,
        color: rowFill,
        opacity: tableFillOpacity,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      combinedPage.drawRectangle({
        x: tableX + col1,
        y: currentY - 5,
        width: col2,
        height: rowHeight,
        color: rowFill,
        opacity: tableFillOpacity,
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
    });

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
      combinedPage.drawRectangle({
        x: cx,
        y: installY - 5,
        width: colWidths[i],
        height: installRowH,
        color: tableHeaderFill,
        opacity: tableFillOpacity,
        borderColor: rgb(0,0,0),
        borderWidth: 1,
      });
      combinedPage.drawText(headers[i], { x: cx + 4, y: installY + 5, size: 9, font: boldFont, color: rgb(0,0,0) });
      cx += colWidths[i];
    }
    installY -= installRowH;

    // Plan rows
    plans.forEach((plan, planIndex) => {
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

      const rowFill = planIndex % 2 === 0 ? tableRowFillEven : tableRowFillOdd;

      cx = installTableX;
      for (let i = 0; i < rowValues.length; i++) {
        combinedPage.drawRectangle({
          x: cx,
          y: installY - 5,
          width: colWidths[i],
          height: installRowH,
          color: rowFill,
          opacity: tableFillOpacity,
          borderColor: rgb(0,0,0),
          borderWidth: 1,
        });
        combinedPage.drawText(rowValues[i], { x: cx + 4, y: installY + 5, size: 9, font: standardFont, color: rgb(0.1,0.1,0.1) });
        cx += colWidths[i];
      }
      installY -= installRowH;
    });

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
    // same mapping used by the site's SpecificTypeGallery page, laid out 2x2
    // (4 per page). Main gallery uses "GALLERY", same as the site's main
    // Gallery page, laid out 2x4 (8 per page) since there are usually more
    // photos to get through. Both preserve each image's native aspect ratio
    // (e.g. 3000x4000) with no cropping.
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
            title: "Apartment Gallery",
            pageWidth,
            pageHeight,
            boldFont,
            standardFont,
            backgroundImage,
            cols: 2,
            rows: 2,
          });
        } catch (e) { console.error("Appartment gallery error:", e); }
      }

      // try {
      //   const mainGalleryImages = await getAllImagesByType("GALLERY");
      //   await renderGalleryPages({
      //     pdfDoc,
      //     bucket,
      //     images: mainGalleryImages,
      //     title: "Gallery",
      //     pageWidth,
      //     pageHeight,
      //     boldFont,
      //     standardFont,
      //     backgroundImage,
      //     cols: 2,
      //     rows: 4,
      //   });
      // } catch (e) { console.error("Main gallery error:", e); }
    } catch (e) { console.error("Gallery error:", e); }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error("Failed to generate PDF");
  }
}