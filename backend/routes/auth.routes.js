import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  googleAuth,
  googleAuthCallback,
  githubAuth,
  githubAuthCallback
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['customer', 'vendor'])
    .withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerification);
router.post('/forgot-password', 
  body('email').isEmail().withMessage('Please provide a valid email'),
  validate,
  forgotPassword
);
router.post('/reset-password/:token',
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  resetPassword
);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, upload.single('avatar'), updateProfile);
router.put('/update-password',
  protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate,
  updatePassword
);

// OAuth routes - always register them
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);
router.get('/github', githubAuth);
router.get('/github/callback', githubAuthCallback);

export default router;
