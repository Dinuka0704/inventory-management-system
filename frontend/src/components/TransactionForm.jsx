// /frontend/src/components/TransactionForm.jsx
import { useState } from 'react';
import { createTransaction } from '../services/api';

function TransactionForm({ item, onSuccess, onClose }) {
  const [type, setType] = useState('INBOUND');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numQuantity = parseInt(quantity);

    if (isNaN(numQuantity) || numQuantity === 0) {
      setError('Quantity must be a non-zero number');
      return;
    }
    
    if (type !== 'ADJUSTMENT' && numQuantity < 0) {
      setError('Quantity must be positive for INBOUND or OUTBOUND');
      return;
    }
    
    setLoading(true);
    setError(null);

    const txData = {
      item_id: item.id,
      type,
      quantity: numQuantity, // Send the number as-is (can be negative)
      notes,
    };

    try {
      await createTransaction(txData);
      setLoading(false);
      onSuccess(); // Tell the parent page to refetch items
      onClose();   // Close the modal
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Failed to log transaction');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Item</label>
        <input
          type="text"
          className="w-full rounded-md border bg-gray-100 p-2 text-gray-900"
          value={item.name}
          disabled // This field is not editable
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Type*</label>
        <select
          className="w-full rounded-md border bg-white p-2 text-gray-900"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="INBOUND">INBOUND (Receiving Stock)</option>
          <option value="OUTBOUND">OUTBOUND (Shipping/Sale)</option>
          <option value="ADJUSTMENT">ADJUSTMENT (Correction/Damage)</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Quantity*</label>
        <p className="mb-1 text-xs text-gray-500">
          {type === 'ADJUSTMENT' 
            ? 'Use a negative number (e.g., -3) for damage/loss.' 
            : 'Must be a positive number.'
          }
        </p>
        <input
          type="number"
          className="w-full rounded-md border p-2 text-gray-900"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          className="w-full rounded-md border p-2 text-gray-900"
          rows="3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
          className="rounded-md bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Transaction'}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;