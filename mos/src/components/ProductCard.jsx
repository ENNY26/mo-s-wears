import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import placeholderImage from "../assets/placeholder.png"; // make sure this exists

const ProductCard = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Defensive: return null if product or imageUrls are invalid
  if (!product || !Array.isArray(product.imageUrls)) {
    return null;
  }

  const hasImages = product.imageUrls.length > 0;
  const displayedImage = hasImages ? product.imageUrls[selectedImage] : placeholderImage;

  const handleAddToCart = (size) => {
    if (!user) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }

    addToCart(product, size);
    toast.success("Added to cart!");
    setShowSizeModal(false);
  };

  const quickAdd = () => {
    if (product.sizes?.length === 1) {
      handleAddToCart(product.sizes[0]);
    } else {
      setShowSizeModal(true);
    }
  };

  return (
    <>
      <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <img
            src={displayedImage}
            alt={product.title}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Image Thumbnails */}
          {hasImages && (
            <div className="absolute bottom-2 left-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {product.imageUrls.slice(0, 3).map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-8 h-8 border-2 ${
                    selectedImage === index ? "border-black" : "border-white"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Add Button */}
          <button
            onClick={quickAdd}
            className="absolute top-3 right-3 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>

          {/* Multiple Images Indicator */}
          {hasImages && product.imageUrls.length > 1 && (
            <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
              {product.imageUrls.length} photos
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">${product.price}</span>
            <span className="text-xs text-gray-500 uppercase">{product.category}</span>
          </div>
        </div>
      </div>

      {/* Size Selection Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
    </>
  );
};

export default ProductCard;
