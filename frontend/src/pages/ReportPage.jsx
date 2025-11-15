// /frontend/src/pages/ReportsPage.jsx
import { useState, useEffect } from 'react';
import { getStockValueHistory } from '../services/api';
import StockValueChart from '../components/StockValueChart';

function ReportsPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getStockValueHistory();
        setHistory(res.data);
      } catch (err) {
        setError('Failed to fetch report data');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reports</h1>

      <div className="rounded-lg bg-white p-6 shadow-md">
        {loading && <div>Loading chart data...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {(!loading && !error && history.length > 0) && (
          <StockValueChart chartData={history} />
        )}
        {(!loading && !error && history.length === 0) && (
          <div>No transaction data found to build a chart.</div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;