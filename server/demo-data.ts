// Demo data service for showcasing ProtoLab functionality
// This provides realistic examples based on actual African startup patterns

export interface DemoPitchContent {
  title: string;
  slides: Array<{
    slideNumber: number;
    title: string;
    content: string[];
    keyPoints: string[];
  }>;
  insights: {
    marketSize: string;
    revenueProjection: string;
    competitiveAdvantage: string;
    marketStrategy: string;
  };
}

export function generateDemoPitchContent(
  industry: string,
  country: string,
  businessType: string,
  description?: string,
  template?: string,
  theme?: string
): DemoPitchContent {
  
  // Generate realistic demo content based on common African startup patterns
  const isAgriTech = industry.toLowerCase().includes('agr') || description?.toLowerCase().includes('farm');
  const isFinTech = industry.toLowerCase().includes('fin') || description?.toLowerCase().includes('payment');
  const isHealthTech = industry.toLowerCase().includes('health') || description?.toLowerCase().includes('medical');
  
  if (isAgriTech || description?.includes('GreenHarvest')) {
    return getAgriTechDemo(country, businessType, template, theme);
  } else if (isFinTech) {
    return getFinTechDemo(country, businessType, template, theme);
  } else if (isHealthTech) {
    return getHealthTechDemo(country, businessType, template, theme);
  } else {
    return getGeneralTechDemo(industry, country, businessType, template, theme);
  }
}

