import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist } from '../store/slices/wishlistSlice';
import { FiHeart, FiShoppingCart, FiStar, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct: product, loading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.images?.[0]) {
      setSelectedImage(0);
    }
    if (product?.variants?.[0]) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity, variant: selectedVariant?._id }));
    toast.success('Added to cart!');
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }
    dispatch(addToWishlist(product._id));
    toast.success('Added to wishlist!');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-300 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-12 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
        <Link to="/products" className="text-indigo-600 hover:text-indigo-800">← Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <nav className="text-xs md:text-sm mb-4 md:mb-6 text-gray-600">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-indigo-600">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
        <div>
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-3 md:mb-4">
            <img src={product.images?.[selectedImage] || '/placeholder-product.jpg'} alt={product.name} className="w-full h-64 md:h-96 object-contain rounded-lg"/>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
            {product.images?.map((img, idx) => (
              <img key={idx} src={img} alt={`${product.name} ${idx + 1}`} onClick={() => setSelectedImage(idx)} className={`h-16 md:h-20 object-cover rounded-lg cursor-pointer border-2 ${selectedImage === idx ? 'border-indigo-600' : 'border-gray-200'} hover:border-indigo-400 transition-all`}/>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">{product.name}</h1>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (<FiStar key={i} className={`${i < Math.floor(product.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}/>))}
              <span className="ml-2 font-medium text-sm md:text-base">{product.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
            <span className="text-gray-500 text-sm md:text-base">({product.totalReviews || 0} reviews)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <span className="text-3xl md:text-4xl font-bold text-indigo-600">₹{product.finalPrice || product.price}</span>
            {product.compareAtPrice > product.price && (<span className="text-lg md:text-xl text-gray-500 line-through">₹{product.compareAtPrice}</span>)}
            {product.discount > 0 && (<span className="bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">-{product.discount}%</span>)}
          </div>

          <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6 leading-relaxed">{product.shortDescription}</p>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Variant</label>
              <div className="flex gap-2">
                {product.variants.map((variant) => (
                  <button key={variant._id} onClick={() => setSelectedVariant(variant)} className={`px-4 py-2 border rounded-lg ${selectedVariant?._id === variant._id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-300 hover:border-indigo-400'}`}>{variant.name}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 md:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base">-</button>
              <input type="number" min="1" max={product.stock} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))} className="w-16 md:w-20 text-center px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-sm md:text-base"/>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base">+</button>
              <span className="text-xs md:text-sm text-gray-600">({product.stock} available)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 bg-indigo-600 text-white px-4 md:px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-base md:text-lg font-semibold"><FiShoppingCart /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</button>
            <button onClick={handleAddToWishlist} className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><FiHeart className="text-red-500 text-2xl"/></button>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <FiTruck className="text-indigo-600 text-xl"/>
              <span>Free shipping on orders over ₹500</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <FiShield className="text-indigo-600 text-xl"/>
              <span>Secure payment & buyer protection</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <FiRefreshCw className="text-indigo-600 text-xl"/>
              <span>30-day return policy</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Sold by</h3>
            <Link to={`/vendors/${product.vendor?._id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">{product.vendor?.businessName || 'Vendor'}</Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-12">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            <button onClick={() => setActiveTab('description')} className={`pb-4 font-semibold ${activeTab === 'description' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}>Description</button>
            <button onClick={() => setActiveTab('specifications')} className={`pb-4 font-semibold ${activeTab === 'specifications' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}>Specifications</button>
            <button onClick={() => setActiveTab('reviews')} className={`pb-4 font-semibold ${activeTab === 'reviews' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}>Reviews ({product.totalReviews || 0})</button>
          </nav>
        </div>

        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="grid md:grid-cols-2 gap-4">
            {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex border-b border-gray-200 py-2">
                <span className="font-medium text-gray-700 w-1/2">{key}</span>
                <span className="text-gray-600 w-1/2">{value}</span>
              </div>
            ))}
            {(!product.specifications || Object.keys(product.specifications).length === 0) && (<p className="text-gray-600">No specifications available</p>)}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Write a Review */}
            {isAuthenticated && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const rating = formData.get('rating');
                  const comment = formData.get('comment');
                  
                  try {
                    await api.post(`/reviews`, {
                      product: id,
                      rating: Number(rating),
                      comment
                    });
                    toast.success('Review submitted successfully');
                    e.target.reset();
                    // Reload product to show new review
                    window.location.reload();
                  } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to submit review');
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <select name="rating" required className="w-full border border-gray-300 rounded-lg px-4 py-2">
                      <option value="">Select rating</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                    <textarea name="comment" required rows="4" className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Share your experience with this product..."></textarea>
                  </div>
                  <button type="submit" className="btn-primary">Submit Review</button>
                </form>
              </div>
            )}
            
            {/* Display Reviews */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
        <p className="text-gray-600">Related products feature coming soon</p>
      </div>
    </div>
  );
};

export default ProductDetail;
