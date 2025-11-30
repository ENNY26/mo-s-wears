// components/Navigation.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const { userProfile } = useUser();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCartClick = () => {
    // Always allow cart access - no login required
    navigate("/cart");
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg py-3' : 'bg-white/95 backdrop-blur-md py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Mo's Clothing
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-8 text-sm font-medium">
            <Link 
              to="/homepage" 
              className="text-gray-700 hover:text-purple-600 transition-colors duration-300 relative group"
            >
              New Arrivals
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors duration-300 relative group">
              Women
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <Link to="/kids" className="text-gray-700 hover:text-purple-600 transition-colors duration-300 relative group">
              Children
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <a href="#" className="text-red-600 hover:text-red-700 transition-colors duration-300 font-semibold relative group">
              Sale
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Search className="w-5 h-5 cursor-pointer text-gray-600 hover:text-purple-600 transition-colors duration-300 hidden sm:block" />
            
            <div className="relative">
              <Heart className="w-5 h-5 cursor-pointer text-gray-600 hover:text-red-500 transition-colors duration-300 hidden sm:block" />
            </div>

            {/* User Profile or Icon */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-purple-600 transition-colors duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {userProfile?.firstName ? userProfile.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
                    </span>
                  </div>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/addresses"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      My Addresses
                    </Link>
                    {user?.email === "danalysis856@gmail.com" && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <User 
                onClick={() => navigate("/login")}
                className="w-5 h-5 cursor-pointer text-gray-600 hover:text-purple-600 transition-colors duration-300 hidden sm:block" 
              />
            )}

            {/* Cart - Updated to allow guest access */}
            <div className="relative">
              <ShoppingBag 
                onClick={handleCartClick}
                className="w-5 h-5 cursor-pointer text-gray-600 hover:text-purple-600 transition-colors duration-300" 
              />
              {/* Show cart count for all users (guests and logged in) */}
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {getCartItemsCount()}
                </span>
              )}
            </div>

            {/* Sign In Button */}
            {!user && (
              <button
                onClick={() => navigate("/login")}
                className="hidden md:block px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm font-medium"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-6 space-y-4">
              <Link 
                to="/homepage" 
                className="block text-gray-700 hover:text-purple-600 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                New Arrivals
              </Link>
              <a href="#" className="block text-gray-700 hover:text-purple-600 transition-colors font-medium py-2">
                Women
              </a>
              <Link to="/kids" className="block text-gray-700 hover:text-purple-600 transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Children
              </Link>
              <a href="#" className="block text-red-600 hover:text-red-700 transition-colors font-semibold py-2">
                Sale
              </a>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block text-gray-700 hover:text-purple-600 transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block text-gray-700 hover:text-purple-600 transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/addresses"
                    className="block text-gray-700 hover:text-purple-600 transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Addresses
                  </Link>
                  {user?.email === "danalysis856@gmail.com" && (
                    <Link
                      to="/admin"
                      className="block text-gray-700 hover:text-purple-600 transition-colors font-medium py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-red-600 hover:text-red-700 transition-colors font-medium py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium mt-4"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}