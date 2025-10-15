export const createStripeSessionOnServer = async (items, total, user, shippingAddress) => {
  const response = await fetch(
    "https://us-central1-mo-s-wears.cloudfunctions.net/api/create-stripe-session",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, total, user, shippingAddress }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe session creation failed: ${errorText}`);
  }

  const data = await response.json();
  return data;
};
