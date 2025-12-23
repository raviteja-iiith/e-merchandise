import Wishlist from '../models/Wishlist.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products.product', 'name basePrice salePrice images averageRating stock');
  
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  res.status(200).json({ success: true, data: { wishlist } });
});

export const addToWishlist = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new AppError('Product not found', 404));

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

  const exists = wishlist.products.some(item => item.product.toString() === req.params.productId);
  if (exists) return next(new AppError('Product already in wishlist', 400));

  wishlist.products.push({ product: req.params.productId });
  await wishlist.save();
  await wishlist.populate('products.product', 'name basePrice salePrice images');

  res.status(200).json({ success: true, message: 'Added to wishlist', data: { wishlist } });
});

export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return next(new AppError('Wishlist not found', 404));

  wishlist.products = wishlist.products.filter(item => item.product.toString() !== req.params.productId);
  await wishlist.save();
  await wishlist.populate('products.product', 'name basePrice salePrice images averageRating totalReviews stock');

  res.status(200).json({ success: true, message: 'Removed from wishlist', data: { wishlist } });
});

export const moveToCart = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new AppError('Product not found', 404));

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const price = product.salePrice || product.basePrice;
  cart.items.push({ product: req.params.productId, quantity: 1, price });
  await cart.save();

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  wishlist.products = wishlist.products.filter(item => item.product.toString() !== req.params.productId);
  await wishlist.save();

  res.status(200).json({ success: true, message: 'Moved to cart', data: { cart, wishlist } });
});
