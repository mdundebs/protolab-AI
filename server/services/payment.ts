// Flutterwave integration service
export interface PaymentInitRequest {
  amount: number;
  currency: string;
  email: string;
  phone: string;
  name: string;
  requestId: number;
}

export interface PaymentResponse {
  status: string;
  message: string;
  data?: {
    link: string;
    reference: string;
  };
}

export async function initializePayment(paymentData: PaymentInitRequest): Promise<PaymentResponse> {
  const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY || process.env.FLW_SECRET_KEY || "default_key";
  
  try {
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${flutterwaveSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: `pitch_deck_${paymentData.requestId}_${Date.now()}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        redirect_url: `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/payment/callback`,
        customer: {
          email: paymentData.email,
          phonenumber: paymentData.phone,
          name: paymentData.name,
        },
        customizations: {
          title: "ProtoLab Pitch Deck Generation",
          description: "AI-Powered Pitch Deck Generation Service",
          logo: "https://your-logo-url.com/logo.png",
        },
        meta: {
          request_id: paymentData.requestId,
        },
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.status === "success") {
      return {
        status: "success",
        message: "Payment initialized successfully",
        data: {
          link: result.data.link,
          reference: result.data.tx_ref,
        },
      };
    } else {
      throw new Error(result.message || "Payment initialization failed");
    }
  } catch (error) {
    console.error("Flutterwave payment error:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Payment initialization failed",
    };
  }
}

export async function verifyPayment(transactionId: string): Promise<boolean> {
  const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY || process.env.FLW_SECRET_KEY || "default_key";
  
  try {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${flutterwaveSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    
    return response.ok && result.status === "success" && result.data.status === "successful";
  } catch (error) {
    console.error("Payment verification error:", error);
    return false;
  }
}
