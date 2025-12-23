import Product from '../models/Product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import APIFeatures from '../utils/apiFeatures.js';

export const searchProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    rating,
    brand,
    tags,
    sort = '-createdAt',
    page = 1,
    limit = 20
  } = req.query;

  let query = { status: 'active', isApproved: true };

  if (search) {
    query.$text = { $search: search };
  }

  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (tags) query.tags = { $in: tags.split(',') };

  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
    if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
  }

  if (rating) {
    query.averageRating = { $gte: parseFloat(rating) };
  }

  const features = new APIFeatures(
    Product.find(query)
      .populate('vendor', 'storeName averageRating')
      .populate('category', 'name'),
    req.query
  )
    .sort()
    .paginate();

  const products = await features.query;
  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pagination: features.pagination,
    data: { products }
  });
});

export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.status(200).json({ success: true, data: { suggestions: [] } });
  }

  const products = await Product.find({
    name: { $regex: q, $options: 'i' },
    status: 'active',
    isApproved: true
  })
    .select('name')
    .limit(10);

  const suggestions = products.map(p => p.name);

  res.status(200).json({ success: true, data: { suggestions } });
});
