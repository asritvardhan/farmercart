import React, { useState, useEffect } from "react";
import logo from "../assets/logo.jpg";
import Home from "./Home";
import "../styles/userDashboard.css";
import LogoutButton from "../components/LogoutButton";
import Cart from "../pages/Cart";
import Profile from "../pages/Profile";
import Orders from "../pages/UserOrders";

const UserDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("Home");
  
  // ✅ Search/filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriceRange, setFilterPriceRange] = useState([0, 10000]); // example range

  const renderTab = () => {
    switch (activeTab) {
      case "Home":
        return (
          <div>
            {/* ✅ Search and Filter UI */}
            <div className="filters p-4 flex gap-4 items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border p-2 rounded w-64"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">All Categories</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains">Grains</option>
              </select>
              {/* You can add a price slider or min/max inputs */}
            </div>

            <Home
              searchQuery={searchQuery}
              filterCategory={filterCategory}
              filterPriceRange={filterPriceRange}
            />
          </div>
        );
      case "Cart":
        return <Cart />;
      case "Profile":
        return <Profile user={user} />;
      case "Orders":
        return <Orders />;
      case "logout":
        return <LogoutButton />;
      default:
        return <div>Home Section (Coming Soon)</div>;
    }
  };

  return (
    <div className="user-dashboard">
      <div className="user-navbar">
        <img src={logo} alt="FarmCart" className="logo" />
        <ul>
          <li className={activeTab === "Home" ? "active" : ""} onClick={() => setActiveTab("Home")}>
            Home
          </li>
          <li className={activeTab === "Orders" ? "active" : ""} onClick={() => setActiveTab("Orders")}>
            Orders
          </li>
          <li className={activeTab === "Cart" ? "active" : ""} onClick={() => setActiveTab("Cart")}>
            Cart
          </li>
          <li className={activeTab === "Profile" ? "active" : ""} onClick={() => setActiveTab("Profile")}>
            Profile
          </li>
          <li className={activeTab === "logout" ? "active" : ""} onClick={() => setActiveTab("logout")}>
            Logout
          </li>
        </ul>
      </div>
      <div className="user-content">{renderTab()}</div>
    </div>
  );
};

export default UserDashboard;
