import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  name: String,
  image: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  variant: {
    size: String,
    color: String,
    material: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  trackingNumber: String,
  deliveredAt: Date,
  cancelledAt: Date,
  returnedAt: Date
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  // Shipping address
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  // Pricing
  itemsTotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: String,
  totalAmount: {
    type: Number,
    required: true
  },
  // Payment
  paymentMethod: {
    type: String,
    enum: ['card', 'wallet', 'cod', 'upi'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  paidAt: Date,
  // Order status
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  // Timestamps for status changes
  processingAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  // Cancellation/Return
  cancellationReason: String,
  returnReason: String,
  refundAmount: Number,
  refundedAt: Date,
  // Notes
  customerNotes: String,
  adminNotes: String,
  // Invoice
  invoiceUrl: String
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ orderId: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ 'items.vendor': 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order ID before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderId = `ORD-${timestamp}-${random}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
