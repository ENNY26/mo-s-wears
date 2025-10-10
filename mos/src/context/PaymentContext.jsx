import React, { createContext, useContext, useState } from 'react';
import { useCart } from './CartContext';
import { useUser } from './UserContext';
import { useAuth } from './AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { toast } from 'react-toastify';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { userProfile, addOrder, getDefaultAddress } = useUser();
  const { user } = useAuth();
  const [processingPayment, setProcessingPayment] = useState(false);

  const createOrderRecord = async (paymentData, paymentMethod) => {
    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cart.items,
        total: getCartTotal(),
        subtotal: getCartTotal(),
        tax: getCartTotal() * 0.1, // 10% tax
        shipping: 5.99, // Fixed shipping cost
        shippingAddress: paymentData.shippingAddress || getDefaultAddress(),
        billingAddress: paymentData.billingAddress || getDefaultAddress(),
        paymentMethod: paymentMethod,
        paymentId: paymentData.paymentId,
        status: 'placed',
        statusHistory: [
          {
            status: 'placed',
            timestamp: new Date(),
            note: 'Order has been placed successfully'
          }
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add to orders collection
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Add to user's order history
      await addOrder({
        ...orderData,
        id: orderRef.id
      });

      return orderRef.id;
    } catch (error) {
      console.error('Error creating order record:', error);
      throw error;
    }
  };

  const sendOrderEmail = async (orderId, status, userEmail, userName) => {
    try {
      // Using EmailJS for email notifications
      const emailData = {
        service_id: process.env.REACT_APP_EMAILJS_SERVICE_ID,
        template_id: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        user_id: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: userEmail,
          to_name: userName,
          order_id: orderId,
          order_status: status,
          order_date: new Date().toLocaleDateString(),
          subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - Order #${orderId}`
        }
      };

      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw error - email failure shouldn't block order
    }
  };

  const processSquarePayment = async (paymentData) => {
    setProcessingPayment(true);
    try {
      // Square payment processing
      const response = await fetch('/api/square-process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId: paymentData.sourceId,
          amount: Math.round(getCartTotal() * 100), // Amount in cents
          locationId: process.env.REACT_APP_SQUARE_LOCATION_ID,
        }),
      });

      const data = await response.json();

      if (data.payment?.status === 'COMPLETED') {
        const orderId = await createOrderRecord({
          paymentId: data.payment.id,
          ...paymentData
        }, 'square');

        await sendOrderEmail(
          orderId, 
          'placed', 
          user.email, 
          userProfile?.firstName || 'Customer'
        );

        clearCart();
        toast.success('Payment successful! Order placed.');
        return { success: true, orderId };
      } else {
        throw new Error(data.errors?.[0]?.detail || 'Payment failed');
      }
    } catch (error) {
      console.error('Square payment error:', error);
      toast.error(`Payment failed: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setProcessingPayment(false);
    }
  };

  const processPayPalPayment = async (paymentData) => {
    setProcessingPayment(true);
    try {
      // PayPal payment processing
      const response = await fetch('/api/paypal-create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: getCartTotal(),
          items: cart.items
        }),
      });

      const { id: orderID } = await response.json();

      // Capture PayPal order
      const captureResponse = await fetch(`/api/paypal-capture-order/${orderID}`, {
        method: 'POST',
      });

      const captureData = await captureResponse.json();

      if (captureData.status === 'COMPLETED') {
        const orderId = await createOrderRecord({
          paymentId: captureData.id,
          ...paymentData
        }, 'paypal');

        await sendOrderEmail(
          orderId, 
          'placed', 
          user.email, 
          userProfile?.firstName || 'Customer'
        );

        clearCart();
        toast.success('Payment successful! Order placed.');
        return { success: true, orderId };
      } else {
        throw new Error('PayPal payment not completed');
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      toast.error('PayPal payment failed');
      return { success: false, error: error.message };
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <PaymentContext.Provider value={{
      processingPayment,
      processSquarePayment,
      processPayPalPayment,
      createOrderRecord
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};