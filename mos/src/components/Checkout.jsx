// components/Checkout.jsx - Updated Guest Flow
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createStripeSessionOnServer } from "../utils/stripeApi";
import { loadStripe } from "@stripe/stripe-js";

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart() || {};
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US"
  });

  const items = Array.isArray(cart) ? cart : [];

  const subtotal = typeof getCartTotal === "function" ? getCartTotal() : 
    items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);
  
  const tax = 1.99;
  const shipping = subtotal > 100 ? 0 : 7.99;
  const total = subtotal + tax + shipping;

  useEffect(() => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    // Pre-fill email if user is logged in
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        email: user.email,
        name: user.displayName || ""
      }));
    }
  }, [user, items.length, navigate]);

  const handleInputChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStripePayment = async () => {
    // Validate shipping address
    const requiredFields = ['name', 'email', 'street', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);
    
    if (missingFields.length > 0) {
      toast.error("Please fill in all required shipping information");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setProcessing(true);
    
    try {
      // call helper that creates session on server and redirects to Stripe
      const result = await processStripePayment({
        items,
        total,
        shippingAddress,
        user: user || { email: shippingAddress.email } // Guest user object
      });
 
      if (result.success) {
        toast.success("Order placed successfully!");
        clearCart();
        navigate("/payment-success");
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // -- new helper: create Stripe session server-side and redirect client to Checkout --
  async function processStripePayment({ items, total, shippingAddress, user }) {
    try {
      // Send cart items and shipping info to your server function
      // createStripeSessionOnServer should return { url } or { id } for session
      const session = await createStripeSessionOnServer(items, total, user, shippingAddress);

      // If your server returns a direct URL (session.url) use it
      if (session?.url) {
        window.location.href = session.url;
        return { success: true };
      }

      // Otherwise, if server returned a session id, use Stripe.js to redirect
      if (session?.id) {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          console.error("Missing VITE_STRIPE_PUBLISHABLE_KEY in env");
          return { success: false, error: "Client Stripe key not configured" };
        }
        const stripe = await loadStripe(publishableKey);
        const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
        if (error) throw error;
        return { success: true };
      }

      return { success: false, error: "No checkout session returned from server" };
    } catch (err) {
      console.error("processStripePayment error:", err);
      return { success: false, error: err?.message || "Server error" };
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout {!user && "(Guest)"}</h2>

          {/* Guest Notice */}
          {!user && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>Guest Checkout:</strong> You can complete your purchase without creating an account. 
                We'll email your order confirmation to {shippingAddress.email || 'the address you provide'}.
              </p>
            </div>
          )}

          {/* Shipping Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={shippingAddress.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={shippingAddress.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={shippingAddress.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                <input
                  type="text"
                  value={shippingAddress.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-black"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                Secure payment processed by Stripe. We accept all major credit cards.
              </p>
              
              <button
                onClick={handleStripePayment}
                disabled={processing}
                className={`w-full bg-black text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                  processing ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {processing ? "Processing..." : `Pay $${total.toFixed(2)} with Stripe`}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.imageUrls?.[0]}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-600">Size: {item.selectedSize} × {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;