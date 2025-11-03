// /frontend/src/pages/CategoryPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import Modal from '../components/Modal';

function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'delete'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openModal = (mode, category = null) => {
    setModalMode(mode);
    setSelectedCategory(category);
    setCategoryName(category ? category.name : '');
    setModalError(null);
    setIsSubmitting(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setCategoryName('');
    setModalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      if (modalMode === 'add') {
        await createCategory(categoryName);
      } else if (modalMode === 'edit') {
        await updateCategory(selectedCategory.id, categoryName);
      }
      fetchCategories();
      closeModal();
    } catch (err) {
      setModalError(err.response?.data?.msg || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setModalError(null);
    try {
      await deleteCategory(selectedCategory.id);
      fetchCategories();
      closeModal();
    } catch (err) {
      setModalError(err.response?.data?.msg || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => openModal('add')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-lg transition duration-300 hover:bg-indigo-700"
        >
          + Add New Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{cat.id}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{cat.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => openModal('edit', cat)} className="text-indigo-600 hover:text-indigo-900">
                    Edit
                  </button>
                  <button onClick={() => openModal('delete', cat)} className="ml-4 text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit/Delete Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={
        modalMode === 'add' ? 'Add Category' :
        modalMode === 'edit' ? 'Edit Category' : 'Confirm Delete'
      }>
        {modalMode === 'add' || modalMode === 'edit' ? (
          <form onSubmit={handleSubmit}>
            {modalError && <div className="mb-4 text-red-600">{modalError}</div>}
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="w-full rounded-md border p-2 text-gray-900"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="rounded-md bg-gray-200 px-4 py-2 text-gray-800">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p>Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?</p>
            {modalError && <div className="mt-4 text-red-600">{modalError}</div>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="rounded-md bg-gray-200 px-4 py-2 text-gray-800">Cancel</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="rounded-md bg-red-600 px-4 py-2 text-white disabled:opacity-50">
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CategoryPage;