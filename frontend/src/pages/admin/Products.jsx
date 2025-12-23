import { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiTrash2, FiCheckCircle, FiXCircle, FiStar } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/products?status=${statusFilter}`);
      setProducts(data.data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
      setProducts([
        { _id: '1', name: 'Premium Wireless Headphones', vendor: { storeName: 'Premium Electronics' }, basePrice: 199.99, stock: 50, isActive: true, featured: true, createdAt: new Date(), totalSales: 45 },
        { _id: '2', name: 'Smart Watch Pro', vendor: { storeName: 'Premium Electronics' }, basePrice: 299.99, stock: 5, isActive: true, featured: false, createdAt: new Date(), totalSales: 38 },
        { _id: '3', name: 'Gaming Keyboard', vendor: { storeName: 'Tech Store' }, basePrice: 129.99, stock: 0, isActive: false, featured: false, createdAt: new Date(), totalSales: 28 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await api.patch(`/admin/products/${productId}/status`, { isActive: !currentStatus });
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleFeatured = async (productId, currentStatus) => {
    try {
      await api.patch(`/admin/products/${productId}/featured`, { featured: !currentStatus });
      toast.success(`Product ${!currentStatus ? 'featured' : 'unfeatured'}`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.vendor?.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        <p className="text-gray-600 mt-1">Moderate and manage platform products</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{products.filter(p => p.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Featured</p>
          <p className="text-2xl font-bold text-yellow-600">{products.filter(p => p.featured).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{products.filter(p => p.stock === 0).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">All Products</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  {product.featured && <span className="text-xs text-yellow-600 flex items-center gap-1"><FiStar size={12} /> Featured</span>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{product.vendor?.storeName || 'N/A'}</td>
                <td className="px-6 py-4 text-sm font-semibold">₹{product.basePrice?.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={product.stock === 0 ? 'text-red-600 font-semibold' : product.stock < 10 ? 'text-orange-600' : 'text-green-600'}>{product.stock}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{product.totalSales || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => window.open(`/products/${product._id}`, '_blank')} className="text-indigo-600 hover:text-indigo-900" title="View"><FiEye /></button>
                    <button onClick={() => handleToggleActive(product._id, product.isActive)} className={product.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} title={product.isActive ? 'Deactivate' : 'Activate'}>{product.isActive ? <FiXCircle /> : <FiCheckCircle />}</button>
                    <button onClick={() => handleToggleFeatured(product._id, product.featured)} className="text-yellow-600 hover:text-yellow-900" title="Toggle Featured"><FiStar /></button>
                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900" title="Delete"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
