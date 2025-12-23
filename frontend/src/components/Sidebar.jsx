import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiHome, FiShoppingBag, FiPackage, FiUsers, FiSettings, FiBarChart2, FiTag, FiStar, FiGrid, FiLogOut } from 'react-icons/fi';
import { logout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const Sidebar = ({ userType }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const vendorLinks = [
    { path: '/vendor', icon: FiHome, label: 'Dashboard' },
    { path: '/vendor/products', icon: FiShoppingBag, label: 'Products' },
    { path: '/vendor/orders', icon: FiPackage, label: 'Orders' },
    { path: '/vendor/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/vendor/profile', icon: FiSettings, label: 'Profile' },
  ];

  const adminLinks = [
    { path: '/admin', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/vendors', icon: FiUsers, label: 'Vendors' },
    { path: '/admin/products', icon: FiShoppingBag, label: 'Products' },
    { path: '/admin/orders', icon: FiPackage, label: 'Orders' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
    { path: '/admin/categories', icon: FiGrid, label: 'Categories' },
    { path: '/admin/coupons', icon: FiTag, label: 'Coupons' },
    { path: '/admin/reviews', icon: FiStar, label: 'Reviews' },
    { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  const links = userType === 'vendor' ? vendorLinks : adminLinks;

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white shadow-lg h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-primary-600">
          {userType === 'vendor' ? 'Vendor' : 'Admin'} Panel
        </h2>
      </div>
      
      <nav className="mt-4 md:mt-6">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 md:px-6 py-3 text-sm md:text-base text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                isActive ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''
              }`}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex-shrink-0" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 md:px-6 py-3 text-sm md:text-base text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors mt-4"
        >
          <FiLogOut className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex-shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
