import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateCoupon } from '../controllers/coupon.controller.js';

const router = express.Router();

router.post('/validate', protect, validateCoupon);

export default router;
