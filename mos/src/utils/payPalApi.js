const FUNCTIONS_BASE = import.meta.env.VITE_FIREBASE_FUNCTIONS_BASE_URL || "";

async function safeJson(resp) {
  const text = await resp.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export const createOrderOnServer = async (totalAmount) => {
  const url = FUNCTIONS_BASE
    ? `${FUNCTIONS_BASE.replace(/\/$/, "")}/paypalApi/paypalCreateOrder`
    : `/api/paypalCreateOrder`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ total: totalAmount })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Server create order failed: ${res.status} ${res.statusText} ${body}`);
  }

  const data = await safeJson(res);
  return data?.id;
};

export const captureOrderOnServer = async (orderId) => {
  const url = FUNCTIONS_BASE
    ? `${FUNCTIONS_BASE.replace(/\/$/, "")}/paypalApi/paypalCaptureOrder/${orderId}`
    : `/api/paypalCaptureOrder/${orderId}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Server capture failed: ${res.status} ${res.statusText} ${body}`);
  }

  return await safeJson(res);
};
