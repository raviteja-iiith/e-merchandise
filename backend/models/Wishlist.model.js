import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index
wishlistSchema.index({ user: 1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
