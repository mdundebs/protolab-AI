// Modern template system for documents
export interface Template {
  id: string;
  name: string;
  category: 'resume' | 'business_plan' | 'pitch_deck';
  tier: 'free' | 'premium';
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  layout: string;
}

// Free templates (5 modern designs)
export const FREE_TEMPLATES: Template[] = [
  {
    id: 'modern_minimal',
    name: 'Modern Minimal',
    category: 'resume',
    tier: 'free',
    preview: '/templates/modern-minimal.jpg',
    colors: { primary: '#2563eb', secondary: '#64748b', accent: '#0f172a' },
    layout: 'single_column'
  },
  {
    id: 'tech_startup',
    name: 'Tech Startup',
    category: 'resume',
    tier: 'free',
    preview: '/templates/tech-startup.jpg',
    colors: { primary: '#7c3aed', secondary: '#6b7280', accent: '#111827' },
    layout: 'two_column'
  },
  {
    id: 'creative_pro',
    name: 'Creative Professional',
    category: 'resume',
    tier: 'free',
    preview: '/templates/creative-pro.jpg',
    colors: { primary: '#059669', secondary: '#6b7280', accent: '#1f2937' },
    layout: 'modern_grid'
  },
  {
    id: 'executive_classic',
    name: 'Executive Classic',
    category: 'resume',
    tier: 'free',
    preview: '/templates/executive-classic.jpg',
    colors: { primary: '#dc2626', secondary: '#6b7280', accent: '#374151' },
    layout: 'traditional'
  },
  {
    id: 'african_heritage',
    name: 'African Heritage',
    category: 'resume',
    tier: 'free',
    preview: '/templates/african-heritage.jpg',
    colors: { primary: '#f59e0b', secondary: '#8b5cf6', accent: '#065f46' },
    layout: 'cultural_modern'
  }
];

// Premium templates (15 additional designs)
export const PREMIUM_TEMPLATES: Template[] = [
  {
    id: 'silicon_valley',
    name: 'Silicon Valley Pro',
    category: 'resume',
    tier: 'premium',
    preview: '/templates/silicon-valley.jpg',
    colors: { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#1e293b' },
    layout: 'tech_modern'
  },
  {
    id: 'investment_banker',
    name: 'Investment Banking',
    category: 'resume',
    tier: 'premium',
    preview: '/templates/investment-banker.jpg',
    colors: { primary: '#1f2937', secondary: '#6b7280', accent: '#gold' },
    layout: 'finance_executive'
  },
  {
    id: 'venture_capital',
    name: 'Venture Capital',
    category: 'business_plan',
    tier: 'premium',
    preview: '/templates/vc-ready.jpg',
    colors: { primary: '#1e40af', secondary: '#3730a3', accent: '#0ea5e9' },
    layout: 'investor_focused'
  },
  {
    id: 'african_unicorn',
    name: 'African Unicorn',
    category: 'business_plan',
    tier: 'premium',
    preview: '/templates/african-unicorn.jpg',
    colors: { primary: '#16a34a', secondary: '#ca8a04', accent: '#dc2626' },
    layout: 'startup_showcase'
  },
  {
    id: 'fintech_disruptor',
    name: 'FinTech Disruptor',
    category: 'business_plan',
    tier: 'premium',
    preview: '/templates/fintech-disruptor.jpg',
    colors: { primary: '#7c2d12', secondary: '#059669', accent: '#0369a1' },
    layout: 'tech_financial'
  }
  // ... 10 more premium templates
];

export function getAllTemplates(): Template[] {
  return [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES];
}

export function getTemplatesByTier(tier: 'free' | 'premium'): Template[] {
  return tier === 'free' ? FREE_TEMPLATES : [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES];
}

export function getTemplateById(id: string): Template | undefined {
  return getAllTemplates().find(template => template.id === id);
}

// Template application functions
export async function applyResumeTemplate(templateId: string, data: any): Promise<Buffer> {
  const template = getTemplateById(templateId);
  if (!template) throw new Error('Template not found');

  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  // Apply template-specific styling
  const colors = template.colors;
  const primaryColor = hexToRgb(colors.primary);
  const secondaryColor = hexToRgb(colors.secondary);

  let currentY = height - 60;

  // Template-specific layouts
  switch (template.layout) {
    case 'modern_grid':
      return applyModernGridLayout(pdfDoc, page, data, colors);
    case 'two_column':
      return applyTwoColumnLayout(pdfDoc, page, data, colors);
    case 'cultural_modern':
      return applyCulturalModernLayout(pdfDoc, page, data, colors);
    default:
      return applyDefaultLayout(pdfDoc, page, data, colors);
  }
}

async function applyModernGridLayout(pdfDoc: any, page: any, data: any, colors: any): Promise<Buffer> {
  const { StandardFonts, rgb } = await import('pdf-lib');
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  const primaryColor = hexToRgb(colors.primary);
  
  // Header section with colored background
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(primaryColor.r, primaryColor.g, primaryColor.b),
  });

  // Name in header
  page.drawText(data.personalInfo.name, {
    x: 30,
    y: height - 60,
    size: 28,
    font: helveticaBoldFont,
    color: rgb(1, 1, 1),
  });

  // Contact info in header
  page.drawText(`${data.personalInfo.email} | ${data.personalInfo.phone}`, {
    x: 30,
    y: height - 90,
    size: 12,
    font: helveticaFont,
    color: rgb(0.9, 0.9, 0.9),
  });

  // Content sections with modern spacing
  let currentY = height - 160;
  
  // Skills in grid format
  page.drawText('CORE COMPETENCIES', {
    x: 30,
    y: currentY,
    size: 14,
    font: helveticaBoldFont,
    color: rgb(primaryColor.r, primaryColor.g, primaryColor.b),
  });

  currentY -= 30;
  const skills = data.skills.split(',').slice(0, 8);
  for (let i = 0; i < skills.length; i += 2) {
    page.drawText(`• ${skills[i].trim()}`, {
      x: 30,
      y: currentY,
      size: 11,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    if (skills[i + 1]) {
      page.drawText(`• ${skills[i + 1].trim()}`, {
        x: 300,
        y: currentY,
        size: 11,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }
    currentY -= 20;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function applyTwoColumnLayout(pdfDoc: any, page: any, data: any, colors: any): Promise<Buffer> {
  // Left column: Contact, Skills, Education
  // Right column: Experience, Achievements
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function applyCulturalModernLayout(pdfDoc: any, page: any, data: any, colors: any): Promise<Buffer> {
  // African-inspired design with modern elements
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function applyDefaultLayout(pdfDoc: any, page: any, data: any, colors: any): Promise<Buffer> {
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}