// /frontend/src/components/LowStockItems.jsx
import { useState, useEffect } from 'react';
import { getLowStockItems } from '../services/api';
import { useAuth } from '../context/AuthContext';

function LowStockItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isKeeper } = useAuth(); // Check role

  useEffect(() => {
    // Only fetch this data if the user is a Keeper or Admin
    if (isKeeper) {
      const fetchItems = async () => {
        try {
          const res = await getLowStockItems();
          setItems(res.data);
        } catch (err) {
          console.error("Failed to fetch low stock items", err);
        } finally {
          setLoading(false);
        }
      };
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [isKeeper]);

  // Don't render anything if the user is not a Keeper/Admin
  if (!isKeeper) {
    return null;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-xl font-semibold text-red-600">Low Stock Report</h3>
      {loading && <div>Loading...</div>}
      {!loading && items.length === 0 && (
        <div className="text-gray-500">All items are well-stocked.</div>
      )}
      
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-sm text-gray-500">SKU: {item.sku}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-600">{item.current_stock}</div>
              <div className="text-xs text-gray-500">/ {item.reorder_level}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LowStockItems;