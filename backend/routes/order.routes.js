import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  requestReturn
} from '../controllers/order.controller.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:orderId', protect, getOrder);
router.put('/:orderId/cancel', protect, cancelOrder);
router.post('/:orderId/return', protect, requestReturn);

export default router;
