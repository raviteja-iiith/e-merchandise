import Review from '../models/Review.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createReview = asyncHandler(async (req, res, next) => {
  const { product, rating, title, comment, order } = req.body;

  // Check if product exists
  const productDoc = await Product.findById(product);
  if (!productDoc) return next(new AppError('Product not found', 404));

  // Check if user purchased the product
  let isVerified = false;
  if (order) {
    const orderDoc = await Order.findById(order);
    if (orderDoc && orderDoc.user.toString() === req.user._id.toString()) {
      isVerified = orderDoc.items.some(item => item.product.toString() === product);
    }
  }

  const reviewData = {
    product,
    user: req.user._id,
    vendor: productDoc.vendor,
    rating,
    title,
    comment,
    order,
    isVerifiedPurchase: isVerified
  };

  if (req.files && req.files.length > 0) {
    reviewData.images = req.files.map(file => `/uploads/reviews/${file.filename}`);
  }

  const review = await Review.create(reviewData);

  // Update product rating
  const reviews = await Review.find({ product, isApproved: true });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  
  productDoc.averageRating = avgRating;
  productDoc.totalReviews = reviews.length;
  productDoc.ratingDistribution[rating] = (productDoc.ratingDistribution[rating] || 0) + 1;
  await productDoc.save();

  res.status(201).json({ success: true, message: 'Review submitted', data: { review } });
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ 
    product: req.params.productId,
    isApproved: true
  })
    .populate('user', 'name avatar')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: reviews.length, data: { reviews } });
});

export const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) return next(new AppError('Review not found', 404));
  if (review.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  const { rating, title, comment } = req.body;
  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (comment) review.comment = comment;

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => `/uploads/reviews/${file.filename}`);
    review.images = [...review.images, ...newImages];
  }

  await review.save();

  res.status(200).json({ success: true, message: 'Review updated', data: { review } });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return next(new AppError('Review not found', 404));
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  await review.deleteOne();

  res.status(200).json({ success: true, message: 'Review deleted' });
});

export const voteReview = asyncHandler(async (req, res, next) => {
  const { vote } = req.body; // 'helpful' or 'unhelpful'
  const review = await Review.findById(req.params.id);

  if (!review) return next(new AppError('Review not found', 404));

  const existingVote = review.votedBy.find(v => v.user.toString() === req.user._id.toString());

  if (existingVote) {
    if (existingVote.vote === vote) {
      return next(new AppError('You already voted', 400));
    }
    // Change vote
    if (existingVote.vote === 'helpful') {
      review.helpfulVotes -= 1;
      review.unhelpfulVotes += 1;
    } else {
      review.unhelpfulVotes -= 1;
      review.helpfulVotes += 1;
    }
    existingVote.vote = vote;
  } else {
    review.votedBy.push({ user: req.user._id, vote });
    if (vote === 'helpful') review.helpfulVotes += 1;
    else review.unhelpfulVotes += 1;
  }

  await review.save();

  res.status(200).json({ success: true, message: 'Vote recorded', data: { review } });
});

export const vendorResponse = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return next(new AppError('Review not found', 404));

  // Check if vendor owns the product
  const product = await Product.findById(review.product);
  if (product.vendor.toString() !== req.vendor._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  review.vendorResponse = {
    comment: req.body.comment,
    respondedAt: new Date()
  };

  await review.save();

  res.status(200).json({ success: true, message: 'Response added', data: { review } });
});
