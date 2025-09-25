import React, { useState } from "react";
import MyProducts from "./MyProducts";
import AddProduct from "./AddProduct";
import logo from "../assets/logo.jpg";
import "../styles/farmerDashboard.css"; 
import LogoutButton from "../components/LogoutButton";
import FarmerOrders from "./FarmerOrders";

const FarmerDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("my-products");

  const renderTab = () => {
    switch (activeTab) {
      case "my-products":
        return <MyProducts />;
      case "add-product":
        return <AddProduct />;
      case "orders":
        return <FarmerOrders/>
      case "transactions":
        return <div>Transactions Section (Coming Soon)</div>;
      case "profile":
        return <div>Profile Section (Coming Soon)</div>;
      case "logout":
      return <LogoutButton/>
      default:
        return <MyProducts />;
    }
  };

  return (
    <div className="farmer-dashboard">
      {/* --- Navbar --- */}
      <nav className="farmer-navbar">
        <img src={logo} alt="FarmCart" className="logo" />
        <ul>
          <li className={activeTab === "my-products" ? "active" : ""} onClick={() => setActiveTab("my-products")}>
            My Products
          </li>
          <li className={activeTab === "add-product" ? "active" : ""} onClick={() => setActiveTab("add-product")}>
            Add Product
          </li>
          <li className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
            Orders
          </li>
          <li className={activeTab === "transactions" ? "active" : ""} onClick={() => setActiveTab("transactions")}>
            Transactions
          </li>
          <li className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
            Profile
          </li>
          <li className={activeTab === "logout" ? "active" : ""} onClick={() => setActiveTab("logout")}>
            Logout
          </li>
        </ul>
      </nav>

      {/* --- Main Content --- */}
      <main className="farmer-content">{renderTab()}</main>
    </div>
  );
};

export default FarmerDashboard;
