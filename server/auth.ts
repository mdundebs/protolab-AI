import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { storage } from './storage';
import './types';

// Africa-optimized phone validation
export function validateAfricanPhone(phone: string): boolean {
  const patterns = {
    'nigeria': /^\+234\d{10}$/,
    'kenya': /^\+254\d{9}$/,
    'south_africa': /^\+27\d{9}$/,
    'ghana': /^\+233\d{9}$/,
    'uganda': /^\+256\d{9}$/,
    'tanzania': /^\+255\d{9}$/,
    'rwanda': /^\+250\d{9}$/,
    'ethiopia': /^\+251\d{9}$/
  };
  
  return Object.values(patterns).some(pattern => pattern.test(phone));
}

export function detectCountryFromPhone(phone: string): string {
  const countryPrefixes: Record<string, string> = {
    '+234': 'Nigeria',
    '+254': 'Kenya',
    '+27': 'South Africa',
    '+233': 'Ghana',
    '+256': 'Uganda',
    '+255': 'Tanzania',
    '+250': 'Rwanda',
    '+251': 'Ethiopia'
  };
  
  for (const [prefix, country] of Object.entries(countryPrefixes)) {
    if (phone.startsWith(prefix)) {
      return country;
    }
  }
  return 'Unknown';
}

export function detectCarrier(phone: string): string {
  const carriers: Record<string, string> = {
    '23480': 'MTN Nigeria',
    '23481': 'Airtel Nigeria',
    '23490': 'Glo Nigeria',
    '25470': 'Safaricom Kenya',
    '25471': 'Airtel Kenya',
    '2771': 'Vodacom SA',
    '2772': 'MTN SA',
    '2773': 'Cell C SA',
    '23324': 'MTN Ghana',
    '23354': 'Vodafone Ghana'
  };
  
  const prefix = phone.substring(0, 5);
  return carriers[prefix] || 'Unknown Carrier';
}

export async function registerUser(req: Request, res: Response) {
  try {
    const { phone, email, password, name } = req.body;
    
    if (!validateAfricanPhone(phone)) {
      return res.status(400).json({ 
        error: 'Invalid African phone format. Use format: +234XXXXXXXXXX' 
      });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByPhone?.(phone);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const country = detectCountryFromPhone(phone);
    const carrier = detectCarrier(phone);
    
    const newUser = await storage.createUser({
      username: name || phone,
      email: email || null,
      password: hashedPassword,
      phone,
      country,
      carrier,
      plan: 'free'
    });

    const token = jwt.sign(
      { 
        userId: newUser.id, 
        phone: newUser.phone,
        plan: 'free',
        country 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    // Track registration analytics
    await trackUserEvent('user_registered', {
      userId: newUser.id,
      country,
      carrier,
      registrationMethod: 'phone'
    });

    res.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.username,
        phone: newUser.phone,
        country,
        plan: 'free'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { phone, password } = req.body;
    
    const user = await storage.getUserByPhone(phone);
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await storage.updateUserLastLogin(user.id);

    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone,
        plan: user.plan || 'free',
        country: user.country 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    // Track login analytics
    await trackUserEvent('user_login', {
      userId: user.id,
      country: user.country,
      carrier: user.carrier
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.username,
        phone: user.phone,
        country: user.country,
        plan: user.plan || 'free'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function mpesaWebhook(req: Request, res: Response) {
  try {
    const { 
      TransactionType, 
      TransID, 
      TransTime, 
      TransAmount, 
      BusinessShortCode, 
      BillRefNumber, 
      InvoiceNumber, 
      OrgAccountBalance, 
      ThirdPartyTransID, 
      MSISDN, 
      FirstName, 
      MiddleName, 
      LastName 
    } = req.body;

    if (TransactionType === 'Pay Bill') {
      const phone = MSISDN.startsWith('254') ? `+${MSISDN}` : `+254${MSISDN}`;
      const amount = parseFloat(TransAmount);
      
      // Determine plan based on amount
      let newPlan = 'free';
      let duration = 0;
      
      if (amount >= 1900) { // $19 USD ≈ 1900 KES
        newPlan = 'founder';
        duration = 30;
      } else if (amount >= 950) { // $9.5 USD ≈ 950 KES
        newPlan = 'hustler_plus';
        duration = 30;
      }

      if (newPlan !== 'free') {
        const user = await storage.getUserByPhone?.(phone);
        if (user) {
          await storage.updateUserPlan?.(user.id, newPlan, duration);
          
          // Track payment analytics
          await trackUserEvent('payment_completed', {
            userId: user.id,
            amount,
            plan: newPlan,
            paymentMethod: 'mpesa',
            transactionId: TransID
          });
        }
      }
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa webhook error:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
}

export async function flutterwaveWebhook(req: Request, res: Response) {
  try {
    const { event, data } = req.body;
    
    if (event === 'charge.completed' && data.status === 'successful') {
      const { customer, amount, currency, tx_ref } = data;
      const email = customer.email;
      
      // Determine plan based on amount
      let newPlan = 'free';
      let duration = 0;
      
      if (amount >= 19) {
        newPlan = 'founder';
        duration = 30;
      } else if (amount >= 9.5) {
        newPlan = 'hustler_plus';
        duration = 30;
      }

      if (newPlan !== 'free') {
        const user = await storage.getUserByEmail?.(email);
        if (user) {
          await storage.updateUserPlan?.(user.id, newPlan, duration);
          
          // Track payment analytics
          await trackUserEvent('payment_completed', {
            userId: user.id,
            amount,
            currency,
            plan: newPlan,
            paymentMethod: 'flutterwave',
            transactionId: tx_ref
          });
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function trackUserEvent(eventType: string, data: any) {
  try {
    // Store analytics event
    await storage.createAnalyticsEvent?.({
      eventType,
      userId: data.userId,
      metadata: data,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

export function requireAuth(req: Request, res: Response, next: Function) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requirePlan(planLevel: string) {
  return (req: Request, res: Response, next: Function) => {
    const userPlan = req.user?.plan || 'free';
    const planHierarchy = ['free', 'hustler_plus', 'founder', 'corporate'];
    
    const userLevel = planHierarchy.indexOf(userPlan);
    const requiredLevel = planHierarchy.indexOf(planLevel);
    
    if (userLevel < requiredLevel) {
      return res.status(402).json({ 
        error: 'Premium subscription required',
        requiredPlan: planLevel,
        currentPlan: userPlan
      });
    }
    
    next();
  };
}