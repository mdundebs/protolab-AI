// Feature flag system for hybrid African-Global architecture
import { Request } from 'express';

interface RegionConfig {
  paymentMethods: string[];
  features: string[];
  legalVersion: string;
  currency: string;
  supportedLanguages: string[];
}

export class FeatureFlags {
  private static flags: Record<string, boolean> = {};
  private static regionConfig: Record<string, RegionConfig> = {
    africa: {
      paymentMethods: ['mpesa', 'flutterwave', 'airtel_money', 'mtn_mobile_money'],
      features: ['mobile_money', 'local_ids', 'carrier_billing', 'sms_auth'],
      legalVersion: 'terms_africa_v1',
      currency: 'USD', // Multi-currency support
      supportedLanguages: ['en', 'sw', 'ha', 'zu', 'yo', 'ig', 'am']
    },
    global: {
      paymentMethods: ['stripe', 'paypal', 'apple_pay', 'google_pay'],
      features: ['vat_calc', 'gdpr_compliance', 'multi_currency', 'advanced_analytics'],
      legalVersion: 'terms_global_v1',
      currency: 'USD',
      supportedLanguages: ['en', 'es', 'fr', 'de', 'zh', 'ja']
    }
  };

  static initialize() {
    // Load feature flags from environment (Phase 1: Africa-focused)
    this.flags = {
      geo_ip: process.env.FF_GEOIP === 'true',
      multi_lang: process.env.FF_MULTI_LANG === 'true',
      advanced_analytics: process.env.FF_ADVANCED_ANALYTICS === 'true',
      gdpr_compliance: process.env.FF_GDPR === 'true',
      global_payments: process.env.FF_GLOBAL_PAYMENTS === 'true'
    };
  }

  static isEnabled(feature: string): boolean {
    return this.flags[feature] || false;
  }

  static getRegion(req: Request): string {
    // Phase 1: Static African region (0.01ms overhead)
    if (!this.isEnabled('geo_ip')) {
      return 'africa';
    }
    
    // Phase 2: Dynamic region detection (when enabled)
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    
    // Simple region detection based on request headers
    if (acceptLanguage.includes('sw') || acceptLanguage.includes('ha')) {
      return 'africa';
    }
    
    return 'africa'; // Default to Africa market
  }

  static getRegionConfig(region: string): RegionConfig {
    return this.regionConfig[region] || this.regionConfig.africa;
  }

  static getEnabledPaymentMethods(region: string): string[] {
    const config = this.getRegionConfig(region);
    const methods = config.paymentMethods;
    
    // Filter based on enabled features
    if (!this.isEnabled('global_payments')) {
      return methods.filter(method => 
        ['mpesa', 'flutterwave', 'airtel_money', 'mtn_mobile_money'].includes(method)
      );
    }
    
    return methods;
  }

  static getRegionFeatures(region: string): string[] {
    const config = this.getRegionConfig(region);
    return config.features.filter(feature => this.isEnabled(feature) || region === 'africa');
  }
}

// Middleware for region detection
export function setRegion(req: any, res: any, next: any) {
  req.region = FeatureFlags.getRegion(req);
  req.regionConfig = FeatureFlags.getRegionConfig(req.region);
  next();
}

// Payment gateway lazy loader
class PaymentGatewayLoader {
  private static gateways: Record<string, any> = {};

  static async getGateway(name: string) {
    if (!this.gateways[name]) {
      switch (name) {
        case 'mpesa':
          const { mpesaService } = await import('./mpesa-config');
          this.gateways[name] = mpesaService;
          break;
        case 'flutterwave':
          // Lazy load Flutterwave when needed
          this.gateways[name] = { 
            name: 'flutterwave',
            enabled: true 
          };
          break;
        case 'stripe':
          if (FeatureFlags.isEnabled('global_payments')) {
            // Load Stripe only when global payments enabled
            this.gateways[name] = { 
              name: 'stripe',
              enabled: true 
            };
          }
          break;
      }
    }
    return this.gateways[name];
  }
}

export { PaymentGatewayLoader };

// Initialize feature flags on import
FeatureFlags.initialize();