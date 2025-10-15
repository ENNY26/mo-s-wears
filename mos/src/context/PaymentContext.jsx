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
  const { cart, getCartTotal, clearCart } = useCart();
  const { userProfile, addOrder, getDefaultAddress } = useUser();
  const { user } = useAuth();
  const [processingPayment, setProcessingPayment] = useState(false);

  // ==========================
  // ✅ Create Firestore Order
  // ==========================
  const createOrderRecord = async (paymentData, paymentMethod) => {
    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cart.items,
        total: getCartTotal(),
        tax: getCartTotal() * 0.1,
        shipping: .99,
        shippingAddress: paymentData.shippingAddress || getDefaultAddress(),
        billingAddress: paymentData.billingAddress || getDefaultAddress(),
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
      await addOrder({ ...orderData, id: orderRef.id });
      return orderRef.id;
    } catch (error) {
      console.error("Error creating order record:", error);
      throw error;
    }
  };

  // ==========================
  // ✅ PayPal Payment Process
  // ==========================
  const processPayPalPayment = async () => {
    setProcessingPayment(true);
    try {
      const orderID = await createOrderOnServer(getCartTotal());
      const captureData = await captureOrderOnServer(orderID);

      if (captureData.status === "COMPLETED") {
        const orderId = await createOrderRecord({ paymentId: captureData.id }, "paypal");
        clearCart();
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
      const items = cart.items.map((item) => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        imageUrls: item.imageUrls || [],
      }));

      const total = getCartTotal();
      const session = await createStripeSessionOnServer(items, total, user, shippingAddress);

      if (!session.id) throw new Error("Invalid Stripe session response");

      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      const { error } = window.location.href = session.url;
      if (error) throw new Error(error.message);

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
        processStripePayment, // 👈 Added Stripe here
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
