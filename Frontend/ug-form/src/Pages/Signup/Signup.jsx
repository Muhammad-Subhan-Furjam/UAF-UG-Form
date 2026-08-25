import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

  // Common states
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [cnic, setCnic] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [phone, setPhone] = useState("");

  // Academic hierarchy
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [discipline, setDiscipline] = useState("");

  // API Data
  const [campuses, setCampuses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [disciplines, setDisciplines] = useState([]);

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
  // LOAD DEGREES (Discipline)
  // ================================
  useEffect(() => {
    if (!department) {
      setDisciplines([]);
      return;
    }
    const fetchDegrees = async () => {
      try {
        const res = await api.get("/degrees");
        const filtered = res.data.filter(
          (d) =>
            d.department_id === department || d.department_id?._id === department
        );
        setDisciplines(filtered);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDegrees();
  }, [department]);

  // ================================
  // HANDLERS
  // ================================
  const handleCampusChange = (e) => {
    setCampus(e.target.value);
    setFaculty("");
    setDepartment("");
    setDiscipline("");
  };

  const handleFacultyChange = (e) => {
    setFaculty(e.target.value);
    setDepartment("");
    setDiscipline("");
  };

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
    setDiscipline("");
  };

  // ================================
  // SIGNUP
  // ================================
  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const signupData = {
        name,
        email,
        password,
        role,
        phone,
        campus_id: campus,
        faculty_id: faculty,
        department_id: department,
      };

      if (role === "student") {
        signupData.ag_number = userId;
        signupData.fatherName = fatherName;
        signupData.cnic = cnic;
        signupData.admissionDate = admissionDate;
        signupData.degree_id = discipline;
      } else {
        signupData.employee_id = userId;
      }

      const response = await api.post("/users/signup", signupData);
      console.log(response.data);
      alert("Signup Successfully");
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
    "Use your own CNIC or B-Form Number. Do not use anyone else’s CNIC or B-Form.",
    "Once CNIC or B-Form is registered with UAF, you cannot change it.",
    "Type your own password and remember it carefully.",
    "This account will be used throughout the whole admission / form process, so please remember your credentials.",
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
                role === "student" ? "Enter AG Number" : "Enter Employee CNIC"
              }
              required
            />
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
                <label>CNIC / B-Form</label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="Enter CNIC / B-Form"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label>Date of Admission</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Phone */}
          <div className="signup-form-group">
            <label>Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter Phone Number"
              required
            />
          </div>

          {/* Email */}
          <div className="signup-form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              required
            />
          </div>

          {/* Password */}
          <div className="signup-form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
            />
          </div>

          <div className="signup-form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />
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

          {/* Discipline */}
          <div className="signup-form-group">
            <label>Discipline</label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              disabled={!department}
              required
            >
              <option value="">
                {department ? "Select Discipline" : "Select Department First"}
              </option>
              {disciplines.map((item) => (
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