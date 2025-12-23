import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave, FiCamera } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });

  const [addressData, setAddressData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
      if (user.address) {
        setAddressData({
          addressLine1: user.address.addressLine1 || '',
          addressLine2: user.address.addressLine2 || '',
          city: user.address.city || '',
          state: user.address.state || '',
          zipCode: user.address.zipCode || '',
          country: user.address.country || '',
        });
      }
    }
  }, [user, isAuthenticated, navigate]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(updateProfile(profileData)).unwrap();
    } catch (error) {
      // Error already handled by thunk
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/update-profile', { address: addressData });
      toast.success('Address updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
        <p className="text-gray-600 mb-6">Manage your account settings and preferences</p>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'profile'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiUser className="inline mr-2" />
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab('address')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'address'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiMapPin className="inline mr-2" />
                Address
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'password'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiLock className="inline mr-2" />
                Password
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {profileData.avatar ? (
                        <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="text-6xl text-gray-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                    >
                      <FiCamera />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Click to upload new photo</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                  >
                    <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'address' && (
              <form onSubmit={handleAddressSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={addressData.addressLine1}
                    onChange={handleAddressChange}
                    placeholder="Street address, P.O. box"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={addressData.addressLine2}
                    onChange={handleAddressChange}
                    placeholder="Apartment, suite, unit, etc. (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={addressData.city}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province *</label>
                    <input
                      type="text"
                      name="state"
                      value={addressData.state}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={addressData.zipCode}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={addressData.country}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                  >
                    <FiSave /> {loading ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <p className="text-sm text-gray-600 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                  >
                    <FiLock /> {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
