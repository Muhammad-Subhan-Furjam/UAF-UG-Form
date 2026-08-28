import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

import universityBg from "../../assets/university-bg.jpeg";
import universityLogo from "../../assets/university-logo.jpeg";
import api from "../../api/api";

const Login = () => {
  const [role, setRole] = useState("student");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    setRole(e.target.value);

    // Clear previous values when switching role
    setUserId("");
    setPassword("");
  };

  const handleUserIdChange = (e) => {
    let val = e.target.value;
    if (role === "coordinator") {
      val = val.slice(0, 8);
    }
    setUserId(val);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/users/login", {
        userId: userId.trim(),
        password,
        role,
      });

      console.log(response.data);

      // save token
      localStorage.setItem("token", response.data.token);

      // save user information
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert("Login Successful");

      if (response.data.user.role === "student") {
        navigate("/student/dashboard");
      } else if (response.data.user.role === "coordinator") {
        navigate("/coordinator/dashboard");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <main
      className="login-page"
      style={{ backgroundImage: `url(${universityBg})` }}
    >
      <div className="login-card">
        {/* HEADER */}
        <div className="login-header">
          <div>
            <h1>Welcome Back</h1>
            <p>Login to your account</p>
          </div>

          <img
            src={universityLogo}
            alt="University Logo"
            className="login-logo"
          />
        </div>

        {/* LOGIN FORM */}
        <form className="login-form" onSubmit={handleLogin}>
          {/* USER ID */}
          <div className="form-group">
            <label htmlFor="userId">
              {role === "student" ? "AG Number" : "Employee ID"}
            </label>

            <input
              id="userId"
              type="text"
              value={userId}
              onChange={handleUserIdChange}
              placeholder={
                role === "student"
                  ? "e.g. 2024-ag-1234"
                  : "e.g. 12345678 (5-8 digits)"
              }
              maxLength={role === "coordinator" ? 8 : undefined}
              required
            />
            {role === "student" ? (
              <small className="login-hint-text">
                Format: 4-digit year-ag-4-digit number (e.g. 2024-ag-1234)
              </small>
            ) : (
              <small className="login-hint-text">
                Must be between 5 and 8 digits/characters long
              </small>
            )}
          </div>

          {/* PASSWORD WITH EYE TOGGLE */}
          <div className="form-group password-group">
            <label htmlFor="password">Password</label>

            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          {/* ROLE */}
          <div className="role-section">
            <h2>Select your Role</h2>

            <div className="role-options">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === "student"}
                  onChange={handleRoleChange}
                />

                <span>Student</span>
              </label>

              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="coordinator"
                  checked={role === "coordinator"}
                  onChange={handleRoleChange}
                />

                <span>Coordinator</span>
              </label>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button type="submit" className="login-btn">
            Login
          </button>

          {/* SIGNUP LINK */}
          <p className="signup-text">
            Don’t have an account?
            <Link to="/signup" state={{ role }}>
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default Login;
