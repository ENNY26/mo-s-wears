// src/context/PaymentContext.js
import React, { createContext, useContext, useState } from "react";
import { useCart } from "./CartContext";
import { useUser } from "./UserContext";
import { useAuth } from "./AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";
import { createOrderOnServer, captureOrderOnServer } from "../utils/payPalApi";
import { createStripeSessionOnServer } from "../utils/stripeApi";
import { loadStripe } from "@stripe/stripe-js";

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const { cart, getCartTotal, clearCart } = useCart() || {};
  const { userProfile, addOrder, getDefaultAddress } = useUser() || {};
  const { user } = useAuth() || {};
  const [processingPayment, setProcessingPayment] = useState(false);

  // normalize items and total
  const items = Array.isArray(cart) ? cart : Array.isArray(cart?.items) ? cart.items : [];
  const total = typeof getCartTotal === "function"
    ? getCartTotal()
    : items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);

  // ==========================
  // ✅ Create Firestore Order
  // ==========================
  const createOrderRecord = async (paymentData, paymentMethod) => {
    try {
      const orderData = {
        userId: user?.uid || null,
        userEmail: user?.email || null,
        items: items,
        total: total,
        tax: total * 0.1,
        shipping: 0.19,
        shippingAddress: paymentData.shippingAddress || (typeof getDefaultAddress === "function" ? getDefaultAddress() : null),
        billingAddress: paymentData.billingAddress || (typeof getDefaultAddress === "function" ? getDefaultAddress() : null),
        paymentMethod,
        paymentId: paymentData.paymentId,
        status: "placed",
        statusHistory: [
          {
            status: "placed",
            timestamp: new Date(),
            note: "Order placed successfully",
          },
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(db, "orders"), orderData);
      if (typeof addOrder === "function") {
        await addOrder({ ...orderData, id: orderRef.id });
      }
      return orderRef.id;
    } catch (error) {
      console.error("Error creating order record:", error);
      throw error;
    }
  };

  // ==========================
  // ✅ PayPal Payment Process
  // ==========================
  const processPayPalPayment = async (extra = {}) => {
    setProcessingPayment(true);
    try {
      const orderID = await createOrderOnServer(total);
      const captureData = await captureOrderOnServer(orderID);

      if (captureData.status === "COMPLETED") {
        const orderId = await createOrderRecord({ paymentId: captureData.id, ...extra }, "paypal");
        if (typeof clearCart === "function") clearCart();
        toast.success("PayPal payment successful! Order placed.");
        return { success: true, orderId };
      } else {
        throw new Error("PayPal payment not completed");
      }
    } catch (error) {
      console.error("PayPal payment error:", error);
      toast.error("PayPal payment failed");
      return { success: false, error: error.message };
    } finally {
      setProcessingPayment(false);
    }
  };

  // ==========================
  // ✅ Stripe Payment Process
  // ==========================
  const processStripePayment = async (shippingAddress) => {
    setProcessingPayment(true);
    try {
      if (!items || items.length === 0) throw new Error("Cart is empty");
      const stripeItems = items.map((item) => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        imageUrls: item.imageUrls || [],
      }));

      const session = await createStripeSessionOnServer(stripeItems, total, user, shippingAddress);

      if (!session || !session.id) throw new Error("Invalid Stripe session response");

      // redirect to session.url if provided, otherwise use Stripe redirectToCheckout
      if (session.url) {
        window.location.href = session.url;
        return { success: true };
      }

      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      if (!stripe) throw new Error("Stripe failed to load");

      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Stripe payment error:", error);
      toast.error("Stripe checkout failed");
      return { success: false, error: error.message };
    } finally {
      setProcessingPayment(false);
    }
  };

  // ==========================
  // ✅ Context Provider
  // ==========================
  return (
    <PaymentContext.Provider
      value={{
        processingPayment,
        processPayPalPayment,
        processStripePayment,
        createOrderRecord,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

// Hook to use in components
export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};
