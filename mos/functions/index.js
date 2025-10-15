import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import express from "express";
import cors from "cors";

// PayPal SDK
import * as paypal from "@paypal/checkout-server-sdk";

// Stripe SDK
import Stripe from "stripe";

// Import config from firebase-functions
import { config } from "firebase-functions";

// Initialize Firebase Admin first
initializeApp();

const app = express();

// Basic CORS configuration
app.use(cors({ origin: true }));
app.use(express.json());

// Get Firebase Functions config
const functionsConfig = config();

// Website URL
const WEBSITE_URL = "https://mo-s-wears.vercel.app";

// Health check endpoint - simple and early
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Mo's Wears API is running", 
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get("/test", (req, res) => {
  res.status(200).json({ 
    success: true,
    message: "Test endpoint working" 
  });
});

// Initialize payment providers only when needed
let paypalClient = null;
let stripe = null;

try {
  // PayPal Configuration
  const paypalConfig = functionsConfig.paypal || {};
  const paypalClientId = paypalConfig.client_id || "";
  const paypalSecretKey = paypalConfig.secret_key || paypalConfig.secret || "";
  
  if (paypalClientId && paypalSecretKey) {
    const paypalEnvironment = paypalConfig.environment === "live" 
      ? new paypal.core.LiveEnvironment(paypalClientId, paypalSecretKey)
      : new paypal.core.SandboxEnvironment(paypalClientId, paypalSecretKey);
    
    paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);
    logger.info("PayPal client initialized");
  } else {
    logger.warn("PayPal credentials not configured");
  }
} catch (error) {
  logger.error("PayPal initialization error:", error);
}

try {
  // Stripe Configuration
  const stripeConfig = functionsConfig.stripe || {};
  const stripeSecretKey = stripeConfig.secret || "";
  
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    logger.info("Stripe client initialized");
  } else {
    logger.warn("Stripe credentials not configured");
  }
} catch (error) {
  logger.error("Stripe initialization error:", error);
}

// Create PayPal order
app.post("/create-paypal-order", async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(500).json({ 
        success: false,
        error: "PayPal is not configured" 
      });
    }

    const { amount, currency = "USD" } = req.body;

    // Validate amount
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false,
        error: "Valid amount is required" 
      });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    
    const requestBody = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString(), // Fixed typo: toStriang -> toString
        }
      }],
      application_context: {
        brand_name: "Mo's Wears",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${WEBSITE_URL}/payment-success`,
        cancel_url: `${WEBSITE_URL}/payment-cancelled`
      }
    };

    request.requestBody(requestBody);

    const response = await paypalClient.execute(request);
    
    logger.info("PayPal order created", { 
      orderId: response.result.id,
      amount: amount
    });

    res.status(200).json({
      success: true,
      orderId: response.result.id,
      status: response.result.status
    });

  } catch (error) {
    logger.error("Create PayPal order error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to create PayPal order"
    });
  }
});

// Capture PayPal order
app.post("/capture-paypal-order", async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(500).json({ 
        success: false,
        error: "PayPal is not configured" 
      });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ 
        success: false,
        error: "Order ID is required" 
      });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await paypalClient.execute(request);
    
    const capture = response.result;
    const captureDetails = capture.purchase_units[0].payments.captures[0];
    
    logger.info("PayPal order captured", { 
      orderId: orderId,
      captureId: captureDetails.id
    });

    res.status(200).json({
      success: true,
      capture: {
        id: captureDetails.id,
        status: captureDetails.status,
        amount: captureDetails.amount.value
      }
    });

  } catch (error) {
    logger.error("Capture PayPal order error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to capture PayPal order"
    });
  }
});

// Create Stripe checkout session
app.post("/create-stripe-session", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        success: false,
        error: "Stripe is not configured" 
      });
    }

    const { items, total, user, shippingAddress } = req.body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Missing or invalid items array" 
      });
    }

    // Format line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title || "Product",
        },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${WEBSITE_URL}/success`,
      cancel_url: `${WEBSITE_URL}/cancel`,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      metadata: {
        userId: user?.uid || "guest",
        cartTotal: total?.toString() || "0",
      },
    });

    logger.info("Stripe session created", { 
      sessionId: session.id,
      itemCount: items.length
    });

    res.status(200).json({
      success: true,
      id: session.id
    });

  } catch (error) {
    logger.error("Stripe session error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to create Stripe session",
      details: error.message
    });
  }
});

// Configuration check endpoint
app.get("/config", (req, res) => {
  res.status(200).json({
    success: true,
    paypal: !!paypalClient,
    stripe: !!stripe,
    website: WEBSITE_URL
  });
});

// List all endpoints
app.get("/endpoints", (req, res) => {
  const endpoints = [
    "GET / - Health check",
    "GET /test - Test endpoint",
    "GET /config - Check configuration",
    "GET /endpoints - List all endpoints",
    "POST /create-paypal-order - Create PayPal order",
    "POST /capture-paypal-order - Capture PayPal payment",
    "POST /create-stripe-session - Create Stripe checkout session"
  ];
  
  res.status(200).json({
    success: true,
    endpoints: endpoints
  });
});

// Add basic error handling for the Express app
app.use((error, req, res, next) => {
  logger.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "/",
      "/test", 
      "/config",
      "/endpoints",
      "/create-paypal-order",
      "/capture-paypal-order", 
      "/create-stripe-session"
    ]
  });
});

// Export the function
export const api = onRequest(app);