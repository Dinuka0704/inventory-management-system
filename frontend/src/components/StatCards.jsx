// /frontend/src/components/StatsCards.jsx
import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';

function StatsCards() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center">Loading stats...</div>;
  }
  
  if (!stats) {
    return <div className="text-center text-red-500">Could not load stats.</div>;
  }

  // Helper component for each card
  const StatCard = ({ title, value, bgColor }) => (
    <div className={`rounded-lg ${bgColor} p-6 text-white shadow-lg`}>
      <div className="text-sm font-medium uppercase">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <StatCard 
        title="Total Items" 
        value={stats.totalItems} 
        bgColor="bg-indigo-600"
      />
      <StatCard 
        title="Total Stock Units" 
        value={stats.totalStock} 
        bgColor="bg-blue-600"
      />
      <StatCard 
        title="Low Stock Items" 
        value={stats.lowStockItems} 
        bgColor={stats.lowStockItems > 0 ? "bg-red-600" : "bg-green-600"}
      />
    </div>
  );
}

export default StatsCards;