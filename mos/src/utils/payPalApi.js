const FUNCTIONS_BASE = import.meta.env.VITE_FIREBASE_FUNCTIONS_BASE_URL || "";

async function safeJson(resp) {
  const text = await resp.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export const createOrderOnServer = async (totalAmount) => {
  const url = FUNCTIONS_BASE
    ? `${FUNCTIONS_BASE.replace(/\/$/, "")}/api/create-paypal-order`
    : `/api/create-paypal-order`;

  console.log("Creating order with URL:", url, "Amount:", totalAmount);

  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ 
      amount: totalAmount.toString(),
      currency: "USD"
    })
  });

  console.log("Create order response status:", res.status);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Server create order failed: ${res.status} ${res.statusText} ${body}`);
  }

  const data = await safeJson(res);
  console.log("Create order response data:", data);
  
  if (!data || !data.id) {
    throw new Error("Invalid response from server: missing id");
  }
  
  return data.id;
};

export const captureOrderOnServer = async (orderId) => {
  const url = FUNCTIONS_BASE
    ? `${FUNCTIONS_BASE.replace(/\/$/, "")}/api/capture-paypal-order`
    : `/api/capture-paypal-order`;

  console.log("Capturing order:", orderId);

  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ orderId })
  });

  console.log("Capture order response status:", res.status);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Server capture failed: ${res.status} ${res.statusText} ${body}`);
  }

  const data = await safeJson(res);
  console.log("Capture order response data:", data);
  
  return data;
};