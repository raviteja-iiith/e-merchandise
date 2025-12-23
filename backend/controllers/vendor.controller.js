import Vendor from '../models/Vendor.model.js';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import Review from '../models/Review.model.js';
import User from '../models/User.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import { emitToUser } from '../config/socket.js';
import Notification from '../models/Notification.model.js';

// @desc    Register as vendor
// @route   POST /api/vendors/register
// @access  Private
export const registerVendor = asyncHandler(async (req, res, next) => {
  // Check if already a vendor
  const existingVendor = await Vendor.findOne({ user: req.user._id });
  if (existingVendor) {
    return next(new AppError('You are already registered as a vendor', 400));
  }

  const vendorData = {
    user: req.user._id,
    ...req.body
  };

  if (req.files) {
    if (req.files.storeLogo) {
      vendorData.storeLogo = `/uploads/vendors/${req.files.storeLogo[0].filename}`;
    }
    if (req.files.storeBanner) {
      vendorData.storeBanner = `/uploads/vendors/${req.files.storeBanner[0].filename}`;
    }
  }

  const vendor = await Vendor.create(vendorData);

  // Update user role to vendor
  await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });

  res.status(201).json({
    success: true,
    message: 'Vendor registration submitted for approval',
    data: { vendor }
  });
});

// @desc    Get vendor profile
// @route   GET /api/vendors/profile
// @access  Private/Vendor
export const getVendorProfile = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findOne({ user: req.user._id })
    .populate('user', 'name email')
    .populate('categories', 'name');

  if (!vendor) {
    return next(new AppError('Vendor profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { vendor }
  });
});

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
// @access  Private/Vendor
export const updateVendorProfile = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findOne({ user: req.user._id });

  if (!vendor) {
    return next(new AppError('Vendor profile not found', 404));
  }

  const allowedFields = [
    'storeDescription',
    'businessPhone',
    'businessEmail',
    'shippingPolicy',
    'returnPolicy',
    'socialMedia',
    'bankDetails'
  ];

  allowedFields.forEach(field => {
    if (req.body[field]) {
      vendor[field] = req.body[field];
    }
  });

  if (req.files) {
    if (req.files.storeLogo) {
      vendor.storeLogo = `/uploads/vendors/${req.files.storeLogo[0].filename}`;
    }
    if (req.files.storeBanner) {
      vendor.storeBanner = `/uploads/vendors/${req.files.storeBanner[0].filename}`;
    }
  }

  await vendor.save();

  res.status(200).json({
    success: true,
    message: 'Vendor profile updated successfully',
    data: { vendor }
  });
});

// @desc    Get vendor analytics
// @route   GET /api/vendors/analytics
// @access  Private/Vendor
export const getVendorAnalytics = asyncHandler(async (req, res) => {
  const vendor = req.vendor;

  // Get total products
  const totalProducts = await Product.countDocuments({ vendor: vendor._id });

  // Get active products
  const activeProducts = await Product.countDocuments({ 
    vendor: vendor._id, 
    status: 'active' 
  });

  // Get orders
  const orders = await Order.find({ 'items.vendor': vendor._id });
  const totalOrders = orders.length;

  // Calculate revenue
  let totalRevenue = 0;
  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.vendor.toString() === vendor._id.toString()) {
        totalRevenue += item.price * item.quantity;
      }
    });
  });

  // Calculate commission
  const platformCommission = totalRevenue * (vendor.commission / 100);
  const netRevenue = totalRevenue - platformCommission;

  // Get reviews
  const totalReviews = await Review.countDocuments({ vendor: vendor._id });

  // Monthly sales data (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        'items.vendor': vendor._id,
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    { $unwind: '$items' },
    {
      $match: {
        'items.vendor': vendor._id
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalSales: { 
          $sum: { $multiply: ['$items.price', '$items.quantity'] }
        },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Get order status breakdown
  const orderStatusBreakdown = await Order.aggregate([
    {
      $match: {
        'items.vendor': vendor._id
      }
    },
    { $unwind: '$items' },
    {
      $match: {
        'items.vendor': vendor._id
      }
    },
    {
      $group: {
        _id: '$items.status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Transform order status data
  const ordersByStatus = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };

  orderStatusBreakdown.forEach(item => {
    if (ordersByStatus.hasOwnProperty(item._id)) {
      ordersByStatus[item._id] = item.count;
    }
  });

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue,
        platformCommission,
        netRevenue,
        totalReviews,
        averageRating: vendor.averageRating
      },
      monthlySales,
      ordersByStatus
    }
  });
});

// @desc    Get vendor orders
// @route   GET /api/vendors/orders
// @access  Private/Vendor
export const getVendorOrders = asyncHandler(async (req, res) => {
  const vendor = req.vendor;

  const orders = await Order.find({ 'items.vendor': vendor._id })
    .populate('user', 'name email')
    .sort('-createdAt');

  // Filter items to show only this vendor's items
  const filteredOrders = orders.map(order => {
    const vendorItems = order.items.filter(
      item => item.vendor.toString() === vendor._id.toString()
    );

    return {
      ...order.toObject(),
      items: vendorItems
    };
  });

  res.status(200).json({
    success: true,
    count: filteredOrders.length,
    data: { orders: filteredOrders }
  });
});

// @desc    Update order item status
// @route   PUT /api/vendors/orders/:orderId/items/:itemId/status
// @access  Private/Vendor
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderId, itemId } = req.params;
  const { status, trackingNumber } = req.body;

  const order = await Order.findOne({ orderId });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const item = order.items.id(itemId);

  if (!item) {
    return next(new AppError('Order item not found', 404));
  }

  // Verify this item belongs to this vendor
  if (item.vendor.toString() !== req.vendor._id.toString()) {
    return next(new AppError('Not authorized to update this item', 403));
  }

  item.status = status;
  if (trackingNumber) item.trackingNumber = trackingNumber;

  if (status === 'shipped') {
    item.shippedAt = new Date();
  } else if (status === 'delivered') {
    item.deliveredAt = new Date();
  } else if (status === 'cancelled') {
    item.cancelledAt = new Date();
  }

  // Update overall order status if all items have same status
  const allItemsStatus = order.items.every(i => i.status === status);
  if (allItemsStatus) {
    order.orderStatus = status;
    if (status === 'shipped') order.shippedAt = new Date();
    if (status === 'delivered') order.deliveredAt = new Date();
  }

  await order.save();

  // Send notification to user
  const notification = await Notification.create({
    recipient: order.user,
    type: `order_${status}`,
    title: `Order ${status}`,
    message: `Your order item has been ${status}`,
    link: `/orders/${order.orderId}`,
    data: { orderId: order.orderId, itemId: item._id }
  });

  emitToUser(order.user, 'notification', notification);

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
});

// @desc    Get vendor products
// @route   GET /api/vendors/products
// @access  Private/Vendor
export const getVendorProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ vendor: req.vendor._id })
    .populate('category', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: products.length,
    data: { products }
  });
});

// @desc    Get vendor reviews
// @route   GET /api/vendors/reviews
// @access  Private/Vendor
export const getVendorReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ vendor: req.vendor._id })
    .populate('user', 'name avatar')
    .populate('product', 'name thumbnail')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: { reviews }
  });
});
