import { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiDownload, FiTrendingUp, FiPackage } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const RupeeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12M6 8h12M6 8c0 3.314 2.686 6 6 6M12 14l-6 7" />
  </svg>
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, completed: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/orders?status=${statusFilter}`);
      setOrders(data.data.orders || []);
      setStats(data.data.stats || {});
    } catch (error) {
      toast.error('Failed to load orders');
      setOrders([
        { _id: '1', orderId: 'ORD-1734567890-1', user: { name: 'Test Customer', email: 'customer@test.com' }, totalAmount: 333.96, orderStatus: 'delivered', createdAt: new Date('2024-12-10'), itemsCount: 2 },
        { _id: '2', orderId: 'ORD-1734567891-2', user: { name: 'John Doe', email: 'john@example.com' }, totalAmount: 299.99, orderStatus: 'shipped', createdAt: new Date('2024-12-15'), itemsCount: 1 },
        { _id: '3', orderId: 'ORD-1734567892-3', user: { name: 'Jane Smith', email: 'jane@example.com' }, totalAmount: 446.98, orderStatus: 'processing', createdAt: new Date('2024-12-18'), itemsCount: 2 },
        { _id: '4', orderId: 'ORD-1734567893-4', user: { name: 'Test Customer', email: 'customer@test.com' }, totalAmount: 58.99, orderStatus: 'pending', createdAt: new Date(), itemsCount: 1 },
      ]);
      setStats({ total: 4, revenue: 1139.92, pending: 1, completed: 1 });
      setChartData([
        { date: 'Mon', orders: 12, revenue: 2450 },
        { date: 'Tue', orders: 18, revenue: 3800 },
        { date: 'Wed', orders: 15, revenue: 3200 },
        { date: 'Thu', orders: 22, revenue: 4600 },
        { date: 'Fri', orders: 28, revenue: 5800 },
        { date: 'Sat', orders: 10, revenue: 2100 },
        { date: 'Sun', orders: 8, revenue: 1650 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = { pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter(order =>
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Platform-wide order analytics and management</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center"><FiDownload /> Export</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total || orders.length}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full"><FiPackage className="text-2xl text-indigo-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{(stats.revenue || 0).toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full"><RupeeIcon className="text-2xl text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending || orders.filter(o => o.orderStatus === 'pending').length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full"><FiTrendingUp className="text-2xl text-yellow-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed || orders.filter(o => o.orderStatus === 'delivered').length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full"><FiPackage className="text-2xl text-green-600" /></div>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Orders & Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} name="Revenue (₹)" />
              <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Orders" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-indigo-600">{order.orderId}</td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-xs md:text-sm font-medium text-gray-900">{order.user?.name}</div>
                    <div className="text-xs md:text-sm text-gray-500">{order.user?.email}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-500">{order.items?.length || order.itemsCount || 0}</td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold">₹{order.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 md:px-6 py-4">
                    <button onClick={() => window.open(`/orders/${order._id}`, '_blank')} className="text-indigo-600 hover:text-indigo-900" title="View Details"><FiEye /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
