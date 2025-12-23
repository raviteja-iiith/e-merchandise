import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiPrinter, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const VendorOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/vendors/orders/${orderId}`);
      setOrder(data.data.order);
      setTrackingNumber(data.data.order.trackingNumber || '');
    } catch (error) {
      toast.error('Failed to load order details');
      navigate('/vendor/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await api.patch(`/vendors/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      setShowStatusModal(false);
      fetchOrderDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleUpdateTracking = async () => {
    try {
      await api.patch(`/vendors/orders/${orderId}/tracking`, { trackingNumber });
      toast.success('Tracking number updated');
      fetchOrderDetail();
    } catch (error) {
      toast.error('Failed to update tracking number');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock />,
      processing: <FiPackage />,
      shipped: <FiTruck />,
      delivered: <FiCheckCircle />,
    };
    return icons[status] || <FiClock />;
  };

  const getNextStatuses = (currentStatus) => {
    const workflow = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };
    return workflow[currentStatus] || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  const statusOptions = getNextStatuses(order.orderStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order #{order.orderId}</h1>
          <p className="text-gray-600 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FiPrinter /> Print
          </button>
          {statusOptions.length > 0 && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Update Status
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${getStatusColor(order.orderStatus)}`}>
        {getStatusIcon(order.orderStatus)}
        <span className="capitalize">{order.orderStatus}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                  <img
                    src={item.image || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                    </p>
                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        {item.variant.size && `Size: ${item.variant.size}`}
                        {item.variant.color && `, Color: ${item.variant.color}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Number */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleUpdateTracking}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Update
                  </button>
                </div>
              </div>
              
              {order.shippingAddress && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <FiMapPin /> Delivery Address
                  </h3>
                  <p className="text-gray-600 ml-6">
                    {order.shippingAddress.name}<br />
                    {order.shippingAddress.addressLine1}<br />
                    {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <FiMail className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{order.user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FiPhone className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{order.shippingAddress?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.itemsTotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${order.shippingCost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${order.tax?.toFixed(2) || '0.00'}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium capitalize ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid At</span>
                  <span className="font-medium">{new Date(order.paidAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Update Order Status</h3>
            <p className="text-gray-600 mb-4">
              Current status: <span className="font-semibold capitalize">{order.orderStatus}</span>
            </p>
            <div className="space-y-2 mb-6">
              {statusOptions.map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={newStatus === status}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="capitalize">{status}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrderDetail;
