import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import express from "express";
import cors from "cors";

// ✅ Use new PayPal SDK import style
import * as paypal from "@paypal/checkout-server-sdk";

initializeApp();

const app = express();

// ✅ Enhanced CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "https://mo-s-wears.vercel.app"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle preflight OPTIONS requests
app.options("/*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(204).send();
});


app.use(express.json());

// ==========================
// 🔹 PayPal Configuration
// ==========================
const paypalClientId = process.env.PAYPAL_CLIENT_ID || "";
const paypalSecretKey = process.env.PAYPAL_SECRET_KEY || "";

if (!paypalClientId || !paypalSecretKey) {
  logger.error("❌ Missing PayPal credentials", {
    hasClientId: !!paypalClientId,
    hasSecretKey: !!paypalSecretKey,
  });
} else {
  logger.info("✅ PayPal credentials loaded successfully");
}

// ✅ Use Live PayPal Environment
const environment = new paypal.core.LiveEnvironment(paypalClientId, paypalSecretKey);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// ==========================
// 🔹 Website Base URL
// ==========================
const WEBSITE_URL = "https://mo-s-wears.vercel.app";

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Mo's Wears PayPal Live API is running",
    environment: "LIVE",
    status: "Ready",
    cors: "Enabled",
  });
});

// ==========================
// 🔹 Create PayPal Order
// ==========================
app.post("/create-paypal-order", async (req, res) => {
  try {
    const { amount, currency = "USD", items = [], description = "Purchase from Mo's Wears", shippingAddress } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, error: "Valid amount is required" });
    }

    const purchaseUnit = {
      amount: {
        currency_code: currency,
        value: amount,
        breakdown: { item_total: { currency_code: currency, value: amount } },
      },
      description,
    };

    if (items.length > 0) purchaseUnit.items = items;
    if (shippingAddress) {
      purchaseUnit.shipping = {
        name: { full_name: shippingAddress.fullName || shippingAddress.name || "" },
        address: {
          address_line_1: shippingAddress.addressLine1 || shippingAddress.street || "",
          address_line_2: shippingAddress.addressLine2 || "",
          admin_area_2: shippingAddress.city || "",
          admin_area_1: shippingAddress.state || "",
          postal_code: shippingAddress.postalCode || shippingAddress.zipCode || "",
          country_code: shippingAddress.countryCode || "US",
        },
      };
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [purchaseUnit],
      application_context: {
        brand_name: "Mo's Wears",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        shipping_preference: shippingAddress ? "SET_PROVIDED_ADDRESS" : "NO_SHIPPING",
        return_url: `${WEBSITE_URL}/payment-success`,
        cancel_url: `${WEBSITE_URL}/payment-cancelled`,
      },
    });

    const response = await paypalClient.execute(request);
    logger.info("✅ PayPal Live order created", { id: response.result.id });

    res.status(200).json({
      success: true,
      orderId: response.result.id,
      status: response.result.status,
      links: response.result.links,
    });
  } catch (error) {
    logger.error("❌ PayPal order creation failed", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================
// 🔹 Capture PayPal Order
// ==========================
app.post("/capture-paypal-order", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, error: "Order ID is required" });

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await paypalClient.execute(request);
    const capture = response.result.purchase_units[0].payments.captures[0];

    logger.info("✅ PayPal Live order captured", {
      orderId,
      captureId: capture.id,
      status: capture.status,
    });

    res.status(200).json({
      success: true,
      capture,
      orderId,
      status: capture.status,
    });
  } catch (error) {
    logger.error("❌ PayPal order capture failed", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================
// 🔹 Public API Export (Option 1 Fix)
// ==========================
export const api = onRequest(
  {
    cors: true,
    invoker: "public", // ✅ Allow unauthenticated access
  },
  app
);
