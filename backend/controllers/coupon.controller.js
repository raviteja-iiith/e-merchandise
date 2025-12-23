import Coupon from '../models/Coupon.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) return next(new AppError('Invalid coupon code', 400));

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return next(new AppError('Coupon has expired', 400));
  }

  if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
    return next(new AppError(`Minimum purchase of $${coupon.minPurchase} required`, 400));
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return next(new AppError('Coupon usage limit reached', 400));
  }

  // Check user usage
  const userUsage = coupon.usedBy.find(u => u.user.toString() === req.user._id.toString());
  if (userUsage && userUsage.count >= coupon.usagePerUser) {
    return next(new AppError('You have already used this coupon', 400));
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }

  res.status(200).json({
    success: true,
    data: { coupon: { code: coupon.code, discount, discountType: coupon.discountType } }
  });
});
