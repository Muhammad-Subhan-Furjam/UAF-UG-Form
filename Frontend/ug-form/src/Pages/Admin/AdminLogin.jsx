import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./AdminLogin.css";
import universityBg from "../../assets/university-bg.jpeg";
import logo from "../../assets/university-logo.jpeg";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@uaf.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await api.post("/admin/login", {
        email: email.trim(),
        password: password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin Login Error:", error);
      setErrorMessage(
        error.response?.data?.message || "Invalid Super Admin credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-login-container"
      style={{ backgroundImage: `url(${universityBg})` }}
    >
      <div className="admin-login-overlay">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <img src={logo} alt="UAF Logo" className="admin-login-logo" />
            <h2>Super Admin Portal</h2>
            <p>System Administration & Centralized Governance</p>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label>Super Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@uaf.com"
                required
              />
            </div>

            <div className="form-group password-group">
              <label>Super Admin Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Super Admin password"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {errorMessage && <p className="admin-error-text">{errorMessage}</p>}

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login to System Portal"}
            </button>
          </form>

          <div className="admin-footer-note">
            <small>🔒 Authorised Super Admin Access Only</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
