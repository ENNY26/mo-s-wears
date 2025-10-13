const FUNCTIONS_BASE = import.meta.env.VITE_FIREBASE_FUNCTIONS_BASE_URL || "";

async function safeJson(resp) {
  const text = await resp.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export const createOrderOnServer = async (totalAmount) => {
  const url = FUNCTIONS_BASE
    ? `${FUNCTIONS_BASE.replace(/\/$/, "")}/api/create-paypal-order`  // ✅ Updated endpoint
    : `/api/create-paypal-order`;  // ✅ Updated endpoint

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      amount: totalAmount.toString(),  // ✅ Changed from 'total' to 'amount'
      currency: "USD"
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Server create order failed: ${res.status} ${res.statusText} ${body}`);
  }

  const data = await safeJson(res);
  return data?.orderId;  // ✅ Changed from data.id to data.orderId
};

export const captureOrderOnServer = async (orderId) => {
  const url = FUNCTIONS_BASE
    ? `${FUNCTIONS_BASE.replace(/\/$/, "")}/api/capture-paypal-order`  // ✅ Updated endpoint
    : `/api/capture-paypal-order`;  // ✅ Updated endpoint

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId })  // ✅ Send as JSON body instead of URL param
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Server capture failed: ${res.status} ${res.statusText} ${body}`);
  }

  return await safeJson(res);
};