import { useState, useEffect } from 'react';
import { FiSave, FiUpload } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('business'); // business, bank, shipping, settings

  const [formData, setFormData] = useState({
    // Business Info
    storeName: '',
    storeDescription: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },
    taxId: '',
    
    // Bank Details
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    
    // Shipping Settings
    defaultShippingCost: 0,
    freeShippingThreshold: 0,
    processingTime: '1-2',
    returnPolicy: '',
    
    // Store Settings
    storeLogo: '',
    storeBanner: '',
    returnWindow: 30,
    acceptsReturns: true,
  });

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/vendors/profile');
      const vendorData = data.data.vendor;
      
      // Set form data with proper defaults
      setFormData({
        storeName: vendorData.storeName || '',
        storeDescription: vendorData.storeDescription || '',
        businessName: vendorData.businessName || '',
        businessEmail: vendorData.businessEmail || '',
        businessPhone: vendorData.businessPhone || '',
        businessAddress: {
          addressLine1: vendorData.businessAddress?.addressLine1 || '',
          addressLine2: vendorData.businessAddress?.addressLine2 || '',
          city: vendorData.businessAddress?.city || '',
          state: vendorData.businessAddress?.state || '',
          country: vendorData.businessAddress?.country || '',
          zipCode: vendorData.businessAddress?.zipCode || '',
        },
        taxId: vendorData.taxId || '',
        bankName: vendorData.bankDetails?.bankName || '',
        accountHolderName: vendorData.bankDetails?.accountHolderName || '',
        accountNumber: vendorData.bankDetails?.accountNumber || '',
        routingNumber: vendorData.bankDetails?.routingNumber || '',
        swiftCode: vendorData.bankDetails?.swiftCode || '',
        defaultShippingCost: vendorData.defaultShippingCost || 0,
        freeShippingThreshold: vendorData.freeShippingThreshold || 0,
        processingTime: vendorData.processingTime || '1-2',
        returnPolicy: vendorData.returnPolicy || '',
        storeLogo: vendorData.storeLogo || '',
        storeBanner: vendorData.storeBanner || '',
        returnWindow: vendorData.returnWindow || 30,
        acceptsReturns: vendorData.acceptsReturns !== undefined ? vendorData.acceptsReturns : true,
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/vendors/profile', formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (type) => {
    toast.info('Image upload - integrate with cloud storage');
  };

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
          <h1 className="text-3xl font-bold text-gray-800">Vendor Profile</h1>
          <p className="text-gray-600 mt-1">Manage your store information and settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:bg-gray-400"
        >
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'business', label: 'Business Information' },
            { id: 'bank', label: 'Bank Details' },
            { id: 'shipping', label: 'Shipping Settings' },
            { id: 'settings', label: 'Store Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Business Information Tab */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Description *</label>
              <textarea
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Email *</label>
                <input
                  type="email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone *</label>
                <input
                  type="tel"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Business Address</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  name="businessAddress.addressLine1"
                  value={formData.businessAddress.addressLine1}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                <input
                  type="text"
                  name="businessAddress.addressLine2"
                  value={formData.businessAddress.addressLine2}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="businessAddress.city"
                    value={formData.businessAddress.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    name="businessAddress.state"
                    value={formData.businessAddress.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <input
                    type="text"
                    name="businessAddress.country"
                    value={formData.businessAddress.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code *</label>
                  <input
                    type="text"
                    name="businessAddress.zipCode"
                    value={formData.businessAddress.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Details Tab */}
        {activeTab === 'bank' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                🔒 Your bank information is encrypted and securely stored. This information is required for receiving payouts.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Routing Number *</label>
                <input
                  type="text"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SWIFT Code (for international)</label>
              <input
                type="text"
                name="swiftCode"
                value={formData.swiftCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Shipping Settings Tab */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Shipping Cost ($)</label>
                <input
                  type="number"
                  name="defaultShippingCost"
                  value={formData.defaultShippingCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold ($)</label>
                <input
                  type="number"
                  name="freeShippingThreshold"
                  value={formData.freeShippingThreshold}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Orders above this amount ship free</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Processing Time (business days)</label>
              <select
                name="processingTime"
                value={formData.processingTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="1-2">1-2 days</option>
                <option value="2-3">2-3 days</option>
                <option value="3-5">3-5 days</option>
                <option value="5-7">5-7 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
              <textarea
                name="returnPolicy"
                value={formData.returnPolicy}
                onChange={handleChange}
                rows={6}
                placeholder="Describe your return and exchange policy..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="acceptsReturns"
                checked={formData.acceptsReturns}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="text-sm font-medium text-gray-700">Accept returns and exchanges</label>
            </div>

            {formData.acceptsReturns && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return Window (days)</label>
                <input
                  type="number"
                  name="returnWindow"
                  value={formData.returnWindow}
                  onChange={handleChange}
                  min="7"
                  max="90"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        )}

        {/* Store Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
              <div className="flex items-center gap-4">
                {formData.storeLogo && (
                  <img src={formData.storeLogo} alt="Store logo" className="w-20 h-20 object-cover rounded-lg" />
                )}
                <button
                  type="button"
                  onClick={() => handleImageUpload('logo')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiUpload /> Upload Logo
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Recommended: 200x200px, PNG or JPG</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Banner</label>
              <div className="flex items-center gap-4">
                {formData.storeBanner && (
                  <img src={formData.storeBanner} alt="Store banner" className="w-40 h-20 object-cover rounded-lg" />
                )}
                <button
                  type="button"
                  onClick={() => handleImageUpload('banner')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiUpload /> Upload Banner
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Recommended: 1200x400px, PNG or JPG</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

