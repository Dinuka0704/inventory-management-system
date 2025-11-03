// /frontend/src/components/UserForm.jsx
import { useState } from 'react';
import { registerUser, updateUser } from '../services/api';

function UserForm({ user, onSuccess, onClose, onError }) {
  const [username, setUsername] = useState(user ? user.username : '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user ? user.role : 'Worker');
  const [isActive, setIsActive] = useState(user ? user.is_active : true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!user;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    onError(null); // Clear previous errors
    
    try {
      if (isEditMode) {
        await updateUser(user.id, { role, is_active: isActive });
      } else {
        await registerUser({ username, password, role });
      }
      onSuccess();
      onClose();
    } catch (err) {
      onError(err.response?.data?.msg || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
        <input
          type="text"
          className="w-full rounded-md border p-2 text-gray-900"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isEditMode} // Can't change username after creation
        />
      </div>
      
      {!isEditMode && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="w-full rounded-md border p-2 text-gray-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
        <select
          className="w-full rounded-md border bg-white p-2 text-gray-900"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Worker">Worker</option>
          <option value="Keeper">Keeper</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      {isEditMode && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
          <select
            className="w-full rounded-md border bg-white p-2 text-gray-900"
            value={isActive}
            onChange={(e) => setIsActive(e.target.value === 'true')}
          >
            <option value={true}>Active</option>
            <option value={false}>Inactive</option>
          </select>
        </div>
      )}
      
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-md bg-gray-200 px-4 py-2 text-gray-800">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create User')}
        </button>
      </div>
    </form>
  );
}

export default UserForm; 