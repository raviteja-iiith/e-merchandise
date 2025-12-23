import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiPackage, FiAlertCircle } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null });

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  const fetchVendorProducts = async () => {
    try {
      const { data } = await api.get('/vendors/products');
      setProducts(data.data.products || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p._id !== productId));
      setDeleteModal({ show: false, productId: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      await api.patch(`/products/${productId}/status`, {
        isActive: !currentStatus
      });
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
      setProducts(products.map(p => 
        p._id === productId ? { ...p, isActive: !currentStatus } : p
      ));
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const filteredProducts = products
    .filter(product => {
      if (filter === 'active') return product.isActive;
      if (filter === 'inactive') return !product.isActive;
      if (filter === 'outOfStock') return product.stock === 0;
      if (filter === 'lowStock') return product.stock > 0 && product.stock < 10;
      return true;
    })
    .filter(product =>
      searchTerm === '' ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
          <p className="text-gray-600 mt-1">{products.length} total products</p>
        </div>
        <button
          onClick={() => navigate('/vendor/products/new')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-semibold"
        >
          <FiPlus /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' },
              { key: 'lowStock', label: 'Low Stock' },
              { key: 'outOfStock', label: 'Out of Stock' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === item.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your filters'
                : "You haven't added any products yet"}
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => navigate('/vendor/products/new')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{product.sku || '-'}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-800">₹{product.price}</span>
                      {product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">₹{product.compareAtPrice}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${
                        product.stock === 0 ? 'text-red-600' :
                        product.stock < 10 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                      {product.stock < 10 && product.stock > 0 && (
                        <FiAlertCircle className="inline ml-1 text-orange-500" />
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleProductStatus(product._id, product.isActive)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          product.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } transition-colors`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{product.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-sm text-gray-600">({product.totalReviews || 0})</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${product._id}`}
                          target="_blank"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View product"
                        >
                          <FiEye />
                        </Link>
                        <button
                          onClick={() => navigate(`/vendor/products/${product._id}/edit`)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ show: true, productId: product._id })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Product</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, productId: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteModal.productId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
