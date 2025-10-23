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
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Eye,
  Sparkles,
  Search,
  Filter,
  Star,
  Heart
} from "lucide-react";

export default function Homepage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [quickAddProduct, setQuickAddProduct] = useState(null);
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

  const handleAddToCart = (product, size = null, color = null) => {
    try {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        size: size,
        color: color,
        imageUrls: product.imageUrls || []
      });
      setQuickAddProduct(product);
      setTimeout(() => setQuickAddProduct(null), 2000);
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

  // Filter and sort products
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
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
        default:
          return b.createdAt - a.createdAt;
      }
    });

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  const LoadingSkeleton = () => (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 animate-pulse"></div>
          <div className="p-5">
            <div className="h-4 bg-purple-100 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-purple-100 rounded animate-pulse mb-4 w-3/4"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-purple-100 rounded animate-pulse w-16"></div>
              <div className="h-8 bg-purple-100 rounded-xl animate-pulse w-8"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ProductCard = ({ product }) => {
    const [showQuickActions, setShowQuickActions] = useState(false);
    const isFavorite = favorites.has(product.id);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="group relative bg-white rounded-3xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
        onMouseEnter={() => setShowQuickActions(true)}
        onMouseLeave={() => setShowQuickActions(false)}
      >
        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(product.id)}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isFavorite 
              ? 'bg-pink-500 text-white shadow-lg' 
              : 'bg-white/80 text-gray-400 hover:bg-white hover:text-pink-500'
          }`}
        >
          <Heart size={18} className={isFavorite ? "fill-current" : ""} />
        </button>

        {/* Image Container */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
          <img
            src={product.imageUrls?.[0] || "/placeholder.png"}
            alt={product.title}
            className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Quick Actions Overlay */}
          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-purple-900/20 backdrop-blur-sm flex items-center justify-center gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAddToCart(product)}
                  className="bg-white rounded-2xl p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-purple-50"
                >
                  <ShoppingCart size={24} className="text-purple-600" />
                </motion.button>
                
                <Link to={`/product/${product.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-white rounded-2xl p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-purple-50"
                  >
                    <Eye size={24} className="text-purple-600" />
                  </motion.div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                NEW
              </span>
            )}
            {product.discount && (
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                -{product.discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2 leading-tight">
              {product.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={`${
                      star <= (product.rating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviewCount || 0})</span>
            </div>
          )}

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddToCart(product)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-2xl hover:shadow-xl transition-all duration-300 shadow-lg hover:from-purple-700 hover:to-pink-700"
            >
              <ShoppingCart size={20} />
            </motion.button>
          </div>

          {/* Quick Size Selection */}
          {product.sizes?.length > 0 && showQuickActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-purple-100"
            >
              <p className="text-xs text-gray-600 mb-2 font-medium">QUICK ADD:</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.slice(0, 4).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleAddToCart(product, size)}
                    className="text-xs px-3 py-2 border border-purple-200 rounded-xl hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 font-medium"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Success Notification */}
      <AnimatePresence>
        {quickAddProduct && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 backdrop-blur-sm"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <ShoppingCart size={16} />
            </div>
            <div>
              <p className="font-semibold">Added to cart!</p>
              <p className="text-sm opacity-90">{quickAddProduct.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            Discover Your
            <span className="block bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">
              Perfect Style
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl opacity-90 mb-8 max-w-2xl mx-auto"
          >
            Explore our curated collection of premium products designed to elevate your everyday
          </motion.p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>

            <div className="flex gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-purple-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-sm min-w-40"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-purple-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-sm min-w-40"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6"
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-yellow-800">
            {errorMsg}
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-purple-400" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Try adjusting your search terms or browse different categories
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl hover:shadow-xl transition-all duration-300"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-purple-600">{Math.min(visibleCount, filteredProducts.length)}</span> of{" "}
                <span className="font-semibold text-purple-600">{filteredProducts.length}</span> products
              </p>
            </div>

            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.slice(0, visibleCount).map((product, index) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {visibleCount < filteredProducts.length && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-16"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoadMore}
                  className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 font-semibold shadow-lg"
                >
                  <Plus size={20} />
                  Load More Products
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}