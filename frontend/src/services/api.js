// /frontend/src/services/api.js
import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export all your API functions
export const getItems = () => api.get("/items");
export const getCategories = () => api.get("/categories"); // We'll use this now
export const createItem = (itemData) => api.post("/items", itemData); // Add this
export const createTransaction = (txData) => api.post("/transactions", txData);
export const updateItem = (id,itemData) => api.put(`/items/${id}`, itemData);
export const deactivateItem = (id) => api.delete(`/items/${id}/deactivate`);
export const createCategory = (name) => api.post('/categories', { name });
export const updateCategory = (id, name) => api.put(`/categories/${id}`, { name });
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
export const getTransactions = () => api.get('/transactions');
export const getUsers = () => api.get('/users');
export const registerUser = (userData) => api.post('/auth/register', userData);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);

export default api;
