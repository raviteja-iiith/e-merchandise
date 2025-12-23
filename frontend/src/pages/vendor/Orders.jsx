import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiClock, FiTruck, FiCheckCircle, FiXCircle, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updateModal, setUpdateModal] = useState({ show: false, orderId: null, currentStatus: '' });

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const fetchVendorOrders = async () => {
    try {
      const { data } = await api.get('/vendors/orders');
      setOrders(data.data.orders || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/vendors/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      setUpdateModal({ show: false, orderId: null, currentStatus: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
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

  const getNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return ['processing', 'cancelled'];
      case 'processing': return ['shipped', 'cancelled'];
      case 'shipped': return ['delivered'];
      default: return [];
    }
  };

  const filteredOrders = orders
    .filter(order => statusFilter === 'all' || order.status === statusFilter)
    .filter(order =>
      searchTerm === '' ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        <div className="bg-white rounded-lg shadow-md p-6 h-96"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
        <p className="text-gray-600 mt-1">{orders.length} total orders</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No orders have been placed yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="font-semibold text-gray-800">
                          #{order.orderNumber || order._id.slice(-8)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-800">{order.customer?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{order.customer?.email || ''}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">{order.items?.length || 0} items</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-indigo-600">₹{order.total?.toFixed(2) || '0.00'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/vendor/orders/${order._id}`)}
                          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          View Details
                        </button>
                        {getNextStatuses(order.status).length > 0 && (
                          <button
                            onClick={() => setUpdateModal({ show: true, orderId: order._id, currentStatus: order.status })}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Update Status
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {updateModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Update Order Status</h3>
            <p className="text-gray-600 mb-4">Select new status for this order:</p>
            <div className="space-y-2 mb-6">
              {getNextStatuses(updateModal.currentStatus).map((status) => (
                <button
                  key={status}
                  onClick={() => updateOrderStatus(updateModal.orderId, status)}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                    status === 'cancelled'
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setUpdateModal({ show: false, orderId: null, currentStatus: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
