import { DocumentContext } from './document-intelligence';

export interface GammaQualitySlide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  content: string[];
  visualElements: {
    type: 'chart' | 'image' | 'icon' | 'diagram' | 'timeline';
    description: string;
    data?: any;
  }[];
  layout: 'hero' | 'split' | 'full-content' | 'visual-heavy' | 'data-focused';
  designNotes: string;
  animations?: string[];
}

export interface GammaQualityPitch {
  title: string;
  subtitle: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontPrimary: string;
    fontSecondary: string;
    style: 'modern' | 'corporate' | 'creative' | 'minimal' | 'bold';
  };
  slides: GammaQualitySlide[];
  designSystem: {
    spacing: string;
    borderRadius: string;
    shadows: string;
    typography: {
      h1: string;
      h2: string;
      body: string;
      caption: string;
    };
  };
  brandElements: {
    logo?: string;
    brandColors: string[];
    brandFonts: string[];
    voiceTone: string;
  };
  insights: {
    marketSize: string;
    revenueProjection: string;
    competitiveAdvantage: string;
    marketStrategy: string;
    riskAssessment: string;
    timeline: string;
  };
}

export function generateGammaQualityPitch(
  businessData: {
    businessName: string;
    industry: string;
    country: string;
    businessType: string;
    description: string;
    fundingAmount: number;
    targetRevenue?: number;
    useCase: string;
  },
  context?: DocumentContext
): GammaQualityPitch {
  
  // Enhanced content quality based on NVN and professional presentation standards
  
  const industryThemes = {
    'agtech': {
      primaryColor: '#2E7D32',
      secondaryColor: '#4CAF50',
      accentColor: '#81C784',
      style: 'modern' as const,
      brandColors: ['#2E7D32', '#4CAF50', '#81C784', '#C8E6C9']
    },
    'fintech': {
      primaryColor: '#1565C0',
      secondaryColor: '#2196F3',
      accentColor: '#64B5F6',
      style: 'corporate' as const,
      brandColors: ['#1565C0', '#2196F3', '#64B5F6', '#BBDEFB']
    },
    'healthtech': {
      primaryColor: '#C62828',
      secondaryColor: '#F44336',
      accentColor: '#EF5350',
      style: 'minimal' as const,
      brandColors: ['#C62828', '#F44336', '#EF5350', '#FFCDD2']
    },
    'default': {
      primaryColor: '#1976D2',
      secondaryColor: '#2196F3',
      accentColor: '#42A5F5',
      style: 'modern' as const,
      brandColors: ['#1976D2', '#2196F3', '#42A5F5', '#90CAF9']
    }
  };

  const theme = industryThemes[businessData.industry.toLowerCase() as keyof typeof industryThemes] || industryThemes.default;

  const slides: GammaQualitySlide[] = [
    {
      slideNumber: 1,
      title: businessData.businessName,
      subtitle: `${businessData.industry} Innovation: Unite Sectors, Empower Nations`,
      content: [
        `"${businessData.description}"`,
        `Seeking $${(businessData.fundingAmount || businessData.targetRevenue || 500000).toLocaleString()} for ${businessData.useCase}`,
        `4IR Solutions for ${businessData.industry}, Industry & Smart Cities`,
        `Guided by ${businessData.country}'s Leadership in Innovation & Strategic Transformation`
      ],
      visualElements: [
        {
          type: 'diagram',
          description: `Professional brand identity with ${businessData.industry} sector visualization and strategic positioning matrix`,
          data: { iconName: 'innovation-nexus', style: 'professional', gradient: true }
        }
      ],
      layout: 'hero',
      designNotes: 'Executive-level hero slide with authority and strategic vision',
      animations: ['fade-in', 'strategic-entrance']
    },
    {
      slideNumber: 2,
      title: "The Problem",
      subtitle: "Market Pain Points Demanding Innovation",
      content: [
        `Current ${businessData.industry} solutions lack efficiency and scalability`,
        `Market gaps in ${businessData.country} create significant opportunities`,
        "Traditional approaches fail to meet modern demands",
        "Cost inefficiencies plague existing systems"
      ],
      visualElements: [
        {
          type: 'diagram',
          description: 'Problem visualization with pain point mapping',
          data: { type: 'pain-points', items: 4, layout: 'circular' }
        }
      ],
      layout: 'split',
      designNotes: 'Problem-focused with visual metaphors and data visualization'
    },
    {
      slideNumber: 3,
      title: "Our Solution",
      subtitle: "Innovative Technology Meets Market Needs",
      content: [
        businessData.description,
        "Proprietary technology stack delivering measurable results",
        "Scalable architecture built for growth",
        "User-centric design with seamless integration"
      ],
      visualElements: [
        {
          type: 'diagram',
          description: 'Solution architecture diagram with technology stack',
          data: { type: 'architecture', components: 5, style: 'modern' }
        }
      ],
      layout: 'visual-heavy',
      designNotes: 'Solution-focused with technical architecture visualization'
    },
    {
      slideNumber: 4,
      title: "Why Choose Us?",
      subtitle: "Proven Impact & Strategic Readiness",
      content: [
        `30% Maintenance Cost Reduction through predictive analytics`,
        `25% Annual Savings via centralized data governance and ISO 8000 compliance`,
        `40% Downtime Reduction with ML-driven failure prediction systems`,
        `Plot-proven frameworks for predictive maintenance and cybersecurity`
      ],
      visualElements: [
        {
          type: 'chart',
          description: 'Performance metrics showcase with percentage improvements and strategic readiness indicators',
          data: { 
            type: 'impact-metrics', 
            metrics: [
              { label: 'Cost Reduction', value: 30, color: 'green' },
              { label: 'Annual Savings', value: 25, color: 'blue' },
              { label: 'Downtime Reduction', value: 40, color: 'purple' }
            ]
          }
        }
      ],
      layout: 'data-focused',
      designNotes: 'Impact-driven metrics with professional certification badges'
    },
    {
      slideNumber: 5,
      title: "Core Services & Advanced Solutions",
      subtitle: "Cross-Sector Collaboration & Innovation",
      content: [
        `AI & Data Science Consulting: Predictive maintenance cutting downtime by 40%`,
        `Cybersecurity & Data Privacy: GDPR/POPIA compliance with PECB ISO frameworks`,
        `Digital Twin Solutions: Virtual plant modeling and predictive analytics`,
        `Smart Cities Advisory: Optimizing water, energy, and transport systems`
      ],
      visualElements: [
        {
          type: 'diagram',
          description: 'Service portfolio matrix with certification badges and industry partnerships',
          data: { type: 'service-matrix', sectors: 4, certifications: ['PECB', 'ISO'], partnerships: ['global', 'local'] }
        }
      ],
      layout: 'visual-heavy',
      designNotes: 'Professional service portfolio with certification credibility'
    },
    {
      slideNumber: 6,
      title: "Innovation Diplomacy in Action",
      subtitle: "Bridging Industries, Governments & Global Partners",
      content: [
        `Local Impact: Partner with ${businessData.country}'s leading institutions to train 200+ engineers in AI-driven solutions`,
        `Global Collaboration: Strategic alliances with international tech leaders for shared prosperity`,
        `Cross-Sector Innovation: Forge partnerships between mining agents, city planners, and cybersecurity experts`,
        `Case Study Success: 30% faster leak detection using digital twin + AI implementation`
      ],
      visualElements: [
        {
          type: 'diagram',
          description: 'Strategic partnership network showing local-to-global collaboration matrix',
          data: { type: 'partnership-network', local: 3, global: 4, sectors: 5 }
        }
      ],
      layout: 'split',
      designNotes: 'Professional networking visualization with measurable impact metrics'
    },
    {
      slideNumber: 7,
      title: "Competitive Landscape",
      subtitle: "Market Positioning & Differentiation",
      content: [
        "Fragmented market with outdated solutions",
        "First-mover advantage in emerging technologies",
        "Superior user experience and functionality",
        "Proprietary algorithms delivering 10x performance"
      ],
      visualElements: [
        {
          type: 'diagram',
          description: 'Competitive positioning matrix',
          data: { type: 'positioning-matrix', competitors: 6, dimensions: 2 }
        }
      ],
      layout: 'visual-heavy',
      designNotes: 'Competitive analysis with clear differentiation'
    },
    {
      slideNumber: 8,
      title: "Financial Projections",
      subtitle: "Path to Profitability",
      content: [
        `Year 1 Revenue: $${(businessData.fundingAmount * 0.5).toLocaleString()}k`,
        `Year 2 Revenue: $${(businessData.fundingAmount * 1.5).toLocaleString()}k`,
        `Year 3 Revenue: $${(businessData.fundingAmount * 3).toLocaleString()}k`,
        "Break-even by Month 18 with positive cash flow"
      ],
      visualElements: [
        {
          type: 'chart',
          description: '3-year financial projection with revenue and profitability',
          data: { 
            type: 'growth-chart', 
            years: 3, 
            metrics: ['revenue', 'users', 'profit'],
            growth_rate: 0.15
          }
        }
      ],
      layout: 'data-focused',
      designNotes: 'Financial projections with clear growth trajectory'
    },
    {
      slideNumber: 9,
      title: "The Team",
      subtitle: "Experienced Leadership",
      content: [
        "Founding team with combined 20+ years experience",
        `Deep expertise in ${businessData.industry} and technology`,
        "Proven track record of successful exits",
        "Advisory board with industry veterans"
      ],
      visualElements: [
        {
          type: 'diagram',
          description: 'Team structure with key roles and experience',
          data: { type: 'org-chart', members: 6, roles: ['CEO', 'CTO', 'CMO'] }
        }
      ],
      layout: 'split',
      designNotes: 'Team credibility with professional presentation'
    },
    {
      slideNumber: 10,
      title: "Funding & Use of Funds",
      subtitle: `$${(businessData.fundingAmount || businessData.targetRevenue || 500000).toLocaleString()} Investment Opportunity`,
      content: [
        "40% Product Development & R&A",
        "30% Marketing & Customer Acquisition",
        "20% Team Expansion & Hiring",
        "10% Operations & Infrastructure"
      ],
      visualElements: [
        {
          type: 'chart',
          description: 'Use of funds allocation with clear breakdown',
          data: { 
            type: 'pie-chart', 
            segments: [
              { label: 'Product Development', value: 40 },
              { label: 'Marketing', value: 30 },
              { label: 'Team Expansion', value: 20 },
              { label: 'Operations', value: 10 }
            ]
          }
        }
      ],
      layout: 'data-focused',
      designNotes: 'Funding allocation with transparent use of funds'
    },
    {
      slideNumber: 11,
      title: "Local Roots, Global Vision",
      subtitle: `Designed for ${businessData.country} Excellence`,
      content: [
        `Engineering Council Collaboration: CPD-Accredited Programs for "Ethical AI for Engineers" (ISO 7000)`,
        `PECB Certifications: Internationally recognized qualifications that enhance professional standing`,
        `Licensure Support: Training meets ${businessData.country}'s 4IR regulatory standards`,
        `Scale Nationally: Replicate success across Africa and beyond`
      ],
      visualElements: [
        {
          type: 'diagram',
          description: 'Professional certification ecosystem with regulatory compliance visualization',
          data: { type: 'certification-matrix', standards: ['ISO', 'PECB', 'Engineering Council'], regions: 'Africa' }
        }
      ],
      layout: 'hero',
      designNotes: 'Professional credibility with regulatory alignment and expansion vision'
    },
    {
      slideNumber: 12,
      title: "Join Our Innovation Alliance",
      subtitle: "Where Data Meets Destiny, and Sectors Unite",
      content: [
        "Free Assessment: Audit your AI/cybersecurity readiness",
        "Custom Bundle: Combine predictive maintenance, ISO 8000 data governance, and PECB training",
        "Scale Nationally: Replicate success across your region and Africa",
        "Contact us today to transform your industry through strategic innovation"
      ],
      visualElements: [
        {
          type: 'diagram',
          description: 'Call-to-action framework with partnership tiers and engagement options',
          data: { type: 'engagement-funnel', tiers: ['Assessment', 'Bundle', 'Scale'], impact: 'continental' }
        }
      ],
      layout: 'hero',
      designNotes: 'Executive call-to-action with clear next steps and continental vision'
    }
  ];

  return {
    title: businessData.businessName,
    subtitle: `${businessData.industry} Innovation for ${businessData.country}`,
    theme: {
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      fontPrimary: 'Inter, system-ui, sans-serif',
      fontSecondary: 'JetBrains Mono, monospace',
      style: theme.style
    },
    slides,
    designSystem: {
      spacing: '8px grid system',
      borderRadius: '12px',
      shadows: '0 4px 20px rgba(0,0,0,0.1)',
      typography: {
        h1: '2.5rem font-bold tracking-tight',
        h2: '1.875rem font-semibold',
        body: '1rem font-normal line-height-1.6',
        caption: '0.875rem font-medium text-gray-600'
      }
    },
    brandElements: {
      brandColors: theme.brandColors,
      brandFonts: ['Inter', 'JetBrains Mono'],
      voiceTone: context?.website_content ? 'Professional with brand consistency' : 'Confident and innovative'
    },
    insights: {
      marketSize: `$${(businessData.fundingAmount * 200).toLocaleString()}M TAM`,
      revenueProjection: `$${(businessData.fundingAmount * 3).toLocaleString()}k by Year 3`,
      competitiveAdvantage: 'First-mover with proprietary technology',
      marketStrategy: 'Freemium to Enterprise growth model',
      riskAssessment: 'Low technical risk, managed market risk',
      timeline: '18 months to profitability'
    }
  };
}

