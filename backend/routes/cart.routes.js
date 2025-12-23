import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon
} from '../controllers/cart.controller.js';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/:itemId', protect, updateCartItem);
router.delete('/:itemId', protect, removeFromCart);
router.delete('/', protect, clearCart);
router.post('/coupon', protect, applyCoupon);
router.delete('/coupon', protect, removeCoupon);

export default router;
