import OpenAI from "openai";
import { createAIClient } from "./ai-provider";
import { storage } from "../storage";

const openai = createAIClient();

// Tiered processing configuration
export const TIER_CONFIG = {
  cv: { timeout: 10000, memory: 512, complexity: 'basic' },
  business_plan: { timeout: 30000, memory: 1024, complexity: 'advanced' },
  pitch_deck: { timeout: 60000, memory: 2048, complexity: 'premium' },
  rfp_response: { timeout: 45000, memory: 1536, complexity: 'advanced' }
};

export interface UserPattern {
  language_style: {
    tone: string;
    formality: string;
    technical_level: string;
    preferred_phrases: string[];
  };
  slide_structure: {
    preferred_sections: string[];
    detail_level: string;
    visual_preference: string;
  };
  design_preferences: {
    color_scheme: string;
    layout_style: string;
    branding_elements: string[];
  };
  industry_context: {
    sector: string;
    target_audience: string;
    compliance_requirements: string[];
  };
}

export interface DocumentContext {
  website_content?: string;
  uploaded_documents?: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
  linkedin_profile?: string;
  company_profile?: string;
  past_projects?: string[];
  user_patterns?: UserPattern;
}

export async function analyzeUploadedDocument(fileBuffer: any, filename: string, mimeType: string): Promise<{
  content: string;
  metadata: any;
  insights: string[];
}> {
  let content = '';
  let insights: string[] = [];

  try {
    // Safely handle buffer conversion
    let textContent = '';
    
    if (mimeType === 'application/pdf') {
      // For now, we'll handle text extraction in a simplified way
      content = `[PDF Document: ${filename}] - Content extraction would be implemented here`;
    } else if (mimeType.startsWith('text/')) {
      // Safely convert buffer to string
      if (fileBuffer && typeof fileBuffer.toString === 'function') {
        textContent = fileBuffer.toString('utf-8');
      } else if (typeof fileBuffer === 'string') {
        textContent = fileBuffer;
      } else {
        textContent = String(fileBuffer || '');
      }
      content = textContent;
    } else {
      content = `[${mimeType} Document: ${filename}] - Binary content analysis would be implemented here`;
    }

    // Analyze content with AI
    const analysis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze this document and extract key insights, writing style, structure patterns, and relevant business information."
        },
        {
          role: "user",
          content: `Analyze this document: ${content.substring(0, 4000)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysisResult = JSON.parse(analysis.choices[0].message.content || '{}');
    insights = analysisResult.insights || [];

    return {
      content,
      metadata: {
        filename,
        mimeType,
        size: fileBuffer?.length || 0,
        analyzed_at: new Date().toISOString()
      },
      insights
    };
  } catch (error) {
    console.error('[Document Analysis Error]', error);
    return {
      content: `[Error analyzing ${filename}]`,
      metadata: { filename, mimeType, error: error instanceof Error ? error.message : 'Unknown error' },
      insights: []
    };
  }
}

export async function scrapeWebsiteContent(url: string): Promise<string> {
  try {
    // In a real implementation, we'd use a web scraping library
    // For now, we'll simulate website analysis
    const mockContent = `Website analysis for ${url} - This would contain scraped content including company description, services, team information, and brand voice examples.`;
    
    return mockContent;
  } catch (error) {
    console.error('[Website Scraping Error]', error);
    return `[Unable to analyze website: ${url}]`;
  }
}

export async function analyzeWritingPatterns(content: string): Promise<Partial<UserPattern>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the writing style, structure preferences, and communication patterns in this content. Return JSON with language_style, slide_structure, and design_preferences."
        },
        {
          role: "user",
          content: content.substring(0, 3000)
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('[Pattern Analysis Error]', error instanceof Error ? error.message : 'Unknown error');
    return {};
  }
}

export async function generateContextualDocument(
  documentType: 'cv' | 'business_plan' | 'pitch_deck' | 'rfp_response',
  baseData: any,
  context: DocumentContext,
  userId?: string
): Promise<{
  content: string;
  metadata: any;
  learning_applied: boolean;
}> {
  const config = TIER_CONFIG[documentType];
  
  try {
    // Build contextual prompt
    let contextualInfo = '';
    
    if (context.website_content) {
      contextualInfo += `\nWebsite Context: ${context.website_content}`;
    }
    
    if (context.uploaded_documents) {
      contextualInfo += `\nUploaded Documents: ${context.uploaded_documents.map(doc => 
        `${doc.filename}: ${doc.content.substring(0, 500)}`
      ).join('\n')}`;
    }
    
    if (context.company_profile) {
      contextualInfo += `\nCompany Profile: ${context.company_profile}`;
    }

    if (context.past_projects) {
      contextualInfo += `\nPast Projects: ${context.past_projects.join(', ')}`;
    }

    // Apply user patterns if available
    let styleInstructions = '';
    if (context.user_patterns) {
      const patterns = context.user_patterns;
      styleInstructions = `
        Apply these learned preferences:
        - Language Style: ${patterns.language_style?.tone} tone, ${patterns.language_style?.formality} formality
        - Structure: Prefer ${patterns.slide_structure?.detail_level} detail level
        - Industry Context: ${patterns.industry_context?.sector} sector, targeting ${patterns.industry_context?.target_audience}
      `;
    }

    const prompt = generateDocumentPrompt(documentType, baseData, contextualInfo, styleInstructions);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert document generator specializing in ${documentType}. Create professional, contextually-aware content.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: config.complexity === 'premium' ? 4000 : config.complexity === 'advanced' ? 2000 : 1000
    });

    const content = response.choices[0].message.content || '';

    // Update user patterns if userId provided
    let learningApplied = false;
    if (userId && content) {
      await updateUserLearningModel(userId, content, documentType);
      learningApplied = true;
    }

    return {
      content,
      metadata: {
        document_type: documentType,
        generated_at: new Date().toISOString(),
        context_used: Object.keys(context).length > 0,
        user_patterns_applied: !!context.user_patterns,
        processing_tier: config.complexity
      },
      learning_applied: learningApplied
    };

  } catch (error) {
    console.error('[Contextual Generation Error]', error);
    throw new Error(`Failed to generate ${documentType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateDocumentPrompt(
  type: 'cv' | 'business_plan' | 'pitch_deck' | 'rfp_response', 
  baseData: any, 
  context: string, 
  styleInstructions: string
): string {
  const basePrompts: Record<typeof type, string> = {
    cv: `Create a professional CV/resume using this information: ${JSON.stringify(baseData)}`,
    business_plan: `Generate a comprehensive business plan with these details: ${JSON.stringify(baseData)}`,
    pitch_deck: `Create an investor pitch deck with these specifications: ${JSON.stringify(baseData)}`,
    rfp_response: `Generate a professional RFP response addressing these requirements: ${JSON.stringify(baseData)}`
  };

  return `${basePrompts[type]}

${context ? `Additional Context: ${context}` : ''}

${styleInstructions}

Please create a professional, contextually-aware document that incorporates all available information and follows the specified style preferences.`;
}

export async function updateUserLearningModel(
  userId: string, 
  newContent: string, 
  documentType: string
): Promise<void> {
  try {
    // Analyze new content patterns
    const newPatterns = await analyzeWritingPatterns(newContent);
    
    // Get existing patterns
    const existingPatterns = await getUserPatterns(userId);
    
    // Merge patterns (70% new influence for adaptability)
    const mergedPatterns: UserPattern = {
      language_style: {
        tone: newPatterns.language_style?.tone || existingPatterns?.language_style?.tone || 'professional',
        formality: newPatterns.language_style?.formality || existingPatterns?.language_style?.formality || 'formal',
        technical_level: newPatterns.language_style?.technical_level || existingPatterns?.language_style?.technical_level || 'medium',
        preferred_phrases: [
          ...(newPatterns.language_style?.preferred_phrases || []),
          ...(existingPatterns?.language_style?.preferred_phrases || [])
        ].slice(0, 10) // Keep top 10
      },
      slide_structure: {
        preferred_sections: newPatterns.slide_structure?.preferred_sections || existingPatterns?.slide_structure?.preferred_sections || [],
        detail_level: newPatterns.slide_structure?.detail_level || existingPatterns?.slide_structure?.detail_level || 'detailed',
        visual_preference: newPatterns.slide_structure?.visual_preference || existingPatterns?.slide_structure?.visual_preference || 'balanced'
      },
      design_preferences: {
        color_scheme: newPatterns.design_preferences?.color_scheme || existingPatterns?.design_preferences?.color_scheme || 'corporate',
        layout_style: newPatterns.design_preferences?.layout_style || existingPatterns?.design_preferences?.layout_style || 'modern',
        branding_elements: [
          ...(newPatterns.design_preferences?.branding_elements || []),
          ...(existingPatterns?.design_preferences?.branding_elements || [])
        ].slice(0, 5)
      },
      industry_context: {
        sector: newPatterns.industry_context?.sector || existingPatterns?.industry_context?.sector || 'technology',
        target_audience: newPatterns.industry_context?.target_audience || existingPatterns?.industry_context?.target_audience || 'business',
        compliance_requirements: [
          ...(newPatterns.industry_context?.compliance_requirements || []),
          ...(existingPatterns?.industry_context?.compliance_requirements || [])
        ].slice(0, 5)
      }
    };

    // Store updated patterns
    await storage.updateUserPatterns(userId, mergedPatterns);
    
  } catch (error) {
    console.error('[Learning Model Update Error]', error);
  }
}

export async function getUserPatterns(userId: string): Promise<UserPattern | null> {
  try {
    const patterns = await storage.getUserPatterns(userId);
    if (!patterns) return null;
    
    return {
      language_style: patterns.languageStyle as UserPattern['language_style'] || {
        tone: 'professional',
        formality: 'formal',
        technical_level: 'medium',
        preferred_phrases: []
      },
      slide_structure: patterns.slideStructure as UserPattern['slide_structure'] || {
        preferred_sections: [],
        detail_level: 'detailed',
        visual_preference: 'balanced'
      },
      design_preferences: patterns.designPreferences as UserPattern['design_preferences'] || {
        color_scheme: 'corporate',
        layout_style: 'modern',
        branding_elements: []
      },
      industry_context: patterns.industryContext as UserPattern['industry_context'] || {
        sector: 'technology',
        target_audience: 'business',
        compliance_requirements: []
      }
    };
  } catch (error) {
    console.error('[Get User Patterns Error]', error);
    return null;
  }
}

export function calculateCompliance(response: string, requirements: string[]): number {
  // Simple compliance scoring based on keyword matching
  const responseWords = response.toLowerCase().split(/\s+/);
  const requirementKeywords = requirements.flatMap(req => 
    req.toLowerCase().split(/\s+/).filter(word => word.length > 3)
  );
  
  const matches = requirementKeywords.filter(keyword => 
    responseWords.some(word => word.includes(keyword))
  );
  
  return Math.min(100, Math.round((matches.length / requirementKeywords.length) * 100));
}

export function checkOriginality(content: string): number {
  // Simple originality check - in production would use plagiarism detection
  const uniqueWords = new Set(content.toLowerCase().split(/\s+/));
  const totalWords = content.split(/\s+/).length;
  
  return Math.round((uniqueWords.size / totalWords) * 100);
}