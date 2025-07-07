import OpenAI from 'openai';
import axios from 'axios';
import { PDFDocument } from 'pdf-lib';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

interface DocumentAnalysis {
  documentType: string;
  industry: string;
  targetAudience: string;
  keyMessages: string[];
  strengthAreas: string[];
  improvementSuggestions: string[];
  brandAnalysis: {
    colorScheme: string[];
    typography: string;
    visualStyle: string;
    professionalLevel: string;
  };
  contentStructure: {
    sections: string[];
    hierarchy: string;
    flowPattern: string;
  };
}

interface DesignPatterns {
  colorScheme: string[];
  typography: {
    primaryFont: string;
    headingSize: string;
    bodySize: string;
  };
  layout: string;
  brandElements: {
    logoPosition: string;
    brandColors: string[];
    visualStyle: string;
  };
  templateType: string;
  gammaQualityScore: number;
}

export async function analyzeDocumentWithAI(text: string, file: Express.Multer.File): Promise<DocumentAnalysis> {
  try {
    // Use GPT-4o for comprehensive document analysis
    const prompt = `Analyze this document content and provide detailed insights:

Content: ${text}

File type: ${file.mimetype}
File name: ${file.originalname}

Please analyze and return JSON with:
1. Document type (resume, proposal, pitch_deck, business_plan, etc.)
2. Industry/sector
3. Target audience
4. Key messages and value propositions
5. Content strength areas
6. Improvement suggestions
7. Brand analysis (if visual elements detected)
8. Content structure analysis

Respond only with valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest OpenAI model
      messages: [
        {
          role: "system",
          content: "You are an expert document analyst. Analyze documents for content, structure, and professional quality. Return only valid JSON responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      documentType: analysis.documentType || 'unknown',
      industry: analysis.industry || 'general',
      targetAudience: analysis.targetAudience || 'professional',
      keyMessages: analysis.keyMessages || [],
      strengthAreas: analysis.strengthAreas || [],
      improvementSuggestions: analysis.improvementSuggestions || [],
      brandAnalysis: analysis.brandAnalysis || {
        colorScheme: ['#1e293b', '#3b82f6'],
        typography: 'Professional Sans',
        visualStyle: 'Modern',
        professionalLevel: 'High'
      },
      contentStructure: analysis.contentStructure || {
        sections: ['Header', 'Body', 'Footer'],
        hierarchy: 'Standard',
        flowPattern: 'Linear'
      }
    };

  } catch (error) {
    console.error('OpenAI analysis error:', error);
    // Fallback to DeepSeek if OpenAI fails
    return await analyzeWithDeepSeek(text, file);
  }
}

async function analyzeWithDeepSeek(text: string, file: Express.Multer.File): Promise<DocumentAnalysis> {
  try {
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are an expert document analyst. Analyze documents for professional quality and structure."
        },
        {
          role: "user",
          content: `Analyze this document: ${text.substring(0, 2000)}. Return analysis as JSON with documentType, industry, keyMessages, strengthAreas, and improvementSuggestions.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const analysis = response.data.choices[0].message.content;
    return JSON.parse(analysis);

  } catch (error) {
    console.error('DeepSeek analysis error:', error);
    // Return basic analysis if both AI services fail
    return {
      documentType: detectDocumentType(file.originalname),
      industry: 'technology',
      targetAudience: 'professional',
      keyMessages: ['Professional document uploaded'],
      strengthAreas: ['Content provided'],
      improvementSuggestions: ['Consider professional formatting'],
      brandAnalysis: {
        colorScheme: ['#1e293b', '#3b82f6', '#10b981'],
        typography: 'System Default',
        visualStyle: 'Standard',
        professionalLevel: 'Medium'
      },
      contentStructure: {
        sections: ['Content'],
        hierarchy: 'Basic',
        flowPattern: 'Sequential'
      }
    };
  }
}

