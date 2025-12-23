import { useState, useEffect } from 'react';
import { FiSearch, FiCheck, FiX, FiEye, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected, suspended
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data} = await api.get(`/admin/vendors?status=${statusFilter}`);
      setVendors(data.data.vendors || []);
    } catch (error) {
      toast.error('Failed to load vendors');
      // Mock data for demo
      setVendors([
        {
          _id: '1',
          storeName: 'Premium Electronics Store',
          businessName: 'Premium Electronics LLC',
          user: { name: 'John Doe', email: 'vendor@test.com', phone: '+1234567890' },
          businessEmail: 'vendor@test.com',
          businessPhone: '+1234567890',
          approvalStatus: 'approved',
          isActive: true,
          totalProducts: 24,
          totalOrders: 156,
          totalRevenue: 45680.50,
          createdAt: new Date('2024-01-15'),
        },
        {
          _id: '2',
          storeName: 'Fashion Hub',
          businessName: 'Fashion Hub Inc',
          user: { name: 'Jane Smith', email: 'fashion@test.com', phone: '+1234567891' },
          businessEmail: 'fashion@test.com',
          businessPhone: '+1234567891',
          approvalStatus: 'pending',
          isActive: false,
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          createdAt: new Date(),
        },
        {
          _id: '3',
          storeName: 'Home Essentials',
          businessName: 'Home Essentials Co',
          user: { name: 'Mike Johnson', email: 'home@test.com', phone: '+1234567892' },
          businessEmail: 'home@test.com',
          businessPhone: '+1234567892',
          approvalStatus: 'approved',
          isActive: true,
          totalProducts: 45,
          totalOrders: 89,
          totalRevenue: 23450.00,
          createdAt: new Date('2024-02-20'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}/approve`);
      toast.success('Vendor approved successfully');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to approve vendor');
    }
  };

  const handleReject = async (vendorId) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}/reject`);
      toast.success('Vendor rejected');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to reject vendor');
    }
  };

  const handleSuspend = async (vendorId) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}/suspend`);
      toast.success('Vendor suspended');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to suspend vendor');
    }
  };

  const handleActivate = async (vendorId) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}/activate`);
      toast.success('Vendor activated');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to activate vendor');
    }
  };

  const viewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.businessEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Vendor Management</h1>
        <p className="text-gray-600 mt-1">Approve and manage vendor accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Vendors</p>
          <p className="text-2xl font-bold text-gray-800">{vendors.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">
            {vendors.filter(v => v.approvalStatus === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Active Vendors</p>
          <p className="text-2xl font-bold text-green-600">
            {vendors.filter(v => v.approvalStatus === 'approved' && v.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Suspended</p>
          <p className="text-2xl font-bold text-red-600">
            {vendors.filter(v => !v.isActive && v.approvalStatus === 'approved').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No vendors found
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vendor.storeName}</div>
                        <div className="text-sm text-gray-500">{vendor.businessName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.businessEmail}</div>
                      <div className="text-sm text-gray-500">{vendor.businessPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.totalProducts || 0} products</div>
                      <div className="text-sm text-gray-500">{vendor.totalOrders || 0} orders</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.approvalStatus)}`}>
                        {vendor.approvalStatus}
                      </span>
                      {vendor.approvalStatus === 'approved' && !vendor.isActive && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Suspended</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewDetails(vendor)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        {vendor.approvalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(vendor._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <FiCheck />
                            </button>
                            <button
                              onClick={() => handleReject(vendor._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <FiX />
                            </button>
                          </>
                        )}
                        {vendor.approvalStatus === 'approved' && (
                          vendor.isActive ? (
                            <button
                              onClick={() => handleSuspend(vendor._id)}
                              className="text-red-600 hover:text-red-900 text-xs"
                              title="Suspend"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(vendor._id)}
                              className="text-green-600 hover:text-green-900 text-xs"
                              title="Activate"
                            >
                              Activate
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedVendor.storeName}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Business Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Business Name</p>
                      <p className="font-medium">{selectedVendor.businessName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tax ID</p>
                      <p className="font-medium">{selectedVendor.taxId || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FiMail /> Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{selectedVendor.businessEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{selectedVendor.businessPhone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Products</p>
                      <p className="text-xl font-bold text-indigo-600">{selectedVendor.totalProducts || 0}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Orders</p>
                      <p className="text-xl font-bold text-green-600">{selectedVendor.totalOrders || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-xl font-bold text-yellow-600">
                        ${(selectedVendor.totalRevenue || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedVendor.approvalStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedVendor._id);
                          setShowDetailModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve Vendor
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedVendor._id);
                          setShowDetailModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
