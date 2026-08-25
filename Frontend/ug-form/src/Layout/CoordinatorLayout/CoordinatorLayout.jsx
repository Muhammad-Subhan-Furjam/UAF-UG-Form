import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  FiHome,
  FiList,
  FiBookOpen,
  FiBell,
  FiLogOut,
  FiFileText,
  FiUser,
} from "react-icons/fi";

import "./CoordinatorLayout.css";

import universityLogo from "../../assets/university-logo.jpeg";

const CoordinatorLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="coordinator-layout">

      {/* SIDEBAR */}
      <aside className="coordinator-sidebar">

        {/* LOGO */}
        <div className="coordinator-brand">
          <img
            src={universityLogo}
            alt="University Logo"
            className="coordinator-brand-logo"
          />

          <div className="coordinator-brand-text">
            <span>UG FORM</span>
            <span>MANAGEMENT SYSTEM</span>
          </div>
        </div>

        {/* MENU */}
<nav className="coordinator-menu">

  <NavLink
    to="/coordinator/dashboard"
    className={({ isActive }) =>
      isActive
        ? "coordinator-menu-link active"
        : "coordinator-menu-link"
    }
  >
    <FiHome />
    <span>Dashboard</span>
  </NavLink>

  <NavLink
    to="/coordinator/requests"
    className={({ isActive }) =>
      isActive
        ? "coordinator-menu-link active"
        : "coordinator-menu-link"
    }
  >
    <FiList />
    <span>My Requests</span>
  </NavLink>

  <NavLink
    to="/coordinator/courses"
    className={({ isActive }) =>
      isActive
        ? "coordinator-menu-link active"
        : "coordinator-menu-link"
    }
  >
    <FiBookOpen />
    <span>Courses</span>
  </NavLink>

  <NavLink
  to="/coordinator/student-form"
  className={({ isActive }) =>
    isActive
      ? "coordinator-menu-link active"
      : "coordinator-menu-link"
  }
>
  <FiFileText />
  <span>Add the Courses</span>
</NavLink>

  <NavLink
    to="/coordinator/profile"
    className={({ isActive }) =>
      isActive
        ? "coordinator-menu-link active"
        : "coordinator-menu-link"
    }
  >
    <FiUser />
    <span>Profile</span>
  </NavLink>

  {/* <NavLink
    to="/coordinator/notifications"
    className={({ isActive }) =>
      isActive
        ? "coordinator-menu-link active"
        : "coordinator-menu-link"
    }
  >
    <FiBell />
    <span>Notifications</span>
  </NavLink> */}

</nav>

        {/* LOGOUT */}
        <button
          className="coordinator-logout"
          onClick={handleLogout}
        >
          <FiLogOut />
          <span>Logout</span>
        </button>

      </aside>

      {/* RIGHT SIDE */}
      <div className="coordinator-main">

        {/* TOP HEADER */}
        <header className="coordinator-header">

          <div>
            <h3>Hello, Coordinator</h3>

            <p>
              University of Agriculture Faisalabad
            </p>
          </div>

          <span className="coordinator-role-badge">
            Coordinator
          </span>

        </header>

        {/* PAGE CONTENT */}
        <main className="coordinator-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default CoordinatorLayout;