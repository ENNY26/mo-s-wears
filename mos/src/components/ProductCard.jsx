// components/ProductCard.jsx - Updated
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (size) => {
    // No login required - guests can add to cart
    addToCart(product, size);
    toast.success("Added to cart!");
    setShowSizeModal(false);
  };

  const quickAdd = () => {
    if (product.sizes.length === 1) {
      handleAddToCart(product.sizes[0]);
    } else {
      setShowSizeModal(true);
    }
  };

  return (
    <div className="product-card group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-w-3 aspect-h-4 overflow-hidden rounded-t-lg">
          <img
            src={product.imageUrls?.[0] || "/placeholder.png"}
            alt={product.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
          <p className="text-lg font-semibold text-gray-900">${product.price?.toFixed(2)}</p>
        </div>
      </Link>

      {/* Quick Add Button - Always visible for guests */}
      <button
        onClick={quickAdd}
        className="absolute top-3 right-3 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Size Selection Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Size</h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => handleAddToCart(size)}
                  className="border border-gray-300 py-2 px-3 hover:border-black transition-colors duration-200 text-sm"
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSizeModal(false)}
              className="w-full border border-gray-300 py-2 text-sm hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;