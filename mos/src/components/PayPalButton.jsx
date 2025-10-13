// src/components/PayPalButton.jsx
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import { createOrderOnServer, captureOrderOnServer } from "../utils/payPalApi";

const PayPalButton = ({ amount, onSuccess, onError }) => {
  // Vite env
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb";

  const initialOptions = {
    "client-id": clientId,
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="paypal-button-container">
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", color: "gold", label: "paypal" }}
          createOrder={async (data, actions) => {
            try {
              const orderId = await createOrderOnServer(amount);
              return orderId;
            } catch (err) {
              console.warn("Server create failed, falling back to client create:", err);
              toast.info("Using PayPal sandbox fallback.");
              return actions.order.create({
                purchase_units: [{ amount: { value: (Number(amount) || 0).toFixed(2) } }],
              });
            }
          }}
          onApprove={async (data, actions) => {
            try {
              const orderId = data.orderID || data.id;
              try {
                const captureData = await captureOrderOnServer(orderId);
                onSuccess(captureData);
                return;
              } catch (serverErr) {
                console.warn("Server capture failed, falling back to client capture", serverErr);
              }
              if (actions?.order) {
                const clientCapture = await actions.order.capture();
                onSuccess(clientCapture);
              } else {
                throw new Error("No capture available");
              }
            } catch (err) {
              console.error("PayPal capture error:", err);
              toast.error("PayPal capture failed.");
              onError(err);
            }
          }}
          onError={(error) => {
            console.error("PayPal error:", error);
            toast.error("PayPal payment failed.");
            onError(error);
          }}
          onCancel={() => toast.info("Payment cancelled")}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
