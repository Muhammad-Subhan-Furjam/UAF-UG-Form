import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Coordinator.css";

import universityBg from "../../../assets/university-bg.jpeg";
import universityLogo from "../../../assets/university-logo.jpeg";

const Coordinator = () => {
  const [role, setRole] = useState("coordinator");

  return (
    <main
      className="coordinator-login-page"
      style={{ backgroundImage: `url(${universityBg})` }}
    >
      <div className="coordinator-login-card">

        {/* =========================
            HEADER
        ========================== */}
        <div className="coordinator-login-header">
          <div>
            <h1>Welcome Back</h1>
            <p>Login to your account</p>
          </div>

          <img
            src={universityLogo}
            alt="University Logo"
            className="coordinator-login-logo"
          />
        </div>


        {/* =========================
            FORM
        ========================== */}
        <form className="coordinator-login-form">

          {/* Employee ID */}
          <div className="coordinator-form-group">
            <label htmlFor="employeeId">
              Employee id
            </label>

            <input
              type="text"
              id="employeeId"
              name="employeeId"
              placeholder="Enter Emp id"
            />
          </div>


          {/* Password */}
          <div className="coordinator-form-group coordinator-password-group">
            <label htmlFor="coordinatorPassword">
              Password
            </label>

            <input
              type="password"
              id="coordinatorPassword"
              name="password"
              placeholder="Enter Password"
            />

            <Link
              to="/forgot-password"
              className="coordinator-forgot-password"
            >
              Forgot Password?
            </Link>
          </div>


          {/* =========================
              ROLE
          ========================== */}
          <div className="coordinator-role-section">
            <h2>Select your Role</h2>

            <div className="coordinator-role-options">

              {/* Student */}
              <label className="coordinator-role-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === "student"}
                  onChange={(e) => setRole(e.target.value)}
                />

                <span>Student</span>
              </label>


              {/* Coordinator */}
              <label className="coordinator-role-option">
                <input
                  type="radio"
                  name="role"
                  value="coordinator"
                  checked={role === "coordinator"}
                  onChange={(e) => setRole(e.target.value)}
                />

                <span>Coordinator</span>
              </label>

            </div>
          </div>


          {/* =========================
              LOGIN
          ========================== */}
          <Link
            to="/coordinator/dashboard"
            className="coordinator-login-btn"
          >
            Login
          </Link>


          {/* =========================
              SIGN UP
          ========================== */}
          <p className="coordinator-signup-text">
            Don’t have an account?
            <Link to="/signup">
              Sign Up
            </Link>
          </p>

        </form>
      </div>
    </main>
  );
};

export default Coordinator;