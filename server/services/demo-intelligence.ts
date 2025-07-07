// Demo version of document intelligence with pre-built responses
export interface DemoDocumentResult {
  content: string;
  metadata: {
    document_type: string;
    generated_at: string;
    context_used: boolean;
    user_patterns_applied: boolean;
    processing_tier: string;
    confidence_score?: number;
    financials?: any;
  };
  learning_applied: boolean;
}

export function generateDemoContextualDocument(
  documentType: string,
  baseData: any,
  context: any,
  userId?: string
): DemoDocumentResult {
  const hasContext = Object.keys(context).length > 0;
  const hasFiles = context.fileIds && context.fileIds.length > 0;
  
  let content = '';
  let confidence_score = 0.85;
  let financials = null;

  switch (documentType) {
    case 'cv':
      content = generateDemoCV(baseData, hasContext);
      confidence_score = hasContext ? 0.92 : 0.85;
      break;
      
    case 'business_plan':
      content = generateDemoBusinessPlan(baseData, hasContext);
      confidence_score = hasContext ? 0.94 : 0.88;
      financials = generateDemoFinancials(baseData.targetRevenue || 1000000);
      break;
      
    case 'pitch_deck':
      content = generateDemoPitchDeck(baseData, hasContext);
      confidence_score = hasContext ? 0.91 : 0.87;
      break;
      
    case 'rfp_response':
      content = generateDemoRFPResponse(baseData, hasContext);
      confidence_score = hasContext ? 0.89 : 0.82;
      break;
      
    default:
      content = `Professional ${documentType} document generated with enhanced AI intelligence.`;
  }

  if (hasContext) {
    content += `\n\n[Enhanced with contextual intelligence: `;
    const enhancements = [];
    if (hasFiles) enhancements.push(`${context.fileIds.length} uploaded documents`);
    if (context.website_content) enhancements.push('website analysis');
    if (context.company_profile) enhancements.push('company profile');
    if (context.past_projects) enhancements.push('project history');
    content += enhancements.join(', ') + ']';
  }

  return {
    content,
    metadata: {
      document_type: documentType,
      generated_at: new Date().toISOString(),
      context_used: hasContext,
      user_patterns_applied: !!userId && userId !== 'anonymous',
      processing_tier: getProcessingTier(documentType),
      confidence_score,
      financials
    },
    learning_applied: !!userId && userId !== 'anonymous'
  };
}

function generateDemoCV(baseData: any, hasContext: boolean): string {
  const enhanced = hasContext ? ' (Enhanced with contextual analysis)' : '';
  
  return `PROFESSIONAL RESUME${enhanced}

${baseData.personalInfo?.name || 'Professional Name'}
${baseData.personalInfo?.email || 'email@example.com'} | ${baseData.personalInfo?.phone || '+1-234-567-8900'}
${baseData.personalInfo?.location || 'Location'} | ${baseData.personalInfo?.linkedinUrl || 'LinkedIn Profile'}

PROFESSIONAL SUMMARY
Dynamic ${baseData.targetIndustry || 'technology'} professional with proven track record in delivering exceptional results. Expertise in ${baseData.skills || 'various technical and business skills'} with strong focus on innovation and growth.

CORE COMPETENCIES
• ${baseData.skills || 'Leadership & Strategy'}
• Technical Excellence & Innovation
• Cross-functional Collaboration
• Results-driven Performance

PROFESSIONAL EXPERIENCE
${baseData.experience || 'Senior Professional with extensive experience in driving business growth and technical innovation across multiple projects and teams.'}

EDUCATION
${baseData.education || 'Advanced degree in relevant field with continuous professional development'}

KEY ACHIEVEMENTS
${baseData.achievements || 'Multiple awards and recognitions for outstanding performance and innovation in the field'}

${hasContext ? '\n[ATS-OPTIMIZED: This resume has been enhanced with industry-specific keywords and formatting based on contextual analysis of uploaded documents and company requirements.]' : ''}`;
}

function generateDemoBusinessPlan(baseData: any, hasContext: boolean): string {
  const enhanced = hasContext ? ' (Enhanced with Market Intelligence)' : '';
  
  return `BUSINESS PLAN: ${baseData.businessName || 'Innovative Company'}${enhanced}

EXECUTIVE SUMMARY
${baseData.businessName || 'Our company'} is a ${baseData.businessType || 'technology'} venture targeting ${baseData.market || 'emerging markets'}. ${baseData.description || 'We provide innovative solutions that address key market challenges.'}

MARKET OPPORTUNITY
Target Market: ${baseData.market || 'Growing market segment with significant potential'}
Market Size: Estimated $${(baseData.targetRevenue * 10).toLocaleString()} total addressable market
Revenue Target: $${baseData.targetRevenue?.toLocaleString() || '1,000,000'} annually

COMPETITIVE LANDSCAPE
Primary Competitors: ${baseData.competitors || 'Established market players'}
Competitive Advantage: Innovative approach with superior technology and customer focus

BUSINESS MODEL
Revenue Streams: Subscription-based model with premium features
Customer Acquisition: Digital marketing and strategic partnerships
Scaling Strategy: Geographic expansion and product diversification

FINANCIAL PROJECTIONS
Year 1: $${Math.round(baseData.targetRevenue * 0.3).toLocaleString()} revenue target
Year 2: $${Math.round(baseData.targetRevenue * 0.7).toLocaleString()} projected growth
Year 3: $${baseData.targetRevenue?.toLocaleString()} full market penetration

FUNDING REQUIREMENTS
Seeking $${Math.round(baseData.targetRevenue * 0.5).toLocaleString()} investment for:
• Technology development (40%)
• Market expansion (35%)
• Team building (25%)

${hasContext ? '\n[CONTEXT-ENHANCED: This business plan incorporates insights from uploaded documents, company profile analysis, and market intelligence to provide highly relevant strategic recommendations.]' : ''}`;
}

function generateDemoPitchDeck(baseData: any, hasContext: boolean): string {
  const { businessName, industry, country, businessType, description, fundingAmount } = baseData;
  const enhanced = hasContext ? ' - Gamma Quality Enhanced' : '';
  
  return `INVESTOR PITCH DECK: ${businessName || 'Company Name'}${enhanced}
Transforming ${industry || 'Industry'} in ${country || 'Target Market'}

SLIDE 1: HERO SLIDE
${businessName || 'Company Name'} - ${description || 'Revolutionary innovation'}
Seeking $${fundingAmount?.toLocaleString() || 'Investment Amount'} for ${baseData.useCase || 'growth funding'}
Revolutionary innovation in ${industry || 'technology'}

SLIDE 2: THE PROBLEM
Market Pain Points Demanding Innovation
• Current ${industry || 'market'} solutions lack efficiency and scalability
• Market gaps in ${country || 'target region'} create significant opportunities  
• Traditional approaches fail to meet modern demands
• Cost inefficiencies plague existing systems

SLIDE 3: OUR SOLUTION
Innovative Technology Meets Market Needs
• ${description || 'Our innovative platform addresses these challenges'}
• Proprietary technology stack delivering measurable results
• Scalable architecture built for growth
• User-centric design with seamless integration

SLIDE 4: MARKET OPPORTUNITY
${country || 'Target'} ${industry || 'Market'} Analysis
• Total Addressable Market: $${(fundingAmount ? fundingAmount * 200 : 500000).toLocaleString()}M
• Serviceable Available Market: $${(fundingAmount ? fundingAmount * 50 : 125000).toLocaleString()}M
• Serviceable Obtainable Market: $${(fundingAmount ? fundingAmount * 10 : 25000).toLocaleString()}M
• Rapid market growth driven by digital transformation

SLIDE 5: BUSINESS MODEL
Sustainable Revenue Generation
• Multi-stream revenue model with recurring subscriptions
• Freemium tier driving user acquisition
• Enterprise partnerships for market expansion
• Target ARR: $${(fundingAmount ? fundingAmount * 2 : 100000).toLocaleString()}k by Year 2

SLIDE 6: TRACTION & VALIDATION
Proven Market Demand
• ${hasContext ? 'Strong digital presence with established brand' : 'Building market presence with early adopters'}
• Pilot programs delivering measurable results
• Strategic partnerships with industry leaders
• Customer testimonials validating product-market fit

SLIDE 7: COMPETITIVE LANDSCAPE
Market Positioning & Differentiation
• Fragmented market with outdated solutions
• First-mover advantage in emerging technologies
• Superior user experience and functionality
• Proprietary algorithms delivering 10x performance

SLIDE 8: FINANCIAL PROJECTIONS
Path to Profitability
• Year 1 Revenue: $${(fundingAmount ? fundingAmount * 0.5 : 25000).toLocaleString()}k
• Year 2 Revenue: $${(fundingAmount ? fundingAmount * 1.5 : 75000).toLocaleString()}k
• Year 3 Revenue: $${(fundingAmount ? fundingAmount * 3 : 150000).toLocaleString()}k
• Break-even by Month 18 with positive cash flow

SLIDE 9: THE TEAM
Experienced Leadership
• Founding team with combined 20+ years experience
• Deep expertise in ${industry || 'technology'} and innovation
• Proven track record of successful ventures
• Advisory board with industry veterans

SLIDE 10: FUNDING & USE OF FUNDS
$${fundingAmount?.toLocaleString() || 'Investment'} Investment Opportunity
• 40% Product Development & R&D
• 30% Marketing & Customer Acquisition
• 20% Team Expansion & Hiring
• 10% Operations & Infrastructure

SLIDE 11: VISION & IMPACT
Transforming ${industry || 'Industry'} Across ${country || 'Markets'}
• Become the leading platform in our market segment
• Expand to 5 key markets within 3 years
• Create 500+ jobs and economic impact
• Drive sustainable development through innovation

${hasContext ? '\n[GAMMA-QUALITY DECK: Enhanced with learned presentation preferences, company voice analysis, and market-specific insights from uploaded context.]' : '\n[PROFESSIONAL DECK: Structured using Gamma app quality standards with compelling visual narrative.]'}`;
}

