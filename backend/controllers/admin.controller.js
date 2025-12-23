import User from '../models/User.model.js';
import Vendor from '../models/Vendor.model.js';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import Coupon from '../models/Coupon.model.js';
import Review from '../models/Review.model.js';
import Notification from '../models/Notification.model.js';
import Category from '../models/Category.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import { emitToUser } from '../config/socket.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalVendors = await Vendor.countDocuments({ approvalStatus: 'approved' });
  const totalProducts = await Product.countDocuments({ isApproved: true });
  const totalOrders = await Order.countDocuments();

  const orders = await Order.find();
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const recentOrders = await Order.find().sort('-createdAt').limit(10)
    .populate('user', 'name email');

  // Get recent vendors with populated user data
  const recentVendors = await Vendor.find().sort('-createdAt').limit(5)
    .populate('user', 'name email');

  // Get recent products
  const recentProducts = await Product.find().sort('-createdAt').limit(5)
    .populate('vendor', 'storeName');

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const ordersByMonth = await Order.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { 
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // User growth by month (last 6 months)
  const usersByMonth = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { 
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        users: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const vendorsByMonth = await Vendor.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { 
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        vendors: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Format month data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueData = ordersByMonth.map(item => ({
    month: months[item._id.month - 1],
    revenue: item.revenue,
    orders: item.orders
  }));

  const userGrowthData = usersByMonth.map(item => {
    const vendorData = vendorsByMonth.find(v => v._id.month === item._id.month && v._id.year === item._id.year);
    return {
      month: months[item._id.month - 1],
      users: item.users,
      vendors: vendorData ? vendorData.vendors : 0
    };
  });

  const pendingVendors = await Vendor.countDocuments({ approvalStatus: 'pending' });

  res.status(200).json({
    success: true,
    data: {
      overview: { totalUsers, totalVendors, totalProducts, totalOrders, totalRevenue },
      recentOrders,
      recentVendors,
      recentProducts,
      revenueData,
      userGrowthData,
      pendingVendors
    }
  });
});

export const getAllVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find()
    .populate('user', 'name email')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: vendors.length, data: { vendors } });
});

export const approveVendor = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id).populate('user');

  if (!vendor) return next(new AppError('Vendor not found', 404));

  vendor.approvalStatus = 'approved';
  vendor.approvalDate = new Date();
  vendor.isActive = true;
  await vendor.save();

  // Send approval email
  await sendEmail({
    to: vendor.user.email,
    subject: 'Vendor Application Approved',
    html: emailTemplates.vendorApproval(vendor.user.name, vendor.storeName)
  });

  // Send notification
  const notification = await Notification.create({
    recipient: vendor.user._id,
    type: 'vendor_approved',
    title: 'Vendor Application Approved',
    message: 'Your vendor application has been approved. You can now start selling!',
    link: '/vendor/dashboard'
  });

  emitToUser(vendor.user._id, 'notification', notification);

  res.status(200).json({ success: true, message: 'Vendor approved', data: { vendor } });
});

export const rejectVendor = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id).populate('user');

  if (!vendor) return next(new AppError('Vendor not found', 404));

  vendor.approvalStatus = 'rejected';
  vendor.rejectionReason = req.body.reason;
  await vendor.save();

  const notification = await Notification.create({
    recipient: vendor.user._id,
    type: 'vendor_rejected',
    title: 'Vendor Application Rejected',
    message: `Your vendor application has been rejected. Reason: ${req.body.reason}`,
    link: '/vendor/profile'
  });

  emitToUser(vendor.user._id, 'notification', notification);

  res.status(200).json({ success: true, message: 'Vendor rejected', data: { vendor } });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: orders.length, data: { orders } });
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate('vendor', 'storeName')
    .populate('category', 'name')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: products.length, data: { products } });
});

export const approveProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return next(new AppError('Product not found', 404));

  product.isApproved = true;
  await product.save();

  res.status(200).json({ success: true, message: 'Product approved', data: { product } });
});

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');

  res.status(200).json({ success: true, count: coupons.length, data: { coupons } });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });

  res.status(201).json({ success: true, message: 'Coupon created', data: { coupon } });
});

export const updateCoupon = asyncHandler(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) return next(new AppError('Coupon not found', 404));

  coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });

  res.status(200).json({ success: true, message: 'Coupon updated', data: { coupon } });
});

export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) return next(new AppError('Coupon not found', 404));

  await coupon.deleteOne();

  res.status(200).json({ success: true, message: 'Coupon deleted' });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role && role !== 'all' ? { role } : {};
  const users = await User.find(filter).select('-password').sort('-createdAt');
  res.status(200).json({ success: true, data: { users } });
});

// @desc    Change user role
// @route   PATCH /api/admin/users/:id/role
// @access  Admin
export const changeUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  
  if (!['customer', 'vendor', 'admin'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({ success: true, data: { user }, message: 'User role updated' });
});

// @desc    Toggle user status (active/banned)
// @route   PATCH /api/admin/users/:id/status
// @access  Admin
export const toggleUserStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({ 
    success: true, 
    data: { user }, 
    message: `User ${isActive ? 'activated' : 'banned'}` 
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await user.deleteOne();

  res.status(200).json({ success: true, message: 'User deleted' });
});

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find().populate('user', 'name email').populate('product', 'name').sort('-createdAt');
  res.status(200).json({ success: true, data: { reviews } });
});

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Admin
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  await review.deleteOne();
  res.status(200).json({ success: true, message: 'Review deleted' });
});

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Admin
export const getSettings = asyncHandler(async (req, res) => {
  const settings = {
    platformName: 'Marketplace',
    commission: 10,
    currency: '₹',
    emailNotifications: true,
    maintenanceMode: false
  };
  res.status(200).json({ success: true, data: settings });
});

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Admin
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = req.body;
  res.status(200).json({ success: true, data: settings, message: 'Settings updated successfully' });
});

// @desc    Get all categories with product counts
// @route   GET /api/admin/categories
// @access  Admin
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('-createdAt');
  
  // Get product count for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const productsCount = await Product.countDocuments({ 
        category: category._id,
        isApproved: true 
      });
      return {
        ...category.toObject(),
        productsCount
      };
    })
  );
  
  res.status(200).json({ 
    success: true, 
    data: { categories: categoriesWithCounts } 
  });
});

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Admin
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ 
    success: true, 
    message: 'Category created', 
    data: { category } 
  });
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Admin
export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  res.status(200).json({ 
    success: true, 
    message: 'Category updated', 
    data: { category } 
  });
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Admin
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  // Check if any products use this category
  const productsCount = await Product.countDocuments({ category: req.params.id });
  if (productsCount > 0) {
    return next(new AppError(`Cannot delete category. ${productsCount} products are using this category`, 400));
  }

  await category.deleteOne();
  res.status(200).json({ success: true, message: 'Category deleted' });
});

// @desc    Toggle category status
// @route   PATCH /api/admin/categories/:id/status
// @access  Admin
export const toggleCategoryStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true }
  );

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  res.status(200).json({ 
    success: true, 
    message: `Category ${isActive ? 'activated' : 'deactivated'}`,
    data: { category } 
  });
});
