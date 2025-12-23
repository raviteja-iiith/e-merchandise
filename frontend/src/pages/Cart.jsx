import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, removeFromCart, updateCartItemQuantity, clearCart } from '../store/slices/cartSlice';
import { FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error, totals } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated, navigate]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateCartItemQuantity({ itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
      toast.success('Cart cleared');
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    toast.info('Coupon feature coming soon');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex gap-4">
                <div className="bg-gray-300 h-24 w-24 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <Link to="/products" className="text-indigo-600 hover:text-indigo-800">Continue Shopping</Link>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <FiShoppingBag className="text-6xl text-gray-400 mx-auto mb-4"/>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">Start Shopping <FiArrowRight/></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Shopping Cart</h1>
        <button onClick={handleClearCart} className="text-red-600 hover:text-red-800 flex items-center gap-2 text-sm md:text-base"><FiTrash2/> Clear Cart</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md p-3 md:p-4 flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link to={`/products/${item.product._id}`} className="flex-shrink-0 mx-auto sm:mx-0">
                <img src={item.product.images?.[0] || '/placeholder-product.jpg'} alt={item.product.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"/>
              </Link>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/products/${item.product._id}`}>
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 hover:text-indigo-600 mb-1">{item.product.name}</h3>
                  </Link>
                  {item.variant && (<p className="text-xs md:text-sm text-gray-600 mb-2">Variant: {item.variant.name}</p>)}
                  <p className="text-base md:text-lg font-bold text-indigo-600">₹{item.price}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3 md:mt-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)} className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm md:text-base">-</button>
                    <input type="number" min="1" max={item.product.stock} value={item.quantity} onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)} className="w-14 md:w-16 text-center px-2 py-1 border border-gray-300 rounded text-sm md:text-base"/>
                    <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)} className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm md:text-base">+</button>
                  </div>

                  <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-base md:text-lg font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => handleRemoveItem(item._id)} className="text-red-600 hover:text-red-800"><FiTrash2 className="text-lg md:text-xl"/></button>
                  </div>
                </div>

                {item.product.stock < 10 && item.product.stock > 0 && (<p className="text-sm text-orange-600 mt-2">Only {item.product.stock} left in stock</p>)}
                {item.product.stock === 0 && (<p className="text-sm text-red-600 mt-2 font-semibold">Out of stock</p>)}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold">₹{totals?.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="font-semibold">₹{totals?.shipping?.toFixed(2) || '0.00'}</span>
              </div>
              {totals?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">-₹{totals.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span className="font-semibold">₹{totals?.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span className="text-indigo-600">₹{totals?.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Have a coupon?</label>
              <div className="flex gap-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter code" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"/>
                <button onClick={handleApplyCoupon} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Apply</button>
              </div>
            </div>

            <button onClick={() => navigate('/checkout')} className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-lg font-semibold mb-3"><span>Proceed to Checkout</span><FiArrowRight/></button>

            <Link to="/products" className="block text-center text-indigo-600 hover:text-indigo-800">← Continue Shopping</Link>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
              <p>✓ Secure checkout</p>
              <p>✓ Free shipping on orders over ₹500</p>
              <p>✓ 30-day return policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