function generateDemoRFPResponse(baseData: any, hasContext: boolean): string {
  const enhanced = hasContext ? ' (Compliance-Optimized)' : '';
  
  return `RFP RESPONSE${enhanced}

EXECUTIVE SUMMARY
Our team brings extensive experience in ${baseData.industry || 'the specified industry'} with proven ability to deliver exceptional results.

PROJECT UNDERSTANDING
We fully understand the requirements: ${baseData.requirements || 'comprehensive solution delivery within specified parameters'}

TECHNICAL APPROACH
Our methodology ensures:
• Requirements compliance
• Quality deliverables
• Timely execution
• Risk mitigation

COMPANY QUALIFICATIONS
${baseData.company_profile || 'Established company with strong track record in similar projects'}

RELEVANT EXPERIENCE
Past Projects:
${baseData.past_projects?.map((project: string, index: number) => `${index + 1}. ${project}`).join('\n') || '• Successfully delivered multiple projects in this domain'}

TEAM COMPOSITION
Dedicated team of experts with relevant certifications and experience

PROJECT TIMELINE
Structured approach with clearly defined milestones and deliverables

BUDGET & PRICING
Competitive pricing with transparent cost structure and value proposition

QUALITY ASSURANCE
Comprehensive QA processes ensuring deliverable excellence

${hasContext ? '\n[COMPLIANCE SCORE: 94% - This response has been optimized for RFP requirements with enhanced keyword matching and structural alignment based on uploaded reference documents.]' : ''}`;
}

function generateDemoFinancials(targetRevenue: number) {
  return {
    year1: {
      revenue: Math.round(targetRevenue * 0.3),
      expenses: Math.round(targetRevenue * 0.3 * 0.75),
      profit: Math.round(targetRevenue * 0.3 * 0.25)
    },
    year2: {
      revenue: Math.round(targetRevenue * 0.7),
      expenses: Math.round(targetRevenue * 0.7 * 0.65),
      profit: Math.round(targetRevenue * 0.7 * 0.35)
    },
    year3: {
      revenue: targetRevenue,
      expenses: Math.round(targetRevenue * 0.6),
      profit: Math.round(targetRevenue * 0.4)
    }
  };
}

function getProcessingTier(documentType: string): string {
  const tiers = {
    cv: 'basic',
    business_plan: 'advanced',
    pitch_deck: 'premium',
    rfp_response: 'advanced'
  };
  return tiers[documentType as keyof typeof tiers] || 'basic';
}

export function analyzeDemoDocument(filename: string, content: string) {
  const insights = [];
  
  if (filename.toLowerCase().includes('resume') || filename.toLowerCase().includes('cv')) {
    insights.push('Professional resume detected');
    insights.push('ATS formatting analysis');
    insights.push('Skills extraction completed');
  } else if (filename.toLowerCase().includes('business') || filename.toLowerCase().includes('plan')) {
    insights.push('Business strategy document');
    insights.push('Financial projections identified');
    insights.push('Market analysis extracted');
  } else if (filename.toLowerCase().includes('proposal') || filename.toLowerCase().includes('rfp')) {
    insights.push('Proposal document analyzed');
    insights.push('Requirements mapping completed');
    insights.push('Compliance structure identified');
  } else {
    insights.push('Document structure analyzed');
    insights.push('Key content extracted');
    insights.push('Context patterns identified');
  }

  return {
    content: `Analyzed content from ${filename}: ${content.substring(0, 200)}...`,
    metadata: {
      filename,
      type: 'document_analysis',
      analyzed_at: new Date().toISOString()
    },
    insights
  };
}