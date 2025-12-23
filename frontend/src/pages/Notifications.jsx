import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2, FiPackage, FiShoppingBag, FiDollarSign } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data.data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications');
      // Mock data for demo
      setNotifications([
        {
          _id: '1',
          type: 'order',
          title: 'Order Confirmed',
          message: 'Your order #ORD-1734567890-1 has been confirmed',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        },
        {
          _id: '2',
          type: 'order',
          title: 'Order Shipped',
          message: 'Your order #ORD-1734567891-2 has been shipped',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
          _id: '3',
          type: 'product',
          title: 'Product Back in Stock',
          message: 'Premium Wireless Headphones is now available',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        },
        {
          _id: '4',
          type: 'promotion',
          title: 'Special Offer',
          message: 'Get 20% off on all electronics. Use code: SAVE20',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      toast.success('Marked as read');
    } catch (error) {
      // Optimistic update for demo
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      setNotifications(notifications.filter(n => n._id !== id));
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <FiPackage className="text-blue-600" size={24} />;
      case 'product':
        return <FiShoppingBag className="text-green-600" size={24} />;
      case 'promotion':
        return <FiDollarSign className="text-yellow-600" size={24} />;
      default:
        return <FiBell className="text-gray-600" size={24} />;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.isRead);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {notifications.filter(n => !n.isRead).length} unread notifications
            </p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <FiCheck size={18} />
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'unread'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({notifications.filter(n => !n.isRead).length})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'read'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read ({notifications.filter(n => n.isRead).length})
            </button>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiBell className="mx-auto text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mt-4">No notifications</h3>
            <p className="text-gray-500 mt-2">
              {filter === 'unread'
                ? "You're all caught up!"
                : 'You have no notifications at this time.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg ${
                  !notification.isRead ? 'border-l-4 border-indigo-600' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="Mark as read"
                          >
                            <FiCheck size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
