// /frontend/src/pages/Dashboard.jsx
import React from "react";
import { useState, useEffect } from "react";
import { getItems} from "../services/api";
import { getCategories } from "../services/api";

import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [catogary, setCatogary] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const response = await getItems();
      setItems(response.data);
    };
    const fetchCatogary = async () => {
      const response = await getCategories();
      setCatogary(response.data);
    };

    fetchItems();
    fetchCatogary();
  }, []);

  return (
    <div className="container mx-auto px-4">

      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        Welcome, {user?.username || user?.role || "User"}!
      </h1>
      <p className="text-gray-700 mb-6">
        This is your main dashboard. You can add summary cards, charts, or quick
        actions here.
      </p>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Total Items
          </h3>
          <p className="text-3xl font-bold text-indigo-600">{items.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Low Stock Items
          </h3>
          <p className="text-3xl font-bold text-orange-600">0</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Categories
          </h3>
          <p className="text-3xl font-bold text-green-600">{catogary.length}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
