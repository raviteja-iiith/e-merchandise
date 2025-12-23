import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createPaymentIntent,
  confirmPayment,
  handleWebhook
} from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
