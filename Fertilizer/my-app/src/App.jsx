import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import BhoomiCardPage from './pages/BhoomiCardPage';
import AuthPage from './pages/Auth';
import About from './pages/About';
import Checkout from './pages/Checkout';
import CropRecommendation from './pages/CropRecommendation';
import SoilAnalysis from './pages/SoilAnalysis';
import ChatBot from './components/ChatBot';
import { LanguageProvider } from './i18n/LanguageContext';
import { apiService } from './services/apiService';

export const AuthContext = createContext();

// Reactive dark-mode hook — mirrors the body.dark-mode class toggled by AppContent
export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.body.classList.contains('dark-mode')
  );
  useEffect(() => {
    const sync = () => setIsDark(document.body.classList.contains('dark-mode'));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
};

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? JSON.parse(stored) : false;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  // ─── GLOBAL WISHLIST STATE (Source of truth for heart icon everywhere) ───
  const [wishlistIds, setWishlistIds] = useState([]);

  const isAuthenticated = Boolean(token && user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Fetch wishlist from backend whenever user logs in or page loads
  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      setWishlistIds([]);
    }
  }, [isAuthenticated]);

  const refreshWishlist = useCallback(async () => {
    try {
      const data = await apiService.getWishlist();
      const ids = Array.isArray(data?.product_ids) ? data.product_ids : [];
      setWishlistIds(ids);
    } catch {
      setWishlistIds([]);
    }
  }, []);

  const toggleWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const isWishlisted = wishlistIds.includes(productId);
    // Optimistic update
    setWishlistIds(prev =>
      isWishlisted ? prev.filter(id => id !== productId) : [...prev, productId]
    );
    try {
      if (isWishlisted) {
        await apiService.removeFromWishlist(productId);
      } else {
        await apiService.addToWishlist(productId);
      }
    } catch {
      // Revert on error
      setWishlistIds(prev =>
        isWishlisted ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    }
  }, [isAuthenticated, wishlistIds, navigate]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    // ─── STRICT SESSION RESET: Clear all user-specific state & local caches ───
    setToken(null);
    setUser(null);
    setWishlistIds([]);

    const darkModeSetting = localStorage.getItem('darkMode');
    localStorage.clear();
    sessionStorage.clear();
    if (darkModeSetting) {
      localStorage.setItem('darkMode', darkModeSetting);
    }

    navigate('/login');
  };

  const requireAuth = (action) => {
    if (isAuthenticated) {
      action();
    } else {
      navigate('/login', { state: { from: location.pathname } });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        logout,
        requireAuth,
        wishlistIds,
        toggleWishlist,
        refreshWishlist,
        setIsAuthenticated: (val) => {
          if (!val) logout();
        }
      }}
    >
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#10B981',
            borderRadius: 12,
            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            colorBgContainer: isDarkMode ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.8)',
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

          <main style={{ flex: 1, position: 'relative' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/crop-recommendation" element={<CropRecommendation />} />
              <Route path="/soil-analysis" element={<SoilAnalysis />} />
              <Route path="/bhoomi-card" element={<BhoomiCardPage />} />
              <Route path="/products" element={<Products />} />
              <Route path="/seeds" element={<Products initialCategory="Seeds" />} />
              <Route path="/machinery" element={<Products initialCategory="Machinery" />} />
              <Route path="/irrigation" element={<Products initialCategory="Irrigation" />} />
              <Route path="/tools" element={<Products initialCategory="Tools" />} />
              <Route path="/fertilizers" element={<Products initialCategory="Fertilizers" />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/login" element={<AuthPage />} />

              {/* Protected User Routes */}
              <Route
                path="/cart"
                element={isAuthenticated ? <Cart /> : <Navigate to="/login" state={{ from: '/cart' }} replace />}
              />
              <Route
                path="/checkout"
                element={isAuthenticated ? <Checkout /> : <Navigate to="/login" state={{ from: '/checkout' }} replace />}
              />
              <Route
                path="/wishlist"
                element={isAuthenticated ? <Wishlist /> : <Navigate to="/login" state={{ from: '/wishlist' }} replace />}
              />
              <Route
                path="/orders"
                element={isAuthenticated ? <Orders /> : <Navigate to="/login" state={{ from: '/orders' }} replace />}
              />

              {/* ─── FARMER / BUYER DASHBOARD ACCESS BLOCKED ───
                  Dashboard routes are strictly restricted to Admin and Seller roles.
                  Farmers/Buyers attempting to access /dashboard are redirected to Home (/).
              ─── */}
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? (
                    user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace />
                    : user?.role === 'seller' ? <Navigate to="/seller/dashboard" replace />
                    : <Navigate to="/" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Protected Seller Routes */}
              <Route
                path="/seller"
                element={
                  isAuthenticated ? (
                    user?.role === 'seller' || user?.role === 'admin' ? <SellerDashboard /> : <Navigate to="/" replace />
                  ) : (
                    <Navigate to="/login" state={{ from: '/seller' }} replace />
                  )
                }
              />
              <Route
                path="/seller/dashboard"
                element={
                  isAuthenticated ? (
                    user?.role === 'seller' || user?.role === 'admin' ? <SellerDashboard /> : <Navigate to="/" replace />
                  ) : (
                    <Navigate to="/login" state={{ from: '/seller/dashboard' }} replace />
                  )
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  isAuthenticated ? (
                    user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />
                  ) : (
                    <Navigate to="/login" state={{ from: '/admin' }} replace />
                  )
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  isAuthenticated ? (
                    user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />
                  ) : (
                    <Navigate to="/login" state={{ from: '/admin/dashboard' }} replace />
                  )
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer hidden on the login/auth page */}
          {location.pathname !== '/login' && <Footer />}
          <ChatBot />
        </div>
      </ConfigProvider>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;