export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: [
      '2 pitch decks per month',
      'Basic templates',
      'Standard export (HTML)',
      'Community support',
      'Basic analytics'
    ],
    limits: {
      pitchDecks: 2,
      documents: 5,
      collaborators: 1,
      storage: '100MB',
      videoGeneration: 0,
      premiumTemplates: false
    }
  },
  hustler_plus: {
    name: 'Hustler+',
    price: 19,
    currency: 'USD',
    features: [
      '20 pitch decks per month',
      'Premium templates',
      'All export formats (PDF, PPT)',
      'Email support',
      'Advanced analytics',
      '2 3D videos included',
      'Brand customization'
    ],
    limits: {
      pitchDecks: 20,
      documents: 50,
      collaborators: 3,
      storage: '1GB',
      videoGeneration: 2,
      premiumTemplates: true
    }
  },
  founder: {
    name: 'Founder',
    price: 49,
    currency: 'USD',
    features: [
      'Unlimited pitch decks',
      'All premium templates',
      'Priority export processing',
      'Priority support',
      'Team collaboration',
      '10 3D videos included',
      'Custom branding',
      'API access'
    ],
    limits: {
      pitchDecks: -1, // unlimited
      documents: -1,
      collaborators: 10,
      storage: '10GB',
      videoGeneration: 10,
      premiumTemplates: true
    }
  },
  corporate: {
    name: 'Corporate',
    price: 99,
    currency: 'USD',
    features: [
      'Unlimited everything',
      'Custom templates',
      'White-label solution',
      'Dedicated support',
      'Advanced team management',
      'Unlimited 3D videos',
      'Custom integrations',
      'Enterprise security'
    ],
    limits: {
      pitchDecks: -1,
      documents: -1,
      collaborators: -1,
      storage: 'unlimited',
      videoGeneration: -1,
      premiumTemplates: true
    }
  }
};

export const REGIONAL_PRICING = {
  'south-africa': {
    currency: 'ZAR',
    multiplier: 18.5,
    paymentMethods: ['card', 'eft', 'instant_eft']
  },
  'kenya': {
    currency: 'KES',
    multiplier: 150,
    paymentMethods: ['mpesa', 'card', 'bank_transfer']
  },
  'nigeria': {
    currency: 'NGN',
    multiplier: 1500,
    paymentMethods: ['flutterwave', 'card', 'bank_transfer']
  },
  'ghana': {
    currency: 'GHS',
    multiplier: 12,
    paymentMethods: ['momo', 'card', 'bank_transfer']
  },
  'default': {
    currency: 'USD',
    multiplier: 1,
    paymentMethods: ['card', 'paypal']
  }
};

export function getPricingForRegion(tier: keyof typeof PRICING_TIERS, country: string) {
  const baseTier = PRICING_TIERS[tier];
  const region = REGIONAL_PRICING[country as keyof typeof REGIONAL_PRICING] || REGIONAL_PRICING.default;
  
  return {
    ...baseTier,
    price: Math.round(baseTier.price * region.multiplier),
    currency: region.currency,
    paymentMethods: region.paymentMethods
  };
}

export function formatPrice(price: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(price);
}