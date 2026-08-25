import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";

import universityBg from "../../assets/university-bg.jpeg";
import universityLogo from "../../assets/university-logo.jpeg";

const Home = () => {
  return (
    <main
      className="home-page"
      style={{ backgroundImage: `url(${universityBg})` }}
    >
      {/* Light overlay */}
      <div className="home-overlay"></div>

      {/* Complete page content */}
      <div className="home-content">

        {/* TOP TEXT */}
        <h1 className="hero-title">
          <span>UG FORM</span>
          <span>MANAGEMENT SYSTEM</span>
        </h1>

        {/* SINGLE LOGO */}
        <img
          src={universityLogo}
          alt="University Logo"
          className="university-logo"
        />

        {/* LOWER CONTENT */}
        <div className="features">
          <span>Fast</span>
          <span className="feature-dot">•</span>
          <span>Secure</span>
          <span className="feature-dot">•</span>
          <span>Paperless</span>
        </div>

       <Link to="/login" className="get-started-btn">
  Get Started
</Link>

      </div>
    </main>
  );
};

export default Home;