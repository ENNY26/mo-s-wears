// components/Cart.jsx
import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Cart() {
  const {
    cart, // may be undefined if provider missing — guard below
    updateQuantity,
    removeItem,
    clearCart,
    getCartTotal,
  } = useCart() || {};

  const items = Array.isArray(cart) ? cart : [];

  const { user } = useAuth();
  const { userProfile } = useUser();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 0 ? .9 : 0; // Free shipping over a certain amount?
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    if (!user) {
      toast.info("Please login to proceed to checkout");
      navigate("/login");
      return;
    }

    // Check if user has an address
    if (!userProfile?.addresses || userProfile.addresses.length === 0) {
      toast.info("Please add a shipping address before checkout");
      navigate("/addresses");
      return;
    }

    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your cart</h2>
          <p className="text-gray-600 mb-6">Sign in to see your items and start shopping.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors duration-200 font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to get started!</p>
          <button
            onClick={handleContinueShopping}
            className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors duration-200 font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h1>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Cart Items */}
            <div className="space-y-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex items-center space-x-6 py-4 border-b border-gray-100 last:border-b-0">
                  {/* Product Image */}
                  <img
                    src={item.imageUrls?.[0] || '/placeholder-image.jpg'}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0OEM1Mi45NzA2IDQ4IDU3IDQzLjk3MDYgNTcgMzlDNzcgMzguOTcwNiA0OCAzNC4wMjk0IDQ4IDM5QzQ4IDQzLjk3MDYgNDMuOTcwNiA0OCAzOSA0OEM0My45NzA2IDQ4IDQ4IDUyLjAyOTQgNDggNTdDNzcgNTYuOTcwNiA0OCA1Mi4wMjk0IDQ4IDU3QzQ4IDUyLjAyOTQgNTIuOTcwNiA0OCA1NyA0OEM1Mi45NzA2IDQ4IDQ4IDQzLjk3MDYgNDggMzlWNTdWNDhaIiBmaWxsPSIjOEE5MEFBIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Size: <span className="font-medium">{item.selectedSize}</span></span>
                      <span>Color: <span className="font-medium">Black</span></span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mt-2">${item.price?.toFixed(2)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={item.quantity <= 1}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-12 h-10 flex items-center justify-center bg-white text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200 p-2"
                      title="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-20">
                    <p className="text-lg font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="max-w-md ml-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
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
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-black text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    Proceed to Checkout
                  </button>
                  
                  <button
                    onClick={handleContinueShopping}
                    className="w-full border border-gray-300 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Secure checkout • SSL encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed / Recommended Products Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">You might also like</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Add recommended products here */}
            <div className="text-center py-8">
              <p className="text-gray-500">More products coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};