import functions from "firebase-functions";
import express from "express";
import cors from "cors";
import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";

dotenv.config(); // loads .env locally (ignored in deployed env)

// --- Express setup ---
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// --- PayPal client setup ---
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const client = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_SECRET
  )
);

// --- Create PayPal Order ---
app.post("/paypalCreateOrder", async (req, res) => {
  try {
    const { total } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: total },
        },
      ],
    });

    const order = await client.execute(request);
    res.status(200).json({ id: order.result.id });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Error creating order" });
  }
});

// --- Capture PayPal Order ---
app.post("/paypalCaptureOrder", async (req, res) => {
  try {
    const { orderID } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client.execute(request);
    res.status(200).json(capture.result);
  } catch (error) {
    console.error("❌ Error capturing order:", error);
    res.status(500).json({ error: "Error capturing order" });
  }
});

// --- Export the Cloud Function ---
export const paypalApi = functions.https.onRequest(app);