export function generateGammaQualityHTML(pitch: GammaQualityPitch): string {
  const { theme, slides, designSystem } = pitch;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pitch.title} - Investor Pitch Deck</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${theme.fontPrimary};
            background: linear-gradient(135deg, ${theme.primaryColor}15 0%, ${theme.secondaryColor}15 100%);
            color: #1a1a1a;
            line-height: 1.6;
        }
        
        .pitch-deck {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .slide {
            background: white;
            border-radius: ${designSystem.borderRadius};
            box-shadow: ${designSystem.shadows};
            margin-bottom: 3rem;
            padding: 3rem;
            min-height: 600px;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        }
        
        .slide::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor});
        }
        
        .slide-number {
            position: absolute;
            top: 1rem;
            right: 1.5rem;
            background: ${theme.accentColor}20;
            color: ${theme.primaryColor};
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .slide-title {
            ${designSystem.typography.h1};
            color: ${theme.primaryColor};
            margin-bottom: 0.5rem;
        }
        
        .slide-subtitle {
            ${designSystem.typography.h2};
            color: ${theme.secondaryColor};
            margin-bottom: 2rem;
            opacity: 0.8;
        }
        
        .slide-content {
            flex: 1;
            display: grid;
            gap: 1.5rem;
        }
        
        .slide.hero {
            text-align: center;
            justify-content: center;
            background: linear-gradient(135deg, ${theme.primaryColor}05, ${theme.secondaryColor}05);
        }
        
        .slide.hero .slide-title {
            font-size: 3.5rem;
            font-weight: 900;
            margin-bottom: 1rem;
        }
        
        .slide.split .slide-content {
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
        }
        
        .slide.visual-heavy .slide-content {
            grid-template-columns: 1fr 2fr;
            gap: 3rem;
        }
        
        .slide.data-focused {
            background: ${theme.primaryColor}02;
        }
        
        .content-list {
            list-style: none;
        }
        
        .content-list li {
            padding: 1rem;
            margin-bottom: 0.5rem;
            background: ${theme.accentColor}10;
            border-left: 4px solid ${theme.primaryColor};
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .content-list li:hover {
            background: ${theme.accentColor}20;
            transform: translateX(4px);
        }
        
        .visual-placeholder {
            background: linear-gradient(135deg, ${theme.secondaryColor}20, ${theme.accentColor}20);
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            color: ${theme.primaryColor};
            font-weight: 600;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px dashed ${theme.primaryColor}40;
        }
        
        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .insight-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid ${theme.primaryColor};
        }
        
        .insight-label {
            font-size: 0.875rem;
            color: ${theme.primaryColor};
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .insight-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-top: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .slide {
                padding: 2rem;
            }
            
            .slide.split .slide-content,
            .slide.visual-heavy .slide-content {
                grid-template-columns: 1fr;
            }
            
            .slide.hero .slide-title {
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="pitch-deck">
        ${slides.map(slide => `
            <div class="slide ${slide.layout}">
                <div class="slide-number">${slide.slideNumber}</div>
                <h1 class="slide-title">${slide.title}</h1>
                ${slide.subtitle ? `<h2 class="slide-subtitle">${slide.subtitle}</h2>` : ''}
                <div class="slide-content">
                    <div>
                        <ul class="content-list">
                            ${slide.content.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    ${slide.visualElements.length > 0 ? `
                        <div class="visual-placeholder">
                            ${slide.visualElements[0].description}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('')}
        
        <div class="slide">
            <h1 class="slide-title">Key Insights</h1>
            <div class="insights-grid">
                <div class="insight-card">
                    <div class="insight-label">Market Size</div>
                    <div class="insight-value">${pitch.insights.marketSize}</div>
                </div>
                <div class="insight-card">
                    <div class="insight-label">Revenue Projection</div>
                    <div class="insight-value">${pitch.insights.revenueProjection}</div>
                </div>
                <div class="insight-card">
                    <div class="insight-label">Competitive Advantage</div>
                    <div class="insight-value">${pitch.insights.competitiveAdvantage}</div>
                </div>
                <div class="insight-card">
                    <div class="insight-label">Market Strategy</div>
                    <div class="insight-value">${pitch.insights.marketStrategy}</div>
                </div>
                <div class="insight-card">
                    <div class="insight-label">Risk Assessment</div>
                    <div class="insight-value">${pitch.insights.riskAssessment}</div>
                </div>
                <div class="insight-card">
                    <div class="insight-label">Timeline</div>
                    <div class="insight-value">${pitch.insights.timeline}</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}