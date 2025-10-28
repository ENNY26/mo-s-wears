import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { ShoppingCart, Search, Heart } from "lucide-react";

export default function Homepage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    setErrorMsg("");

    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = [];
        snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
        setProducts(items);
        setLoading(false);
      },
      async (err) => {
        console.error("Realtime products listener error:", err);
        setErrorMsg("Realtime read failed. Trying a one-time fetch...");

        try {
          const snap = await getDocs(q);
          const items = [];
          snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
          setProducts(items);
        } catch (getErr) {
          console.error("One-time products fetch failed:", getErr);
          if (getErr.code === "permission-denied") {
            setErrorMsg(
              "Permission denied. Adjust Firestore rules to allow reads on products."
            );
          } else {
            setErrorMsg("Failed to load products. See console for details.");
          }
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsub();
  }, []);

  const handleAddToCart = (product) => {
    try {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        imageUrls: product.imageUrls || []
      });
      toast.success(`Added ${product.title} to cart!`);
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Could not add to cart");
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleLoadMore = () => setVisibleCount((c) => c + 12);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
        default:
          return b.createdAt - a.createdAt;
      }
    });

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  const LoadingSkeleton = () => (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="h-48 sm:h-56 bg-gray-200 animate-pulse"></div>
          <div className="p-3 sm:p-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse mb-3 w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const ProductCard = ({ product }) => {
    const isFavorite = favorites.has(product.id);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
      >
        <Link to={`/product/${product.id}`} className="block relative">
          <div className="relative bg-gray-50">
            <img
              src={product.imageUrls?.[0] || "/placeholder.png"}
              alt={product.title}
              className="w-full h-48 sm:h-56 object-contain"
            />
            
            {/* Badges */}
            {(product.isNew || product.discount) && (
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isNew && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    NEW
                  </span>
                )}
                {product.discount && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    -{product.discount}%
                  </span>
                )}
              </div>
            )}

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(product.id);
              }}
              className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart size={16} className={isFavorite ? "fill-current" : ""} />
            </button>
          </div>
        </Link>

        <div className="p-3 sm:p-4">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 mb-1 hover:text-blue-600">
              {product.title}
            </h3>
          </Link>
          
          <p className="text-gray-600 text-xs sm:text-sm line-clamp-1 mb-3">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs sm:text-sm text-gray-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            
            <button
              onClick={() => handleAddToCart(product)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 sm:p-2.5 rounded-lg transition-colors"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Discover Amazing Products
          </h1>
          <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
            Explore our collection of quality items at great prices
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1 sm:flex-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All" : category}
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1 sm:flex-none"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Low to High</option>
                <option value="price-high">High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
            {errorMsg}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{Math.min(visibleCount, filteredProducts.length)}</span> of{" "}
                <span className="font-semibold">{filteredProducts.length}</span> products
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}