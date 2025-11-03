// /frontend/src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import StatCards from '../components/StatCards';
import RecentTransactions from '../components/RecentTransactions';
import LowStockItems from '../components/LowStockItems';

function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        Welcome, {user.username || user.role}!
      </h1>
      
      {/* 1. Stats Cards */}
      <StatCards />
      
      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Transactions (takes 2/3 space on large screens) */}
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        
        <div className="lg:col-span-1">
          <LowStockItems />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;