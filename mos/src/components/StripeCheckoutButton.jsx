// components/StripeCheckout.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const StripeCheckout = ({ items, user, total, shippingAddress }) => {
  const [loading, setLoading] = useState(false);

  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      // Replace with your Firebase Function URL
      const response = await axios.post(
        "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/create-stripe-session",
        {
          items,
          customer_email: user?.email,
          success_url: "https://mo-s-wears.vercel.app/payment-success",
          cancel_url: "https://mo-s-wears.vercel.app/payment-cancelled",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.url) {
        window.location.href = response.data.url; // ✅ Redirect to Stripe Checkout
      } else {
        toast.error("Stripe session not created. Try again.");
      }
    } catch (error) {
      console.error("Stripe Checkout Error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStripeCheckout}
      disabled={loading}
      className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
    >
      {loading ? "Processing..." : "Pay with Stripe"}
    </button>
  );
};

export default StripeCheckout;
