import type { Express } from "express";
import { hackathonIntegrations } from "../services/hackathon-integrations.js";

export function registerHackathonRoutes(app: Express) {
  
  // Get hackathon integration status
  app.get('/api/hackathon/status', async (req, res) => {
    try {
      const status = await hackathonIntegrations.getIntegrationStatus();
      res.json({
        success: true,
        integrations: status,
        total_credits_available: {
          tavus: 150,
          dappier: 25,
          lingo: 50,
          pica: 'unlimited_pro',
          sentry: '6_months_free',
          revenuecat: 'free_until_2500_monthly'
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get integration status' });
    }
  });

  // Enhanced pitch generation with all integrations
  app.post('/api/hackathon/enhance-pitch', async (req, res) => {
    try {
      const pitchData = req.body;
      
      if (!pitchData.businessName || !pitchData.description) {
        return res.status(400).json({ error: 'Business name and description required' });
      }

      const enhancedPitch = await hackathonIntegrations.enhancePitchWithAllIntegrations(pitchData);
      
      res.json({
        success: true,
        enhanced_pitch: enhancedPitch,
        integrations_used: [
          'Tavus AI Video Generation',
          'Pica Premium Design',
          'Dappier AI Content Enhancement',
          'Lingo Multi-language Localization'
        ],
        credits_status: enhancedPitch.integration_credits_used
      });
    } catch (error) {
      console.error('Pitch enhancement error:', error);
      res.status(500).json({ error: 'Failed to enhance pitch with integrations' });
    }
  });

  // RevenueCat subscription management
  app.post('/api/hackathon/revenuecat/init', async (req, res) => {
    try {
      const subscriptionConfig = await hackathonIntegrations.revenueCat.initializeSubscriptionManagement();
      
      res.json({
        success: true,
        subscription_config: subscriptionConfig,
        message: 'RevenueCat integration initialized - FREE for Bolt participants!'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to initialize RevenueCat' });
    }
  });

  // Sentry error monitoring setup
  app.post('/api/hackathon/sentry/init', async (req, res) => {
    try {
      const monitoringConfig = await hackathonIntegrations.sentry.initializeErrorMonitoring();
      
      res.json({
        success: true,
        monitoring_config: monitoringConfig,
        message: 'Sentry monitoring active - 6 months FREE Team Plan!'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to initialize Sentry monitoring' });
    }
  });

  // Tavus conversational video generation
  app.post('/api/hackathon/tavus/generate', async (req, res) => {
    try {
      const { pitchData } = req.body;
      
      const conversationalVideo = await hackathonIntegrations.tavus.generateConversationalVideo(pitchData);
      
      res.json({
        success: true,
        conversational_video: conversationalVideo,
        message: 'AI conversational video generated with Tavus - $150 FREE credits!'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate Tavus video' });
    }
  });

  // Pica design enhancement
  app.post('/api/hackathon/pica/enhance', async (req, res) => {
    try {
      const { designData } = req.body;
      
      const enhancedDesign = await hackathonIntegrations.pica.enhanceDesignElements(designData);
      
      res.json({
        success: true,
        enhanced_design: enhancedDesign,
        message: 'Premium design enhanced with Pica - 2 months FREE Pro access!'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to enhance design with Pica' });
    }
  });

  // Dappier AI content enhancement
  app.post('/api/hackathon/dappier/enhance', async (req, res) => {
    try {
      const { query } = req.body;
      
      const enhancedContent = await hackathonIntegrations.dappier.enhanceContentWithAI(query);
      
      res.json({
        success: true,
        enhanced_content: enhancedContent,
        message: 'Content enhanced with Dappier AI - $25 FREE credits!'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to enhance content with Dappier' });
    }
  });

  // Lingo localization
  app.post('/api/hackathon/lingo/localize', async (req, res) => {
    try {
      const { content, languages } = req.body;
      
      if (!content || !languages || !Array.isArray(languages)) {
        return res.status(400).json({ error: 'Content and target languages array required' });
      }
      
      const localizedContent = await hackathonIntegrations.lingo.localizeContent(content, languages);
      
      res.json({
        success: true,
        localized_content: localizedContent,
        message: `Content localized to ${languages.length} languages with Lingo - $50 FREE credits!`
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to localize content with Lingo' });
    }
  });

  // Complete hackathon showcase
  app.post('/api/hackathon/showcase', async (req, res) => {
    try {
      const { businessData } = req.body;
      
      // Generate comprehensive showcase using all integrations
      const [
        conversationalVideo,
        enhancedDesign,
        enhancedContent,
        localizedContent
      ] = await Promise.all([
        hackathonIntegrations.tavus.generateConversationalVideo(businessData),
        hackathonIntegrations.pica.enhanceDesignElements(businessData),
        hackathonIntegrations.dappier.enhanceContentWithAI(businessData.description),
        hackathonIntegrations.lingo.localizeContent(businessData.description, ['fr', 'sw', 'ar', 'pt'])
      ]);

      const showcase = {
        business_name: businessData.businessName,
        original_data: businessData,
        enhanced_features: {
          ai_video: conversationalVideo,
          premium_design: enhancedDesign,
          ai_content: enhancedContent,
          multi_language: localizedContent
        },
        hackathon_perks_used: {
          tavus: '$150 FREE credits',
          pica: '2 months FREE Pro',
          dappier: '$25 FREE credits',
          lingo: '$50 FREE credits',
          sentry: '6 months FREE monitoring',
          revenuecat: 'FREE until $2.5K/month'
        },
        total_value_unlocked: '$475+ in premium features',
        ready_for_production: true
      };
      
      res.json({
        success: true,
        hackathon_showcase: showcase,
        message: 'Complete hackathon showcase generated with all premium integrations!'
      });
    } catch (error) {
      console.error('Hackathon showcase error:', error);
      res.status(500).json({ error: 'Failed to generate hackathon showcase' });
    }
  });
}