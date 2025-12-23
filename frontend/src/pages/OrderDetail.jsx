import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiPackage, FiTruck, FiCheckCircle, FiMapPin, FiCreditCard, FiDownload } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrderDetails();
  }, [orderId, isAuthenticated, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data.data.order);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order details');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: FiPackage },
      { key: 'processing', label: 'Processing', icon: FiPackage },
      { key: 'shipped', label: 'Shipped', icon: FiTruck },
      { key: 'delivered', label: 'Delivered', icon: FiCheckCircle },
    ];
    
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="bg-white rounded-lg shadow-md p-6 h-64"></div>
          <div className="bg-white rounded-lg shadow-md p-6 h-96"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
        <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
        <Link to="/orders" className="text-indigo-600 hover:text-indigo-800">← Back to Orders</Link>
      </div>
    );
  }

  const statusSteps = order.status !== 'cancelled' ? getStatusSteps(order.status) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm mb-6 text-gray-600">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/orders" className="hover:text-indigo-600">Orders</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">#{order.orderNumber || order._id.slice(-8)}</span>
      </nav>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Order #{order.orderNumber || order._id.slice(-8)}
          </h1>
          <p className="text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        
        <span className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Status</h2>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{
                  width: `${(statusSteps.filter(s => s.completed).length - 1) / (statusSteps.length - 1) * 100}%`
                }}
              ></div>
            </div>
            
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
                  } transition-colors duration-500 mb-2`}>
                    <step.icon className="text-xl" />
                  </div>
                  <p className={`text-sm font-medium text-center ${
                    step.completed ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  {step.completed && order.statusHistory?.find(h => h.status === step.key) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.statusHistory.find(h => h.status === step.key).timestamp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {order.trackingNumber && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-800">Tracking Number</p>
                  <p className="text-lg font-mono text-blue-900">{order.trackingNumber}</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Track Package
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item._id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <img
                    src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/products/${item.product?._id}`}
                      className="text-lg font-semibold text-gray-800 hover:text-indigo-600"
                    >
                      {item.product?.name}
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-gray-600 mt-1">Variant: {item.variant.name}</p>
                    )}
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">₹{item.price}</p>
                    <p className="text-sm text-gray-600">Total: ₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiMapPin /> Shipping Address
            </h2>
            <div className="text-gray-700">
              <p className="font-semibold">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
              <p className="mt-2">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-semibold">${order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="font-semibold">${order.shippingCost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span className="font-semibold">${order.tax?.toFixed(2) || '0.00'}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span className="text-indigo-600">${order.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiCreditCard /> Payment Information
            </h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-semibold capitalize">{order.paymentMethod || 'Card'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-semibold ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                </span>
              </div>
              {order.transactionId && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Transaction ID:</p>
                  <p className="text-xs font-mono text-gray-800 break-all">{order.transactionId}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <FiDownload /> Download Invoice
            </button>
            {order.status === 'delivered' && (
              <button className="w-full border border-indigo-600 text-indigo-600 px-4 py-3 rounded-lg hover:bg-indigo-50 transition-colors">
                Leave a Review
              </button>
            )}
            {['pending', 'processing'].includes(order.status) && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this order?')) {
                    toast.info('Cancel order feature coming soon');
                  }
                }}
                className="w-full border border-red-600 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
