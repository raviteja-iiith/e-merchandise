import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiPackage, FiClock, FiTruck, FiCheckCircle, FiXCircle, FiSearch } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data.data.orders || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-500" />;
      case 'processing': return <FiPackage className="text-blue-500" />;
      case 'shipped': return <FiTruck className="text-purple-500" />;
      case 'delivered': return <FiCheckCircle className="text-green-500" />;
      case 'cancelled': return <FiXCircle className="text-red-500" />;
      default: return <FiPackage className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders
    .filter(order => filter === 'all' || order.status === filter)
    .filter(order => 
      searchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 h-40"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders found</h2>
          <p className="text-gray-600 mb-6">
            {searchTerm || filter !== 'all'
              ? 'Try adjusting your filters'
              : "You haven't placed any orders yet"}
          </p>
          {!searchTerm && filter === 'all' && (
            <button
              onClick={() => navigate('/products')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start Shopping
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              onClick={() => navigate(`/orders/${order._id}`)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="flex items-center gap-3 mb-2 md:mb-0">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order #{order.orderNumber || order._id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="text-xl font-bold text-indigo-600">
                    ₹{order.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-4 overflow-x-auto">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                      <img
                        src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.product?.name || 'Product'}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                          {item.product?.name || 'Product'}
                        </p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {order.trackingNumber && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Tracking Number:</span> {order.trackingNumber}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
