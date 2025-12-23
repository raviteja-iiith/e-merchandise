import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart
} from '../controllers/wishlist.controller.js';

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/add/:productId', protect, addToWishlist);
router.delete('/:productId', protect, removeFromWishlist);
router.post('/move-to-cart/:productId', protect, moveToCart);

export default router;
