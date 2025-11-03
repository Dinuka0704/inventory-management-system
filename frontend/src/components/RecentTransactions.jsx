// /frontend/src/components/RecentTransactions.jsx
import { useState, useEffect } from 'react';
import { getTransactions } from '../services/api';

function RecentTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        // We use our modified function to get just the last 5
        const res = await getTransactions(5);
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch recent transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, []);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-xl font-semibold text-gray-900">Recent Activity</h3>
      {loading && <div>Loading...</div>}
      {!loading && transactions.length === 0 && <div className="text-gray-500">No recent transactions.</div>}
      
      <div className="divide-y divide-gray-200">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-gray-900">{tx.item_name}</div>
              <div className="text-sm text-gray-500">
                {tx.type} by {tx.user_name || 'N/A'}
              </div>
            </div>
            <div className={`text-lg font-bold ${
              tx.quantity > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentTransactions;