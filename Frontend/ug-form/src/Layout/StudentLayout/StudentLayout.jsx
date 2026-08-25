import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiList,
  FiFileText,
  FiBookOpen,
  FiUser,
  FiBell,
  FiLogOut,
} from "react-icons/fi";

import "./StudentLayout.css";

import universityLogo from "../../assets/university-logo.jpeg";

const StudentLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="student-layout">

      {/* ========================================
          SIDEBAR
      ======================================== */}
      <aside className="student-sidebar">

        {/* Logo Area */}
        <div className="sidebar-brand">
          <img
            src={universityLogo}
            alt="University Logo"
            className="sidebar-logo"
          />

          <div className="sidebar-brand-text">
            <span>UG FORM</span>
            <span>MANAGEMENT SYSTEM</span>
          </div>
        </div>


        {/* Navigation */}
        <nav className="sidebar-nav">

          <NavLink
            to="/student/dashboard"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <FiGrid />
            <span>Dashboard</span>
          </NavLink>


          <NavLink
            to="/student/requests"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <FiList />
            <span>My Requests</span>
          </NavLink>


          <NavLink
            to="/student/forms"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <FiFileText />
            <span>My Forms</span>
          </NavLink>


          <NavLink
            to="/student/courses"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <FiBookOpen />
            <span>Courses</span>
          </NavLink>


          <NavLink
            to="/student/profile"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <FiUser />
            <span>Profile</span>
          </NavLink>


          {/* <NavLink
            to="/student/notifications"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <FiBell />
            <span>Notifications</span>
          </NavLink> */}

        </nav>


        {/* Logout */}
        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <FiLogOut />
          <span>Logout</span>
        </button>

      </aside>


      {/* ========================================
          RIGHT SIDE
      ======================================== */}
      <div className="student-main">

        {/* TOP HEADER */}
        <header className="student-header">

          <div className="student-info">
            <h2>Hello, 2022-AG-5555</h2>

            <p>
              University of Agriculture Faisalabad – Faculty of Sciences
            </p>
          </div>


          <div className="student-role">
            Student
          </div>

        </header>


        {/* ========================================
            PAGE CONTENT

            Dashboard / Forms / Courses etc.
            will render here
        ======================================== */}
        <main className="student-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default StudentLayout;