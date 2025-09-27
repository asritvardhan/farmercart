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
      if (registrationForm.role === "farmer" && !registrationForm.location)
        newErrors.location = "Location is required for farmers";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isLogin) setLoginForm({ ...loginForm, [name]: value });
    else setRegistrationForm({ ...registrationForm, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
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
      const endpoint = isLogin
        ? `${import.meta.env.VITE_API_URL}/api/auth/login`
        : `${import.meta.env.VITE_API_URL}/api/auth/register`;
      const data = isLogin ? loginForm : registrationForm;
      const response = await axios.post(endpoint, data);

      const { token, user } = response.data;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // Redirect based on role & status
      if (user.role === "farmer") {
        if (user.status === "pending") navigate("/farmer/pending");
        else if (user.status === "rejected") navigate("/farmer/rejected");
        else navigate("/farmer/dashboard");
      } else if (user.role === "user") {
        navigate("/user/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "An error occurred. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {!isLogin && (
          <>
            <input type="text" name="name" placeholder="Full Name" value={registrationForm.name} onChange={handleChange} />
            {errors.name && <span className="error">{errors.name}</span>}

            <input type="text" name="pincode" placeholder="Pincode" value={registrationForm.pincode} onChange={handleChange} />
            {errors.pincode && <span className="error">{errors.pincode}</span>}

            <select name="role" value={registrationForm.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="farmer">Farmer</option>
            </select>

            {registrationForm.role === "farmer" && (
              <>
                <input type="text" name="location" placeholder="Location (e.g. Hyderabad)" value={registrationForm.location} onChange={handleChange} />
                {errors.location && <span className="error">{errors.location}</span>}
                <p>As a farmer, your registration will be reviewed by admin.</p>
              </>
            )}
          </>
        )}

        <input type="email" name="email" placeholder="Email" value={isLogin ? loginForm.email : registrationForm.email} onChange={handleChange} />
        {errors.email && <span className="error">{errors.email}</span>}

        <input type="password" name="password" placeholder="Password" value={isLogin ? loginForm.password : registrationForm.password} onChange={handleChange} />
        {errors.password && <span className="error">{errors.password}</span>}

        <button type="submit" disabled={isLoading}>{isLoading ? "Please wait..." : isLogin ? "Login" : "Register"}</button>
        <p onClick={toggleForm}>{isLogin ? "Don't have an account? Register" : "Already have an account? Login"}</p>
      </form>
    </div>
  );
};

export default AuthForm;
