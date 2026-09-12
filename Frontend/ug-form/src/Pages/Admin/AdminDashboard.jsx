import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiUserCheck, FiFileText, FiBookOpen, FiPlus, FiLayers } from "react-icons/fi";
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

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      setErrorMsg(
        error.response?.data?.message || "Session error. Please log in again at /ladmin."
      );
    } finally {
      setLoading(false);
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

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading statistics...</p>
      ) : (
        <div className="admin-stats-grid">
          {/* STUDENTS CARD */}
          <div className="admin-stat-card card-blue" onClick={() => navigate("/admin/students")}>
            <div className="stat-icon-wrapper"><FiUsers size={24} /></div>
            <div className="stat-info">
              <h3>{stats.studentsCount}</h3>
              <p>Registered Students</p>
            </div>
            <div className="stat-footer-link">Add / Manage Students &rarr;</div>
          </div>

          {/* COORDINATORS CARD */}
          <div className="admin-stat-card card-green" onClick={() => navigate("/admin/coordinators")}>
            <div className="stat-icon-wrapper"><FiUserCheck size={24} /></div>
            <div className="stat-info">
              <h3>{stats.coordinatorsCount}</h3>
              <p>Registered Coordinators</p>
            </div>
            <div className="stat-footer-link">Add / Manage Coordinators &rarr;</div>
          </div>

          {/* FORMS CARD */}
          <div className="admin-stat-card card-purple" onClick={() => navigate("/admin/forms")}>
            <div className="stat-icon-wrapper"><FiFileText size={24} /></div>
            <div className="stat-info">
              <h3>{stats.formsCount}</h3>
              <p>UG Form Submissions</p>
            </div>
            <div className="stat-footer-link">View, Edit, Accept, Reject &rarr;</div>
          </div>

          {/* COURSES CARD */}
          <div className="admin-stat-card card-orange" onClick={() => navigate("/admin/courses")}>
            <div className="stat-icon-wrapper"><FiBookOpen size={24} /></div>
            <div className="stat-info">
              <h3>{stats.coursesCount}</h3>
              <p>System Academic Courses</p>
            </div>
            <div className="stat-footer-link">Add / Manage Courses &rarr;</div>
          </div>
        </div>
      )}

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
