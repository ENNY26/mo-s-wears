// components/PayPalButton.jsx
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";

const PayPalButton = ({ amount, onSuccess, onError }) => {
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || "sb";
  console.log("PayPal client-id used:", clientId);

  const initialOptions = {
    "client-id": clientId,
    currency: "USD",
    intent: "capture",
  };

  // Attempt server-side create order, fall back to client-side create
  const createOrderOnServer = async () => {
    const resp = await fetch("/api/paypal-create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, items: [] }),
    });
    if (!resp.ok) {
      // try to read body for debug
      let bodyText = "";
      try { bodyText = await resp.text(); } catch (e) { /* ignore */ }
      const err = new Error(`Server create order failed: ${resp.status} ${resp.statusText} ${bodyText}`);
      err.status = resp.status;
      throw err;
    }
    const data = await resp.json();
    return data.id || data.orderID;
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="paypal-button-container">
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", color: "gold", label: "paypal" }}
          createOrder={async (data, actions) => {
            // Try server create first
            try {
              const orderId = await createOrderOnServer();
              console.log("Server created PayPal order id:", orderId);
              return orderId;
            } catch (err) {
              console.warn("Server create failed, falling back to client-side createOrder:", err);
              toast.info("Using PayPal sandbox fallback (server create failed). See console for details.");
              // Client-side fallback (sandbox only). Ensure amount is string.
              return actions.order.create({
                purchase_units: [{
                  amount: { value: (Number(amount) || 0).toFixed(2) }
                }]
              });
            }
          }}
          onApprove={async (data, actions) => {
            try {
              // Prefer server-side capture if you have an endpoint
              const orderID = data.orderID || data.id;
              // Try server capture first
              try {
                const resp = await fetch(`/api/paypal-capture-order/${orderID}`, { method: "POST" });
                if (resp.ok) {
                  const captureData = await resp.json();
                  console.log("PayPal capture (server) result:", captureData);
                  onSuccess(captureData);
                  return;
                } else {
                  console.warn("Server capture failed, falling back to client-side capture", resp.status);
                }
              } catch (serverErr) {
                console.warn("Server capture attempt failed:", serverErr);
              }

              // Client-side capture fallback (only works if order was created client-side)
              if (actions && actions.order) {
                const clientCapture = await actions.order.capture();
                console.log("PayPal client-side capture result:", clientCapture);
                onSuccess(clientCapture);
              } else {
                throw new Error("No capture method available");
              }
            } catch (err) {
              console.error("PayPal capture error:", err);
              toast.error("PayPal capture failed. See console for details.");
              onError(err);
            }
          }}
          onError={(error) => {
            console.error("PayPal button error:", error);
            toast.error("PayPal payment failed. Please try again.");
            onError(error);
          }}
          onCancel={() => {
            toast.info("Payment cancelled");
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalButton;