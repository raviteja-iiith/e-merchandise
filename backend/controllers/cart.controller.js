import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import Coupon from '../models/Coupon.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name basePrice salePrice images stock vendor');
  
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json({ success: true, data: { cart } });
});

export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity, variant } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found', 404));

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId && JSON.stringify(item.variant) === JSON.stringify(variant)
  );

  const price = product.salePrice || product.basePrice;

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, variant, price });
  }

  await cart.save();
  await cart.populate('items.product', 'name basePrice salePrice images stock');

  res.status(200).json({ success: true, message: 'Item added to cart', data: { cart } });
});

export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) return next(new AppError('Cart not found', 404));

  const item = cart.items.id(req.params.itemId);
  if (!item) return next(new AppError('Item not found in cart', 404));

  item.quantity = quantity;
  await cart.save();

  res.status(200).json({ success: true, message: 'Cart updated', data: { cart } });
});

export const removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found', 404));

  cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
  await cart.save();

  res.status(200).json({ success: true, message: 'Item removed from cart', data: { cart } });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.coupon = undefined;
    await cart.save();
  }

  res.status(200).json({ success: true, message: 'Cart cleared' });
});

export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return next(new AppError('Invalid coupon code', 400));

  // Validate coupon
  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return next(new AppError('Coupon has expired', 400));
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (cart.totalPrice * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }

  cart.coupon = { code: coupon.code, discount };
  await cart.save();

  res.status(200).json({ success: true, message: 'Coupon applied', data: { cart, discount } });
});

export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  cart.coupon = undefined;
  await cart.save();

  res.status(200).json({ success: true, message: 'Coupon removed', data: { cart } });
});
