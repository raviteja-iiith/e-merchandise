import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  voteReview,
  vendorResponse
} from '../controllers/review.controller.js';

const router = express.Router();

router.post('/', protect, upload.array('reviewImages', 5), createReview);
router.get('/product/:productId', optionalAuth, getProductReviews);
router.put('/:id', protect, upload.array('reviewImages', 5), updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/vote', protect, voteReview);
router.post('/:id/vendor-response', protect, vendorResponse);

export default router;
