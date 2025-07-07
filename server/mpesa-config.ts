import axios from 'axios';
import { storage } from './storage';

interface MPesaConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  environment: 'sandbox' | 'production';
  callbackUrl: string;
  confirmationUrl: string;
}

export class MPesaService {
  private config: MPesaConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      businessShortCode: process.env.MPESA_BUSINESS_SHORTCODE || '',
      passkey: process.env.MPESA_PASSKEY || '',
      environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      callbackUrl: process.env.MPESA_CALLBACK_URL || `${process.env.BASE_URL}/api/webhooks/mpesa`,
      confirmationUrl: process.env.MPESA_CONFIRMATION_URL || `${process.env.BASE_URL}/api/webhooks/mpesa/confirmation`
    };

    this.baseUrl = this.config.environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  private generatePassword(timestamp: string): string {
    const data = this.config.businessShortCode + this.config.passkey + timestamp;
    return Buffer.from(data).toString('base64');
  }

  async initiateSTKPush(phoneNumber: string, amount: number, accountReference: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = this.generatePassword(timestamp);

      // Format phone number (remove + and ensure 254 prefix)
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber.slice(1) 
        : phoneNumber.startsWith('0') 
        ? `254${phoneNumber.slice(1)}` 
        : phoneNumber;

      const requestData = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: this.config.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.config.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: 'ProtoLab Premium Subscription'
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage
      };
    } catch (error: any) {
      console.error('M-Pesa STK Push error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'M-Pesa payment failed');
    }
  }

  async queryTransactionStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = this.generatePassword(timestamp);

      const requestData = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('M-Pesa query error:', error.response?.data || error.message);
      throw new Error('Failed to query transaction status');
    }
  }

  async handleCallback(callbackData: any): Promise<void> {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;
      
      if (stkCallback.ResultCode === 0) {
        // Payment successful
        const items = stkCallback.CallbackMetadata?.Item || [];
        const amount = items.find((item: any) => item.Name === 'Amount')?.Value;
        const mpesaReceiptNumber = items.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
        const phoneNumber = items.find((item: any) => item.Name === 'PhoneNumber')?.Value;
        
        // Update user subscription
        const user = await storage.getUserByPhone(`+${phoneNumber}`);
        if (user) {
          const plan = amount >= 1900 ? 'founder' : amount >= 950 ? 'hustler_plus' : 'free';
          if (plan !== 'free') {
            await storage.updateUserPlan(user.id, plan, 30);
            
            // Track payment analytics
            await storage.createAnalyticsEvent({
              eventType: 'payment_completed',
              userId: user.id.toString(),
              metadata: {
                amount,
                paymentMethod: 'mpesa',
                mpesaReceiptNumber,
                plan
              }
            });
          }
        }
      } else {
        // Payment failed
        console.log('M-Pesa payment failed:', stkCallback.ResultDesc);
      }
    } catch (error) {
      console.error('M-Pesa callback processing error:', error);
    }
  }

  validateConfiguration(): { valid: boolean; missing: string[] } {
    const required = ['consumerKey', 'consumerSecret', 'businessShortCode', 'passkey'];
    const missing = required.filter(key => !this.config[key as keyof MPesaConfig]);
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
}

export const mpesaService = new MPesaService();