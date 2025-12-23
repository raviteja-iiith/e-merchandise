import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../store/slices/cartSlice';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const { items, totals } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (!items || items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleShippingChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const validateShipping = () => {
    const required = ['fullName', 'addressLine1', 'city', 'state', 'zipCode', 'country', 'phone'];
    for (let field of required) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Payment system is not ready');
      return;
    }

    setProcessing(true);

    try {
      const { data } = await api.post('/orders', {
        items: items.map(item => ({
          product: item.product._id,
          variant: item.variant?._id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod: 'card',
      });

      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingAddress.fullName,
            address: {
              line1: shippingAddress.addressLine1,
              line2: shippingAddress.addressLine2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.zipCode,
              country: shippingAddress.country,
            },
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        toast.success('Order placed successfully!');
        navigate(`/orders/${data.order._id}`);
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#9e2146' },
    },
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Checkout</h1>

        <div className="flex flex-col sm:flex-row mb-6 md:mb-8 gap-3 sm:gap-0">
          <div className={`flex-1 flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>1</div>
            <span className="ml-2 text-sm md:text-base font-semibold">Shipping</span>
          </div>
          <div className={`flex-1 flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>2</div>
            <span className="ml-2 text-sm md:text-base font-semibold">Payment</span>
          </div>
          <div className={`flex-1 flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>3</div>
            <span className="ml-2 text-sm md:text-base font-semibold">Review</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleShippingChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input type="text" name="addressLine1" value={shippingAddress.addressLine1} onChange={handleShippingChange} placeholder="Street address, P.O. box" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input type="text" name="addressLine2" value={shippingAddress.addressLine2} onChange={handleShippingChange} placeholder="Apartment, suite, unit, etc. (optional)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"/>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input type="text" name="city" value={shippingAddress.city} onChange={handleShippingChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State/Province *</label>
                      <input type="text" name="state" value={shippingAddress.state} onChange={handleShippingChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required/>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP/Postal Code *</label>
                      <input type="text" name="zipCode" value={shippingAddress.zipCode} onChange={handleShippingChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <input type="text" name="country" value={shippingAddress.country} onChange={handleShippingChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleShippingChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required/>
                  </div>

                  <button type="button" onClick={() => { if (validateShipping()) setStep(2); }} className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold">Continue to Payment</button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><FiLock/> Payment Information</h2>
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
                    <div className="p-4 border border-gray-300 rounded-lg">
                      <CardElement options={cardElementOptions}/>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Your payment information is secure and encrypted</p>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold">Back</button>
                    <button type="submit" disabled={!stripe || processing} className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">{processing ? 'Processing...' : 'Place Order'}</button>
                  </div>
                </form>

                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-600">
                  <FiLock/><span>Secure SSL encryption</span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items?.map((item) => (
                  <div key={item._id} className="flex gap-3 pb-3 border-b border-gray-200">
                    <img src={item.product.images?.[0] || '/placeholder-product.jpg'} alt={item.product.name} className="w-16 h-16 object-cover rounded"/>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-indigo-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{totals?.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold">₹{totals?.shipping?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span className="font-semibold">₹{totals?.tax?.toFixed(2) || '0.00'}</span>
                </div>
                {totals?.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{totals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-indigo-600">₹{totals?.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><FiCheckCircle className="text-green-600"/> Secure checkout</p>
                <p className="flex items-center gap-2"><FiCheckCircle className="text-green-600"/> 30-day return policy</p>
                <p className="flex items-center gap-2"><FiCheckCircle className="text-green-600"/> Free shipping over ₹500</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
