import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthForm = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    email: "",
    password: "",
    pincode: "",
    location: "",
    role: "user",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (isLogin) {
      if (!loginForm.email) newErrors.email = "Email is required";
      if (!loginForm.password) newErrors.password = "Password is required";
    } else {
      if (!registrationForm.name) newErrors.name = "Name is required";
      if (!registrationForm.email) newErrors.email = "Email is required";
      if (!registrationForm.password) newErrors.password = "Password is required";
      if (!registrationForm.pincode) newErrors.pincode = "Pincode is required";
      if (registrationForm.role === "farmer" && !registrationForm.location) {
        newErrors.location = "Location is required for farmers";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isLogin) {
      setLoginForm({ ...loginForm, [name]: value });
    } else {
      setRegistrationForm({ ...registrationForm, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const data = isLogin ? loginForm : registrationForm;
      const response = await axios.post(endpoint, data);

      if (response.status === 200 || response.status === 201) {
        const { token, user } = response.data;

        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        if (user.role === "farmer") {
          if (user.status === "pending") navigate("/farmer/pending");
          else if (user.status === "rejected") navigate("/farmer/rejected");
          else navigate("/farmer/dashboard");
        } else if (user.role === "user") {
          navigate("/user/dashboard");
        } else if (user.role === "admin") {
          navigate("/admin/dashboard");
        }
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      alert(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {!isLogin && (
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              value={registrationForm.name}
              required
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
        )}

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={isLogin ? loginForm.email : registrationForm.email}
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={isLogin ? loginForm.password : registrationForm.password}
            required
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        {!isLogin && (
          <>
            <div className="form-group">
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                onChange={handleChange}
                value={registrationForm.pincode}
                required
              />
              {errors.pincode && <span className="error">{errors.pincode}</span>}
            </div>

            <div className="form-group">
              <select name="role" onChange={handleChange} value={registrationForm.role}>
                <option value="user">User</option>
                <option value="farmer">Farmer</option>
              </select>
            </div>

            {registrationForm.role === "farmer" && (
              <div className="form-group">
                <input
                  type="text"
                  name="location"
                  placeholder="Location (e.g. Hyderabad)"
                  onChange={handleChange}
                  value={registrationForm.location}
                  required
                />
                {errors.location && <span className="error">{errors.location}</span>}
              </div>
            )}
          </>
        )}

        {registrationForm.role === "farmer" && !isLogin && (
          <p className="info">
            As a farmer, your registration will be reviewed by admin. You will be notified once your account is approved.
          </p>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>

        <p className="toggle" onClick={toggleForm}>
          {isLogin ? "Don't have an account? Register here." : "Already have an account? Login here."}
        </p>
      </form>
    </div>
  );
};

export default AuthForm;