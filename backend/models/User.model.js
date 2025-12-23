import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  // OAuth fields
  googleId: String,
  githubId: String,
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  // Address book
  addresses: [{
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  // Phone number
  phone: {
    type: String,
    trim: true
  },
  // Loyalty points
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  // Referral code
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Recently viewed products
  recentlyViewed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // Last login
  lastLogin: Date,
  refreshToken: String
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate unique referral code
userSchema.methods.generateReferralCode = function() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.referralCode = code;
  return code;
};

const User = mongoose.model('User', userSchema);

export default User;