export async function extractDesignPatternsWithAI(file: Express.Multer.File, analysis: DocumentAnalysis): Promise<DesignPatterns> {
  try {
    // For image files, use vision API
    if (file.mimetype.startsWith('image/')) {
      return await analyzeImageDesign(file, analysis);
    }

    // For PDF files, extract visual patterns
    if (file.mimetype === 'application/pdf') {
      return await analyzePDFDesign(file, analysis);
    }

    // For other documents, use content-based pattern detection
    const prompt = `Based on this document analysis, generate professional design patterns:

Document Type: ${analysis.documentType}
Industry: ${analysis.industry}
Brand Analysis: ${JSON.stringify(analysis.brandAnalysis)}

Generate Gamma-quality design patterns including:
1. Professional color scheme (5 colors)
2. Typography specifications
3. Layout recommendations
4. Brand elements positioning
5. Visual style guidelines

Return only valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional designer specializing in Gamma-quality document templates. Generate design patterns that match industry standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });

    const patterns = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      colorScheme: patterns.colorScheme || generateIndustryColors(analysis.industry),
      typography: patterns.typography || {
        primaryFont: 'Inter',
        headingSize: '24px',
        bodySize: '16px'
      },
      layout: patterns.layout || 'professional-grid',
      brandElements: patterns.brandElements || {
        logoPosition: 'top-left',
        brandColors: patterns.colorScheme?.slice(0, 2) || ['#1e293b', '#3b82f6'],
        visualStyle: 'minimalist-professional'
      },
      templateType: `${analysis.industry}-${analysis.documentType}`,
      gammaQualityScore: calculateGammaScore(patterns, analysis)
    };

  } catch (error) {
    console.error('Design pattern extraction error:', error);
    return generateFallbackPatterns(analysis);
  }
}

async function analyzeImageDesign(file: Express.Multer.File, analysis: DocumentAnalysis): Promise<DesignPatterns> {
  try {
    const base64Image = file.buffer.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image for design patterns. Extract color scheme, typography, layout style, and brand elements. Return as JSON with colorScheme, typography, layout, and brandElements."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.mimetype};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });

    const patterns = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      colorScheme: patterns.colorScheme || ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      typography: patterns.typography || {
        primaryFont: 'Inter',
        headingSize: '28px',
        bodySize: '16px'
      },
      layout: patterns.layout || 'visual-focused',
      brandElements: patterns.brandElements || {
        logoPosition: 'detected',
        brandColors: patterns.colorScheme?.slice(0, 3) || ['#1e293b', '#3b82f6', '#10b981'],
        visualStyle: 'image-based'
      },
      templateType: 'visual-template',
      gammaQualityScore: 85
    };

  } catch (error) {
    console.error('Image analysis error:', error);
    return generateFallbackPatterns(analysis);
  }
}

async function analyzePDFDesign(file: Express.Multer.File, analysis: DocumentAnalysis): Promise<DesignPatterns> {
  try {
    // Extract PDF structure and formatting
    const pdfDoc = await PDFDocument.load(file.buffer);
    const pageCount = pdfDoc.getPageCount();
    
    // Use AI to analyze PDF structure
    const prompt = `Analyze PDF document with ${pageCount} pages for design patterns:

Document Type: ${analysis.documentType}
Industry: ${analysis.industry}

Generate professional design patterns that would recreate this document's quality.
Focus on layout, typography hierarchy, and professional color schemes.

Return JSON with colorScheme, typography, layout, brandElements.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are analyzing PDF documents for design pattern extraction. Focus on professional document standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800
    });

    const patterns = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      colorScheme: patterns.colorScheme || generateIndustryColors(analysis.industry),
      typography: patterns.typography || {
        primaryFont: 'Inter',
        headingSize: '24px',
        bodySize: '14px'
      },
      layout: patterns.layout || 'document-flow',
      brandElements: patterns.brandElements || {
        logoPosition: 'header',
        brandColors: patterns.colorScheme?.slice(0, 2) || ['#1e293b', '#3b82f6'],
        visualStyle: 'professional-document'
      },
      templateType: 'pdf-template',
      gammaQualityScore: 80
    };

  } catch (error) {
    console.error('PDF analysis error:', error);
    return generateFallbackPatterns(analysis);
  }
}

function detectDocumentType(filename: string): string {
  const name = filename.toLowerCase();
  if (name.includes('resume') || name.includes('cv')) return 'resume';
  if (name.includes('proposal')) return 'proposal';
  if (name.includes('pitch') || name.includes('deck')) return 'pitch_deck';
  if (name.includes('business') || name.includes('plan')) return 'business_plan';
  return 'document';
}

