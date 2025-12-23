import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin only routes
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

// Address management
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.put('/addresses/:addressId/default', protect, setDefaultAddress);

export default router;
