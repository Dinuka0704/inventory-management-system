// /frontend/src/pages/UserManagementPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { getUsers } from '../services/api'; 
import Modal from '../components/Modal';
import UserForm from '../components/UserForm'; 

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalError, setModalError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalError(null);
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => openModal('add')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-lg transition duration-300 hover:bg-indigo-700"
        >
          + Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.role}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => openModal('edit', user)} className="text-indigo-600 hover:text-indigo-900">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={modalMode === 'add' ? 'Add New User' : 'Edit User'}
      >
        {modalError && <div className="mb-4 text-center text-red-600">{modalError}</div>}
        <UserForm
          user={selectedUser}
          onSuccess={fetchUsers}
          onClose={closeModal}
          onError={setModalError}
        />
      </Modal>
    </div>
  );
}

export default UserManagementPage;