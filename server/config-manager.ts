// Environment-aware configuration manager for hybrid architecture
import { FeatureFlags } from './feature-flags';

interface PricingConfig {
  currency: string;
  tiers: {
    hustler_plus: number;
    founder: number;
    corporate: number;
  };
}

interface RegionalPricing {
  [key: string]: PricingConfig;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: any;

  private constructor() {
    this.loadConfiguration();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfiguration() {
    this.config = {
      // Payment provider configuration
      paymentProviders: (process.env.PAYMENT_PROVIDERS || 'mpesa,flutterwave').split(','),
      
      // Regional pricing (optimized for African markets)
      pricing: {
        kenya: {
          currency: 'KES',
          tiers: {
            hustler_plus: 950,   // ~$9.50 USD
            founder: 1900,       // ~$19 USD
            corporate: 4750      // ~$47.50 USD
          }
        },
        nigeria: {
          currency: 'NGN',
          tiers: {
            hustler_plus: 7600,  // ~$9.50 USD
            founder: 15200,      // ~$19 USD
            corporate: 38000     // ~$47.50 USD
          }
        },
        south_africa: {
          currency: 'ZAR',
          tiers: {
            hustler_plus: 142,   // ~$9.50 USD
            founder: 285,        // ~$19 USD
            corporate: 712       // ~$47.50 USD
          }
        },
        ghana: {
          currency: 'GHS',
          tiers: {
            hustler_plus: 114,   // ~$9.50 USD
            founder: 228,        // ~$19 USD
            corporate: 570       // ~$47.50 USD
          }
        },
        global: {
          currency: 'USD',
          tiers: {
            hustler_plus: 9.50,
            founder: 19.00,
            corporate: 47.50
          }
        }
      },

      // Feature limits by region and tier
      limits: {
        free: {
          pitch_decks: 3,
          business_plans: 2,
          resumes: 5,
          collaborators: 1,
          templates: 'basic'
        },
        hustler_plus: {
          pitch_decks: 25,
          business_plans: 15,
          resumes: 50,
          collaborators: 5,
          templates: 'premium'
        },
        founder: {
          pitch_decks: 100,
          business_plans: 50,
          resumes: 200,
          collaborators: 15,
          templates: 'all'
        },
        corporate: {
          pitch_decks: -1, // unlimited
          business_plans: -1,
          resumes: -1,
          collaborators: -1,
          templates: 'all'
        }
      },

      // Regional feature availability
      regionalFeatures: {
        africa: [
          'mobile_money_payments',
          'carrier_billing',
          'sms_authentication',
          'local_language_support',
          'african_templates',
          'grant_database_africa',
          'patent_filing_aripo'
        ],
        global: [
          'advanced_analytics',
          'multi_currency',
          'vat_calculation',
          'gdpr_compliance',
          'global_templates',
          'worldwide_grants'
        ]
      }
    };
  }

  // Get pricing for specific country
  getPricing(country: string): PricingConfig {
    const countryKey = country.toLowerCase().replace(/\s+/g, '_');
    return this.config.pricing[countryKey] || this.config.pricing.global;
  }

  // Get enabled payment methods for region
  getPaymentMethods(region: string): string[] {
    const regionConfig = FeatureFlags.getRegionConfig(region);
    return regionConfig.paymentMethods.filter(method => 
      this.config.paymentProviders.includes(method)
    );
  }

  // Get feature limits for user tier
  getFeatureLimits(tier: string): any {
    return this.config.limits[tier] || this.config.limits.free;
  }

  // Check if feature is available in region
  isFeatureAvailable(feature: string, region: string): boolean {
    const features = this.config.regionalFeatures[region] || [];
    return features.includes(feature);
  }

  // Get currency for country
  getCurrency(country: string): string {
    const pricing = this.getPricing(country);
    return pricing.currency;
  }

  // Get localized pricing display
  getLocalizedPrice(tier: string, country: string): { amount: number; currency: string; display: string } {
    const pricing = this.getPricing(country);
    const amount = pricing.tiers[tier as keyof typeof pricing.tiers];
    
    const formatters: { [key: string]: (amount: number) => string } = {
      'KES': (amt) => `KES ${amt.toLocaleString()}`,
      'NGN': (amt) => `₦${amt.toLocaleString()}`,
      'ZAR': (amt) => `R${amt.toFixed(2)}`,
      'GHS': (amt) => `GH₵${amt.toFixed(2)}`,
      'USD': (amt) => `$${amt.toFixed(2)}`
    };

    const formatter = formatters[pricing.currency] || formatters.USD;
    
    return {
      amount,
      currency: pricing.currency,
      display: formatter(amount)
    };
  }

  // Get regional configuration
  getRegionalConfig(region: string): any {
    return {
      paymentMethods: this.getPaymentMethods(region),
      features: this.config.regionalFeatures[region] || [],
      currency: region === 'africa' ? 'multi' : 'USD'
    };
  }

  // Performance optimization: Cache frequently accessed configs
  private cache = new Map<string, any>();

  getCachedConfig(key: string, generator: () => any): any {
    if (!this.cache.has(key)) {
      this.cache.set(key, generator());
    }
    return this.cache.get(key);
  }

  // Environment-specific settings
  getEnvironmentConfig(): any {
    return {
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      enableDebugLogs: process.env.DEBUG_LOGS === 'true',
      enableMetrics: process.env.ENABLE_METRICS === 'true',
      enableGeoIP: process.env.FF_GEOIP === 'true',
      enableAdvancedAnalytics: process.env.FF_ADVANCED_ANALYTICS === 'true'
    };
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();