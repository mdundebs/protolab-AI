import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertPitchRequestSchema, insertPaymentSchema } from "@shared/schema.js";
import { generatePitchDeck } from "./services/openai.js";
import { generatePitchDeckPDF } from "./services/pdf.js";
import { 
  generateFileTags, 
  findSimilarPatents, 
  generatePatentRecommendations,
  generateGrantRecommendations,
  translateText 
} from "./services/ai-features.js";
import { generateStyledPDF } from "./services/template-pdf.js";
import { generateDemoPitchContent } from "./demo-data.js";
import Stripe from "stripe";
import multer from 'multer';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found, Stripe payments will not work');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to generate demo resume
function generateDemoResume(personalInfo: any, targetIndustry: string, experience: string, skills: string, education: string, achievements: string): string {
  return `${personalInfo.name}
${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}
${personalInfo.linkedinUrl ? personalInfo.linkedinUrl : ''}

PROFESSIONAL SUMMARY
Results-driven ${targetIndustry} professional with proven track record of delivering innovative solutions. 
${experience.substring(0, 150)}...

CORE COMPETENCIES
${skills.split(',').map((skill: string) => `• ${skill.trim()}`).join('\n')}

PROFESSIONAL EXPERIENCE
${experience}

KEY ACHIEVEMENTS
${achievements.split(',').map((achievement: string) => `• ${achievement.trim()}`).join('\n')}

EDUCATION
${education}

ADDITIONAL INFORMATION
• Fluent in English and Swahili
• Strong understanding of African markets
• Experienced with remote collaboration tools
• Committed to sustainable technology solutions`;
}

// Helper function to generate demo business plan
function generateDemoBusinessPlan(businessName: string, businessType: string, market: string, targetRevenue: number, competitors: string, description: string): string {
  return `BUSINESS PLAN: ${businessName}

EXECUTIVE SUMMARY
${businessName} is a ${businessType} company targeting ${market}. ${description}

Our projected Year 1 revenue is $${targetRevenue.toLocaleString()}, with strong growth potential in the African market.

MARKET ANALYSIS
Target Market: ${market}
Market Size: Growing rapidly across Africa with increasing digital adoption
Key Trends: Mobile-first solutions, financial inclusion, sustainable development

BUSINESS MODEL
Revenue Streams:
• Primary: Core ${businessType} services
• Secondary: Premium features and partnerships
• Tertiary: Training and consulting services

COMPETITIVE ANALYSIS
Key Competitors: ${competitors}
Competitive Advantage: Deep African market understanding, local partnerships, mobile-optimized solutions

MARKETING STRATEGY
• Digital marketing focused on mobile platforms
• Partnership with local organizations
• Community engagement and word-of-mouth
• Targeted social media campaigns

FINANCIAL PROJECTIONS
Year 1: $${Math.round(targetRevenue * 0.3).toLocaleString()} revenue
Year 2: $${Math.round(targetRevenue * 0.7).toLocaleString()} revenue  
Year 3: $${targetRevenue.toLocaleString()} revenue

IMPLEMENTATION TIMELINE
Months 1-3: Product development and team building
Months 4-6: Market entry and customer acquisition
Months 7-12: Scale operations and expand market reach

RISK ASSESSMENT
• Market risks: Competition, regulatory changes
• Operational risks: Talent acquisition, infrastructure
• Mitigation: Strong partnerships, diversified revenue streams`;
}

// Helper function to calculate ATS score
function calculateATSScore(resumeContent: string, industry: string): number {
  let score = 60; // Base score
  
  // Check for key ATS-friendly elements
  if (resumeContent.includes('EXPERIENCE') || resumeContent.includes('WORK HISTORY')) score += 10;
  if (resumeContent.includes('SKILLS') || resumeContent.includes('TECHNICAL SKILLS')) score += 10;
  if (resumeContent.includes('EDUCATION')) score += 5;
  if (resumeContent.includes('ACHIEVEMENTS') || resumeContent.includes('ACCOMPLISHMENTS')) score += 10;
  
  // Industry-specific keywords boost
  const industryKeywords = {
    technology: ['software', 'development', 'programming', 'coding', 'API'],
    finance: ['financial', 'analysis', 'accounting', 'budget', 'audit'],
    healthcare: ['patient', 'medical', 'clinical', 'healthcare', 'treatment'],
    agriculture: ['crop', 'farming', 'agricultural', 'livestock', 'harvest']
  };
  
  const keywords = industryKeywords[industry as keyof typeof industryKeywords] || [];
  const keywordMatches = keywords.filter(keyword => 
    resumeContent.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  score += Math.min(keywordMatches * 2, 10);
  
  return Math.min(score, 95); // Cap at 95%
}

// Helper function to generate financial projections
function generateFinancialProjections(targetRevenue: number, businessType: string) {
  const expenseRatios = {
    'tech-startup': 0.7,
    'saas': 0.6,
    'e-commerce': 0.8,
    'consulting': 0.5,
    'manufacturing': 0.75,
    'agriculture': 0.65,
    'fintech': 0.65,
    'healthtech': 0.7
  };
  
  const expenseRatio = expenseRatios[businessType as keyof typeof expenseRatios] || 0.7;
  
  return {
    year1: {
      revenue: Math.round(targetRevenue * 0.3),
      expenses: Math.round(targetRevenue * 0.3 * expenseRatio),
      profit: Math.round(targetRevenue * 0.3 * (1 - expenseRatio))
    },
    year2: {
      revenue: Math.round(targetRevenue * 0.7),
      expenses: Math.round(targetRevenue * 0.7 * expenseRatio),
      profit: Math.round(targetRevenue * 0.7 * (1 - expenseRatio))
    },
    year3: {
      revenue: targetRevenue,
      expenses: Math.round(targetRevenue * expenseRatio),
      profit: Math.round(targetRevenue * (1 - expenseRatio))
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Document Generation Routes
  app.post("/api/documents/generate-resume", async (req, res) => {
    try {
      const { personalInfo, targetIndustry, experience, skills, education, achievements } = req.body;
      
      // Generate demo resume content with user's actual information
      const resumeContent = generateDemoResume(personalInfo, targetIndustry, experience, skills, education, achievements);
      const atsScore = calculateATSScore(resumeContent, targetIndustry);
      
      res.json({
        content: resumeContent,
        score: atsScore,
        previewUrl: null
      });
    } catch (error) {
      console.error("Resume generation error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate resume",
      });
    }
  });

  app.post("/api/documents/generate-business-plan", async (req, res) => {
    try {
      const { businessName, businessType, market, targetRevenue, competitors, referenceUrl, description } = req.body;
      
      // Generate demo business plan content with user's actual information
      const businessPlanContent = generateDemoBusinessPlan(businessName, businessType, market, targetRevenue, competitors, description);
      const financials = generateFinancialProjections(targetRevenue, businessType);
      
      res.json({
        content: businessPlanContent,
        financials: financials,
        charts: []
      });
    } catch (error) {
      console.error("Business plan generation error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate business plan",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}