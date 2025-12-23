import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import APIFeatures from '../utils/apiFeatures.js';
import fs from 'fs';
import csv from 'csv-parser';

// @desc    Create product
// @route   POST /api/products
// @access  Private/Vendor
export const createProduct = asyncHandler(async (req, res, next) => {
  const productData = {
    ...req.body,
    vendor: req.vendor._id,
    isApproved: true, // Auto-approve for demo purposes
    status: 'active' // Make it active immediately
  };

  if (req.files && req.files.length > 0) {
    productData.images = req.files.map(file => `/uploads/products/${file.filename}`);
  }

  // Parse variants if sent as JSON string
  if (typeof req.body.variants === 'string') {
    productData.variants = JSON.parse(req.body.variants);
  }

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Product.find({ status: 'active', isApproved: true })
      .populate('vendor', 'storeName averageRating')
      .populate('category', 'name'),
    req.query
  )
    .filter()
    .textSearch()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;
  const total = await Product.countDocuments({ status: 'active', isApproved: true });

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pagination: features.pagination,
    data: { products }
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('vendor', 'storeName averageRating storeLogo')
    .populate('category', 'name')
    .populate('subcategory', 'name');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Increment views
  product.views += 1;
  await product.save();

  // Add to recently viewed if user is logged in
  if (req.user) {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          recentlyViewed: {
            $each: [product._id],
            $position: 0,
            $slice: 20
          }
        }
      }
    );
  }

  res.status(200).json({
    success: true,
    data: { product }
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Vendor
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check ownership
  if (product.vendor.toString() !== req.vendor._id.toString()) {
    return next(new AppError('Not authorized to update this product', 403));
  }

  // Handle new images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
    req.body.images = [...(product.images || []), ...newImages];
  }

  // Parse variants if sent as JSON string
  if (typeof req.body.variants === 'string') {
    req.body.variants = JSON.parse(req.body.variants);
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Vendor
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check ownership
  if (product.vendor.toString() !== req.vendor._id.toString()) {
    return next(new AppError('Not authorized to delete this product', 403));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Upload products in bulk
// @route   POST /api/products/bulk-upload
// @access  Private/Vendor
export const uploadBulkProducts = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a CSV file', 400));
  }

  const products = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      try {
        products.push({
          name: row.name,
          description: row.description,
          category: row.category,
          basePrice: parseFloat(row.price),
          stock: parseInt(row.stock),
          vendor: req.vendor._id,
          images: row.images ? row.images.split(',') : []
        });
      } catch (error) {
        errors.push({ row, error: error.message });
      }
    })
    .on('end', async () => {
      try {
        const createdProducts = await Product.insertMany(products, { ordered: false });
        
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        res.status(201).json({
          success: true,
          message: `${createdProducts.length} products uploaded successfully`,
          data: {
            created: createdProducts.length,
            errors: errors.length
          }
        });
      } catch (error) {
        return next(new AppError('Error uploading products', 500));
      }
    });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Product.find({ 
      category: req.params.categoryId,
      status: 'active',
      isApproved: true
    })
      .populate('vendor', 'storeName averageRating'),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const products = await features.query;

  res.status(200).json({
    success: true,
    count: products.length,
    data: { products }
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ 
    isFeatured: true,
    status: 'active',
    isApproved: true
  })
    .populate('vendor', 'storeName')
    .limit(20);

  res.status(200).json({
    success: true,
    count: products.length,
    data: { products }
  });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    status: 'active',
    isApproved: true
  })
    .limit(8)
    .select('name basePrice salePrice images averageRating');

  res.status(200).json({
    success: true,
    count: relatedProducts.length,
    data: { products: relatedProducts }
  });
});
