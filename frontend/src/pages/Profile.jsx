import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/profile.css";

const Profile = ({ user, onProfileUpdate }) => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: ""
    },
    profilePicture: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, memberSince: "" });
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?._id) {
      fetchProfileData();
    }
  }, [user?._id]);

  const fetchProfileData = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/profile/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Ensure address object has all required fields
      const profileData = {
        ...res.data,
        address: {
          street: res.data.address?.street || "",
          city: res.data.address?.city || "",
          state: res.data.address?.state || "",
          pincode: res.data.address?.pincode || "",
          landmark: res.data.address?.landmark || ""
        }
      };
      
      setProfile(profileData);
      setStats(res.data.stats || { totalOrders: 0, totalSpent: 0, memberSince: "" });
      setRecentOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.error || "Failed to load profile");
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/profile/${user._id}/update`,
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(res.data.user);
      setEditMode(false);
      onProfileUpdate?.(res.data.user);
      alert("Profile updated successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update profile";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // SINGLE handleChangePassword function (removed the duplicate)
  const handleChangePassword = async () => {
    // Validate all fields are filled
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/profile/${user._id}/update`,
        {
          currentPassword: passwordData.currentPassword.trim(),
          newPassword: passwordData.newPassword.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPasswordMode(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      alert("Password changed successfully!");
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to change password";
      setError(errorMsg);
      alert(errorMsg);
      console.error("Password change error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (!user?._id) {
    return (
      <div className="profile-container">
        <div className="error-message">User not loaded. Please log in again.</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {error && <div className="error-message">{error}</div>}
      
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {profile.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{profile.name || "User"}</h1>
          <p>{profile.email}</p>
          <p>Member since {stats.memberSince ? new Date(stats.memberSince).toLocaleDateString() : "N/A"}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>{stats.totalOrders || 0}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <h3>₹{(stats.totalSpent || 0).toLocaleString()}</h3>
          <p>Total Spent</p>
        </div>
      </div>

      <div className="profile-sections">
        {/* Personal Information Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            {!editMode && !passwordMode && (
              <button 
                className="btn-edit"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  disabled
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="address-fields">
                <h4>Address</h4>
                <input type="text" name="address.street" placeholder="Street" value={profile.address.street} onChange={handleProfileChange} />
                <input type="text" name="address.city" placeholder="City" value={profile.address.city} onChange={handleProfileChange} />
                <input type="text" name="address.state" placeholder="State" value={profile.address.state} onChange={handleProfileChange} />
                <input type="text" name="address.pincode" placeholder="Pincode" value={profile.address.pincode} onChange={handleProfileChange} />
                <input type="text" name="address.landmark" placeholder="Landmark" value={profile.address.landmark} onChange={handleProfileChange} />
              </div>

              <div className="form-actions">
                <button 
                  className="btn-save"
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <p><strong>Name:</strong> {profile.name || "Not provided"}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Phone:</strong> {profile.phone || "Not provided"}</p>
              <p><strong>Address:</strong> {profile.address?.street ? 
                `${profile.address.street}, ${profile.address.city}, ${profile.address.state} - ${profile.address.pincode}` 
                : "Not provided"}</p>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Security</h2>
            {!passwordMode && !editMode && (
              <button 
                className="btn-change-password"
                onClick={() => setPasswordMode(true)}
              >
                Change Password
              </button>
            )}
          </div>

          {passwordMode && (
            <div className="password-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="form-actions">
                <button 
                  className="btn-save"
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => setPasswordMode(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Orders Section */}
        <div className="profile-section">
          <h2>Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <div className="recent-orders">
              {recentOrders.map(order => (
                <div key={order._id} className="order-item">
                  <span>Order #{order._id?.slice(-6) || "N/A"}</span>
                  <span>₹{order.totalPrice}</span>
                  <span className={`status-${order.status?.toLowerCase() || "pending"}`}>
                    {order.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;