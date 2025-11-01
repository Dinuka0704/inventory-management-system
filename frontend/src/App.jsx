// /frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import Pages and Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRout';

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
        {/* <Route path="users" element={<UserManagementPage />} /> */}
      </Route>

      {/* 404 Not Found Page */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;