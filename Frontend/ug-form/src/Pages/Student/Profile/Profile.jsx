import { useEffect, useState } from "react";
import api from "../../../api/api";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
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
        console.error("Failed to load student profile:", error);
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        setProfile(localUser);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  if (loading || !profile) {
    return <div className="student-profile-loading">Loading profile...</div>;
  }

  // Initial letter of first name
  const initialLetter = profile.name ? profile.name.trim().charAt(0).toUpperCase() : "S";

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

  const degreeName =
    profile.degree_id?.name ||
    (typeof profile.degree_id === "string" ? profile.degree_id : "") ||
    "B.Sc. (Hons.) Agriculture";

  return (
    <div className="profile-page">
      <section className="profile-card">
        {/* COVER */}
        <div className="profile-cover"></div>

        {/* PROFILE HEADER */}
        <div className="profile-header-area">
          <div className="profile-image-wrap">
            <div className="student-profile-avatar-circle">
              {initialLetter}
            </div>
            <span className="profile-status-dot"></span>
          </div>

          <div className="profile-main-info">
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-id">AG Number: {profile.ag_number || "N/A"}</p>
          </div>
        </div>

        {/* INFORMATION SECTION */}
        <div className="profile-info-section">
          <div className="profile-section-header">
            <div>
              <h3>Student Information</h3>
              <p>Personal and academic information (Managed by Super Admin).</p>
            </div>

            <span className="profile-account-badge">
              {profile.status ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="profile-info-grid">
            {/* EMAIL */}
            <div className="profile-field">
              <label>Email</label>
              <input
                type="email"
                value={profile.email || ""}
                readOnly
                disabled
                className="student-readonly-input"
              />
            </div>

            {/* PHONE */}
            <div className="profile-field">
              <label>Phone Number</label>
              <input
                type="text"
                value={profile.phone || ""}
                readOnly
                disabled
                className="student-readonly-input"
              />
            </div>

            {/* AG NUMBER */}
            <div className="profile-field">
              <label>AG Number</label>
              <input
                type="text"
                value={profile.ag_number || ""}
                readOnly
                disabled
                className="student-readonly-input"
              />
            </div>

            {/* FATHER NAME */}
            <div className="profile-field">
              <label>Father Name</label>
              <input
                type="text"
                value={profile.fatherName || "N/A"}
                readOnly
                disabled
                className="student-readonly-input"
              />
            </div>

            {/* CNIC */}
            <div className="profile-field">
              <label>CNIC / B-Form</label>
              <input
                type="text"
                value={profile.cnic || "N/A"}
                readOnly
                disabled
                className="student-readonly-input"
              />
            </div>

            {/* ADMISSION DATE */}
            <div className="profile-field">
              <label>Date of Admission</label>
              <input
                type="text"
                value={
                  profile.admissionDate
                    ? new Date(profile.admissionDate).toLocaleDateString()
                    : "N/A"
                }
                readOnly
                disabled
                className="student-readonly-input"
              />
            </div>

            {/* CAMPUS */}
            <div className="profile-field">
              <label>Campus</label>
              <input
                type="text"
                value={campusName}
                readOnly
                disabled
                className="student-readonly-input"
              />
            </div>

            {/* FACULTY */}
            <div className="profile-field">
              <label>Faculty</label>
              <input
                type="text"
                value={facultyName}
                readOnly
                disabled
                className="student-readonly-input"
              />
            </div>

            {/* DEPARTMENT */}
            <div className="profile-field">
              <label>Department</label>
              <input
                type="text"
                value={departmentName}
                readOnly
                disabled
                className="student-readonly-input"
              />
            </div>

            {/* DEGREE */}
            <div className="profile-field">
              <label>Degree</label>
              <input
                type="text"
                value={degreeName}
                readOnly
                disabled
                className="student-readonly-input"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
