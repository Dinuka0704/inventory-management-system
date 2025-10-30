// /frontend/src/components/MainLayout.jsx
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="p-5 text-2xl font-bold">IMS</div>
        <nav className="flex-1 p-4">
          <Link
            to="/dashboard"
            className="block rounded-md py-2.5 px-4 transition duration-200 hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link
            to="/inventory"
            className="block rounded-md py-2.5 px-4 transition duration-200 hover:bg-gray-700"
          >
            Inventory
          </Link>
          {/* We can add more links here later */}
        </nav>
        <div className="border-t border-gray-700 p-4">
          <div className="mb-2">
            Logged in as:{" "}
            <strong>{user?.username || user?.role || "User"}</strong>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-md bg-indigo-600 py-2 px-4 text-white shadow-lg transition duration-300 ease-in-out hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <Outlet /> {/* Child pages will be rendered here */}
      </main>
    </div>
  );
}

export default MainLayout;
