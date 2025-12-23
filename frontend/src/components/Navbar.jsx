import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiBell, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { unreadCount } = useSelector((state) => state.notifications || { unreadCount: 0 });
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold text-primary-600">
            Marketplace
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </form>
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative">
                  <FiShoppingCart className="w-6 h-6 text-gray-700 hover:text-primary-600" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>

                <Link to="/wishlist" className="relative">
                  <FiHeart className="w-6 h-6 text-gray-700 hover:text-primary-600" />
                </Link>

                <Link to="/notifications" className="relative">
                  <FiBell className="w-6 h-6 text-gray-700 hover:text-primary-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button 
                    className="flex items-center space-x-2"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <FiUser className="w-6 h-6 text-gray-700" />
                    <span className="hidden md:block text-sm font-medium">{user?.name}</span>
                  </button>
                  
                  {showDropdown && (
                    <>
                      {/* Backdrop to close dropdown when clicking outside */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowDropdown(false)}
                      ></div>
                      
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                        <Link 
                          to="/profile" 
                          className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                          onClick={() => setShowDropdown(false)}
                        >
                          Profile
                        </Link>
                        <Link 
                          to="/orders" 
                          className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                          onClick={() => setShowDropdown(false)}
                        >
                          My Orders
                        </Link>
                        {user?.role === 'vendor' && (
                          <Link 
                            to="/vendor" 
                            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            Vendor Dashboard
                          </Link>
                        )}
                        {user?.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button 
                          onClick={() => { handleLogout(); setShowDropdown(false); }} 
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-gray-700 text-2xl"
          >
            {showMobileMenu ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden py-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </form>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/cart" 
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="flex items-center gap-2">
                    <FiShoppingCart className="w-5 h-5" />
                    Cart
                  </span>
                  {totalItems > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/wishlist" 
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FiHeart className="w-5 h-5" />
                  Wishlist
                </Link>
                <Link 
                  to="/notifications" 
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="flex items-center gap-2">
                    <FiBell className="w-5 h-5" />
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="px-4 py-2 font-semibold text-gray-800">{user?.name}</div>
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 hover:bg-gray-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/orders" 
                    className="block px-4 py-2 hover:bg-gray-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Orders
                  </Link>
                  {user?.role === 'vendor' && (
                    <Link 
                      to="/vendor" 
                      className="block px-4 py-2 hover:bg-gray-50"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Vendor Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="block px-4 py-2 hover:bg-gray-50"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => { handleLogout(); setShowMobileMenu(false); }} 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-4 py-2 hover:bg-gray-50 font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-4 py-2 bg-primary-600 text-white rounded-lg mx-4 text-center font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
