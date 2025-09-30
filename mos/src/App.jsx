import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Homepage";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";
import { CartProvider } from "./context/CartContext";
import Cart from "./components/Cart";
import AddProduct from "./admin/AddProduct";
import AdminPage from "./admin/AdminPage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Navigation Component
function Navigation() {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and main navigation */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200"
            >
              FashionStore
            </Link>
            
            <Link 
              to="/" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
            >
              Home
            </Link>
          </div>

          {/* Right side - Auth navigation */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            {user && (
              <Link 
                to="/cart" 
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>
                )}
              </Link>
            )}

            {/* Admin Link */}
            {user?.email === "danalysis856@gmail.com" && (
              <Link 
                to="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
              >
                Admin
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 hidden sm:block">
                  Welcome, <span className="font-medium">{user.email}</span>
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Main App Component
function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedAdminRoute>
                    <AdminPage />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/add-product" 
                element={
                  <ProtectedAdminRoute>
                    <AddProduct />
                  </ProtectedAdminRoute>
                } 
              />
            </Routes>
          </main>

          {/* Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </CartProvider>
  );
}

// Protected Admin Route Component
function ProtectedAdminRoute({ children }) {
  const { user } = useAuth();
  
  if (user?.email === "danalysis856@gmail.com") {
    return children;
  }
  
  return <Navigate to="/" replace />;
}

export default App;