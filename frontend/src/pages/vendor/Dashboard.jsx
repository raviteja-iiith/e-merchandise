import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiStar, FiTrendingUp, FiUsers, FiAlertCircle } from 'react-icons/fi';

const RupeeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12M6 8h12M6 8c0 3.314 2.686 6 6 6M12 14l-6 7" />
  </svg>
);
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await api.get('/vendors/analytics');
      
      // Transform the analytics data to match dashboard stats format
      const analyticsData = data.data;
      const transformedStats = {
        totalProducts: analyticsData.overview?.totalProducts || 0,
        totalOrders: analyticsData.overview?.totalOrders || 0,
        totalRevenue: analyticsData.overview?.totalRevenue || 0,
        averageRating: analyticsData.overview?.averageRating || 0,
        ordersByStatus: analyticsData.ordersByStatus || {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        }
      };
      
      setStats(transformedStats);

      // Transform monthly sales data for chart
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const chartData = analyticsData.monthlySales?.map(item => ({
        month: monthNames[item._id.month - 1],
        revenue: item.totalSales || 0
      })) || [];

      // If no data, show last 6 months with zero values
      if (chartData.length === 0) {
        const currentMonth = new Date().getMonth();
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          chartData.push({
            month: monthNames[monthIndex],
            revenue: 0
          });
        }
      }

      setRevenueData(chartData);

      // Transform order status data for pie chart
      setOrderStatusData([
        { name: 'Pending', value: transformedStats.ordersByStatus?.pending || 0, color: '#FFA500' },
        { name: 'Processing', value: transformedStats.ordersByStatus?.processing || 0, color: '#3B82F6' },
        { name: 'Shipped', value: transformedStats.ordersByStatus?.shipped || 0, color: '#8B5CF6' },
        { name: 'Delivered', value: transformedStats.ordersByStatus?.delivered || 0, color: '#10B981' },
        { name: 'Cancelled', value: transformedStats.ordersByStatus?.cancelled || 0, color: '#EF4444' },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load dashboard data';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (<div key={i} className="bg-white rounded-lg shadow-md p-6 h-32"></div>))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (<div key={i} className="bg-white rounded-lg shadow-md p-6 h-80"></div>))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiAlertCircle className="mx-auto text-red-500 text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            {error.includes('profile not found') ? 
              'Please complete your vendor registration or contact support.' : 
              'Please try refreshing the page or contact support if the issue persists.'}
          </p>
          <button 
            onClick={fetchDashboardStats}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: FiPackage, color: 'bg-blue-500', change: '+12%' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: FiShoppingBag, color: 'bg-green-500', change: '+8%' },
    { title: 'Revenue', value: `₹${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: RupeeIcon, color: 'bg-indigo-500', change: '+23%' },
    { title: 'Average Rating', value: stats?.averageRating?.toFixed(1) || '0.0', icon: FiStar, color: 'bg-yellow-500', change: '+0.2' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vendor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <Link to="/vendor/products/new" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold">Add New Product</Link>
      </div>

      {stats?.vendorStatus !== 'approved' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="text-yellow-600 text-xl mt-0.5"/>
          <div>
            <h3 className="font-semibold text-yellow-800">Vendor Account Pending Approval</h3>
            <p className="text-yellow-700 text-sm mt-1">Your vendor account is currently under review. Some features may be limited until approval.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="text-white text-2xl"/>
              </div>
              <span className="text-green-600 text-sm font-semibold flex items-center gap-1"><FiTrendingUp/> {card.change}</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} name="Revenue (₹)"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={100} fill="#8884d8" dataKey="value">
                {orderStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color}/>))}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats?.recentOrders?.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-600">₹{order.total?.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                </div>
              </div>
            )) || <p className="text-gray-600">No recent orders</p>}
          </div>
          <Link to="/vendor/orders" className="block text-center mt-4 text-indigo-600 hover:text-indigo-800 font-medium">View All Orders →</Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Products</h2>
          <div className="space-y-3">
            {stats?.topProducts?.slice(0, 5).map((product) => (
              <div key={product._id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <img src={product.images?.[0] || '/placeholder-product.jpg'} alt={product.name} className="w-12 h-12 object-cover rounded"/>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.soldCount || 0} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-600">₹{product.price}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <FiStar className="text-yellow-400 fill-current"/>
                    <span>{product.averageRating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>
            )) || <p className="text-gray-600">No products yet</p>}
          </div>
          <Link to="/vendor/products" className="block text-center mt-4 text-indigo-600 hover:text-indigo-800 font-medium">View All Products →</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/vendor/products/new" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
            <FiPackage className="text-3xl text-indigo-600 mx-auto mb-2"/>
            <p className="font-semibold text-gray-800">Add Product</p>
          </Link>
          <Link to="/vendor/orders" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
            <FiShoppingBag className="text-3xl text-indigo-600 mx-auto mb-2"/>
            <p className="font-semibold text-gray-800">Manage Orders</p>
          </Link>
          <Link to="/vendor/analytics" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
            <FiTrendingUp className="text-3xl text-indigo-600 mx-auto mb-2"/>
            <p className="font-semibold text-gray-800">View Analytics</p>
          </Link>
          <Link to="/vendor/profile" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
            <FiUsers className="text-3xl text-indigo-600 mx-auto mb-2"/>
            <p className="font-semibold text-gray-800">Edit Profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
