import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'order_placed',
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'payment_success',
      'payment_failed',
      'product_review',
      'vendor_approved',
      'vendor_rejected',
      'low_stock',
      'new_message',
      'flash_sale',
      'coupon',
      'general'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  link: String,
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
