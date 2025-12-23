import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  material: String,
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  images: [String]
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  // Vendor who owns this product
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  // Category
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  // Pricing
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Stock management
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  // Product variants
  hasVariants: {
    type: Boolean,
    default: false
  },
  variants: [variantSchema],
  // Images
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one image is required'
    }
  },
  thumbnail: String,
  // Attributes
  brand: {
    type: String,
    trim: true
  },
  tags: [String],
  attributes: {
    type: Map,
    of: String
  },
  // Dimensions & Weight (for shipping)
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch'],
      default: 'cm'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lb'],
      default: 'kg'
    }
  },
  // Ratings & Reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  ratingDistribution: {
    5: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    1: { type: Number, default: 0 }
  },
  // Sales metrics
  totalSales: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  // SEO
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  // Additional options
  isReturnable: {
    type: Boolean,
    default: true
  },
  returnDays: {
    type: Number,
    default: 7
  },
  isCancellable: {
    type: Boolean,
    default: true
  },
  // Flash sale
  flashSale: {
    isActive: {
      type: Boolean,
      default: false
    },
    price: Number,
    startTime: Date,
    endTime: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ vendor: 1 });
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ status: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ totalSales: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ basePrice: 1 });

// Generate slug
productSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    
    this.slug = `${baseSlug}-${Date.now()}`;
  }
  
  // Update stock status
  if (this.stock === 0) {
    this.status = 'out_of_stock';
  }
  
  // Set thumbnail
  if (this.images && this.images.length > 0 && !this.thumbnail) {
    this.thumbnail = this.images[0];
  }
  
  next();
});

// Virtual for final price
productSchema.virtual('finalPrice').get(function() {
  if (this.flashSale?.isActive && 
      this.flashSale?.startTime <= new Date() && 
      this.flashSale?.endTime >= new Date()) {
    return this.flashSale.price;
  }
  return this.salePrice || this.basePrice;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.salePrice && this.basePrice) {
    return Math.round(((this.basePrice - this.salePrice) / this.basePrice) * 100);
  }
  return this.discount;
});

const Product = mongoose.model('Product', productSchema);

export default Product;
