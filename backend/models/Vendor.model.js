import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  storeName: {
    type: String,
    required: [true, 'Please provide a store name'],
    trim: true,
    unique: true
  },
  storeDescription: {
    type: String,
    required: [true, 'Please provide a store description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  storeLogo: {
    type: String,
    default: ''
  },
  storeBanner: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    unique: true
  },
  // Business Information
  businessName: {
    type: String,
    required: true
  },
  businessEmail: {
    type: String,
    required: true
  },
  businessPhone: {
    type: String,
    required: true
  },
  businessAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  taxId: {
    type: String,
    required: true
  },
  // Bank Details for payments
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    swiftCode: String
  },
  // Approval status
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalDate: Date,
  rejectionReason: String,
  // Ratings
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Revenue tracking
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 10 // percentage
  },
  // Store settings
  isActive: {
    type: Boolean,
    default: true
  },
  shippingPolicy: String,
  returnPolicy: String,
  // Social media
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    website: String
  },
  // Categories the vendor deals in
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  // Featured/Premium status
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
vendorSchema.index({ user: 1 });
vendorSchema.index({ storeName: 1 });
vendorSchema.index({ slug: 1 });
vendorSchema.index({ approvalStatus: 1 });
vendorSchema.index({ averageRating: -1 });

// Generate slug before saving
vendorSchema.pre('save', async function(next) {
  if (this.isModified('storeName')) {
    this.slug = this.storeName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  next();
});

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
