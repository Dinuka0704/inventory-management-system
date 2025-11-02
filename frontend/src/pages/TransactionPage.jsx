// /frontend/src/pages/TransactionPage.jsx
import { useState, useEffect } from 'react';
import { getTransactions } from '../services/api';

function TransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await getTransactions();
        setTransactions(response.data);
      } catch (err) {
        setError('Failed to fetch transactions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) return <div>Loading transaction history...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Transaction History</h1>
      
      {/* Transaction Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {new Date(tx.created_at).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{tx.item_name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    tx.type === 'INBOUND' ? 'bg-green-100 text-green-800' :
                    tx.type === 'OUTBOUND' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className={`whitespace-nowrap px-6 py-4 text-sm font-bold ${
                  tx.quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{tx.user_name || 'N/A'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{tx.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionPage;