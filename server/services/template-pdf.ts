import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface StyledDeckData {
  title: string;
  subtitle: string;
  slides: Array<{
    id: string;
    type: string;
    title: string;
    content: string[];
    notes?: string;
    styling?: any;
    templateFeatures?: string[];
  }>;
  styling: {
    template: string;
    theme: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
    };
    layout: {
      logoPosition: string;
      includeNotes: boolean;
      includeCharts: boolean;
    };
  };
  branding?: {
    companyName: string;
    tagline?: string;
  };
}

export async function generateStyledPDF(deckData: StyledDeckData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  // Convert hex colors to RGB
  const primaryColor = hexToRgb(deckData.styling.colors.primary);
  const secondaryColor = hexToRgb(deckData.styling.colors.secondary);
  const accentColor = hexToRgb(deckData.styling.colors.accent);
  
  // Load fonts
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const lightFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Generate title slide
  await createTitleSlide(pdfDoc, deckData, headingFont, bodyFont, primaryColor, accentColor);
  
  // Generate content slides
  for (let i = 0; i < deckData.slides.length; i++) {
    const slide = deckData.slides[i];
    await createContentSlide(
      pdfDoc, 
      slide, 
      i + 2, // Slide number (after title slide)
      headingFont, 
      bodyFont, 
      primaryColor, 
      secondaryColor,
      accentColor,
      deckData.styling.template
    );
  }

  // Add template-specific branding
  await addTemplateBranding(pdfDoc, deckData.styling.template, deckData.branding);

  return pdfDoc.save();
}

