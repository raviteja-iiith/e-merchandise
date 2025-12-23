import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', protect, authorize('admin'), upload.single('categoryImage'), createCategory);
router.put('/:id', protect, authorize('admin'), upload.single('categoryImage'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
