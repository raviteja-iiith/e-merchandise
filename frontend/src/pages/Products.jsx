import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist } from '../store/slices/wishlistSlice';
import { FiHeart, FiShoppingCart, FiStar, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, pagination } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || '',
    page: searchParams.get('page') || 1,
  });

  // Update filters when URL changes
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      rating: searchParams.get('rating') || '',
      search: searchParams.get('search') || '',
      sort: searchParams.get('sort') || '',
      page: searchParams.get('page') || 1,
    });
  }, [searchParams]);

  useEffect(() => {
    // Filter out empty values before sending to API
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    dispatch(fetchProducts(cleanFilters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    toast.success('Added to cart!');
  };

  const handleAddToWishlist = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    dispatch(addToWishlist(product._id));
    toast.success('Added to wishlist!');
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      search: '',
      sort: '',
      page: 1,
    });
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">{pagination?.total || 0} products found</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm md:text-base"><FiFilter /> Filters</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-800">Clear All</button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input type="text" placeholder="Search products..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"/>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
                <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
              <select value={filters.rating} onChange={(e) => handleFilterChange('rating', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">All Ratings</option>
                <option value="4">4★ & above</option>
                <option value="3">3★ & above</option>
                <option value="2">2★ & above</option>
                <option value="1">1★ & above</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="-createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-averageRating">Highest Rated</option>
                <option value="-totalReviews">Most Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (<div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse"><div className="bg-gray-300 h-48 rounded-lg mb-4"></div><div className="h-4 bg-gray-300 rounded mb-2"></div><div className="h-4 bg-gray-300 rounded w-2/3"></div></div>))}
            </div>
          ) : error ? (
            <div className="text-center py-12"><p className="text-red-600 text-lg">{error}</p></div>
          ) : products?.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-600 text-lg">No products found</p><button onClick={clearFilters} className="mt-4 text-indigo-600 hover:text-indigo-800">Clear filters</button></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <Link to={`/products/${product._id}`} className="block relative">
                      <img src={product.images?.[0] || '/placeholder-product.jpg'} alt={product.name} className="w-full h-48 object-cover"/>
                      {product.discount > 0 && (<span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">-{product.discount}%</span>)}
                    </Link>

                    <div className="p-4">
                      <Link to={`/products/${product._id}`}><h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-indigo-600 line-clamp-2">{product.name}</h3></Link>

                      <div className="flex items-center gap-1 mb-2">
                        <FiStar className="text-yellow-400 fill-current"/>
                        <span className="text-sm font-medium">{product.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-sm text-gray-500">({product.totalReviews || 0})</span>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-bold text-indigo-600">₹{product.finalPrice || product.price}</span>
                        {product.compareAtPrice > product.price && (<span className="text-sm text-gray-500 line-through">₹{product.compareAtPrice}</span>)}
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleAddToCart(product)} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"><FiShoppingCart /> Add to Cart</button>
                        <button onClick={() => handleAddToWishlist(product)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><FiHeart className="text-red-500"/></button>
                      </div>

                      {product.stock < 10 && product.stock > 0 && (<p className="text-sm text-orange-600 mt-2">Only {product.stock} left in stock!</p>)}
                      {product.stock === 0 && (<p className="text-sm text-red-600 mt-2 font-semibold">Out of Stock</p>)}
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))} disabled={filters.page <= 1} className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Previous</button>
                  {[...Array(pagination.pages)].map((_, i) => (<button key={i + 1} onClick={() => handleFilterChange('page', i + 1)} className={`px-4 py-2 rounded-lg ${filters.page == i + 1 ? 'bg-indigo-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{i + 1}</button>))}
                  <button onClick={() => handleFilterChange('page', Math.min(pagination.pages, parseInt(filters.page) + 1))} disabled={filters.page >= pagination.pages} className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
