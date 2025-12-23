import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: { siteName: 'E-Commerce Marketplace', siteDescription: 'Multi-vendor marketplace', contactEmail: 'admin@marketplace.com', supportPhone: '+1-234-567-8900' },
    payment: { stripeEnabled: true, paypalEnabled: false, codEnabled: true, currency: 'USD', taxRate: 10 },
    shipping: { freeShippingThreshold: 100, defaultShippingCost: 10, estimatedDeliveryDays: 7 },
    email: { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPassword: '', fromEmail: 'noreply@marketplace.com' },
    notifications: { orderConfirmation: true, orderShipped: true, orderDelivered: true, vendorApproval: true, lowStock: true },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      setSettings(data.data.settings || settings);
    } catch (error) {
      // Use default settings
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/admin/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings({ ...settings, [category]: { ...settings[category], [key]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform settings</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {[{ id: 'general', name: 'General' }, { id: 'payment', name: 'Payment' }, { id: 'shipping', name: 'Shipping' }, { id: 'email', name: 'Email' }, { id: 'notifications', name: 'Notifications' }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 font-medium border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>{tab.name}</button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input type="text" value={settings.general.siteName} onChange={(e) => updateSetting('general', 'siteName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                <textarea value={settings.general.siteDescription} onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input type="email" value={settings.general.contactEmail} onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                <input type="tel" value={settings.general.supportPhone} onChange={(e) => updateSetting('general', 'supportPhone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.payment.stripeEnabled} onChange={(e) => updateSetting('payment', 'stripeEnabled', e.target.checked)} className="w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Enable Stripe</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.payment.paypalEnabled} onChange={(e) => updateSetting('payment', 'paypalEnabled', e.target.checked)} className="w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Enable PayPal</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.payment.codEnabled} onChange={(e) => updateSetting('payment', 'codEnabled', e.target.checked)} className="w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Enable Cash on Delivery</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={settings.payment.currency} onChange={(e) => updateSetting('payment', 'currency', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input type="number" value={settings.payment.taxRate} onChange={(e) => updateSetting('payment', 'taxRate', Number(e.target.value))} min="0" step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold ($)</label>
                <input type="number" value={settings.shipping.freeShippingThreshold} onChange={(e) => updateSetting('shipping', 'freeShippingThreshold', Number(e.target.value))} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Shipping Cost ($)</label>
                <input type="number" value={settings.shipping.defaultShippingCost} onChange={(e) => updateSetting('shipping', 'defaultShippingCost', Number(e.target.value))} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery (Days)</label>
                <input type="number" value={settings.shipping.estimatedDeliveryDays} onChange={(e) => updateSetting('shipping', 'estimatedDeliveryDays', Number(e.target.value))} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">⚠️ These settings are for email notifications. Configure your SMTP server details.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                <input type="text" value={settings.email.smtpHost} onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                <input type="number" value={settings.email.smtpPort} onChange={(e) => updateSetting('email', 'smtpPort', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP User</label>
                <input type="text" value={settings.email.smtpUser} onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                <input type="password" value={settings.email.smtpPassword} onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                <input type="email" value={settings.email.fromEmail} onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Configure which email notifications to send to customers and vendors.</p>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notifications.orderConfirmation} onChange={(e) => updateSetting('notifications', 'orderConfirmation', e.target.checked)} className="w-4 h-4" />
                <label className="text-sm text-gray-700">Order Confirmation</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notifications.orderShipped} onChange={(e) => updateSetting('notifications', 'orderShipped', e.target.checked)} className="w-4 h-4" />
                <label className="text-sm text-gray-700">Order Shipped</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notifications.orderDelivered} onChange={(e) => updateSetting('notifications', 'orderDelivered', e.target.checked)} className="w-4 h-4" />
                <label className="text-sm text-gray-700">Order Delivered</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notifications.vendorApproval} onChange={(e) => updateSetting('notifications', 'vendorApproval', e.target.checked)} className="w-4 h-4" />
                <label className="text-sm text-gray-700">Vendor Approval Notifications</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notifications.lowStock} onChange={(e) => updateSetting('notifications', 'lowStock', e.target.checked)} className="w-4 h-4" />
                <label className="text-sm text-gray-700">Low Stock Alerts</label>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6">
          <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:bg-gray-400">
            <FiSave /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;