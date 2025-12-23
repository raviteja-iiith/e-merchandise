import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/categories');
      setCategories(data.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, formData);
        toast.success('Category updated');
      } else {
        await api.post('/admin/categories', formData);
        toast.success('Category created');
      }
      setShowModal(false);
      setFormData({ name: '', description: '', isActive: true });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description, isActive: category.isActive });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will affect all products in this category.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/categories/${id}/status`, { isActive: !currentStatus });
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditingCategory(null); setFormData({ name: '', description: '', isActive: true }); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"><FiPlus /> Add Category</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Categories</p>
          <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{categories.filter(c => c.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-blue-600">{categories.reduce((acc, cat) => acc + (cat.productsCount || 0), 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  <div className="text-sm text-gray-500">{category.description}</div>
                </td>
                <td className="px-6 py-4 text-sm">{category.productsCount || 0}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggleStatus(category._id, category.isActive)} className={`px-3 py-1 rounded-full text-xs font-semibold ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{category.isActive ? 'Active' : 'Inactive'}</button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(category.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(category)} className="text-indigo-600 hover:text-indigo-900" title="Edit"><FiEdit2 /></button>
                    <button onClick={() => handleDelete(category._id)} className="text-red-600 hover:text-red-900" title="Delete"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-indigo-600" />
                <label className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingCategory(null); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editingCategory ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;