// src/context/PaymentContext.js
import React, { createContext, useContext, useState } from "react";
import { useCart } from "./CartContext";
import { useUser } from "./UserContext";
import { useAuth } from "./AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";
import { createOrderOnServer, captureOrderOnServer } from "../utils/payPalApi";

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { userProfile, addOrder, getDefaultAddress } = useUser();
  const { user } = useAuth();
  const [processingPayment, setProcessingPayment] = useState(false);

  const firebaseBase =
    "https://us-central1-mo-s-wears.cloudfunctions.net"; // 👈 Replace YOUR_PROJECT_ID

  const createOrderRecord = async (paymentData, paymentMethod) => {
    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cart.items,
        total: getCartTotal(),
        tax: getCartTotal() * 0.1,
        shipping: 5.99,
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

  const processPayPalPayment = async () => {
    setProcessingPayment(true);
    try {
      // create order on server (returns PayPal order id)
      const orderID = await createOrderOnServer(getCartTotal());

      // capture on server (preferred)
      const captureData = await captureOrderOnServer(orderID);

      if (captureData.status === "COMPLETED" || captureData.status === "COMPLETED") {
        const orderId = await createOrderRecord({ paymentId: captureData.id }, "paypal");
        clearCart();
        toast.success("Payment successful! Order placed.");
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

  return (
    <PaymentContext.Provider
      value={{
        processingPayment,
        processPayPalPayment,
        createOrderRecord,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};
