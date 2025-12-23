import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [String],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  // Helpful votes
  helpfulVotes: {
    type: Number,
    default: 0
  },
  unhelpfulVotes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['helpful', 'unhelpful']
    }
  }],
  // Vendor response
  vendorResponse: {
    comment: String,
    respondedAt: Date
  },
  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ vendor: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