function getAgriTechDemo(country: string, businessType: string, template?: string, theme?: string): DemoPitchContent {
  // Template-specific variations
  const templateTitles = {
    'modern-business': "GreenHarvest Kenya: Agricultural Technology Solutions",
    'agritech': "GreenHarvest Kenya: Smart Irrigation Revolution", 
    'tech-startup': "GreenHarvest Kenya: IoT-Powered Farm Management",
    'social-impact': "GreenHarvest Kenya: Empowering Smallholder Farmers",
    'creative': "GreenHarvest Kenya: Growing Dreams, Harvesting Hope"
  };

  const themeInsights = {
    'ubuntu-spirit': "Community-driven agricultural transformation",
    'sahara-gold': "Resilient farming solutions for arid regions",
    'savanna-green': "Sustainable ecosystem farming practices",
    'earth-brown': "Traditional wisdom meets modern technology"
  };

  const title = templateTitles[template as keyof typeof templateTitles] || templateTitles['agritech'];
  const insight = themeInsights[theme as keyof typeof themeInsights] || themeInsights['ubuntu-spirit'];

  return {
    title,
    slides: [
      {
        slideNumber: 1,
        title: "Problem Statement",
        content: [
          "40% crop loss during dry seasons affects 2.5M smallholder farmers in East Africa",
          "Limited access to modern irrigation technology in rural areas",
          "Inefficient water usage leads to 30% reduction in crop yields",
          "Climate change increases unpredictable weather patterns across the region"
        ],
        keyPoints: ["High crop loss", "Technology gap", "Water inefficiency", "Climate impact"]
      },
      {
        slideNumber: 2,
        title: "Our Solution",
        content: [
          "IoT-powered precision irrigation system with solar power capability",
          "Mobile app for remote monitoring and control (works offline)",
          "AI-driven weather prediction using local meteorological data",
          "Real-time soil moisture and nutrient monitoring sensors"
        ],
        keyPoints: ["IoT sensors", "Mobile control", "Weather AI", "Soil monitoring"]
      },
      {
        slideNumber: 3,
        title: "Market Opportunity",
        content: [
          "East African agricultural market: $24B annually (World Bank, 2023)",
          "2.5M smallholder farmers in Kenya, Uganda, Tanzania target regions",
          "Growing government support for digital agriculture initiatives",
          "Irrigation technology adoption rate increasing 25% annually"
        ],
        keyPoints: ["$24B market", "2.5M farmers", "Government support", "25% growth"]
      },
      {
        slideNumber: 4,
        title: "Business Model",
        content: [
          "Hardware sales: $299 per irrigation kit (competitive with imports)",
          "SaaS subscription: $15/month for analytics and weather insights",
          "Installation and training services: $150 per farm setup",
          "Premium data analytics: $30/month for cooperative management"
        ],
        keyPoints: ["Hardware revenue", "Recurring SaaS", "Service income", "Premium features"]
      },
      {
        slideNumber: 5,
        title: "Competitive Advantage",
        content: [
          "First IoT irrigation solution designed specifically for African smallholders",
          "Affordable pricing with M-Pesa integration for flexible payments",
          "Strategic partnerships with Kenya Agricultural Research Institute",
          "Offline-first design for areas with limited internet connectivity"
        ],
        keyPoints: ["African-focused", "M-Pesa payments", "Research partnerships", "Offline capability"]
      },
      {
        slideNumber: 6,
        title: "Financial Projections",
        content: [
          "Year 1: $485K revenue, 1,500 farmers served across 3 counties",
          "Year 2: $2.1M revenue, 7,000 farmers, expansion to Uganda",
          "Year 3: $5.8M revenue, 19,000 farmers, full East Africa coverage",
          "Break-even projected at Month 18 with 40% gross margins"
        ],
        keyPoints: ["$485K Y1", "$2.1M Y2", "$5.8M Y3", "18-month breakeven"]
      },
      {
        slideNumber: 7,
        title: "Funding Requirements",
        content: [
          "Seeking $1.2M Series A funding from impact investors",
          "Product development and IoT manufacturing: 40% ($480K)",
          "Market expansion and farmer education programs: 35% ($420K)",
          "Team expansion and operational scaling: 25% ($300K)"
        ],
        keyPoints: ["$1.2M funding", "40% product", "35% expansion", "25% operations"]
      },
      {
        slideNumber: 8,
        title: "Impact & Scaling",
        content: [
          "Target: 35% increase in crop yields for participating farmers",
          "Water conservation: 40% reduction through precision irrigation",
          "Job creation: 500+ roles in rural communities by Year 3",
          "Vision: Serve 100K farmers across Sub-Saharan Africa by 2028"
        ],
        keyPoints: ["35% yield boost", "40% water savings", "500+ jobs", "100K farmers by 2028"]
      }
    ],
    insights: {
      marketSize: template === 'modern-business' ? 
        "East African agricultural market: $24B (AfDB 2023), precision agriculture segment growing 15% annually with strong ROI metrics" :
        template === 'tech-startup' ?
        "IoT agriculture market: $24B opportunity, 12% CAGR, targeting 33M smallholder farmers across Sub-Saharan Africa" :
        template === 'social-impact' ?
        "Agricultural development: $24B market serving 70% of Africa's population, focus on food security and poverty reduction" :
        "East African agricultural market worth $24B annually, with precision agriculture expected to grow 15% year-over-year through 2028 (AfDB Agricultural Outlook 2023)",
      
      revenueProjection: template === 'modern-business' ?
        "Revenue forecast: $5.8M by Year 3 with 65% gross margins, driven by SaaS model and IoT device sales" :
        template === 'tech-startup' ?
        "Projected $5.8M ARR by Year 3, scaling to 200K+ users through freemium model and enterprise partnerships" :
        "Conservative projections show $5.8M revenue by Year 3, driven by 35% gross margins on hardware and 80% margins on software subscriptions",
      
      competitiveAdvantage: theme === 'ubuntu-spirit' ?
        `${insight}: Community-driven technology adoption with peer-to-peer learning networks and collective purchasing power` :
        theme === 'sahara-gold' ?
        `${insight}: Proven resilience technology designed for arid conditions with water conservation focus` :
        "First-mover advantage in IoT irrigation for African smallholders, with deep partnerships across agricultural value chain and proven offline-capable technology",
      
      marketStrategy: `${insight} - Partner with agricultural cooperatives for farmer education, leverage mobile money infrastructure for accessible payment plans`
    }
  };
}

