import Vendor from '../models/Vendor.model.js';
import { AppError } from './errorHandler.js';

export const checkVendorStatus = async (req, res, next) => {
  try {
    let vendor = await Vendor.findOne({ user: req.user._id });

    // Auto-create vendor profile if it doesn't exist
    if (!vendor) {
      vendor = await Vendor.create({
        user: req.user._id,
        storeName: `${req.user.name}'s Store`,
        storeDescription: 'Welcome to my store! We offer quality products at competitive prices.',
        businessName: `${req.user.name}'s Business`,
        businessEmail: req.user.email,
        businessPhone: req.user.phone || '+1234567890',
        taxId: 'TAX-' + Date.now(), // Auto-generate a temporary tax ID
        approvalStatus: 'approved', // Auto-approve for demo purposes
        isActive: true,
      });
    }

    if (vendor.approvalStatus !== 'approved') {
      return next(new AppError('Your vendor account is not approved yet', 403));
    }

    if (!vendor.isActive) {
      return next(new AppError('Your vendor account is inactive', 403));
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    next(error);
  }
};
