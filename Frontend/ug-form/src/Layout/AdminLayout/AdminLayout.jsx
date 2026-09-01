import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "./AdminLayout.css";
import logo from "../../assets/university-logo.jpeg";

const AdminLayout = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/ladmin");
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <img src={logo} alt="UAF Logo" className="admin-logo" />
          <div className="admin-branding">
            <h3>UG FORM</h3>
            <span>SUPER ADMIN</span>
          </div>
        </div>

        <nav className="admin-nav-menu">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/students"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">🎓</span>
            <span>Students List</span>
          </NavLink>

          <NavLink
            to="/admin/coordinators"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">👔</span>
            <span>Coordinators List</span>
          </NavLink>

          <NavLink
            to="/admin/forms"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">📋</span>
            <span>UG Forms</span>
          </NavLink>

          <NavLink
            to="/admin/courses"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">📚</span>
            <span>Courses</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="admin-main">
        {/* TOP HEADER */}
        <header className="admin-header">
          <div className="admin-greeting">
            <h2>Hello, Super Admin</h2>
            <p>{user.email || "admin@uaf.com"} — Full Administrative Control</p>
          </div>
          <div className="admin-badge">
            <span>SUPER ADMIN</span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
