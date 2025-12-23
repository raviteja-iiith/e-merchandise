import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiPackage, FiTrendingUp, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const RupeeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12M6 8h12M6 8c0 3.314 2.686 6 6 6M12 14l-6 7" />
  </svg>
);
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      // Extract the overview data from the response
      const dashboardData = data.data || {};
      const overview = dashboardData.overview || {};
      setStats(overview);

      // Use real revenue data if available, otherwise use empty array
      if (dashboardData.revenueData && dashboardData.revenueData.length > 0) {
        setRevenueData(dashboardData.revenueData);
      } else {
        // Show empty data if no orders yet
        setRevenueData([]);
      }

      // Use real user growth data if available, otherwise use empty array
      if (dashboardData.userGrowthData && dashboardData.userGrowthData.length > 0) {
        setUserGrowthData(dashboardData.userGrowthData);
      } else {
        // Show empty data if no users yet
        setUserGrowthData([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast.error('Failed to load dashboard data');
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

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'bg-blue-500', change: '+12%', link: '/admin/users' },
    { title: 'Active Vendors', value: stats?.totalVendors || 0, icon: FiShoppingBag, color: 'bg-green-500', change: '+8%', link: '/admin/vendors' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: FiPackage, color: 'bg-purple-500', change: '+18%', link: '/admin/products' },
    { title: 'Platform Revenue', value: `₹${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: RupeeIcon, color: 'bg-indigo-500', change: '+32%', link: '/admin/analytics' },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Platform overview and management</p>
        </div>
      </div>

      {stats?.pendingVendors > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 md:p-4 rounded-lg flex flex-col sm:flex-row items-start gap-3">
          <FiAlertCircle className="text-yellow-600 text-xl mt-0.5 flex-shrink-0"/>
          <div className="flex-1">
            <h3 className="text-sm md:text-base font-semibold text-yellow-800">Pending Vendor Approvals</h3>
            <p className="text-yellow-700 text-xs md:text-sm mt-1">{stats.pendingVendors} vendor(s) awaiting approval</p>
          </div>
          <Link to="/admin/vendors?status=pending" className="bg-yellow-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-xs md:text-sm font-semibold w-full sm:w-auto text-center">Review</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card) => (
          <Link key={card.title} to={card.link} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="text-white text-2xl"/>
              </div>
              <span className="text-green-600 text-sm font-semibold flex items-center gap-1"><FiTrendingUp/> {card.change}</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue & Orders Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis yAxisId="left"/>
              <YAxis yAxisId="right" orientation="right"/>
              <Tooltip/>
              <Legend/>
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} name="Revenue (₹)"/>
              <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Orders"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User & Vendor Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Bar dataKey="users" fill="#3B82F6" name="Users"/>
              <Bar dataKey="vendors" fill="#8B5CF6" name="Vendors"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Vendors</h2>
          <div className="space-y-3">
            {stats?.recentVendors?.slice(0, 5).map((vendor) => (
              <div key={vendor._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{vendor.businessName}</p>
                  <p className="text-sm text-gray-600">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${vendor.status === 'approved' ? 'bg-green-100 text-green-800' : vendor.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{vendor.status}</span>
              </div>
            )) || <p className="text-gray-600">No vendors yet</p>}
          </div>
          <Link to="/admin/vendors" className="block text-center mt-4 text-indigo-600 hover:text-indigo-800 font-medium">View All Vendors →</Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Products</h2>
          <div className="space-y-3">
            {stats?.recentProducts?.slice(0, 5).map((product) => (
              <div key={product._id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <img src={product.images?.[0] || '/placeholder-product.jpg'} alt={product.name} className="w-12 h-12 object-cover rounded"/>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                  <p className="text-sm text-gray-600">₹{product.price}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            )) || <p className="text-gray-600">No products yet</p>}
          </div>
          <Link to="/admin/products" className="block text-center mt-4 text-indigo-600 hover:text-indigo-800 font-medium">View All Products →</Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-600"/>
                <span className="font-medium text-gray-800">System Status</span>
              </div>
              <span className="text-green-600 font-semibold">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FiUsers className="text-blue-600"/>
                <span className="font-medium text-gray-800">Active Users (24h)</span>
              </div>
              <span className="text-blue-600 font-semibold">{stats?.activeUsers24h || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="text-purple-600"/>
                <span className="font-medium text-gray-800">Orders Today</span>
              </div>
              <span className="text-purple-600 font-semibold">{stats?.ordersToday || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2">
                <RupeeIcon className="w-5 h-5 text-indigo-600"/>
                <span className="font-medium text-gray-800">Revenue Today</span>
              </div>
              <span className="text-indigo-600 font-semibold">₹{stats?.revenueToday?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/vendors?status=pending" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
            <FiAlertCircle className="text-3xl text-indigo-600 mx-auto mb-2"/>
            <p className="font-semibold text-gray-800">Review Vendors</p>
            {stats?.pendingVendors > 0 && (<span className="inline-block mt-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{stats.pendingVendors}</span>)}
          </Link>
          <Link to="/admin/users" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
            <FiUsers className="text-3xl text-indigo-600 mx-auto mb-2"/>
            <p className="font-semibold text-gray-800">Manage Users</p>
          </Link>
          <Link to="/admin/products" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
            <FiPackage className="text-3xl text-indigo-600 mx-auto mb-2"/>
            <p className="font-semibold text-gray-800">Manage Products</p>
          </Link>
          <Link to="/admin/analytics" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
            <FiTrendingUp className="text-3xl text-indigo-600 mx-auto mb-2"/>
            <p className="font-semibold text-gray-800">View Analytics</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
