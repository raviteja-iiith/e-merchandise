import Category from '../models/Category.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true, parent: null })
    .populate('subcategories')
    .sort('order');

  res.status(200).json({ success: true, count: categories.length, data: { categories } });
});

export const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate('subcategories');

  if (!category) return next(new AppError('Category not found', 404));

  res.status(200).json({ success: true, data: { category } });
});

export const createCategory = asyncHandler(async (req, res) => {
  const categoryData = { ...req.body };
  
  if (req.file) {
    categoryData.image = `/uploads/categories/${req.file.filename}`;
  }

  if (categoryData.parent) {
    const parentCat = await Category.findById(categoryData.parent);
    categoryData.level = parentCat.level + 1;
  }

  const category = await Category.create(categoryData);

  res.status(201).json({ success: true, message: 'Category created', data: { category } });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) return next(new AppError('Category not found', 404));

  if (req.file) {
    req.body.image = `/uploads/categories/${req.file.filename}`;
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });

  res.status(200).json({ success: true, message: 'Category updated', data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) return next(new AppError('Category not found', 404));

  await category.deleteOne();

  res.status(200).json({ success: true, message: 'Category deleted' });
});
