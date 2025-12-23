import { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiLock, FiUnlock } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/users?role=${roleFilter}`);
      setUsers(data.data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
      // Mock data
      setUsers([
        { _id: '1', name: 'Test Customer', email: 'customer@test.com', role: 'customer', isActive: true, createdAt: new Date('2024-01-10'), totalOrders: 12, totalSpent: 1250.50 },
        { _id: '2', name: 'Test Vendor', email: 'vendor@test.com', role: 'vendor', isActive: true, createdAt: new Date('2024-01-15'), totalOrders: 156, totalSpent: 0 },
        { _id: '3', name: 'Test Admin', email: 'admin@test.com', role: 'admin', isActive: true, createdAt: new Date('2024-01-01'), totalOrders: 0, totalSpent: 0 },
        { _id: '4', name: 'John Doe', email: 'john@example.com', role: 'customer', isActive: false, createdAt: new Date('2024-03-20'), totalOrders: 3, totalSpent: 450.00 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    try {
      await api.patch(`/admin/users/${selectedUser._id}/role`, { role: newRole });
      toast.success('User role updated');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'banned'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      vendor: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Manage platform users and permissions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Customers</p>
          <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'customer').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Vendors</p>
          <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'vendor').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Banned</p>
          <p className="text-2xl font-bold text-red-600">{users.filter(u => !u.isActive).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[768px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadge(user.role)}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>{user.totalOrders || 0} orders</div>
                    <div className="text-gray-500">₹{(user.totalSpent || 0).toFixed(2)} spent</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedUser(user); setNewRole(user.role); setShowEditModal(true); }} className="text-indigo-600 hover:text-indigo-900" title="Change Role"><FiEdit2 /></button>
                      <button onClick={() => handleToggleStatus(user._id, user.isActive)} className={user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} title={user.isActive ? 'Ban User' : 'Activate User'}>{user.isActive ? <FiLock /> : <FiUnlock />}</button>
                      <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900" title="Delete User"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Change User Role</h3>
            <p className="text-gray-600 mb-4">User: <strong>{selectedUser.name}</strong></p>
            <div className="space-y-2 mb-6">
              {['customer', 'vendor', 'admin'].map((role) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value={role} checked={newRole === role} onChange={(e) => setNewRole(e.target.value)} className="w-4 h-4 text-indigo-600" />
                  <span className="capitalize">{role}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleChangeRole} disabled={!newRole} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
