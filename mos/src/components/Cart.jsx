import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your cart</h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors duration-200"
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
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors duration-200"
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({cart.items.length} items)</h1>
          </div>

          <div className="p-6">
            {cart.items.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex items-center space-x-4 py-4 border-b border-gray-100">
                <img
                  src={item.imageUrls[0]}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-md"
                />
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                  <p className="text-lg font-semibold text-gray-900">${item.price}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-100 transition-colors duration-200"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 min-w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-100 transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-6 flex justify-between items-center">
              <div>
                <p className="text-xl font-bold text-gray-900">
                  Total: ${getCartTotal().toFixed(2)}
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={clearCart}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => toast.success("Checkout functionality coming soon!")}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;