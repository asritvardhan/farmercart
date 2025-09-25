import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './index.css';

import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import PendingApproval from "./pages/PendingApproval";
import UserDashboard from "./pages/UserDashboard";

import BrowseProducts from "./pages/BrowseProducts";
import ProductDetail from "./pages/ProductDetail";
import ActiveOrders from "./pages/ActiveOrders";
import OrderHistory from "./pages/OrderHistory";
import Cart from "./pages/Cart";
import LogoutButton from "./components/LogoutButton";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Navbar from "./components/Navbar";
import "./styles/userPanel.css";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      {/* ✅ Show Navbar only once for user */}
      {user?.role === 'user' && <Navbar setUser={setUser} />}

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<AuthPage setUser={setUser} />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            user?.role === 'admin'
              ? <AdminDashboard user={user} setUser={setUser} />
              : <Navigate to="/" />
          }
        />

        {/* Farmer Routes */}
        <Route
          path="/farmer/dashboard"
          element={
            user?.role === 'farmer'
              ? (user.status === 'pending'
                ? <Navigate to="/pending-approval" />
                : <FarmerDashboard user={user} setUser={setUser} />)
              : <Navigate to="/" />
          }
        />
        <Route
          path="/pending-approval"
          element={
            user?.role === 'farmer' && user.status === 'pending'
              ? <PendingApproval />
              : <Navigate to="/" />
          }
        />

        {/* User Routes */}
        <Route
          path="/user/dashboard"
          element={
            user?.role === 'user'
              ? <UserDashboard />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/user/products"
          element={
            user?.role === 'user'
              ? <BrowseProducts />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/user/product/:id"
          element={
            user?.role === 'user'
              ? <ProductDetail />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/user/orders"
          element={
            user?.role === 'user'
              ? <ActiveOrders />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/user/history"
          element={
            user?.role === 'user'
              ? <OrderHistory />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/user/cart"
          element={
            user?.role === 'user'
              ? <Cart />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/user/wishlist"
          element={
            user?.role === 'user'
              ? <Wishlist />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/user/checkout"
          element={
            user?.role === 'user'
              ? <Checkout />
              : <Navigate to="/" />
          }
        />

        {/* Logout */}
        <Route path="/logout" element={<LogoutButton setUser={setUser} />} />

        {/* Fallback to Auth Page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
