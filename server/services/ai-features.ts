import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateFileTags(filename: string, buffer: Buffer): Promise<string[]> {
  try {
    // Analyze file content and generate relevant tags
    const prompt = `Analyze this file named "${filename}" and generate relevant tags for a grant proposal. 
    Consider categories like: budget, technical, team_credentials, prototype, market_research, sustainability, legal, partnership.
    Return only the most relevant 3-5 tags as a comma-separated list.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
    });

    const tags = response.choices[0].message.content
      ?.split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0) || [];

    return tags.slice(0, 5); // Limit to 5 tags
  } catch (error) {
    console.error("File tagging error:", error);
    return ['document']; // Fallback tag
  }
}

export async function findSimilarPatents(description: string): Promise<any[]> {
  try {
    // Simulate patent database search
    const prompt = `Given this invention description: "${description}"
    Generate 3-5 similar existing patents with realistic details including:
    - Patent number (format: US1234567B2)
    - Title
    - Brief description
    - Similarity score (0-100)
    - Key differences
    
    Focus on African and global patents. Return as JSON array.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a patent analysis expert. Respond with valid JSON only."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"patents": []}');
    return result.patents || [];
  } catch (error) {
    console.error("Patent search error:", error);
    return [];
  }
}

export function generatePatentRecommendations(noveltyScore: number, isPremium: boolean = false): string[] {
  const recommendations = [];
  
  if (noveltyScore >= 80) {
    recommendations.push("High novelty score - strong patent potential");
    recommendations.push("Consider filing provisional patent application");
    recommendations.push("Document all technical details thoroughly");
  } else if (noveltyScore >= 60) {
    recommendations.push("Moderate novelty - review similar patents");
    recommendations.push("Focus on unique differentiators");
    recommendations.push("Consider filing in specific jurisdictions");
  } else {
    recommendations.push("Low novelty score - significant prior art exists");
    recommendations.push("Explore alternative approaches or improvements");
    recommendations.push("Consider trade secret protection instead");
  }
  
  recommendations.push("Consult with patent attorney for detailed analysis");
  recommendations.push("ARIPO filing available for African market protection");
  
  // Premium novelty improvement suggestions
  if (isPremium) {
    recommendations.push("--- Premium Novelty Improvements ---");
    
    if (noveltyScore >= 80) {
      recommendations.push("Add AI-powered predictive analytics to anticipate system failures");
      recommendations.push("Integrate edge computing capabilities for real-time processing");
      recommendations.push("Incorporate renewable energy harvesting mechanisms");
      recommendations.push("Develop voice-activated control interface with local language support");
      recommendations.push("Implement blockchain-based data integrity verification");
    } else if (noveltyScore >= 60) {
      recommendations.push("Develop proprietary sensor calibration algorithms for African soil conditions");
      recommendations.push("Create adaptive learning system that improves with usage data");
      recommendations.push("Add multi-climate zone optimization for diverse African environments");
      recommendations.push("Implement swarm intelligence for coordinated multi-device operation");
      recommendations.push("Develop predictive crop yield modeling based on historical patterns");
    } else if (noveltyScore >= 40) {
      recommendations.push("Combine your core technology with quantum sensing principles");
      recommendations.push("Integrate biomimetic design patterns from African flora adaptations");
      recommendations.push("Develop unique actuation mechanisms inspired by traditional tools");
      recommendations.push("Create mesh networking capabilities for remote area connectivity");
      recommendations.push("Apply African geometric patterns for improved aerodynamics or efficiency");
    } else {
      recommendations.push("Explore unconventional materials used in traditional African crafts");
      recommendations.push("Study indigenous plant adaptation mechanisms for breakthrough insights");
      recommendations.push("Investigate traditional African technologies for novel applications");
      recommendations.push("Develop unique energy storage using locally available materials");
      recommendations.push("Apply traditional African water management principles to modern systems");
      recommendations.push("Use traditional African acoustic principles for vibration optimization");
    }
    
    // Strategic premium recommendations
    recommendations.push("--- Patent Strategy ---");
    recommendations.push("File continuation patents for each major improvement iteration");
    recommendations.push("Collaborate with African universities for research validation");
    recommendations.push("Apply for ARIPO innovation grants specifically for enhanced versions");
    recommendations.push("Publish research papers to establish technical authority");
    recommendations.push("Develop unique production methods suited for African manufacturing");
  }
  
  return recommendations;
}

export function generateGrantRecommendations(grants: any[]): string[] {
  const recommendations = [];
  
  if (grants.length === 0) {
    recommendations.push("No matching grants found - consider broadening search criteria");
    recommendations.push("Explore private sector partnerships");
    return recommendations;
  }
  
  const totalFunding = grants.reduce((sum, grant) => {
    const amount = parseFloat(grant.amount?.replace(/[^0-9.]/g, '') || '0');
    return sum + amount;
  }, 0);
  
  if (totalFunding > 1000000) {
    recommendations.push("High-value opportunities available - prepare comprehensive proposals");
  }
  
  const urgentGrants = grants.filter(grant => {
    if (!grant.deadline) return false;
    const deadline = new Date(grant.deadline);
    const now = new Date();
    const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 30;
  });
  
  if (urgentGrants.length > 0) {
    recommendations.push(`${urgentGrants.length} grants have deadlines within 30 days - prioritize these`);
  }
  
  recommendations.push("Consider collaborative partnerships to strengthen applications");
  recommendations.push("Prepare detailed budgets and impact projections");
  
  return recommendations;
}

export async function translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
  try {
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}.
    Focus on grant proposal and business terminology accuracy.
    
    Text: "${text}"
    
    Return only the translated text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
  }
}

export async function generateGrantIntelligence(industry: string, country: string, businessType: string): Promise<any> {
  try {
    const prompt = `Generate comprehensive grant intelligence for:
    - Industry: ${industry}
    - Country: ${country}
    - Business Type: ${businessType}
    
    Include:
    1. Top 5 relevant grant opportunities (AfDB, World Bank, GCF, bilateral donors)
    2. Funding amounts and deadlines
    3. Key requirements and eligibility criteria
    4. Success factors and tips
    5. Required partnerships or collaborations
    
    Focus on African development funding and green/sustainable projects.
    Return as structured JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a grant funding expert specializing in African development finance. Respond with valid JSON only."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("Grant intelligence error:", error);
    return { grants: [], recommendations: [] };
  }
}

export async function checkPatentNovelty(description: string): Promise<{
  noveltyScore: number;
  similarPatents: any[];
  recommendations: string[];
}> {
  try {
    const [similarPatents] = await Promise.all([
      findSimilarPatents(description)
    ]);

    // Calculate novelty score based on similarity to existing patents
    const maxSimilarity = Math.max(...similarPatents.map(p => p.similarityScore || 0), 0);
    const noveltyScore = Math.max(10, 100 - maxSimilarity);

    return {
      noveltyScore,
      similarPatents,
      recommendations: generatePatentRecommendations(noveltyScore)
    };
  } catch (error) {
    console.error("Patent novelty check error:", error);
    return {
      noveltyScore: 50,
      similarPatents: [],
      recommendations: ["Error occurred during analysis - please try again"]
    };
  }
}