// /frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider (the "box")
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // This effect runs on app load to check if a token is in local storage
  useEffect(() => {
    const loadUserFromToken = async () => {
      if (token) {
        // Set the auth header for all future axios requests
        axios.defaults.headers.common['x-auth-token'] = token;
        
        try {
          // Use our protected /api/auth/me route
          const { data } = await axios.get('http://localhost:5000/api/auth/me');
          setUser(data.user); // We get back { id, role }
        } catch (err) {
          console.error("Token invalid, logging out.");
          logout(); // Token is bad, so clear it
        }
      }
      setLoading(false);
    };
    loadUserFromToken();
  }, [token]);

  // Login function
  const login = (tokenData) => {
    localStorage.setItem('token', tokenData.token);
    setToken(tokenData.token);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };
  
  // The values we share with the rest of the app
  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'Admin',
    isKeeper: user?.role === 'Keeper' || user?.role === 'Admin',
    isWorker: user?.role === 'Worker' || user?.role === 'Keeper' || user?.role === 'Admin',
  };

  // 3. Return the Provider, wrapping the app
  // We show a loading screen while we verify the token
  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}

// 4. Create a custom hook to easily use the context
export function useAuth() {
  return useContext(AuthContext);
}