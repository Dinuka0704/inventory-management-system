// /frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // If user is not logged in, redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, show the page they are trying to access
  return children;
}

export default ProtectedRoute;