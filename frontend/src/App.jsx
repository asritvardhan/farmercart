import React, { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import FarmerDashboard from "./pages/FarmerDashboard";
import AdminDashboard from "./pages/AdminDashboard"
import FarmerPending from "./pages/FarmerPending";
import UserDashboard from "./pages/UserDashboard";
import FarmerProducts from "./pages/FarmerProducts";
import ProductDetail from "./pages/ProductDetail";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Login/Signup page */}
        <Route path="/" element={<AuthPage setUser={setUser} />} />

        {/* Dashboards */}
        <Route
          path="/farmer/dashboard"
          element={user ? <FarmerDashboard user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/dashboard"
          element={user ? <AdminDashboard user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/user/dashboard"
          element={user ? <UserDashboard user={user} /> : <Navigate to="/" />}
        />
        <Route path="/farmer/pending" element={user?<FarmerPending user={user}/>:<Navigate to="/"/>}/>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/farmer/:farmerId" element={<FarmerProducts />} />
        <Route path="/products/:productId" element={<ProductDetail />} />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
