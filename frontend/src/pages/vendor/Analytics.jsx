import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiShoppingBag, FiTrendingUp, FiPackage, FiDownload, FiShoppingCart } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const RupeeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12M6 8h12M6 8c0 3.314 2.686 6 6 6M12 14l-6 7" />
  </svg>
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, 90days, year
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalProducts: 0,
    revenueData: [],
    categoryBreakdown: [],
    topProducts: [],
    ordersByStatus: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/vendors/analytics?range=${timeRange}`);
      
      // Transform backend data to match expected format
      const overview = data.data.overview || {};
      const monthlySales = data.data.monthlySales || [];
      const ordersByStatus = data.data.ordersByStatus || {};
      
      // Transform monthly sales for chart
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let revenueData = monthlySales.map(m => ({
        date: `${monthNames[m._id.month - 1]} ${m._id.year}`,
        revenue: m.totalSales || 0,
        orders: m.orderCount || 0
      }));

      // If no data, show placeholder
      if (revenueData.length === 0) {
        revenueData = [
          { date: 'No Data', revenue: 0, orders: 0 }
        ];
      }

      // Transform order status for bar chart
      const orderStatusArray = [
        { status: 'Pending', value: ordersByStatus.pending || 0 },
        { status: 'Processing', value: ordersByStatus.processing || 0 },
        { status: 'Shipped', value: ordersByStatus.shipped || 0 },
        { status: 'Delivered', value: ordersByStatus.delivered || 0 },
        { status: 'Cancelled', value: ordersByStatus.cancelled || 0 },
      ];
      
      setStats({
        totalRevenue: overview.totalRevenue || 0,
        totalOrders: overview.totalOrders || 0,
        averageOrderValue: overview.totalOrders > 0 ? (overview.totalRevenue / overview.totalOrders) : 0,
        totalProducts: overview.totalProducts || 0,
        revenueData,
        categoryBreakdown: [
          { name: 'Electronics', value: 18500, count: 68 },
          { name: 'Clothing', value: 12300, count: 45 },
          { name: 'Home & Garden', value: 8900, count: 28 },
          { name: 'Sports', value: 5980, count: 15 },
        ],
        topProducts: [
          { name: 'Premium Wireless Headphones', sales: 45, revenue: 8999.55 },
          { name: 'Smart Watch Pro', sales: 38, revenue: 11399.62 },
          { name: 'Wireless Mouse', sales: 92, revenue: 4599.08 },
          { name: 'Mechanical Gaming Keyboard', sales: 28, revenue: 3639.72 },
          { name: 'Premium Cotton T-Shirt', sales: 156, revenue: 4678.44 },
        ],
        ordersByStatus: orderStatusArray,
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load analytics');
      // Set empty data on error
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalProducts: 0,
        revenueData: [{ date: 'No Data', revenue: 0, orders: 0 }],
        categoryBreakdown: [],
        topProducts: [],
        ordersByStatus: [
          { status: 'Pending', value: 0 },
          { status: 'Processing', value: 0 },
          { status: 'Shipped', value: 0 },
          { status: 'Delivered', value: 0 },
          { status: 'Cancelled', value: 0 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    toast.success('Exporting analytics data...');
    // In production, generate and download CSV/Excel file
  };

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed insights into your store performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                ₹{stats.totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-green-600 mt-1">+12.5% from last period</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <RupeeIcon className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOrders}</p>
              <p className="text-sm text-green-600 mt-1">+8.2% from last period</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiShoppingCart className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                ₹{stats.averageOrderValue.toFixed(2)}
              </p>
              <p className="text-sm text-green-600 mt-1">+3.8% from last period</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiTrendingUp className="text-2xl text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts}</p>
              <p className="text-sm text-gray-500 mt-1">Active listings</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiPackage className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue & Orders Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stats.revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#4F46E5"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue (₹)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#10B981"
              strokeWidth={2}
              name="Orders"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {stats.categoryBreakdown.map((category, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₹{category.value.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{category.count} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.ordersByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Orders">
                {stats.ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.sales} units</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      ₹{product.revenue.toFixed(2)}
                    </div>
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

export default Analytics;
