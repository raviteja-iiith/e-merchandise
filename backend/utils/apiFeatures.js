class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'minPrice', 'maxPrice', 'rating'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    // Handle price range
    if (this.queryString.minPrice || this.queryString.maxPrice) {
      const priceFilter = {};
      if (this.queryString.minPrice) {
        priceFilter.$gte = parseFloat(this.queryString.minPrice);
      }
      if (this.queryString.maxPrice) {
        priceFilter.$lte = parseFloat(this.queryString.maxPrice);
      }
      // Apply to both basePrice and salePrice
      this.query = this.query.find({
        $or: [
          { basePrice: priceFilter },
          { salePrice: priceFilter }
        ]
      });
    }

    // Handle minimum rating
    if (this.queryString.rating) {
      this.query = this.query.find({
        averageRating: { $gte: parseFloat(this.queryString.rating) }
      });
    }

    return this;
  }

  search(fields = []) {
    if (this.queryString.search && fields.length > 0) {
      const searchQuery = {
        $or: fields.map(field => ({
          [field]: { $regex: this.queryString.search, $options: 'i' }
        }))
      };
      this.query = this.query.find(searchQuery);
    }
    return this;
  }

  textSearch() {
    if (this.queryString.search) {
      // Use regex search instead of text index to search name and description
      this.query = this.query.find({
        $or: [
          { name: { $regex: this.queryString.search, $options: 'i' } },
          { description: { $regex: this.queryString.search, $options: 'i' } },
          { brand: { $regex: this.queryString.search, $options: 'i' } },
          { tags: { $regex: this.queryString.search, $options: 'i' } }
        ]
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort;
      
      // Handle price sorting (use salePrice if available, otherwise basePrice)
      if (sortBy === 'price' || sortBy === '-price') {
        // For price sorting, we'll sort by salePrice first, then basePrice
        const sortOrder = sortBy === 'price' ? 1 : -1;
        this.query = this.query.sort({ salePrice: sortOrder, basePrice: sortOrder });
      } else {
        sortBy = sortBy.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      }
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    
    this.pagination = {
      page,
      limit,
      skip
    };

    return this;
  }
}

export default APIFeatures;
