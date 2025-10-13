const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// ✅ Enable CORS (allow localhost + your future production domain)
app.use(cors({ origin: ["http://localhost:5173", "https://your-production-domain.com"] }));
app.use(express.json());

// ✅ PayPal credentials
const PAYPAL_CLIENT_ID = functions.config().paypal.client_id;
const PAYPAL_SECRET = functions.config().paypal.secret;

// ✅ PayPal API base URL
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

// -----------------------------------------------
// CREATE ORDER
// -----------------------------------------------
app.post("/paypalCreateOrder", async (req, res) => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: req.body.total,
            },
          },
        ],
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error creating PayPal order:", err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------
// CAPTURE ORDER
// -----------------------------------------------
app.post("/paypalCaptureOrder", async (req, res) => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
    const { paymentID } = req.body;

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paymentID}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error capturing PayPal order:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Export entire app as one HTTPS function
exports.paypalApi = functions.https.onRequest(app);
