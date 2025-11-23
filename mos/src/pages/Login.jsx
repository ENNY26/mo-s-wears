// components/Login.jsx - Updated
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, LogIn } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);

  const showNotification = (message, type = "success") => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showNotification("Please enter your email", "error");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showNotification("Please enter a valid email", "error");
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmail(email);
      showNotification("Welcome! You're now signed in.");
      
      // Redirect to intended page or home
      const from = location.state?.from?.pathname || "/homepage";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      showNotification("Login failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      await signInWithGoogle();
      showNotification("Google login successful!");
      
      const from = location.state?.from?.pathname || "/homepage";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Google login error:", error);
      showNotification("Google login failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEmailLogin(e);
    }
  };

  const continueAsGuest = () => {
    navigate(location.state?.from?.pathname || "/homepage");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl"></div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 20 }}
          exit={{ opacity: 0 }}
          className={`fixed top-0 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-lg ${
            showToast.type === 'success' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}
        >
          <p className="font-semibold">{showToast.message}</p>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to continue or shop as guest
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleEmailLogin}>
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Continue with Email
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-3 py-4 px-4 border-2 border-gray-300 rounded-xl bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Guest Option */}
            <div className="mt-6">
              <button
                onClick={continueAsGuest}
                className="w-full py-4 px-4 border-2 border-purple-600 rounded-xl bg-transparent text-base font-semibold text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300"
              >
                Continue as Guest
              </button>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <button className="text-purple-600 hover:text-purple-500 underline">Terms of Service</button>
            {' '}and{' '}
            <button className="text-purple-600 hover:text-purple-500 underline">Privacy Policy</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;