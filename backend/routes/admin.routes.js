import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getDashboardStats,
  getAllVendors,
  approveVendor,
  rejectVendor,
  getAllOrders,
  getAllProducts,
  approveProduct,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllUsers,
  changeUserRole,
  toggleUserStatus,
  deleteUser,
  getAllReviews,
  deleteReview,
  getSettings,
  updateSettings,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.get('/orders', getAllOrders);
router.get('/products', getAllProducts);
router.put('/products/:id/approve', approveProduct);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', changeUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.patch('/categories/:id/status', toggleCategoryStatus);

export default router;
