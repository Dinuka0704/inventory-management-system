// /frontend/src/components/EditItemForm.jsx
import { useState, useEffect } from "react";
import { getCategories, updateItem } from "../services/api";

function EditItemForm({ item, onSuccess, onClose }) {
  // Set initial state from the 'item' prop
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [category_id, setCategoryId] = useState(item.category_id || "");
  const [reorder_level, setReorderLevel] = useState(item.reorder_level);
  const [cost, setCost] = useState(item.cost || 0);

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
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // We only send fields that can be updated.
    // SKU and stock are not editable here.
    const itemData = {
      name,
      description,
      category_id: category_id ? parseInt(category_id) : null,
      reorder_level: parseInt(reorder_level),
      cost: parseFloat(cost),
      // We don't send attributes yet, but you could add them
    };

    try {
      await updateItem(item.id, itemData);
      setLoading(false);
      onSuccess(); // Tell the parent page to refetch items
      onClose(); // Close the modal
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || "Failed to update item");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-red-700">
          {error}
        </div>
      )}

      {/* Form fields */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Item Name*
        </label>
        <input
          type="text"
          className="w-full rounded-md border p-2 text-gray-900"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          className="w-full rounded-md border p-2 text-gray-900"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Cost per Unit*
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="w-full rounded-md border p-2 text-gray-900"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Category
        </label>
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
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Reorder Level*
        </label>
        <input
          type="number"
          min="0"
          className="w-full rounded-md border p-2 text-gray-900"
          value={reorder_level}
          onChange={(e) => setReorderLevel(e.target.value)}
          required
        />
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
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default EditItemForm;
