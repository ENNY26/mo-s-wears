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
import { ShoppingCart, Search, Heart, Filter, X, SlidersHorizontal, Star, TrendingUp, Package } from "lucide-react";

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
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

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

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        imageUrls: product.imageUrls || []
      });
      toast.success(`Added ${product.title} to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Could not add to cart");
    }
  };

  const toggleFavorite = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        toast.info("Removed from favorites");
      } else {
        newFavorites.add(productId);
        toast.success("Added to favorites");
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
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "popular":
          return (b.reviews || 0) - (a.reviews || 0);
        case "newest":
        default:
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
    });

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
    setPriceRange({ min: 0, max: 1000 });
  };

  const LoadingSkeleton = () => (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="h-56 sm:h-64 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded-full animate-pulse mb-3"></div>
            <div className="h-3 bg-gray-200 rounded-full animate-pulse mb-3 w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const ProductCard = ({ product, index }) => {
    const isFavorite = favorites.has(product.id);
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        whileHover={{ y: -8 }}
        className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group"
      >
        <Link to={`/product/${product.id}`} className="block relative">
          {/* Product Image */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden aspect-square">
            <img
              src={product.imageUrls?.[0] || "/placeholder.png"}
              alt={product.title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            
            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {product.isNew && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm"
                >
                  NEW
                </motion.span>
              )}
              {hasDiscount && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm"
                >
                  -{discountPercent}%
                </motion.span>
              )}
              {product.featured && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1"
                >
                  <Star size={12} className="fill-current" />
                  Featured
                </motion.span>
              )}
            </div>

            {/* Favorite Button */}
            <button
              onClick={(e) => toggleFavorite(product.id, e)}
              className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 z-10 shadow-lg ${
                isFavorite 
                  ? 'bg-red-500 text-white scale-110' 
                  : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 hover:scale-110'
              }`}
            >
              <Heart size={18} className={isFavorite ? "fill-current" : ""} />
            </button>

            {/* Quick Add Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={(e) => handleAddToCart(product, e)}
                className="w-full bg-white text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-xl"
              >
                <ShoppingCart size={18} />
                Quick Add
              </button>
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-4">
          <Link to={`/product/${product.id}`}>
            {product.category && (
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">
                {product.category}
              </p>
            )}
            
            <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors min-h-[2.5rem]">
              {product.title}
            </h3>
          </Link>
          
          {product.description && (
            <p className="text-gray-600 text-xs line-clamp-2 mb-3 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({product.reviews || 0})
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                ${product.price}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            
            <button
              onClick={(e) => handleAddToCart(product, e)}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white p-2.5 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse mb-4 max-w-md"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse max-w-sm"></div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <TrendingUp size={16} />
              <span className="text-sm font-semibold">Trending Now</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Discover Amazing Products
            </h1>
            <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              Explore our curated collection of premium items at unbeatable prices
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40 backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm flex-1 sm:flex-none bg-white font-medium"
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
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm flex-1 sm:flex-none bg-white font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors"
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory !== "all" || sortBy !== "newest") && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {searchQuery && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")} className="hover:text-purple-900">
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("all")} className="hover:text-purple-900">
                    <X size={14} />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6"
          >
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-xl p-4 text-yellow-800 text-sm flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                !
              </div>
              <p className="flex-1">{errorMsg}</p>
              <button onClick={() => setErrorMsg("")} className="text-yellow-600 hover:text-yellow-800">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="text-purple-600" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <>
            {/* Results Count */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between flex-wrap gap-4"
            >
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {Math.min(visibleCount, filteredProducts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900">
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </p>
              </div>
              
              {favorites.size > 0 && (
                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full">
                  <Heart size={16} className="text-red-500 fill-current" />
                  <span className="text-sm font-semibold text-red-600">
                    {favorites.size} favorites
                  </span>
                </div>
              )}
            </motion.div>

            {/* Products Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.slice(0, visibleCount).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredProducts.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-12"
              >
                <button
                  onClick={handleLoadMore}
                  className="group bg-gradient-to-r from-purple-600 to-pink-500 text-white px-10 py-4 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3"
                >
                  Load More Products
                  <Package size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}