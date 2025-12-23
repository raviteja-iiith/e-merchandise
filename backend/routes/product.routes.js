import express from 'express';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { checkVendorStatus } from '../middleware/vendor.js';
import { upload, uploadCSV } from '../middleware/upload.js';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadBulkProducts,
  getProductsByCategory,
  getFeaturedProducts,
  getRelatedProducts
} from '../controllers/product.controller.js';

const router = express.Router();

router.post('/', protect, authorize('vendor'), checkVendorStatus, upload.array('productImages', 10), createProduct);
router.get('/', optionalAuth, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', optionalAuth, getProduct);
router.get('/:id/related', getRelatedProducts);
router.put('/:id', protect, authorize('vendor'), checkVendorStatus, upload.array('productImages', 10), updateProduct);
router.delete('/:id', protect, authorize('vendor'), checkVendorStatus, deleteProduct);
router.post('/bulk-upload', protect, authorize('vendor'), checkVendorStatus, uploadCSV.single('file'), uploadBulkProducts);

export default router;
