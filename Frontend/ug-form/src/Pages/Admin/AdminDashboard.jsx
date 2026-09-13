import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiUserCheck, FiFileText, FiBookOpen, FiActivity } from "react-icons/fi";
import api from "../../api/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    studentsCount: 0,
    coordinatorsCount: 0,
    formsCount: 0,
    coursesCount: 0,
  });

  const [settings, setSettings] = useState({
    studentSignupEnabled: true,
    coordinatorSignupEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const [resStats, resSettings] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/settings"),
      ]);
      setStats(resStats.data);
      if (resSettings.data) setSettings(resSettings.data);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      setErrorMsg(
        error.response?.data?.message || "Session error. Please log in again at /ladmin."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (key) => {
    const nextVal = !settings[key];
    const targetName = key === "studentSignupEnabled" ? "Student Signup" : "Coordinator Signup";
    const actionText = nextVal ? "ENABLE" : "DISABLE";
    if (window.confirm(`Are you sure you want to ${actionText} ${targetName} globally?`)) {
      try {
        const res = await api.put("/admin/settings", { [key]: nextVal });
        setSettings(res.data?.setting || { ...settings, [key]: nextVal });
        alert(res.data?.message || `${targetName} ${nextVal ? "enabled" : "disabled"} successfully.`);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to update registration setting.");
      }
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard-page">
      <div className="admin-page-header">
        <h2>System Executive Overview</h2>
        <p>Centralized monitoring and full super admin governance for UAF UG Form Management System.</p>
      </div>

      {errorMsg && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", border: "1px solid #fecaca", fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading statistics...</p>
      ) : (
        <div className="admin-stats-grid">
          {/* STUDENTS CARD */}
          <div className="admin-stat-card card-blue" onClick={() => navigate("/admin/students")}>
            <div className="stat-icon-wrapper" style={{ color: "#2563eb" }}><FiUsers size={24} /></div>
            <div className="stat-info">
              <h3>{stats.studentsCount}</h3>
              <p>Registered Students</p>
            </div>
            <div className="stat-footer-link">Add / Manage Students &rarr;</div>
          </div>

          {/* COORDINATORS CARD */}
          <div className="admin-stat-card card-green" onClick={() => navigate("/admin/coordinators")}>
            <div className="stat-icon-wrapper" style={{ color: "#16a34a" }}><FiUserCheck size={24} /></div>
            <div className="stat-info">
              <h3>{stats.coordinatorsCount}</h3>
              <p>Registered Coordinators</p>
            </div>
            <div className="stat-footer-link">Add / Manage Coordinators &rarr;</div>
          </div>

          {/* FORMS CARD */}
          <div className="admin-stat-card card-purple" onClick={() => navigate("/admin/forms")}>
            <div className="stat-icon-wrapper" style={{ color: "#9333ea" }}><FiFileText size={24} /></div>
            <div className="stat-info">
              <h3>{stats.formsCount}</h3>
              <p>UG Form Submissions</p>
            </div>
            <div className="stat-footer-link">View, Edit, Accept, Reject &rarr;</div>
          </div>

          {/* COURSES CARD */}
          <div className="admin-stat-card card-orange" onClick={() => navigate("/admin/courses")}>
            <div className="stat-icon-wrapper" style={{ color: "#ea580c" }}><FiBookOpen size={24} /></div>
            <div className="stat-info">
              <h3>{stats.coursesCount}</h3>
              <p>System Academic Courses</p>
            </div>
            <div className="stat-footer-link">Add / Manage Courses &rarr;</div>
          </div>

          {/* STATISTICS & ANALYTICS TAB LINK CARD */}
          <div className="admin-stat-card card-teal" style={{ borderTop: "4px solid #0d9488" }} onClick={() => navigate("/admin/analytics")}>
            <div className="stat-icon-wrapper" style={{ color: "#0d9488" }}><FiActivity size={24} /></div>
            <div className="stat-info">
              <h3>Live Tracker</h3>
              <p>Statistics & IP Analytics</p>
            </div>
            <div className="stat-footer-link" style={{ color: "#0d9488" }}>
              Open Statistics & IP Tracker &rarr;
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION CONTROLS CARD */}
      <div className="admin-quick-actions-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
        <h3>Portal Registration Governance Controls</h3>
        <p>Enable or disable public signup pages for students and departmental coordinators with a single click.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "15px" }}>
          {/* STUDENT SIGNUP CONTROL */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, minWidth: "280px", background: "#f8fafc", padding: "14px 18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div>
              <strong style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>Student Registration Page</strong>
              <span style={{ fontSize: "12px", color: settings.studentSignupEnabled ? "#16a34a" : "#dc2626", fontWeight: "700" }}>
                Status: {settings.studentSignupEnabled ? "ACTIVE (SIGNUP ENABLED)" : "CLOSED (SIGNUP DISABLED)"}
              </span>
            </div>
            <button
              className={`admin-toggle-block-btn ${settings.studentSignupEnabled ? "block-access" : "unblock-access"}`}
              onClick={() => handleToggleSetting("studentSignupEnabled")}
              style={{ padding: "8px 14px", fontSize: "12px" }}
            >
              {settings.studentSignupEnabled ? "🚫 Disable Student Signup" : "✅ Enable Student Signup"}
            </button>
          </div>

          {/* COORDINATOR SIGNUP CONTROL */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, minWidth: "280px", background: "#f8fafc", padding: "14px 18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div>
              <strong style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>Coordinator Registration Page</strong>
              <span style={{ fontSize: "12px", color: settings.coordinatorSignupEnabled ? "#16a34a" : "#dc2626", fontWeight: "700" }}>
                Status: {settings.coordinatorSignupEnabled ? "ACTIVE (SIGNUP ENABLED)" : "CLOSED (SIGNUP DISABLED)"}
              </span>
            </div>
            <button
              className={`admin-toggle-block-btn ${settings.coordinatorSignupEnabled ? "block-access" : "unblock-access"}`}
              onClick={() => handleToggleSetting("coordinatorSignupEnabled")}
              style={{ padding: "8px 14px", fontSize: "12px" }}
            >
              {settings.coordinatorSignupEnabled ? "🚫 Disable Coordinator Signup" : "✅ Enable Coordinator Signup"}
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BANNER */}
      <div className="admin-quick-actions-card">
        <h3>Super Admin Governance & Action Panel</h3>
        <p>You have complete override control to add coordinators, add students, govern campuses/faculties/departments/degrees, manage courses, and view, edit, accept (approve), or reject submitted UG forms.</p>
        <div className="quick-buttons-row" style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "15px" }}>
          <button className="quick-action-btn primary" onClick={() => navigate("/admin/coordinators?action=add")}>
            + Add Coordinator
          </button>
          <button className="quick-action-btn primary" onClick={() => navigate("/admin/students?action=add")}>
            + Add Student
          </button>
          <button className="quick-action-btn secondary" onClick={() => navigate("/admin/analytics")}>
            Statistics & IP Analytics
          </button>
          <button className="quick-action-btn secondary" onClick={() => navigate("/admin/hierarchy")}>
            Campuses, Faculties, Depts & Degrees
          </button>
          <button className="quick-action-btn secondary" onClick={() => navigate("/admin/courses")}>
            Manage Courses
          </button>
          <button className="quick-action-btn primary" onClick={() => navigate("/admin/forms")}>
            UG Forms (View/Edit/Accept/Reject)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