async function createTitleSlide(
  pdfDoc: PDFDocument,
  deckData: StyledDeckData,
  headingFont: any,
  bodyFont: any,
  primaryColor: any,
  accentColor: any
) {
  const page = pdfDoc.addPage([792, 612]); // Standard slide dimensions
  const { width, height } = page.getSize();

  // Add template-specific background elements
  await addTemplateBackground(page, deckData.styling.template, width, height, accentColor);

  // Title
  page.drawText(deckData.branding?.companyName || deckData.title, {
    x: 60,
    y: height - 200,
    size: 48,
    font: headingFont,
    color: primaryColor,
  });

  // Subtitle
  if (deckData.subtitle || deckData.branding?.tagline) {
    page.drawText(deckData.subtitle || deckData.branding?.tagline || '', {
      x: 60,
      y: height - 260,
      size: 24,
      font: bodyFont,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  // Template-specific elements
  await addTemplateElements(page, deckData.styling.template, width, height, primaryColor, accentColor);

  // Footer with template attribution
  page.drawText(`Template: ${getTemplateName(deckData.styling.template)} | Theme: ${getThemeName(deckData.styling.theme)}`, {
    x: 60,
    y: 40,
    size: 10,
    font: bodyFont,
    color: rgb(0.6, 0.6, 0.6),
  });
}

async function createContentSlide(
  pdfDoc: PDFDocument,
  slide: any,
  slideNumber: number,
  headingFont: any,
  bodyFont: any,
  primaryColor: any,
  secondaryColor: any,
  accentColor: any,
  templateId: string
) {
  const page = pdfDoc.addPage([792, 612]);
  const { width, height } = page.getSize();

  // Add template-specific background
  await addTemplateBackground(page, templateId, width, height, accentColor);

  // Slide number
  page.drawText(`${slideNumber}`, {
    x: width - 60,
    y: height - 40,
    size: 12,
    font: bodyFont,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Slide title
  page.drawText(slide.title, {
    x: 60,
    y: height - 100,
    size: 32,
    font: headingFont,
    color: primaryColor,
  });

  // Content bullets
  let yPosition = height - 180;
  slide.content.forEach((bullet: string, index: number) => {
    // Bullet point
    page.drawText('•', {
      x: 80,
      y: yPosition,
      size: 16,
      font: bodyFont,
      color: accentColor,
    });

    // Bullet text with word wrapping
    const wrappedText = wrapText(bullet, 600, bodyFont, 16);
    wrappedText.forEach((line, lineIndex) => {
      page.drawText(line, {
        x: 110,
        y: yPosition - (lineIndex * 20),
        size: 16,
        font: bodyFont,
        color: rgb(0.2, 0.2, 0.2),
      });
    });

    yPosition -= Math.max(40, wrappedText.length * 20);
  });

  // Template-specific slide enhancements
  await addSlideEnhancements(page, slide, templateId, width, height, primaryColor, accentColor);
}

async function addTemplateBackground(
  page: any,
  templateId: string,
  width: number,
  height: number,
  accentColor: any
) {
  switch (templateId) {
    case 'african_enterprise':
      // Add subtle geometric patterns inspired by African art
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: 20,
        color: rgb(accentColor.r * 0.3, accentColor.g * 0.3, accentColor.b * 0.3),
      });
      page.drawRectangle({
        x: 0,
        y: height - 20,
        width: width,
        height: 20,
        color: rgb(accentColor.r * 0.3, accentColor.g * 0.3, accentColor.b * 0.3),
      });
      break;
      
    case 'agritech_green':
      // Add nature-inspired elements
      page.drawRectangle({
        x: width - 100,
        y: 0,
        width: 100,
        height: height,
        color: rgb(accentColor.r * 0.1, accentColor.g * 0.1, accentColor.b * 0.1),
      });
      break;
      
    case 'fintech_blue':
      // Add professional grid lines
      for (let i = 0; i < 5; i++) {
        page.drawLine({
          start: { x: 0, y: height - (i * height / 5) },
          end: { x: width, y: height - (i * height / 5) },
          thickness: 0.5,
          color: rgb(accentColor.r * 0.1, accentColor.g * 0.1, accentColor.b * 0.1),
        });
      }
      break;
  }
}

async function addTemplateElements(
  page: any,
  templateId: string,
  width: number,
  height: number,
  primaryColor: any,
  accentColor: any
) {
  switch (templateId) {
    case 'african_enterprise':
      // Add cultural motifs placeholder
      page.drawText('🌍', {
        x: width - 120,
        y: height - 120,
        size: 48,
        color: rgb(accentColor.r * 0.6, accentColor.g * 0.6, accentColor.b * 0.6),
      });
      break;
      
    case 'agritech_green':
      // Add agricultural symbols
      page.drawText('🌱', {
        x: width - 120,
        y: height - 120,
        size: 48,
        color: rgb(accentColor.r * 0.6, accentColor.g * 0.6, accentColor.b * 0.6),
      });
      break;
      
    case 'fintech_blue':
      // Add security badge placeholder
      page.drawRectangle({
        x: width - 150,
        y: height - 150,
        width: 80,
        height: 30,
        borderColor: primaryColor,
        borderWidth: 2,
      });
      break;
  }
}

async function addSlideEnhancements(
  page: any,
  slide: any,
  templateId: string,
  width: number,
  height: number,
  primaryColor: any,
  accentColor: any
) {
  // Add template-specific slide enhancements based on slide type
  if (slide.type === 'chart' && slide.templateFeatures?.includes('Growth charts')) {
    // Add chart placeholder for AgriTech template
    page.drawRectangle({
      x: width - 250,
      y: height / 2 - 100,
      width: 200,
      height: 150,
      borderColor: rgb(primaryColor.r, primaryColor.g, primaryColor.b),
      borderWidth: 1,
    });
    
    page.drawText('📊 Chart Data', {
      x: width - 200,
      y: height / 2,
      size: 14,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Add impact metrics for social impact slides
  if (templateId === 'social_impact' || slide.templateFeatures?.includes('Impact visualization')) {
    page.drawText('📈 Impact Metrics', {
      x: width - 200,
      y: 100,
      size: 12,
      color: rgb(accentColor.r, accentColor.g, accentColor.b),
    });
  }
}

async function addTemplateBranding(
  pdfDoc: PDFDocument,
  templateId: string,
  branding?: any
) {
  // Add template-specific branding elements to all pages
  const pages = pdfDoc.getPages();
  
  pages.forEach((page, index) => {
    if (index === 0) return; // Skip title page
    
    // Add consistent branding footer
    page.drawText(`${branding?.companyName || 'Your Company'} | ProtoLab Generated`, {
      x: 60,
      y: 20,
      size: 8,
      color: rgb(0.7, 0.7, 0.7),
    });
  });
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    // Approximate text width (simplified calculation)
    const textWidth = testLine.length * fontSize * 0.6;
    
    if (textWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

function getTemplateName(templateId: string): string {
  const names: Record<string, string> = {
    'african_enterprise': 'African Enterprise',
    'agritech_green': 'AgriTech Green',
    'fintech_blue': 'FinTech Professional',
    'healthtech_care': 'HealthTech Care',
    'edtech_bright': 'EdTech Bright',
    'social_impact': 'Social Impact',
    'startup_minimal': 'Startup Minimal',
    'energy_power': 'Energy & Power'
  };
  return names[templateId] || 'Custom Template';
}

function getThemeName(themeId: string): string {
  const names: Record<string, string> = {
    'ubuntu': 'Ubuntu Spirit',
    'sahara': 'Sahara Gold',
    'savanna': 'Savanna Green',
    'kente': 'Kente Pattern',
    'baobab': 'Baobab Blue',
    'nile': 'Nile Flow'
  };
  return names[themeId] || 'Custom Theme';
}