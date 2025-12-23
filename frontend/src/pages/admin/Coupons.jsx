import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiCopy } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: 0,
    minPurchase: 0, maxDiscount: 0, expiresAt: '', usageLimit: 0, isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/coupons');
      setCoupons(data.data.coupons || []);
    } catch (error) {
      toast.error('Failed to load coupons');
      setCoupons([
        { _id: '1', code: 'WELCOME10', description: 'Welcome discount', discountType: 'percentage', discountValue: 10, minPurchase: 50, usageLimit: 100, usedCount: 23, isActive: true, expiresAt: new Date('2025-12-31') },
        { _id: '2', code: 'SAVE20', description: '20% off on orders above $100', discountType: 'percentage', discountValue: 20, minPurchase: 100, maxDiscount: 50, usageLimit: 50, usedCount: 12, isActive: true, expiresAt: new Date('2025-06-30') },
        { _id: '3', code: 'FLAT50', description: 'Flat $50 discount', discountType: 'fixed', discountValue: 50, minPurchase: 200, usageLimit: 20, usedCount: 5, isActive: true, expiresAt: new Date('2025-03-31') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon._id}`, formData);
        toast.success('Coupon updated');
      } else {
        await api.post('/admin/coupons', formData);
        toast.success('Coupon created');
      }
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({ code: '', description: '', discountType: 'percentage', discountValue: 0, minPurchase: 0, maxDiscount: 0, expiresAt: '', usageLimit: 0, isActive: true });
    setEditingCoupon(null);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code, description: coupon.description, discountType: coupon.discountType,
      discountValue: coupon.discountValue, minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || 0, expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || 0, isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const isExpired = (date) => new Date(date) < new Date();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Coupons</h1>
          <p className="text-gray-600 mt-1">Manage discount codes and promotions</p>
        </div>
        <button onClick={() => { setShowModal(true); resetForm(); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"><FiPlus /> Add Coupon</button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Coupons</p>
          <p className="text-2xl font-bold text-gray-800">{coupons.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{coupons.filter(c => c.isActive && !isExpired(c.expiresAt)).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Uses</p>
          <p className="text-2xl font-bold text-blue-600">{coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Expired</p>
          <p className="text-2xl font-bold text-red-600">{coupons.filter(c => isExpired(c.expiresAt)).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-indigo-600">{coupon.code}</span>
                    <button onClick={() => handleCopyCode(coupon.code)} className="text-gray-400 hover:text-gray-600" title="Copy code"><FiCopy size={16} /></button>
                  </div>
                  <div className="text-sm text-gray-500">{coupon.description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</div>
                  {coupon.minPurchase > 0 && <div className="text-xs text-gray-500">Min: ₹{coupon.minPurchase}</div>}
                  {coupon.maxDiscount > 0 && <div className="text-xs text-gray-500">Max: ₹{coupon.maxDiscount}</div>}
                </td>
                <td className="px-6 py-4 text-sm">{coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={isExpired(coupon.expiresAt) ? 'text-red-600' : ''}>{new Date(coupon.expiresAt).toLocaleDateString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${coupon.isActive && !isExpired(coupon.expiresAt) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{coupon.isActive && !isExpired(coupon.expiresAt) ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(coupon)} className="text-indigo-600 hover:text-indigo-900" title="Edit"><FiEdit2 /></button>
                    <button onClick={() => handleDelete(coupon._id)} className="text-red-600 hover:text-red-900" title="Delete"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 my-8">
            <h3 className="text-xl font-semibold mb-4">{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                  <input type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })} required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase</label>
                  <input type="number" value={formData.minPurchase} onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount</label>
                  <input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At *</label>
                <input type="date" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-indigo-600" />
                <label className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editingCoupon ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;