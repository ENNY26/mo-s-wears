import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import * as functions from "firebase-functions";

// Initialize Firebase Admin
initializeApp();

const app = express();

// Allow all origins for CORS (adjust for production if needed)
app.use(cors({ origin: true }));
app.use(express.json());

// Stripe initialization (use Firebase Functions config for secret)
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    (functions.config().stripe && functions.config().stripe.secret_key),
  { apiVersion: "2023-08-16" }
);

// Website URL for redirects
const WEBSITE_URL =
  process.env.NODE_ENV === "production"
    ? "https://themosclothing.com"
    : "http://localhost:5173";

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Mo's Wears API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint
app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Test endpoint working",
  });
});

// Configuration check endpoint
app.get("/config", (req, res) => {
  res.status(200).json({
    success: true,
    website: WEBSITE_URL,
    status: "Minimal API running",
  });
});

// List all endpoints
app.get("/endpoints", (req, res) => {
  const endpoints = [
    "GET / - Health check",
    "GET /test - Test endpoint",
    "GET /config - Check configuration",
    "GET /endpoints - List all endpoints",
    "POST /create-stripe-session - Create Stripe Checkout session",
  ];
  res.status(200).json({
    success: true,
    endpoints,
  });
});

// Stripe Checkout Session endpoint
app.post("/create-stripe-session", async (req, res) => {
  try {
    const { items, total, user, shippingAddress } = req.body;

    // Map cart items to Stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
...(item.description ? { description: item.description } : {}),        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${WEBSITE_URL}/payment-success`,
      cancel_url: `${WEBSITE_URL}/payment-cancelled`,
      customer_email: user?.email,
      shipping_address_collection: {
        allowed_countries: ["US", "CA"], // adjust as needed
      },
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    logger.error("❌ Stripe session creation failed", error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "/",
      "/test",
      "/config",
      "/endpoints",
      "/create-stripe-session",
    ],
  });
});

// Export the function for Firebase
export const api = onRequest(app);