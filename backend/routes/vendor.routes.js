import express from 'express';
import {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorAnalytics,
  getVendorOrders,
  updateOrderStatus,
  getVendorProducts,
  getVendorReviews
} from '../controllers/vendor.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { checkVendorStatus } from '../middleware/vendor.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Vendor registration
router.post('/register', protect, upload.fields([
  { name: 'storeLogo', maxCount: 1 },
  { name: 'storeBanner', maxCount: 1 }
]), registerVendor);

// Vendor profile
router.get('/profile', protect, authorize('vendor'), getVendorProfile);
router.put('/profile', protect, authorize('vendor'), upload.fields([
  { name: 'storeLogo', maxCount: 1 },
  { name: 'storeBanner', maxCount: 1 }
]), updateVendorProfile);

// Vendor analytics and data
router.get('/analytics', protect, authorize('vendor'), checkVendorStatus, getVendorAnalytics);
router.get('/orders', protect, authorize('vendor'), checkVendorStatus, getVendorOrders);
router.put('/orders/:orderId/items/:itemId/status', protect, authorize('vendor'), checkVendorStatus, updateOrderStatus);
router.get('/products', protect, authorize('vendor'), checkVendorStatus, getVendorProducts);
router.get('/reviews', protect, authorize('vendor'), checkVendorStatus, getVendorReviews);

export default router;
