import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { FiHeart, FiShoppingCart, FiTrash2, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(getWishlist());
  }, [dispatch, isAuthenticated, navigate]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleMoveToCart = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(removeFromWishlist(product._id));
    toast.success('Moved to cart!');
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Wishlist</h1>
          <p className="text-gray-600">{products?.length || 0} items saved</p>
        </div>
      </div>

      {!products || products.length === 0 ? (
        <div className="text-center py-12">
          <FiHeart className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Start adding products you love!</p>
          <Link
            to="/products"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <Link to={`/products/${product._id}`} className="block relative">
                <img
                  src={product.images?.[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {product.discount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                    -{product.discount}%
                  </span>
                )}
              </Link>

              <div className="p-4">
                <Link to={`/products/${product._id}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-indigo-600 line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-1 mb-2">
                  <FiStar className="text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {product.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({product.totalReviews || 0})
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-indigo-600">
                    ₹{product.finalPrice || product.price}
                  </span>
                  {product.compareAtPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{product.compareAtPrice}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    <FiShoppingCart />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove from wishlist"
                  >
                    <FiTrash2 className="text-red-500" />
                  </button>
                </div>

                {product.stock < 10 && product.stock > 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    Only {product.stock} left in stock!
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
