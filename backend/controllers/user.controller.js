import User from '../models/User.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import APIFeatures from '../utils/apiFeatures.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .search(['name', 'email'])
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  const total = await User.countDocuments();

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    data: { users }
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const { role, isActive, isBlocked } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (role) user.role = role;
  if (typeof isActive !== 'undefined') user.isActive = isActive;
  if (typeof isBlocked !== 'undefined') user.isBlocked = isBlocked;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // If this is the first address, make it default
  const isFirst = user.addresses.length === 0;

  user.addresses.push({
    ...req.body,
    isDefault: isFirst || req.body.isDefault
  });

  // If new address is default, unset others
  if (req.body.isDefault) {
    user.addresses.forEach((addr, index) => {
      if (index !== user.addresses.length - 1) {
        addr.isDefault = false;
      }
    });
  }

  await user.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: { addresses: user.addresses }
  });
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
export const updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  Object.assign(address, req.body);

  if (req.body.isDefault) {
    user.addresses.forEach(addr => {
      if (addr._id.toString() !== req.params.addressId) {
        addr.isDefault = false;
      }
    });
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: { addresses: user.addresses }
  });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
export const deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const addressIndex = user.addresses.findIndex(
    addr => addr._id.toString() === req.params.addressId
  );

  if (addressIndex === -1) {
    return next(new AppError('Address not found', 404));
  }

  user.addresses.splice(addressIndex, 1);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    data: { addresses: user.addresses }
  });
});

// @desc    Set default address
// @route   PUT /api/users/addresses/:addressId/default
// @access  Private
export const setDefaultAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  user.addresses.forEach(addr => {
    addr.isDefault = addr._id.toString() === req.params.addressId;
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Default address updated',
    data: { addresses: user.addresses }
  });
});
