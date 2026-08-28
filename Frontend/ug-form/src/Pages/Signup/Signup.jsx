import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Signup.css";

import universityBg from "../../assets/university-bg.jpeg";
import universityLogo from "../../assets/university-logo.jpeg";
import api from "../../api/api";

const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const role = location.state?.role || "student";

  // Popup
  const [showPopup, setShowPopup] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [emailPrefix, setEmailPrefix] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fatherName, setFatherName] = useState("");
  const [cnic, setCnic] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [phone, setPhone] = useState("");

  // Academic hierarchy (Campus, Faculty, Department)
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");

  // API Data
  const [campuses, setCampuses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Dynamic Date calculation
  const currentYear = new Date().getFullYear();
  const minAdmissionDate = "2021-01-01";
  const maxAdmissionDate = `${currentYear}-12-31`;

  // Password Rules Checklist State
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMinLength = password.length >= 8;
  const isPasswordValid =
    hasUppercase && hasLowercase && hasNumber && hasSpecialChar && hasMinLength;

  // ================================
  // LOAD CAMPUSES
  // ================================
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const res = await api.get("/campuses");
        setCampuses(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCampuses();
  }, []);

  // ================================
  // LOAD FACULTIES
  // ================================
  useEffect(() => {
    if (!campus) {
      setFaculties([]);
      return;
    }
    const fetchFaculties = async () => {
      try {
        const res = await api.get("/faculties");
        const filtered = res.data.filter(
          (f) => f.campus_id === campus || f.campus_id?._id === campus
        );
        setFaculties(filtered);
      } catch (error) {
        console.log(error);
      }
    };
    fetchFaculties();
  }, [campus]);

  // ================================
  // LOAD DEPARTMENTS
  // ================================
  useEffect(() => {
    if (!faculty) {
      setDepartments([]);
      return;
    }
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/departments");
        const filtered = res.data.filter(
          (d) => d.faculty_id === faculty || d.faculty_id?._id === faculty
        );
        setDepartments(filtered);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDepartments();
  }, [faculty]);

  // ================================
  // HANDLERS
  // ================================
  const handleCampusChange = (e) => {
    setCampus(e.target.value);
    setFaculty("");
    setDepartment("");
  };

  const handleFacultyChange = (e) => {
    setFaculty(e.target.value);
    setDepartment("");
  };

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
  };

  // CNIC Restrict to 13 Digits
  const handleCnicChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 13);
    setCnic(val);
  };

  // Phone Restrict to 11 Digits
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(val);
  };

  // Email Prefix Change (Removes @gmail.com if user types it)
  const handleEmailPrefixChange = (e) => {
    let val = e.target.value;
    if (val.includes("@")) {
      val = val.split("@")[0];
    }
    setEmailPrefix(val);
  };

  // ================================
  // SIGNUP SUBMIT
  // ================================
  const handleSignup = async (e) => {
    e.preventDefault();

    // 1. Student AG Number Validation (YYYY-ag-XXXX)
    if (role === "student") {
      const agPattern = /^\d{4}-ag-\d{4}$/i;
      if (!agPattern.test(userId.trim())) {
        alert(
          "Invalid AG Number format! Standard format is 4-digit year-ag-4-digit number (e.g. 2024-ag-1234)"
        );
        return;
      }

      // CNIC Validation (Exactly 13 Digits)
      if (cnic.length !== 13) {
        alert("CNIC / B-Form number must consist of exactly 13 digits.");
        return;
      }

      // Admission Date Range Check (2021 to Current Year)
      const selectedYear = new Date(admissionDate).getFullYear();
      if (selectedYear < 2021 || selectedYear > currentYear) {
        alert(`Date of admission must be between 2021 and ${currentYear}.`);
        return;
      }
    }

    // 2. Phone Number Validation (Exactly 11 Digits)
    if (phone.length !== 11) {
      alert("Phone number must consist of exactly 11 digits.");
      return;
    }

    // 3. Password Strength Validation
    if (!isPasswordValid) {
      alert(
        "Password does not meet all security requirements. Please check the rules list."
      );
      return;
    }

    // 4. Confirm Password Check
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const fullEmail = `${emailPrefix.trim()}@gmail.com`;

    try {
      const signupData = {
        name,
        email: fullEmail,
        password,
        role,
        phone,
        campus_id: campus,
        faculty_id: faculty,
        department_id: department,
      };

      if (role === "student") {
        signupData.ag_number = userId.trim();
        signupData.fatherName = fatherName;
        signupData.cnic = cnic;
        signupData.admissionDate = admissionDate;
      } else {
        signupData.employee_id = userId.trim();
      }

      const response = await api.post("/users/signup", signupData);
      console.log(response.data);
      alert("Signup Successfully!");
      navigate("/login");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Signup Failed");
    }
  };

  // ================================
  // POPUP CONTENT
  // ================================
  const studentInstructions = [
    "Register your own email address, do not use anyone else’s email because all correspondence will be shared with you on this email.",
    "Use your own CNIC or B-Form Number (13 digits). Do not use anyone else’s CNIC or B-Form.",
    "Once CNIC or B-Form is registered with UAF, you cannot change it.",
    "AG Number must follow standard format: YYYY-ag-XXXX (e.g. 2024-ag-1234).",
    "Type your own password following the strength rules and remember it carefully.",
  ];

  const coordinatorInstructions = [
    "Register using your official email address only.",
    "Use your correct Employee CNIC. Do not use anyone else’s CNIC.",
    "Once registered, your Employee CNIC cannot be changed.",
    "Create a strong password and keep it safe.",
    "This account will be used for managing student UG forms, so please remember your login details.",
  ];

  const instructions =
    role === "student" ? studentInstructions : coordinatorInstructions;

  return (
    <main
      className="signup-page"
      style={{ backgroundImage: `url(${universityBg})` }}
    >
      {showPopup && (
        <div className="signup-popup-overlay">
          <div className="signup-popup">
            <button
              className="signup-popup-close-icon"
              onClick={() => setShowPopup(false)}
            >
              ×
            </button>
            <h2 className="signup-popup-title">ATTENTION PLEASE</h2>
            <ul className="signup-popup-list">
              {instructions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <button
              className="signup-popup-close-btn"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="signup-card">
        <div className="signup-header">
          <h1>
            {role === "student"
              ? "Create Student Account"
              : "Create Coordinator Account"}
          </h1>
          <img
            src={universityLogo}
            alt="University Logo"
            className="signup-logo"
          />
        </div>

        <form className="signup-form" onSubmit={handleSignup}>
          {/* AG / Employee ID */}
          <div className="signup-form-group">
            <label>
              {role === "student" ? "AG Number" : "Employee CNIC"}
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={
                role === "student"
                  ? "e.g. 2024-ag-1234"
                  : "Enter Employee CNIC"
              }
              required
            />
            {role === "student" && (
              <small className="signup-hint-text">
                Format: 4-digit year-ag-4-digit number (e.g. 2024-ag-1234)
              </small>
            )}
          </div>

          {/* Name */}
          <div className="signup-form-group">
            <label>
              {role === "student" ? "Student Name" : "Coordinator Name"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                role === "student"
                  ? "Enter Student Name"
                  : "Enter Coordinator Name"
              }
              required
            />
          </div>

          {/* Student only fields */}
          {role === "student" && (
            <>
              <div className="signup-form-group">
                <label>Father Name</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Enter Father Name"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label>CNIC / B-Form (13 Digits)</label>
                <input
                  type="text"
                  value={cnic}
                  onChange={handleCnicChange}
                  placeholder="Enter 13-digit CNIC (e.g. 3310212345671)"
                  maxLength={13}
                  required
                />
                <small className="signup-hint-text">
                  Must be exactly 13 digits ({cnic.length}/13)
                </small>
              </div>

              <div className="signup-form-group">
                <label>Date of Admission</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  min={minAdmissionDate}
                  max={maxAdmissionDate}
                  required
                />
                <small className="signup-hint-text">
                  Allowed range: 2021 to {currentYear}
                </small>
              </div>
            </>
          )}

          {/* Phone */}
          <div className="signup-form-group">
            <label>Phone Number (11 Digits)</label>
            <input
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Enter 11-digit phone (e.g. 03001234567)"
              maxLength={11}
              required
            />
            <small className="signup-hint-text">
              Must be exactly 11 digits ({phone.length}/11)
            </small>
          </div>

          {/* Email Prefix with @gmail.com addon */}
          <div className="signup-form-group">
            <label>Email Address</label>
            <div className="email-input-wrapper">
              <input
                type="text"
                value={emailPrefix}
                onChange={handleEmailPrefixChange}
                placeholder="Enter email username"
                required
              />
              <span className="email-addon">@gmail.com</span>
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div className="signup-form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
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

            {/* Interactive Password Rules Box */}
            <div className="password-rules-box">
              <p className="password-rules-title">Password must contain:</p>
              <ul className="password-rules-list">
                <li className={hasUppercase ? "rule-valid" : "rule-invalid"}>
                  <span className="rule-icon">{hasUppercase ? "✓" : "○"}</span> At least 1 Uppercase letter (A-Z)
                </li>
                <li className={hasLowercase ? "rule-valid" : "rule-invalid"}>
                  <span className="rule-icon">{hasLowercase ? "✓" : "○"}</span> At least 1 Lowercase letter (a-z)
                </li>
                <li className={hasNumber ? "rule-valid" : "rule-invalid"}>
                  <span className="rule-icon">{hasNumber ? "✓" : "○"}</span> At least 1 Number (0-9)
                </li>
                <li className={hasSpecialChar ? "rule-valid" : "rule-invalid"}>
                  <span className="rule-icon">{hasSpecialChar ? "✓" : "○"}</span> At least 1 Special character (!@#$%^&*)
                </li>
                <li className={hasMinLength ? "rule-valid" : "rule-invalid"}>
                  <span className="rule-icon">{hasMinLength ? "✓" : "○"}</span> At least 8 characters long
                </li>
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="signup-form-group">
            <label>Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
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

          {/* Campus */}
          <div className="signup-form-group">
            <label>Campus</label>
            <select value={campus} onChange={handleCampusChange} required>
              <option value="">Select Campus</option>
              {campuses.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty */}
          <div className="signup-form-group">
            <label>Faculty</label>
            <select
              value={faculty}
              onChange={handleFacultyChange}
              disabled={!campus}
              required
            >
              <option value="">
                {campus ? "Select Faculty" : "Select Campus First"}
              </option>
              {faculties.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="signup-form-group">
            <label>Department</label>
            <select
              value={department}
              onChange={handleDepartmentChange}
              disabled={!faculty}
              required
            >
              <option value="">
                {faculty ? "Select Department" : "Select Faculty First"}
              </option>
              {departments.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="signup-btn">
            Sign Up
          </button>

          <p className="signup-login-text">
            Already have an account?
            <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default Signup;