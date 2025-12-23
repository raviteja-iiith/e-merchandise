import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import { getNotifications } from './store/slices/notificationSlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OAuthCallback from './pages/auth/OAuthCallback';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Notifications from './pages/Notifications';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorProducts from './pages/vendor/Products';
import VendorProductForm from './pages/vendor/ProductForm';
import VendorOrders from './pages/vendor/Orders';
import VendorOrderDetail from './pages/vendor/OrderDetail';
import VendorAnalytics from './pages/vendor/Analytics';
import VendorProfile from './pages/vendor/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminVendors from './pages/admin/Vendors';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminCoupons from './pages/admin/Coupons';
import AdminReviews from './pages/admin/Reviews';
import AdminSettings from './pages/admin/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken) {
      dispatch(getMe());
    }
  }, [dispatch, accessToken]);

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getNotifications());
      // Refresh notifications every 30 seconds
      const interval = setInterval(() => {
        dispatch(getNotifications());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="auth/callback" element={<OAuthCallback />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        
        {/* Protected Customer Routes */}
        <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      </Route>

      {/* Vendor Routes */}
      <Route path="/vendor" element={
        <ProtectedRoute roles={['vendor']}>
          <DashboardLayout userType="vendor" />
        </ProtectedRoute>
      }>
        <Route index element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="products/new" element={<VendorProductForm />} />
        <Route path="products/:productId/edit" element={<VendorProductForm />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="orders/:orderId" element={<VendorOrderDetail />} />
        <Route path="analytics" element={<VendorAnalytics />} />
        <Route path="profile" element={<VendorProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout userType="admin" />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="flex items-center justify-center h-screen"><h1 className="text-4xl">404 - Page Not Found</h1></div>} />
    </Routes>
  );
}

export default App;
