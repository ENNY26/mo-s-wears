// components/StripeCheckoutButton.jsx - Updated with better error handling
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";

const StripeCheckoutButton = ({ items, total, user, shippingAddress }) => {
  const [loading, setLoading] = useState(false);

  const handleStripeCheckout = async () => {
    if (!items || items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);

      // Create Stripe Checkout session
      const response = await fetch(
        "https://us-central1-mo-s-wears.cloudfunctions.net/api/create-stripe-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map(item => ({
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              imageUrls: item.imageUrls || []
            })),
            total: total,
            user: user,
            shippingAddress: shippingAddress,
          }),
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned an error page");
      }

      const data = await response.json();

      if (!response.ok) {
        console.error("Stripe session creation failed:", data);
        toast.error(data.error || "Failed to create payment session.");
        return;
      }

      if (!data.id) {
        throw new Error("No session ID returned");
      }

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error } = await stripe.redirectToCheckout({ 
        sessionId: data.id 
      });

      if (error) {
        console.error("Stripe redirect error:", error);
        toast.error("Unable to redirect to checkout.");
      }

    } catch (error) {
      console.error("Stripe Checkout Error:", error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStripeCheckout}
      disabled={loading}
      className={`w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      {loading ? "Processing..." : "Pay with Card (Stripe)"}
    </button>
  );
};

export default StripeCheckoutButton;