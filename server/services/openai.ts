import { createAIClient, getAIModel, getProviderName } from "./ai-provider";

export interface PitchDeckContent {
  title: string;
  slides: PitchSlide[];
  insights: PitchInsights;
}

export interface PitchSlide {
  slideNumber: number;
  title: string;
  content: string[];
  keyPoints: string[];
}

export interface PitchInsights {
  marketSize: string;
  revenueProjection: string;
  competitiveAdvantage: string;
  marketStrategy: string;
}

export async function generatePitchDeck(
  industry: string,
  country: string,
  businessType: string,
  description?: string,
  template?: string,
  theme?: string
): Promise<PitchDeckContent> {
  // Template-specific content variations
  const templatePrompts = {
    'modern-business': 'Focus on clean metrics, KPIs, and corporate governance. Emphasize scalability and operational efficiency.',
    'agritech': 'Highlight sustainability metrics, farm-to-market solutions, climate resilience, and agricultural innovation.',
    'tech-startup': 'Emphasize technology stack, user acquisition, digital transformation, and scalability metrics.',
    'healthcare': 'Focus on patient outcomes, regulatory pathways, healthcare accessibility, and clinical validation.',
    'fintech': 'Highlight financial inclusion, mobile payments, regulatory compliance, and transaction volumes.',
    'social-impact': 'Emphasize social metrics, community impact, SDG alignment, and measurable social outcomes.',
    'creative': 'Focus on brand storytelling, cultural resonance, creative differentiation, and audience engagement.',
    'education': 'Highlight learning outcomes, educational technology adoption, and skill development metrics.'
  };

  // Theme-specific cultural elements
  const themeElements = {
    'ubuntu-spirit': 'Incorporate Ubuntu philosophy: "I am because we are" - emphasize community collaboration, shared success, and collective growth.',
    'sahara-gold': 'Reflect desert resilience, ancient trade routes, and golden opportunities - emphasize endurance, value creation, and strategic positioning.',
    'savanna-green': 'Channel natural growth patterns, ecosystem thinking, and environmental harmony - focus on organic expansion and sustainable practices.',
    'ocean-blue': 'Emphasize vast possibilities, coastal trade networks, and maritime connections - highlight global reach and fluid adaptation.',
    'sunset-orange': 'Capture warmth, energy, and new beginnings - focus on optimism, transformation, and emerging opportunities.',
    'earth-brown': 'Ground in traditional values, stability, and organic growth - emphasize heritage, reliability, and authentic development.'
  };

  const templateStyle = template ? templatePrompts[template as keyof typeof templatePrompts] || '' : '';
  const themeStyle = theme ? themeElements[theme as keyof typeof themeElements] || '' : '';

  const prompt = `Generate a professional 10-slide pitch deck for a ${businessType} business in the ${industry} sector operating in ${country}. ${description ? `Business description: ${description}` : ''}

${templateStyle ? `TEMPLATE FOCUS: ${templateStyle}` : ''}
${themeStyle ? `CULTURAL THEME: ${themeStyle}` : ''}

Create a pitch deck with this structure:
1. Problem Statement
2. Solution Overview
3. Market Opportunity & Size
4. Business Model
5. Financial Projections (3-year)
6. Competition Analysis
7. Go-to-Market Strategy
8. Team & Expertise
9. Funding Requirements
10. Next Steps & Milestones

For each slide, provide:
- A compelling title that reflects the ${template} template style
- 3-5 key content points tailored to the template focus
- Specific data points relevant to ${country} market
- Cultural insights that align with ${theme} theme

Respond with JSON in this exact format:
{
  "title": "Company Name - Pitch Deck",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "content": ["Content point 1", "Content point 2", "Content point 3"],
      "keyPoints": ["Key insight 1", "Key insight 2"]
    }
  ],
  "insights": {
    "marketSize": "Market size estimate with specific numbers",
    "revenueProjection": "3-year revenue projection with specific numbers",
    "competitiveAdvantage": "Clear competitive advantage statement",
    "marketStrategy": "Go-to-market strategy optimized for target market"
  }
}`;

  try {
    // Use the AI provider system
    const aiClient = createAIClient();
    const model = getAIModel();
    const providerName = getProviderName();

    console.log(`Using AI provider: ${providerName} with model: ${model}`);

    const response = await aiClient.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a professional business consultant and pitch deck expert specializing in African markets. Create comprehensive, data-driven pitch decks with specific market insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return JSON.parse(content) as PitchDeckContent;
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Handle API quota or connectivity issues by importing demo data
    if ((error instanceof Error && (error.message.includes('quota') || error.message.includes('429') || error.message.includes('insufficient_quota'))) || 
        (error as any)?.status === 429 || (error as any)?.code === 'insufficient_quota') {
      console.log(`${getProviderName()} API quota exceeded, using demo content based on African startup patterns`);
      
      // Import demo data function dynamically
      const { generateDemoPitchContent } = await import('../demo-data.js');
      return generateDemoPitchContent(industry, country, businessType, description, template, theme);
    }
    
    throw new Error(`Failed to generate pitch deck: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