function getFinTechDemo(country: string, businessType: string, template?: string, theme?: string): DemoPitchContent {
  return {
    title: "PayFlow Nigeria: Cross-Border Payments for SMEs",
    slides: [
      {
        slideNumber: 1,
        title: "Problem Statement",
        content: [
          "SMEs lose $2.3B annually on high cross-border payment fees in West Africa",
          "Traditional banking takes 3-7 days for regional transfers",
          "Limited access to foreign exchange for small businesses",
          "Compliance complexity discourages cross-border trade"
        ],
        keyPoints: ["$2.3B losses", "Slow transfers", "FX access", "Compliance barriers"]
      },
      {
        slideNumber: 2,
        title: "Our Solution",
        content: [
          "Real-time cross-border payments using blockchain rails",
          "Competitive FX rates with transparent pricing",
          "Automated compliance and KYC verification",
          "Integration with popular African payment methods"
        ],
        keyPoints: ["Blockchain rails", "Competitive FX", "Auto compliance", "Local integration"]
      },
      {
        slideNumber: 3,
        title: "Market Opportunity",
        content: [
          "West African payment market: $45B transaction volume annually",
          "1.2M SMEs across Nigeria, Ghana, Senegal target markets",
          "Cross-border trade growing 12% annually in ECOWAS region",
          "Digital payment adoption accelerating post-COVID"
        ],
        keyPoints: ["$45B market", "1.2M SMEs", "12% growth", "Digital acceleration"]
      }
    ],
    insights: {
      marketSize: "West African cross-border payment market represents $45B in annual transaction volume",
      revenueProjection: "Revenue model based on 0.8% transaction fees, targeting $12M revenue by Year 3",
      competitiveAdvantage: "First blockchain-based solution specifically for African SME cross-border payments",
      marketStrategy: "Partner with trade associations and chambers of commerce for SME onboarding"
    }
  };
}

function getHealthTechDemo(country: string, businessType: string, template?: string, theme?: string): DemoPitchContent {
  return {
    title: "MediConnect Rwanda: Telemedicine for Rural Health",
    slides: [
      {
        slideNumber: 1,
        title: "Problem Statement",
        content: [
          "2.5M rural Rwandans lack access to specialized healthcare",
          "Average 4-hour travel time to reach nearest specialist",
          "Healthcare worker shortage: 1 doctor per 1,400 patients",
          "Preventable diseases account for 60% of rural mortality"
        ],
        keyPoints: ["2.5M underserved", "4-hour travel", "Doctor shortage", "Preventable deaths"]
      },
      {
        slideNumber: 2,
        title: "Our Solution",
        content: [
          "Telemedicine platform connecting rural patients with specialists",
          "AI-powered diagnostic assistance for community health workers",
          "Mobile health kiosks with basic diagnostic equipment",
          "Integration with Rwanda's national health information system"
        ],
        keyPoints: ["Telemedicine", "AI diagnostics", "Mobile kiosks", "Health system integration"]
      }
    ],
    insights: {
      marketSize: "East African digital health market projected to reach $1.8B by 2025",
      revenueProjection: "Subscription model targeting $3.2M revenue by Year 3 through government partnerships",
      competitiveAdvantage: "Integration with existing health infrastructure and government support",
      marketStrategy: "Partner with Ministry of Health and international development organizations"
    }
  };
}

function getGeneralTechDemo(industry: string, country: string, businessType: string, template?: string, theme?: string): DemoPitchContent {
  return {
    title: `TechSolution ${country}: Digital Innovation Platform`,
    slides: [
      {
        slideNumber: 1,
        title: "Problem Statement",
        content: [
          `Limited digital infrastructure constrains ${industry} growth in ${country}`,
          "Small businesses lack access to modern technology solutions",
          "Skills gap prevents adoption of digital tools",
          "High cost of imported technology solutions"
        ],
        keyPoints: ["Infrastructure limits", "SME access", "Skills gap", "Cost barriers"]
      },
      {
        slideNumber: 2,
        title: "Our Solution",
        content: [
          `Localized ${industry} platform designed for African markets`,
          "Affordable pricing with flexible payment options",
          "Comprehensive training and support programs",
          "Integration with existing business processes"
        ],
        keyPoints: ["Localized platform", "Affordable pricing", "Training included", "Easy integration"]
      }
    ],
    insights: {
      marketSize: `African ${industry} technology market growing at 18% annually`,
      revenueProjection: "SaaS model targeting sustainable growth with local partnerships",
      competitiveAdvantage: "Deep understanding of African market needs and constraints",
      marketStrategy: "Build through local partnerships and community engagement"
    }
  };
}