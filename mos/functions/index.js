import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import express from "express";
import cors from "cors";

// PayPal SDK
import * as paypal from "@paypal/checkout-server-sdk";

initializeApp();

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://mo-s-wears.vercel.app",
    "https://mo-s-wears.web.app",
    "https://mo-s-wears.firebaseapp.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    res.header("Access-Control-Max-Age", "86400"); // 24 hours
    return res.status(204).send();
  }
  next();
});

app.use(express.json());

// PayPal Live Configuration
const paypalClientId = process.env.PAYPAL_CLIENT_ID || "";
const paypalSecretKey = process.env.PAYPAL_SECRET_KEY || "";

// Validate credentials
if (!paypalClientId || !paypalSecretKey) {
  logger.error("Missing PayPal credentials", {
    hasClientId: !!paypalClientId,
    hasSecretKey: !!paypalSecretKey
  });
} else {
  logger.info("PayPal credentials loaded successfully");
}

// Configure PayPal LIVE environment
const environment = new paypal.core.LiveEnvironment(paypalClientId, paypalSecretKey);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// Website URL
const WEBSITE_URL = "https://mo-s-wears.vercel.app";

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Mo's Wears PayPal Live API is running", 
    environment: "LIVE",
    website: WEBSITE_URL,
    status: "Ready to process real payments",
    cors: "Enabled for all origins"
  });
});

// Create PayPal order
app.post("/create-paypal-order", async (req, res) => {
  try {
    const { 
      amount, 
      currency = "USD",
      items = [],
      description = "Purchase from Mo's Wears",
      shippingAddress
    } = req.body;

    // Validate required fields
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ 
        success: false,
        error: "Valid amount is required" 
      });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    
    // Build purchase unit
    const purchaseUnit = {
      amount: {
        currency_code: currency,
        value: amount,
        breakdown: {
          item_total: {
            currency_code: currency,
            value: amount
          }
        }
      },
      description: description,
    };

    // Add items if provided
    if (items.length > 0) {
      purchaseUnit.items = items;
    }

    // Add shipping if provided
    if (shippingAddress) {
      purchaseUnit.shipping = {
        name: {
          full_name: shippingAddress.fullName || shippingAddress.name || ""
        },
        address: {
          address_line_1: shippingAddress.addressLine1 || shippingAddress.street || "",
          address_line_2: shippingAddress.addressLine2 || "",
          admin_area_2: shippingAddress.city || "",
          admin_area_1: shippingAddress.state || "",
          postal_code: shippingAddress.postalCode || shippingAddress.zipCode || "",
          country_code: shippingAddress.countryCode || "US"
        }
      };
    }

    const requestBody = {
      intent: "CAPTURE",
      purchase_units: [purchaseUnit],
      application_context: {
        brand_name: "Mo's Wears",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        shipping_preference: shippingAddress ? "SET_PROVIDED_ADDRESS" : "NO_SHIPPING",
        return_url: `${WEBSITE_URL}/payment-success`,
        cancel_url: `${WEBSITE_URL}/payment-cancelled`
      }
    };

    request.requestBody(requestBody);

    const response = await paypalClient.execute(request);
    
    logger.info("Live PayPal order created:", { 
      orderId: response.result.id,
      amount: amount,
      currency: currency
    });

    res.status(200).json({
      success: true,
      orderId: response.result.id,
      status: response.result.status,
      links: response.result.links
    });

  } catch (error) {
    logger.error("Create PayPal order error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to create PayPal order",
      details: error.message 
    });
  }
});

// Capture PayPal order
app.post("/capture-paypal-order", async (req, res) => {
  try {
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
    
    logger.info("Live PayPal order captured:", { 
      orderId: orderId,
      captureId: captureDetails.id,
      status: captureDetails.status,
      amount: captureDetails.amount.value,
      currency: captureDetails.amount.currency_code
    });

    // Log successful payment for business records
    logger.info("PAYMENT SUCCESS - Mo's Wears", {
      captureId: captureDetails.id,
      orderId: orderId,
      amount: captureDetails.amount.value,
      currency: captureDetails.amount.currency_code,
      status: captureDetails.status,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      capture: {
        id: captureDetails.id,
        status: captureDetails.status,
        amount: captureDetails.amount.value,
        currency: captureDetails.amount.currency_code,
        create_time: captureDetails.create_time,
        update_time: captureDetails.update_time,
        payer_email: capture.payer?.email_address || null
      },
      order: {
        id: orderId,
        status: capture.status
      }
    });

  } catch (error) {
    logger.error("Capture PayPal order error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to capture PayPal order",
      details: error.message,
      orderId: req.body.orderId
    });
  }
});

// Get order details
app.get("/paypal-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ 
        success: false,
        error: "Order ID is required" 
      });
    }

    const request = new paypal.orders.OrdersGetRequest(orderId);
    const response = await paypalClient.execute(request);

    res.status(200).json({
      success: true,
      order: response.result
    });

  } catch (error) {
    logger.error("Get PayPal order error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to get PayPal order details",
      details: error.message 
    });
  }
});

// Verify PayPal configuration
app.get("/paypal-config", (req, res) => {
  const configInfo = {
    environment: "LIVE",
    clientId: paypalClientId ? `${paypalClientId.substring(0, 10)}...` : "Not set",
    hasSecretKey: !!paypalSecretKey,
    baseUrl: process.env.VITE_FIREBASE_FUNCTIONS_BASE_URL,
    websiteUrl: WEBSITE_URL
  };
  
  res.status(200).json({
    success: true,
    message: "PayPal Live Configuration",
    config: configInfo
  });
});

// Test endpoint to verify CORS is working
app.get("/test-cors", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CORS is working!",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

export const api = onRequest(app);