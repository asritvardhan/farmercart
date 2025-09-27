// UserOrders.js - FIXED STATUS HANDLING
import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/progressBar.css";

const statusSteps = ["Pending", "Accepted", "Shipped", "Delivered", "Cancelled"];

const UserOrders = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders - FIXED
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/orders/${userId}`);
      console.log("Fetched orders:", res.data); // Debug log
      setOrders(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchOrders();

    const socket = io(`${import.meta.env.VITE_API_URL}`);
    socket.emit("joinRoom", userId);

    socket.on("orderUpdated", (updatedOrder) => {
      console.log("Order updated via socket:", updatedOrder); // Debug log
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    });

    return () => socket.disconnect();
  }, [userId]);

  // Cancel individual item - FIXED
  const cancelItem = async (orderId, itemId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/orders/${orderId}/items/${itemId}/cancel`
      );
      
      console.log("Cancel response:", response.data); // Debug log
      
      // Update local state with the returned order
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? response.data.order : order
        )
      );
      
      alert("Item cancelled successfully!");
    } catch (err) {
      console.error("Cancel error:", err);
      alert(err.response?.data?.message || "Failed to cancel item");
    }
  };

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
  if (!orders.length) return <p className="p-6">You have no orders yet.</p>;

  return (
    <div className="orders-container p-6">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      
      {orders.map((order) => {
        // Group items by farmer - FIXED
        const itemsByFarmer = order.items.reduce((acc, item) => {
          const farmerId = item.farmer?._id || "unknown";
          if (!acc[farmerId]) {
            acc[farmerId] = {
              farmerName: item.farmer?.name || "Farm Fresh",
              farmer: item.farmer,
              items: []
            };
          }
          acc[farmerId].items.push(item);
          return acc;
        }, {});

        return (
          <div key={order._id} className="order-card bg-white border rounded-lg p-6 mb-6 shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p><b>Order ID:</b> {order._id.slice(-8)}</p>
                <p><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p><b>Total:</b> ₹{order.totalPrice}</p>
                <p><b>Payment:</b> {order.paymentMethod}</p>
              </div>
              <div>
                <p><b>Address:</b> {order.address}</p>
                <p><b>Order Status:</b> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </p>
              </div>
            </div>

            {Object.keys(itemsByFarmer).map((farmerId) => {
              const { farmerName, farmer, items: farmerItems } = itemsByFarmer[farmerId];
              
              // Calculate progress for this farmer's items
              const statusIndexes = farmerItems.map(item => 
                statusSteps.indexOf(item.status)
              ).filter(index => index !== -1); // Remove invalid indexes
              
              const maxStatusIndex = statusIndexes.length > 0 ? Math.max(...statusIndexes) : 0;

              return (
                <div key={farmerId} className="farmer-progress mb-6 p-4 border rounded bg-gray-50">
                  <h4 className="text-lg font-semibold mb-3">
                    🚜 Farmer: {farmerName}
                    {farmer?.phone && <span className="text-sm text-gray-600 ml-2">📞 {farmer.phone}</span>}
                  </h4>

                  {/* Progress Bar */}
                  <div className={`progress-bar mb-4 ${farmerItems.every(i => i.status === "Cancelled") ? "cancelled-bar" : ""}`}>
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= maxStatusIndex;
                      const isCurrent = index === maxStatusIndex;
                      
                      return (
                        <div key={step} className={`progress-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}>
                          <div className="circle">
                            {farmerItems.every(i => i.status === "Cancelled") ? "✖" : 
                             isCompleted ? "✔" : index + 1}
                          </div>
                          <span className="step-label">{step}</span>
                          {index < statusSteps.length - 1 && (
                            <div className={`connector ${isCompleted ? "completed" : ""}`}></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Items List */}
                  <div className="order-items space-y-3">
                    {farmerItems.map((item) => (
                      <div key={item._id} className="order-item-card flex justify-between items-center p-3 border rounded bg-white">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{item.product?.name}</p>
                          <p className="text-gray-600">Quantity: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}</p>
                          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(item.status)}`}>
                            Status: {item.status}
                            {item.cancelledAt && ` (Cancelled on ${new Date(item.cancelledAt).toLocaleDateString()})`}
                          </span>
                        </div>
                        
                        <div>
                          {["Pending", "Accepted"].includes(item.status) && (
                            <button
                              className="cancel-btn bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                              onClick={() => cancelItem(order._id, item._id)}
                            >
                              Cancel Item
                            </button>
                          )}
                          {item.status === "Cancelled" && (
                            <span className="cancelled-label bg-gray-200 px-3 py-2 rounded text-gray-700">
                              ❌ Cancelled
                            </span>
                          )}
                          {["Shipped", "Delivered"].includes(item.status) && (
                            <span className="completed-label bg-green-200 px-3 py-2 rounded text-green-700">
                              ✓ {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default UserOrders;