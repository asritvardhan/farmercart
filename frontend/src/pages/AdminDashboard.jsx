import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/adminDashboard.css";
import LogoutButton from "../components/LogoutButton"
const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const response = await axios.get("${import.meta.env.VITE_API_URL}/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchFarmers = async () => {
    try {
      const response = await axios.get("${import.meta.env.VITE_API_URL}/api/admin/farmers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFarmers(response.data);
    } catch (err) {
      console.error("Error fetching farmers:", err);
    }
  };

  const updateFarmerStatus = async (farmerId, status) => {
    if (!farmerId) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/farmers/${farmerId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFarmers(); // refresh list
    } catch (err) {
      console.error("Error updating farmer status:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchFarmers();
  }, []);

  const counts = farmers.reduce(
    (acc, f) => {
      const key = f.status || "pending";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 }
  );

  const renderFarmers = () => (
    <div>
      {/* Summary cards */}
      <div className="summary-cards">
        <div className="card pending">Pending: {counts.pending}</div>
        <div className="card approved">Approved: {counts.approved}</div>
        <div className="card rejected">Rejected: {counts.rejected}</div>
      </div>

      {/* Farmers table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {farmers.length === 0 ? (
            <tr>
              <td colSpan="4">No farmers found</td>
            </tr>
          ) : (
            farmers.map((farmer) => (
              <tr key={farmer._id}>
                <td>{farmer.name}</td>
                <td>{farmer.email}</td>
                <td>{farmer.status}</td>
                <td>
                  {farmer.status === "pending" ? (
                    <>
                      <button
                        onClick={() => updateFarmerStatus(farmer._id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateFarmerStatus(farmer._id, "rejected")}
                        style={{ marginLeft: "10px" }}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderUsers = () => (
    <div>
      <h2>Users List</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u._id}>
              {u.name} - {u.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderProducts = () => <h2>Products Page (Coming Soon)</h2>;
  const renderAccount = () => <h2>Account Page (Coming Soon)</h2>;

  return (
    <div className="admin-dashboard">
      <nav className="admin-navbar">
        <div className="logo">🌾 AgroAdmin</div>
        <div className="nav-links">
          <button onClick={() => setActiveTab("users")}>Users</button>
          <button onClick={() => setActiveTab("farmers")}>Farmers</button>
          <button onClick={() => setActiveTab("products")}>Products</button>
          <button onClick={() => setActiveTab("account")}>Account</button>
          <LogoutButton/>
        </div>
      </nav>

      <main className="admin-content">
        <h1>Welcome, {user?.name || "Admin"}!</h1>
        {activeTab === "users" && renderUsers()}
        {activeTab === "farmers" && renderFarmers()}
        {activeTab === "products" && renderProducts()}
        {activeTab === "account" && renderAccount()}
      </main>
    </div>
  );
};

export default AdminDashboard;
