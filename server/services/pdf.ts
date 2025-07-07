import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { PitchDeckContent, PitchSlide } from "./openai.js";

export async function generatePitchDeckPDF(pitchContent: PitchDeckContent, watermark: boolean = false): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const primaryColor = rgb(0.149, 0.388, 0.922); // #2563EB
    const textColor = rgb(0.2, 0.2, 0.2);
    const lightGrayColor = rgb(0.95, 0.95, 0.95);

    // Title page
    const titlePage = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = titlePage.getSize();

    // Title page content
    titlePage.drawRectangle({
      x: 0,
      y: height - 200,
      width: width,
      height: 200,
      color: primaryColor,
    });

    titlePage.drawText(sanitizeTextForPDF(pitchContent.title), {
      x: 50,
      y: height - 100,
      size: 32,
      font: helveticaBoldFont,
      color: rgb(1, 1, 1),
    });

    titlePage.drawText("AI-Generated Pitch Deck", {
      x: 50,
      y: height - 140,
      size: 16,
      font: helveticaFont,
      color: rgb(1, 1, 1),
    });

    titlePage.drawText("Powered by ProtoLab", {
      x: 50,
      y: height - 170,
      size: 12,
      font: helveticaFont,
      color: rgb(1, 1, 1),
    });

    // Generate slide pages
    for (const slide of pitchContent.slides) {
      const page = pdfDoc.addPage([595, 842]);
      await createSlidePage(page, slide, helveticaFont, helveticaBoldFont, primaryColor, textColor, lightGrayColor, watermark);
    }

    // Insights page
    const insightsPage = pdfDoc.addPage([595, 842]);
    await createInsightsPage(insightsPage, pitchContent.insights, helveticaFont, helveticaBoldFont, primaryColor, textColor, lightGrayColor, watermark);

    return await pdfDoc.save();
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function createSlidePage(
  page: any,
  slide: PitchSlide,
  regularFont: any,
  boldFont: any,
  primaryColor: any,
  textColor: any,
  lightGrayColor: any,
  watermark: boolean = false
) {
  const { width, height } = page.getSize();
  
  // Header
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: lightGrayColor,
  });

  // Slide number
  page.drawText(`${slide.slideNumber}/10`, {
    x: width - 80,
    y: height - 30,
    size: 12,
    font: regularFont,
    color: textColor,
  });

  // Title
  page.drawText(sanitizeTextForPDF(slide.title), {
    x: 50,
    y: height - 50,
    size: 24,
    font: boldFont,
    color: primaryColor,
  });

  // Content
  let yPosition = height - 120;
  for (const contentItem of slide.content) {
    const wrappedText = wrapText(contentItem, 500, regularFont, 14);
    for (const line of wrappedText) {
      page.drawText(`• ${sanitizeTextForPDF(line)}`, {
        x: 50,
        y: yPosition,
        size: 14,
        font: regularFont,
        color: textColor,
      });
      yPosition -= 20;
    }
    yPosition -= 10;
  }

  // Key points section
  if (slide.keyPoints.length > 0) {
    yPosition -= 20;
    page.drawText("Key Insights:", {
      x: 50,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: primaryColor,
    });
    yPosition -= 30;

    for (const keyPoint of slide.keyPoints) {
      const wrappedText = wrapText(keyPoint, 500, regularFont, 12);
      for (const line of wrappedText) {
        page.drawText(`• ${sanitizeTextForPDF(line)}`, {
          x: 70,
          y: yPosition,
          size: 12,
          font: regularFont,
          color: textColor,
        });
        yPosition -= 18;
      }
    }
  }

  // Add watermark if enabled
  if (watermark) {
    page.drawText("UPGRADE TO REMOVE WATERMARK", {
      x: width / 2 - 120,
      y: height / 2,
      size: 20,
      font: boldFont,
      color: rgb(0.9, 0.9, 0.9),
      opacity: 0.3,
      rotate: { type: 'degrees', angle: -45 },
    });
  }
}

async function createInsightsPage(
  page: any,
  insights: any,
  regularFont: any,
  boldFont: any,
  primaryColor: any,
  textColor: any,
  lightGrayColor: any,
  watermark: boolean = false
) {
  const { width, height } = page.getSize();
  
  // Header
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: lightGrayColor,
  });

  page.drawText("Market Insights & Analysis", {
    x: 50,
    y: height - 50,
    size: 24,
    font: boldFont,
    color: primaryColor,
  });

  let yPosition = height - 120;

  const insightSections = [
    { title: "Market Size", content: insights.marketSize },
    { title: "Revenue Projection", content: insights.revenueProjection },
    { title: "Competitive Advantage", content: insights.competitiveAdvantage },
    { title: "Go-to-Market Strategy", content: insights.marketStrategy }
  ];

  for (const section of insightSections) {
    page.drawText(sanitizeTextForPDF(section.title), {
      x: 50,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: primaryColor,
    });
    yPosition -= 25;

    const wrappedContent = wrapText(section.content, 500, regularFont, 12);
    for (const line of wrappedContent) {
      page.drawText(sanitizeTextForPDF(line), {
        x: 50,
        y: yPosition,
        size: 12,
        font: regularFont,
        color: textColor,
      });
      yPosition -= 18;
    }
    yPosition -= 20;
  }

  // Add watermark if enabled
  if (watermark) {
    page.drawText("UPGRADE TO REMOVE WATERMARK", {
      x: width / 2 - 120,
      y: height / 2,
      size: 20,
      font: boldFont,
      color: rgb(0.9, 0.9, 0.9),
      opacity: 0.3,
      rotate: { type: 'degrees', angle: -45 },
    });
  }
}

function sanitizeTextForPDF(text: string): string {
  return text
    .replace(/→/g, '->')
    .replace(/•/g, '*')
    .replace(/–/g, '-')
    .replace(/—/g, '--')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/[^\x00-\x7F]/g, ''); // Remove any remaining non-ASCII characters
}

function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (textWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}
