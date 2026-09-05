import React, { useEffect, useState } from "react";
import "./CoordinatorProfile.css";
import api from "../../../api/api";

const CoordinatorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCoordinatorProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/users/profile");
        if (response.data?.user) {
          setProfile(response.data.user);
        } else {
          const localUser = JSON.parse(localStorage.getItem("user") || "{}");
          setProfile(localUser);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        setProfile(localUser);
      } finally {
        setLoading(false);
      }
    };

    getCoordinatorProfile();
  }, []);

  if (loading || !profile) {
    return <div className="coordinator-profile-loading">Loading profile...</div>;
  }

  // Initial letter of first name
  const initialLetter = profile.name ? profile.name.trim().charAt(0).toUpperCase() : "C";

  // Hierarchy Resolution
  const campusName =
    profile.campus_id?.name ||
    (typeof profile.campus_id === "string" ? profile.campus_id : "") ||
    "Main Campus";

  const facultyName =
    profile.faculty_id?.name ||
    (typeof profile.faculty_id === "string" ? profile.faculty_id : "") ||
    "Faculty of Sciences";

  const departmentName =
    profile.department_id?.name ||
    (typeof profile.department_id === "string" ? profile.department_id : "") ||
    "Department Of Computer Science";

  return (
    <div className="coordinator-profile-page">
      <section className="coordinator-profile-card">
        {/* COVER */}
        <div className="coordinator-profile-cover"></div>

        {/* PROFILE HEADER */}
        <div className="coordinator-profile-header">
          <div className="coordinator-profile-image-wrap">
            <div className="coordinator-profile-avatar-circle">
              {initialLetter}
            </div>
            <span className="coordinator-profile-status-dot"></span>
          </div>

          <div className="coordinator-profile-main-info">
            <h2 className="coordinator-profile-name">{profile.name}</h2>
            <p className="coordinator-profile-id">Employee ID: {profile.employee_id}</p>
          </div>
        </div>

        {/* INFORMATION SECTION */}
        <div className="coordinator-profile-info-section">
          <div className="coordinator-profile-section-header">
            <div>
              <h3>Coordinator Information</h3>
              <p>Personal and university assignment details (Managed by Super Admin).</p>
            </div>

            <span className="coordinator-profile-status-badge">
              {profile.status ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="coordinator-profile-grid">
            {/* EMAIL */}
            <div className="coordinator-profile-field">
              <label>Email</label>
              <input
                type="email"
                value={profile.email || ""}
                readOnly
                disabled
                className="coordinator-readonly-input"
              />
            </div>

            {/* PHONE */}
            <div className="coordinator-profile-field">
              <label>Phone</label>
              <input
                type="text"
                value={profile.phone || ""}
                readOnly
                disabled
                className="coordinator-readonly-input"
              />
            </div>

            {/* CAMPUS */}
            <div className="coordinator-profile-field">
              <label>Campus</label>
              <input
                type="text"
                value={campusName}
                readOnly
                disabled
                className="coordinator-readonly-input"
              />
            </div>

            {/* FACULTY */}
            <div className="coordinator-profile-field">
              <label>Faculty</label>
              <input
                type="text"
                value={facultyName}
                readOnly
                disabled
                className="coordinator-readonly-input"
              />
            </div>

            {/* DEPARTMENT */}
            <div className="coordinator-profile-field">
              <label>Department</label>
              <input
                type="text"
                value={departmentName}
                readOnly
                disabled
                className="coordinator-readonly-input"
              />
            </div>

            {/* EMPLOYEE ID */}
            <div className="coordinator-profile-field">
              <label>Employee ID</label>
              <input
                type="text"
                value={profile.employee_id || ""}
                readOnly
                disabled
                className="coordinator-readonly-input"
              />
            </div>

            {/* ACCOUNT STATUS */}
            <div className="coordinator-profile-field">
              <label>Account Status</label>
              <p className="coordinator-active-status">
                {profile.status ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoordinatorProfile;
