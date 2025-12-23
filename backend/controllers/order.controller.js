import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import Vendor from '../models/Vendor.model.js';
import Notification from '../models/Notification.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import { emitToUser, emitToVendor } from '../config/socket.js';

export const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod, items } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError('No items in order', 400));
  }

  let orderItems = [];
  let itemsTotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (product.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${product.name}`, 400));
    }

    const price = product.salePrice || product.basePrice;
    orderItems.push({
      product: product._id,
      vendor: product.vendor,
      name: product.name,
      image: product.images[0],
      quantity: item.quantity,
      price,
      variant: item.variant
    });

    itemsTotal += price * item.quantity;

    // Deduct stock
    product.stock -= item.quantity;
    product.totalSales += item.quantity;
    if (product.stock === 0) product.status = 'out_of_stock';
    await product.save();
  }

  const shippingCost = 50; // Fixed for now
  const tax = itemsTotal * 0.1; // 10% tax
  const totalAmount = itemsTotal + shippingCost + tax;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    itemsTotal,
    shippingCost,
    tax,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    orderStatus: 'pending'
  });

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: undefined });

  // Send notifications to vendors
  const vendorIds = [...new Set(orderItems.map(item => item.vendor.toString()))];
  for (const vendorId of vendorIds) {
    const vendor = await Vendor.findById(vendorId).populate('user');
    if (vendor) {
      const notification = await Notification.create({
        recipient: vendor.user._id,
        type: 'order_placed',
        title: 'New Order Received',
        message: `You have a new order: ${order.orderId}`,
        link: `/vendor/orders/${order.orderId}`,
        data: { orderId: order.orderId }
      });
      emitToUser(vendor.user._id, 'notification', notification);
    }
  }

  // Send order confirmation email
  await sendEmail({
    to: req.user.email,
    subject: 'Order Confirmation',
    html: emailTemplates.orderConfirmation(
      req.user.name,
      order.orderId,
      totalAmount,
      orderItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price }))
    )
  });

  res.status(201).json({ success: true, message: 'Order placed successfully', data: { order } });
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'name images')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: orders.length, data: { orders } });
});

export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ orderId: req.params.orderId })
    .populate('items.product', 'name images')
    .populate('items.vendor', 'storeName');

  if (!order) return next(new AppError('Order not found', 404));

  // Check if user owns this order
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  res.status(200).json({ success: true, data: { order } });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ orderId: req.params.orderId });

  if (!order) return next(new AppError('Order not found', 404));
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  if (['shipped', 'delivered'].includes(order.orderStatus)) {
    return next(new AppError('Cannot cancel order in current status', 400));
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = req.body.reason;

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, totalSales: -item.quantity }
    });
  }

  await order.save();

  res.status(200).json({ success: true, message: 'Order cancelled', data: { order } });
});

export const requestReturn = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ orderId: req.params.orderId });

  if (!order) return next(new AppError('Order not found', 404));
  if (order.orderStatus !== 'delivered') {
    return next(new AppError('Only delivered orders can be returned', 400));
  }

  order.orderStatus = 'returned';
  order.returnReason = req.body.reason;
  await order.save();

  res.status(200).json({ success: true, message: 'Return request submitted', data: { order } });
});
