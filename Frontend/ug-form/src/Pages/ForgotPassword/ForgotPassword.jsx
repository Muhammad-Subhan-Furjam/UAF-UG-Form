import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import "./ForgotPassword.css";

import universityBg from "../../assets/university-bg.jpeg";
import universityLogo from "../../assets/university-logo.jpeg";
import api from "../../api/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [cnic, setCnic] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Real-time password format checklist validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[@#$%!&*]/.test(newPassword);
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecialChar;

  const handleCnicChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 13);
    setCnic(val);
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!cnic || cnic.length !== 13) {
      setErrorMessage("CNIC / B-Form number must be exactly 13 digits long.");
      return;
    }

    if (!phone || phone.length !== 11) {
      setErrorMessage("Phone number must be exactly 11 digits long.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage(
        "New Password does not meet all required security format criteria."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New Password and Confirm New Password do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/users/forgot-password", {
        cnic: cnic.trim(),
        phone: phone.trim(),
        newPassword: newPassword,
      });

      setSuccessMessage("Password changed successfully! Logging in...");

      // Save session credentials
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect user to their respective account dashboard
      setTimeout(() => {
        if (res.data.user.role === "student") {
          navigate("/student/dashboard");
        } else if (res.data.user.role === "coordinator") {
          navigate("/coordinator/dashboard");
        } else {
          navigate("/login");
        }
      }, 1200);
    } catch (error) {
      console.error("Forgot Password Error:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to reset password. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="forgot-password-page"
      style={{ backgroundImage: `url(${universityBg})` }}
    >
      <div className="forgot-password-card">
        {/* HEADER */}
        <div className="forgot-password-header">
          <div>
            <h1>Reset Password</h1>
            <p>Verify CNIC & Phone to update your account password</p>
          </div>
          <img
            src={universityLogo}
            alt="University Logo"
            className="forgot-password-logo"
          />
        </div>

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          {/* CNIC FIELD */}
          <div className="form-group">
            <label htmlFor="cnic">
              CNIC / B-Form Number <span style={{ color: "red" }}> *</span>
            </label>
            <input
              id="cnic"
              type="text"
              value={cnic}
              onChange={handleCnicChange}
              placeholder="13-digit CNIC (e.g. 3520112345671)"
              required
            />
            <small className="forgot-hint-text">Must be 13 digits long without dashes</small>
          </div>

          {/* PHONE FIELD */}
          <div className="form-group">
            <label htmlFor="phone">
              Phone Number <span style={{ color: "red" }}> *</span>
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="11-digit Phone (e.g. 03001234567)"
              required
            />
            <small className="forgot-hint-text">Must be 11 digits long starting with 03</small>
          </div>

          {/* NEW PASSWORD WITH EYE TOGGLE */}
          <div className="form-group password-group">
            <label htmlFor="newPassword">
              New Password <span style={{ color: "red" }}> *</span>
            </label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter New Password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex="-1"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* PASSWORD SECURITY FORMAT CHECKLIST */}
          <div className="password-checklist-box">
            <p className="checklist-title">Password Security Requirements:</p>
            <div className="checklist-items">
              <div className={`checklist-item ${hasMinLength ? "valid" : ""}`}>
                {hasMinLength ? <FaCheck /> : <FaTimes />} At least 8 characters
              </div>
              <div className={`checklist-item ${hasUppercase ? "valid" : ""}`}>
                {hasUppercase ? <FaCheck /> : <FaTimes />} At least 1 uppercase letter (A-Z)
              </div>
              <div className={`checklist-item ${hasLowercase ? "valid" : ""}`}>
                {hasLowercase ? <FaCheck /> : <FaTimes />} At least 1 lowercase letter (a-z)
              </div>
              <div className={`checklist-item ${hasDigit ? "valid" : ""}`}>
                {hasDigit ? <FaCheck /> : <FaTimes />} At least 1 digit (0-9)
              </div>
              <div className={`checklist-item ${hasSpecialChar ? "valid" : ""}`}>
                {hasSpecialChar ? <FaCheck /> : <FaTimes />} At least 1 special character (@#$%!&*)
              </div>
            </div>
          </div>

          {/* CONFIRM NEW PASSWORD WITH EYE TOGGLE */}
          <div className="form-group password-group">
            <label htmlFor="confirmPassword">
              Confirm New Password <span style={{ color: "red" }}> *</span>
            </label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter New Password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* ERROR / SUCCESS ALERTS */}
          {errorMessage && <div className="forgot-error-alert">{errorMessage}</div>}
          {successMessage && <div className="forgot-success-alert">{successMessage}</div>}

          {/* SUBMIT BUTTON */}
          <button type="submit" className="forgot-submit-btn" disabled={loading}>
            {loading ? "Verifying & Updating..." : "Submit & Login to Dashboard"}
          </button>

          {/* BACK TO LOGIN LINK */}
          <p className="back-login-text">
            Remembered your password? <Link to="/login">Back to Login</Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default ForgotPassword;
