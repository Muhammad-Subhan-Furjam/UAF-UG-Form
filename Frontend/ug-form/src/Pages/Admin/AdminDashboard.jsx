import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard-page">
      <div className="admin-page-header">
        <h2>System Executive Overview</h2>
        <p>Centralized monitoring and governance for UAF UG Form Management System.</p>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading statistics...</p>
      ) : (
        <div className="admin-stats-grid">
          {/* STUDENTS CARD */}
          <div className="admin-stat-card card-blue" onClick={() => navigate("/admin/students")}>
            <div className="stat-icon-wrapper">🎓</div>
            <div className="stat-info">
              <h3>{stats.studentsCount}</h3>
              <p>Registered Students</p>
            </div>
            <div className="stat-footer-link">Manage Students List →</div>
          </div>

          {/* COORDINATORS CARD */}
          <div className="admin-stat-card card-green" onClick={() => navigate("/admin/coordinators")}>
            <div className="stat-icon-wrapper">👔</div>
            <div className="stat-info">
              <h3>{stats.coordinatorsCount}</h3>
              <p>Registered Coordinators</p>
            </div>
            <div className="stat-footer-link">Manage Coordinators List →</div>
          </div>

          {/* FORMS CARD */}
          <div className="admin-stat-card card-purple" onClick={() => navigate("/admin/forms")}>
            <div className="stat-icon-wrapper">📋</div>
            <div className="stat-info">
              <h3>{stats.formsCount}</h3>
              <p>Total UG Form Submissions</p>
            </div>
            <div className="stat-footer-link">View UG Forms →</div>
          </div>

          {/* COURSES CARD */}
          <div className="admin-stat-card card-orange" onClick={() => navigate("/admin/courses")}>
            <div className="stat-icon-wrapper">📚</div>
            <div className="stat-info">
              <h3>{stats.coursesCount}</h3>
              <p>System Academic Courses</p>
            </div>
            <div className="stat-footer-link">Manage Courses →</div>
          </div>
        </div>
      )}

      {/* QUICK ACTIONS BANNER */}
      <div className="admin-quick-actions-card">
        <h3>Administrative Governance Controls</h3>
        <p>As Super Admin, you have full override power to alter user accounts, re-assign academic campuses/faculties/departments, enable/disable access, and govern system courses.</p>
        <div className="quick-buttons-row">
          <button className="quick-action-btn primary" onClick={() => navigate("/admin/students")}>
            View All Students
          </button>
          <button className="quick-action-btn secondary" onClick={() => navigate("/admin/coordinators")}>
            View All Coordinators
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
