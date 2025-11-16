import { useState, useEffect, useCallback } from "react";
import { getItems, deactivateItem } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import AddItemForm from "../components/AddItemForm";
import EditItemForm from "../components/EditItemForm";
import TransactionForm from "../components/TransactionForm";

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { isKeeper } = useAuth();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getItems();
      setItems(response.data);
    } catch (err) {
      setError("Failed to fetch items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsTxModalOpen(false);
    setSelectedItem(null);
  };

  const handleAdjestClick = (item) => {
    setSelectedItem(item);
    setIsTxModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      await deactivateItem(selectedItem.id);
      fetchItems(); // Refresh the list
      handleCloseModals(); // Close the modal
    } catch (err) {
      console.error("Failed to deactivate item", err);
      alert("Failed to deactivate item. It might be in use.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        {isKeeper && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-lg transition duration-300 hover:bg-indigo-700"
          >
            + Add New Item
          </button>
        )}
      </div>

      {/* Item Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* ... (other headers) ... */}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Stock Actions
              </th>
              {isKeeper && (
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Item Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {/* ... (other table data) ... */}
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {item.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {item.category_name || "N/A"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                  {item.current_stock}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => handleAdjestClick(item)}
                    className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 transition hover:bg-blue-200"
                  >
                    Adjust
                  </button>
                </td>

                {isKeeper && (
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="ml-4 text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        title="Add New Item"
      >
        <AddItemForm onClose={handleCloseModals} onSuccess={fetchItems} />
      </Modal>

      {/* Edit Item Modal */}
      {selectedItem && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          title={`Edit ${selectedItem.name}`}
        >
          <EditItemForm
            item={selectedItem}
            onClose={handleCloseModals}
            onSuccess={fetchItems}
          />
        </Modal>
      )}

      {selectedItem && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseModals}
          title="Confirm Deactivation"
        >
          <div>
            <p className="text-gray-700">
              Are you sure you want to deactivate{" "}
              <strong>{selectedItem.name}</strong>?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              This item will be hidden from the list, but its transaction
              history will be preserved.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModals}
                className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-white shadow transition hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deactivating..." : "Deactivate Item"}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {selectedItem && (
        <Modal
          isOpen={isTxModalOpen}
          onClose={handleCloseModals}
          title={`Log Transaction for ${selectedItem.name}`}
        >
          <TransactionForm
            item={selectedItem}
            onClose={handleCloseModals}
            onSuccess={() => {
              fetchItems(); // Refetch the items list after success
            }}
          />
        </Modal>
      )}

    </div>
  );
}

export default InventoryPage;
