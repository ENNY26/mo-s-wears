// App.js - Updated and Cleaned
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";
import { PaymentProvider } from './context/PaymentContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import Landing from "./pages/Landing";
import Home from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import ProductDetail from "./pages/ProductDetail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";

// Import Admin Pages
import AddProduct from "./admin/AddProduct";
import AdminPage from "./admin/AdminPage";
import EditProduct from "./admin/EditProduct";

// Import Shared Navigation
import Navigation from "./components/Navigation";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <UserProvider>
          <PaymentProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                {/* Shared Navigation - Now used across all pages */}
                <Navigation />
                <main>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/homepage" element={<Home />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/addresses" element={<Addresses />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<ProtectedAdminRoute><AdminPage /></ProtectedAdminRoute>} />
                    <Route path="/admin/add-product" element={<ProtectedAdminRoute><AddProduct /></ProtectedAdminRoute>} />
                    <Route path="/admin/edit-product/:id" element={<ProtectedAdminRoute><EditProduct /></ProtectedAdminRoute>} />
                  </Routes>
                </main>
                <ToastContainer />
              </div>
            </Router>
          </PaymentProvider>
        </UserProvider>
      </CartProvider>
    </AuthProvider>
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