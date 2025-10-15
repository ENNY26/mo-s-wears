import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { usePayment } from "../context/PaymentContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PayPalButton from "./PayPalButton";
import { toast } from "react-toastify";

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { userProfile, getDefaultAddress } = useUser();
  const { processPayPalPayment, processStripePayment } = usePayment(); // ✅ Added Stripe
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedPayment, setSelectedPayment] = useState("");
  const [shippingAddress, setShippingAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [processing, setProcessing] = useState(false);

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const shipping = 5.99;
  const total = subtotal + tax + shipping;

  // ==========================
  // ✅ Auth + Cart Validation
  // ==========================
  useEffect(() => {
    if (!user) {
      toast.error("Please log in to checkout");
      navigate("/login");
      return;
    }

    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    const defaultAddress = getDefaultAddress();
    if (defaultAddress) {
      setShippingAddress(defaultAddress);
      setBillingAddress(defaultAddress);
    }
  }, [user, cart, navigate, getDefaultAddress]);

  // ==========================
  // ✅ PayPal Handlers
  // ==========================
  const handlePayPalSuccess = async (paymentData) => {
    setProcessing(true);
    try {
      const result = await processPayPalPayment({
        ...paymentData,
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
      });

      if (result.success) {
        toast.success("Payment successful! Order placed.");
        clearCart();
        navigate("/orders");
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (error) {
      console.error("PayPal payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePayPalError = (error) => {
    console.error("PayPal error:", error);
    toast.error("PayPal payment failed. Please try again.");
    setProcessing(false);
  };

  // ==========================
  // ✅ Stripe Handler
  // ==========================
  const handleStripePayment = async () => {
    if (!shippingAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setProcessing(true);
    try {
      const result = await processStripePayment(shippingAddress);

      if (result.success) {
        toast.success("Redirecting to Stripe Checkout...");
      } else {
        throw new Error(result.error || "Stripe payment failed");
      }
    } catch (error) {
      console.error("Stripe checkout error:", error);
      toast.error("Stripe checkout failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ==========================
  // ✅ Rendering
  // ==========================
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to checkout
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
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

  if (!userProfile?.addresses || userProfile.addresses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping address required</h2>
          <p className="text-gray-600 mb-6">
            Please add a shipping address before checkout.
          </p>
          <button
            onClick={() => navigate("/addresses")}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800"
          >
            Add Address
          </button>
        </div>
      </div>
    );
  }

  // ==========================
  // ✅ Checkout Layout
  // ==========================
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
            <select
              value={shippingAddress ? JSON.stringify(shippingAddress) : ""}
              onChange={(e) => {
                const address = JSON.parse(e.target.value);
                setShippingAddress(address);
                if (sameAsShipping) setBillingAddress(address);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-black"
              required
            >
              <option value="">Select shipping address</option>
              {userProfile.addresses.map((address) => (
                <option key={address.id} value={JSON.stringify(address)}>
                  {address.name} - {address.street}, {address.city}
                  {address.isDefault && " (Default)"}
                </option>
              ))}
            </select>
          </div>

          {/* Billing Address */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={sameAsShipping}
                onChange={(e) => {
                  setSameAsShipping(e.target.checked);
                  if (e.target.checked) setBillingAddress(shippingAddress);
                }}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="ml-2 text-gray-700">Same as shipping address</span>
            </label>

            {!sameAsShipping && (
              <select
                value={billingAddress ? JSON.stringify(billingAddress) : ""}
                onChange={(e) => setBillingAddress(JSON.parse(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-black"
              >
                <option value="">Select billing address</option>
                {userProfile.addresses.map((address) => (
                  <option key={address.id} value={JSON.stringify(address)}>
                    {address.name} - {address.street}, {address.city}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Payment Options */}
          <div className="mb-6 space-y-3">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

            <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
              <input
                type="radio"
                name="payment"
                value="paypal"
                checked={selectedPayment === "paypal"}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="text-black focus:ring-black"
              />
              <div className="ml-3">
                <span className="font-medium">PayPal</span>
                <p className="text-sm text-gray-600">Pay with your PayPal account</p>
              </div>
            </label>

            <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
              <input
                type="radio"
                name="payment"
                value="stripe"
                checked={selectedPayment === "stripe"}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="text-black focus:ring-black"
              />
              <div className="ml-3">
                <span className="font-medium">Stripe</span>
                <p className="text-sm text-gray-600">Pay securely with card using Stripe</p>
              </div>
            </label>
          </div>

          {/* Payment Buttons */}
          {selectedPayment === "paypal" && shippingAddress && (
            <div className="border-t pt-4">
              <PayPalButton
                amount={total}
                onSuccess={handlePayPalSuccess}
                onError={handlePayPalError}
              />
            </div>
          )}

          {selectedPayment === "stripe" && shippingAddress && (
            <div className="border-t pt-4">
              <button
                onClick={handleStripePayment}
                disabled={processing}
                className={`w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition ${
                  processing ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {processing ? "Processing..." : "Pay with Card (Stripe)"}
              </button>
            </div>
          )}

          {processing && (
            <div className="text-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Processing payment...</p>
            </div>
          )}
        </div>

        {/* Right Section: Order Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

          <div className="space-y-4 mb-6">
            {cart.items.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex items-center space-x-4">
                <img
                  src={item.imageUrls?.[0]}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {shippingAddress && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Shipping to:</h4>
              <p className="text-sm text-gray-600">
                {shippingAddress.name}
                <br />
                {shippingAddress.street}
                <br />
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