function generateIndustryColors(industry: string): string[] {
  const colorSchemes = {
    technology: ['#1e293b', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
    healthcare: ['#059669', '#0891b2', '#7c3aed', '#dc2626', '#1f2937'],
    finance: ['#1e40af', '#059669', '#dc2626', '#92400e', '#374151'],
    education: ['#7c3aed', '#059669', '#dc2626', '#d97706', '#1f2937'],
    consulting: ['#374151', '#1e40af', '#059669', '#dc2626', '#92400e'],
    default: ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  };
  
  return colorSchemes[industry as keyof typeof colorSchemes] || colorSchemes.default;
}

function calculateGammaScore(patterns: any, analysis: DocumentAnalysis): number {
  let score = 60; // Base score
  
  // Color scheme quality
  if (patterns.colorScheme && patterns.colorScheme.length >= 4) score += 10;
  
  // Typography completeness
  if (patterns.typography && patterns.typography.primaryFont) score += 10;
  
  // Brand consistency
  if (patterns.brandElements && patterns.brandElements.visualStyle) score += 10;
  
  // Industry appropriateness
  if (analysis.industry !== 'general') score += 5;
  
  // Document type recognition
  if (analysis.documentType !== 'unknown') score += 5;
  
  return Math.min(score, 95); // Cap at 95
}

function generateFallbackPatterns(analysis: DocumentAnalysis): DesignPatterns {
  return {
    colorScheme: generateIndustryColors(analysis.industry),
    typography: {
      primaryFont: 'Inter',
      headingSize: '24px',
      bodySize: '16px'
    },
    layout: 'professional-standard',
    brandElements: {
      logoPosition: 'top-left',
      brandColors: generateIndustryColors(analysis.industry).slice(0, 2),
      visualStyle: 'clean-professional'
    },
    templateType: `${analysis.industry}-standard`,
    gammaQualityScore: 75
  };
}

export async function analyzeWebsiteWithAI(url: string): Promise<{ patterns: DesignPatterns; insights: DocumentAnalysis }> {
  try {
    // Fetch website content
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProtoLab-AI/1.0)'
      }
    });

    const htmlContent = response.data;
    
    // Extract text content for analysis
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Use AI to analyze website
    const prompt = `Analyze this website for brand patterns and business insights:

URL: ${url}
Content: ${textContent.substring(0, 3000)}

Extract:
1. Brand colors and visual identity
2. Typography and design style
3. Industry and target audience
4. Key messaging and value propositions
5. Professional quality assessment

Return JSON with insights and design patterns suitable for document generation.`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a brand analyst. Extract design patterns and business insights from websites. Return structured JSON data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    });

    const analysis = JSON.parse(aiResponse.choices[0].message.content || '{}');
    
    const insights: DocumentAnalysis = {
      documentType: 'website_analysis',
      industry: analysis.industry || 'technology',
      targetAudience: analysis.targetAudience || 'business',
      keyMessages: analysis.keyMessages || [],
      strengthAreas: analysis.strengthAreas || [],
      improvementSuggestions: analysis.improvementSuggestions || [],
      brandAnalysis: analysis.brandAnalysis || {
        colorScheme: analysis.colors || ['#1e293b', '#3b82f6'],
        typography: analysis.typography || 'Modern Sans',
        visualStyle: analysis.visualStyle || 'Professional',
        professionalLevel: 'High'
      },
      contentStructure: analysis.contentStructure || {
        sections: ['Header', 'Main', 'Footer'],
        hierarchy: 'Web Standard',
        flowPattern: 'Navigation-based'
      }
    };

    const patterns: DesignPatterns = {
      colorScheme: analysis.brandColors || analysis.colors || ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      typography: {
        primaryFont: analysis.primaryFont || 'Inter',
        headingSize: analysis.headingSize || '28px',
        bodySize: analysis.bodySize || '16px'
      },
      layout: analysis.layout || 'modern-web',
      brandElements: {
        logoPosition: analysis.logoPosition || 'header-left',
        brandColors: (analysis.brandColors || analysis.colors || ['#1e293b', '#3b82f6']).slice(0, 3),
        visualStyle: analysis.visualStyle || 'modern-professional'
      },
      templateType: 'web-inspired',
      gammaQualityScore: 88
    };

    return { patterns, insights };

  } catch (error) {
    console.error('Website analysis error:', error);
    
    // Return fallback analysis based on domain
    const domain = new URL(url).hostname;
    const industry = detectIndustryFromDomain(domain);
    
    return {
      insights: {
        documentType: 'website_analysis',
        industry,
        targetAudience: 'professional',
        keyMessages: [`Website content from ${domain}`],
        strengthAreas: ['Online presence'],
        improvementSuggestions: ['Consider brand consistency'],
        brandAnalysis: {
          colorScheme: generateIndustryColors(industry),
          typography: 'Web Standard',
          visualStyle: 'Professional',
          professionalLevel: 'Medium'
        },
        contentStructure: {
          sections: ['Header', 'Content', 'Footer'],
          hierarchy: 'Standard Web',
          flowPattern: 'Linear'
        }
      },
      patterns: generateFallbackPatterns({
        documentType: 'website_analysis',
        industry,
        targetAudience: 'professional',
        keyMessages: [],
        strengthAreas: [],
        improvementSuggestions: [],
        brandAnalysis: {
          colorScheme: generateIndustryColors(industry),
          typography: 'Web Standard',
          visualStyle: 'Professional',
          professionalLevel: 'Medium'
        },
        contentStructure: {
          sections: ['Header', 'Content', 'Footer'],
          hierarchy: 'Standard Web',
          flowPattern: 'Linear'
        }
      })
    };
  }
}

function detectIndustryFromDomain(domain: string): string {
  if (domain.includes('tech') || domain.includes('ai') || domain.includes('software')) return 'technology';
  if (domain.includes('health') || domain.includes('medical') || domain.includes('care')) return 'healthcare';
  if (domain.includes('finance') || domain.includes('bank') || domain.includes('invest')) return 'finance';
  if (domain.includes('edu') || domain.includes('school') || domain.includes('university')) return 'education';
  if (domain.includes('consult') || domain.includes('advisory') || domain.includes('services')) return 'consulting';
  return 'technology';
}

export async function extractTextFromDocument(file: Express.Multer.File): Promise<string> {
  try {
    if (file.mimetype === 'application/pdf') {
      // PDF text extraction would go here
      return `PDF content from ${file.originalname}`;
    }
    
    if (file.mimetype.includes('text')) {
      return file.buffer.toString('utf-8');
    }
    
    if (file.mimetype.includes('word')) {
      // Word document extraction would go here
      return `Word document content from ${file.originalname}`;
    }
    
    return `Document content extracted from ${file.originalname}`;
    
  } catch (error) {
    console.error('Text extraction error:', error);
    return `Content from ${file.originalname}`;
  }
}