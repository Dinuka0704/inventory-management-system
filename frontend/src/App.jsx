// /frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import Pages and Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import CategoryPage from './pages/CategoryPage';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRout';
import TransactionPage from './pages/TransactionPage';
import UserManagementPage from './pages/UserManagementPage';
import ReportsPage from './pages/ReportPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* PUBLIC ROUTE:
        If logged in, redirect from /login to /dashboard
      */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />

      {/* PRIVATE ROUTES:
        All routes wrapped by ProtectedRoute require login.
        They all share the MainLayout (sidebar, etc.).
      */}
      <Route 
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Child routes of MainLayout */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="categories" element={<CategoryPage />} />
        <Route path="transactions" element={<TransactionPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="reports" element={<ReportsPage />} />
        {/* <Route path="users" element={<UserManagementPage />} /> */}
      </Route>

      {/* 404 Not Found Page */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;