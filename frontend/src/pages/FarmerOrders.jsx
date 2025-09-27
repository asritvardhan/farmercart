// FarmerOrders.js - FIXED STATUS UPDATES
import React, { useEffect, useState } from "react";
import axios from "axios";

const statusSteps = ["Pending", "Accepted", "Shipped", "Delivered", "Cancelled"];

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/farmer/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Farmer orders:", res.data); // Debug
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update status for a specific order item - FIXED
  const updateStatus = async (orderId, itemId, newStatus) => {
    try {
      console.log("Updating status:", { orderId, itemId, newStatus }); // Debug
      
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/farmer/orders/${orderId}/status`,
        { itemId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Update response:", res.data); // Debug
      
      // Update the specific order in state
      setOrders(prevOrders =>
        prevOrders.map(order => 
          order._id === orderId ? res.data : order
        )
      );
      
      alert(`Status updated to ${newStatus} successfully!`);
    } catch (err) {
      console.error("Status update error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Accepted": return "bg-blue-100 text-blue-800";
      case "Shipped": return "bg-purple-100 text-purple-800";
      case "Delivered": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <p className="p-6">Loading orders...</p>;
  if (orders.length === 0) return <p className="p-6">No orders yet.</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      
      {orders.map(order => (
        <div key={order._id} className="border p-4 mb-6 rounded-lg shadow-md bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded">
            <div>
              <p><b>Order ID:</b> {order._id.slice(-8)}</p>
              <p><b>Customer:</b> {order.user?.name}</p>
              <p><b>Email:</b> {order.user?.email}</p>
            </div>
            <div>
              <p><b>Phone:</b> {order.user?.phone || 'N/A'}</p>
              <p><b>Address:</b> {order.address}</p>
              <p><b>Order Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <h3 className="font-semibold mb-3 text-lg">📦 My Products in this Order:</h3>
          
          {order.items.map(item => {
            const currentStatusIndex = statusSteps.indexOf(item.status);
            const canUpdate = !["Delivered", "Cancelled"].includes(item.status);

            return (
              <div key={item._id} className="border p-4 mb-3 rounded bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-medium text-lg">{item.product?.name}</p>
                    <p className="text-gray-600">Quantity: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}</p>
                    <p className={`inline-block px-3 py-1 rounded text-sm font-medium mt-2 ${getStatusColor(item.status)}`}>
                      Current Status: <strong>{item.status}</strong>
                      {item.cancelledAt && ` (Cancelled on ${new Date(item.cancelledAt).toLocaleDateString()})`}
                    </p>
                  </div>
                </div>

                {/* Status update buttons */}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Update Status:</p>
                  <div className="flex flex-wrap gap-2">
                    {statusSteps.map((step, index) => {
                      const isCurrent = item.status === step;
                      const isCompleted = index <= currentStatusIndex;
                      const isFuture = index > currentStatusIndex;
                      const isAllowed = index === currentStatusIndex + 1 || isCurrent; // Only allow next step or current
                      
                      return (
                        <button
                          key={step}
                          className={`px-4 py-2 rounded text-sm font-medium transition ${
                            isCurrent 
                              ? "bg-blue-600 text-white border-2 border-blue-600 shadow" 
                              : isCompleted && !isCurrent
                              ? "bg-green-500 text-white"
                              : isAllowed && canUpdate
                              ? "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          onClick={() => isAllowed && updateStatus(order._id, item._id, step)}
                          disabled={!isAllowed || !canUpdate}
                        >
                          {step}
                          {isCurrent && " ✓"}
                          {isCompleted && !isCurrent && " ✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cancel button - Only show for Pending/Accepted status */}
                {canUpdate && ["Pending", "Accepted"].includes(item.status) && (
                  <div className="mt-4">
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to cancel this item?")) {
                          updateStatus(order._id, item._id, "Cancelled");
                        }
                      }}
                    >
                      🚫 Cancel This Item
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default FarmerOrders;