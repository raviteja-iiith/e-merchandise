import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FiMenu, FiX } from 'react-icons/fi';

const DashboardLayout = ({ userType }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar userType={userType} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-md px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-gray-700 text-2xl"
          >
            {showSidebar ? <FiX /> : <FiMenu />}
          </button>
          <h2 className="text-lg font-bold text-primary-600">
            {userType === 'vendor' ? 'Vendor' : 'Admin'} Panel
          </h2>
        </div>
        
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
