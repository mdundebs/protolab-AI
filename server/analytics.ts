import { Request, Response } from 'express';
import { storage } from './storage';

interface AnalyticsEvent {
  eventType: string;
  userId: string;
  metadata: any;
  timestamp: Date;
}

interface AfricaAnalytics {
  activeUsers: Record<string, number>;
  revenueStreams: {
    mpesa: number;
    flutterwave: number;
    card: number;
    telcoBilling: number;
  };
  topFeatures: Array<{
    name: string;
    usage: number;
  }>;
  conversionRates: {
    freeToHustler: number;
    hustlerToFounder: number;
    signupToActive: number;
  };
  carrierData: Record<string, {
    users: number;
    revenue: number;
    avgSessionTime: number;
  }>;
}

export async function getAfricaAnalytics(req: Request, res: Response) {
  try {
    const userCount = await storage.getUserCount();
    const revenue = await storage.getMonthlyRevenue();
    const analytics = await storage.getAnalytics();
    
    // Get user distribution by country
    const usersByCountry = await getUsersByCountry();
    
    // Get revenue breakdown by payment method
    const revenueBreakdown = await getRevenueByPaymentMethod();
    
    // Get feature usage statistics
    const featureUsage = await getFeatureUsageStats();
    
    // Get conversion rates
    const conversionRates = await getConversionRates();
    
    // Get carrier performance data
    const carrierData = await getCarrierAnalytics();

    const africaAnalytics: AfricaAnalytics = {
      activeUsers: usersByCountry,
      revenueStreams: revenueBreakdown,
      topFeatures: featureUsage,
      conversionRates,
      carrierData
    };

    res.json({
      overview: {
        totalUsers: userCount,
        monthlyRevenue: revenue,
        activeCountries: Object.keys(usersByCountry).length,
        topCountry: getTopCountry(usersByCountry)
      },
      detailed: africaAnalytics,
      trends: {
        userGrowth: await getUserGrowthTrend(),
        revenueGrowth: await getRevenueGrowthTrend(),
        featureAdoption: await getFeatureAdoptionTrend()
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

async function getUsersByCountry(): Promise<Record<string, number>> {
  const users = await storage.getAllUsers();
  const countryCount: Record<string, number> = {};
  
  users.forEach(user => {
    const country = user.country || 'Unknown';
    countryCount[country] = (countryCount[country] || 0) + 1;
  });
  
  return countryCount;
}

async function getRevenueByPaymentMethod() {
  const payments = await storage.getAllPayments?.() || [];
  
  const breakdown = {
    mpesa: 0,
    flutterwave: 0,
    card: 0,
    telcoBilling: 0
  };
  
  payments.forEach((payment: any) => {
    const method = payment.paymentMethod || 'card';
    const amount = parseFloat(payment.amount || 0);
    
    if (method in breakdown) {
      (breakdown as any)[method] += amount;
    }
  });
  
  return breakdown;
}

async function getFeatureUsageStats() {
  const events = await storage.getAnalyticsEvents?.() || [];
  const featureUsage: Record<string, number> = {};
  
  events.forEach((event: any) => {
    if (event.eventType === 'feature_used') {
      const feature = event.metadata?.feature || 'Unknown';
      featureUsage[feature] = (featureUsage[feature] || 0) + 1;
    }
  });
  
  return Object.entries(featureUsage)
    .map(([name, usage]) => ({ name, usage }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 10);
}

async function getConversionRates() {
  const users = await storage.getAllUsers();
  const totalUsers = users.length;
  const hustlerUsers = users.filter(u => u.plan === 'hustler_plus').length;
  const founderUsers = users.filter(u => u.plan === 'founder').length;
  const activeUsers = users.filter(u => u.isActive).length;
  
  return {
    freeToHustler: totalUsers > 0 ? (hustlerUsers / totalUsers) * 100 : 0,
    hustlerToFounder: hustlerUsers > 0 ? (founderUsers / hustlerUsers) * 100 : 0,
    signupToActive: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
  };
}

async function getCarrierAnalytics() {
  const users = await storage.getAllUsers();
  const events = await storage.getAnalyticsEvents?.() || [];
  const carrierData: Record<string, any> = {};
  
  users.forEach(user => {
    const carrier = user.carrier || 'Unknown';
    if (!carrierData[carrier]) {
      carrierData[carrier] = {
        users: 0,
        revenue: 0,
        avgSessionTime: 0,
        sessionCount: 0
      };
    }
    carrierData[carrier].users += 1;
  });
  
  // Calculate session times and revenue by carrier
  events.forEach((event: any) => {
    const user = users.find(u => u.id === event.userId);
    if (user && user.carrier) {
      const carrier = user.carrier;
      
      if (event.eventType === 'payment_completed') {
        carrierData[carrier].revenue += parseFloat(event.metadata?.amount || 0);
      }
      
      if (event.eventType === 'session_end') {
        const sessionTime = event.metadata?.duration || 0;
        carrierData[carrier].sessionCount += 1;
        carrierData[carrier].avgSessionTime = 
          (carrierData[carrier].avgSessionTime + sessionTime) / carrierData[carrier].sessionCount;
      }
    }
  });
  
  return carrierData;
}

function getTopCountry(usersByCountry: Record<string, number>): string {
  return Object.entries(usersByCountry)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
}

async function getUserGrowthTrend() {
  const users = await storage.getAllUsers();
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentUsers = users.filter(u => 
    new Date(u.createdAt || 0) > last30Days
  );
  
  return {
    total: users.length,
    lastMonth: recentUsers.length,
    growthRate: users.length > 0 ? (recentUsers.length / users.length) * 100 : 0
  };
}

async function getRevenueGrowthTrend() {
  const payments = await storage.getAllPayments?.() || [];
  const thisMonth = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const thisMonthRevenue = payments
    .filter((p: any) => new Date(p.createdAt || 0) >= lastMonth)
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);
  
  const previousMonthRevenue = payments
    .filter((p: any) => {
      const date = new Date(p.createdAt || 0);
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      return date >= twoMonthsAgo && date < lastMonth;
    })
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);
  
  return {
    current: thisMonthRevenue,
    previous: previousMonthRevenue,
    growthRate: previousMonthRevenue > 0 
      ? ((thisMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0
  };
}

async function getFeatureAdoptionTrend() {
  const events = await storage.getAnalyticsEvents?.() || [];
  const features = ['pitch_generation', 'resume_builder', 'grant_finder', 'collaboration'];
  
  return features.map(feature => {
    const featureEvents = events.filter((e: any) => 
      e.eventType === 'feature_used' && e.metadata?.feature === feature
    );
    
    const last7Days = featureEvents.filter((e: any) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(e.timestamp) > weekAgo;
    }).length;
    
    const previous7Days = featureEvents.filter((e: any) => {
      const twoWeeksAgo = new Date();
      const weekAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const eventDate = new Date(e.timestamp);
      return eventDate > twoWeeksAgo && eventDate <= weekAgo;
    }).length;
    
    return {
      feature,
      current: last7Days,
      previous: previous7Days,
      trend: previous7Days > 0 ? ((last7Days - previous7Days) / previous7Days) * 100 : 0
    };
  });
}

export async function trackFeatureUsage(req: Request, res: Response) {
  try {
    const { feature, metadata } = req.body;
    const userId = req.user?.userId;
    
    if (!userId || !feature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    await storage.createAnalyticsEvent?.({
      eventType: 'feature_used',
      userId,
      metadata: { feature, ...metadata },
      timestamp: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Feature tracking error:', error);
    res.status(500).json({ error: 'Failed to track feature usage' });
  }
}

export async function getDashboardMetrics(req: Request, res: Response) {
  try {
    const userCount = await storage.getUserCount();
    const subscriptionCount = await storage.getActiveSubscriptionCount();
    const monthlyRevenue = await storage.getMonthlyRevenue();
    const documentCount = await storage.getDocumentCount();
    const conversionRate = await storage.getConversionRate();
    
    // Additional African-specific metrics
    const usersByCountry = await getUsersByCountry();
    const topCountry = getTopCountry(usersByCountry);
    const mobileUsageRate = await getMobileUsageRate();
    
    res.json({
      overview: {
        totalUsers: userCount,
        activeSubscriptions: subscriptionCount,
        monthlyRevenue,
        documentsGenerated: documentCount,
        conversionRate,
        topMarket: topCountry,
        mobileUsage: mobileUsageRate
      },
      geographic: usersByCountry,
      performance: {
        avgResponseTime: await getAvgResponseTime(),
        uptime: 99.8, // This would come from monitoring service
        errorRate: await getErrorRate()
      }
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
}

async function getMobileUsageRate(): Promise<number> {
  const events = await storage.getAnalyticsEvents?.() || [];
  const mobileEvents = events.filter((e: any) => 
    e.metadata?.device === 'mobile' || e.metadata?.userAgent?.includes('Mobile')
  );
  
  return events.length > 0 ? (mobileEvents.length / events.length) * 100 : 0;
}

async function getAvgResponseTime(): Promise<number> {
  const events = await storage.getAnalyticsEvents?.() || [];
  const responseTimeEvents = events.filter((e: any) => 
    e.eventType === 'api_response' && e.metadata?.responseTime
  );
  
  if (responseTimeEvents.length === 0) return 0;
  
  const totalTime = responseTimeEvents.reduce((sum: number, e: any) => 
    sum + (e.metadata?.responseTime || 0), 0
  );
  
  return totalTime / responseTimeEvents.length;
}

async function getErrorRate(): Promise<number> {
  const events = await storage.getAnalyticsEvents?.() || [];
  const apiEvents = events.filter((e: any) => e.eventType === 'api_response');
  const errorEvents = events.filter((e: any) => 
    e.eventType === 'api_error' || (e.eventType === 'api_response' && e.metadata?.status >= 400)
  );
  
  return apiEvents.length > 0 ? (errorEvents.length / apiEvents.length) * 100 : 0;
}