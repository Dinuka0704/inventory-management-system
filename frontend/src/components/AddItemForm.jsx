// /frontend/src/components/AddItemForm.jsx
import { useState, useEffect } from 'react';
import { getCategories, createItem } from '../services/api';

function AddItemForm({ onSuccess, onClose }) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category_id, setCategoryId] = useState('');
  const [initial_stock, setInitialStock] = useState(0);
  const [reorder_level, setReorderLevel] = useState(10);
  
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories when the form loads
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const itemData = {
      sku,
      name,
      category_id: category_id ? parseInt(category_id) : null,
      initial_stock: parseInt(initial_stock),
      reorder_level: parseInt(reorder_level),
    };

    try {
      await createItem(itemData);
      setLoading(false);
      onSuccess(); // Tell the parent page to refetch items
      onClose();   // Close the modal
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Failed to create item');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-red-700">
          {error}
        </div>
      )}
      
      {/* Form fields in a grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">SKU*</label>
          <input
            type="text"
            className="w-full rounded-md border p-2 text-gray-900"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Item Name*</label>
          <input
            type="text"
            className="w-full rounded-md border p-2 text-gray-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
          <select
            className="w-full rounded-md border bg-white p-2 text-gray-900"
            value={category_id}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Initial Stock*</label>
          <input
            type="number"
            min="0"
            className="w-full rounded-md border p-2 text-gray-900"
            value={initial_stock}
            onChange={(e) => setInitialStock(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Reorder Level*</label>
          <input
            type="number"
            min="0"
            className="w-full rounded-md border p-2 text-gray-900"
            value={reorder_level}
            onChange={(e) => setReorderLevel(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Item'}
        </button>
      </div>
    </form>
  );
}

export default AddItemForm;