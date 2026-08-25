import React, { useEffect, useState } from "react";
import "./CoordinatorProfile.css";
import api from "../../../api/api";

const CoordinatorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState(null);

  const [editData, setEditData] = useState({});

  const handleEdit = () => {
    setEditData(profile);
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await api.put("/users/profile", editData);

      setProfile(response.data.user);

      setEditData(response.data.user);

      setIsEditing(false);

      alert("Profile Updated Successfully");
    } catch (error) {
      console.log(error);

      alert("Update Failed");
    }
  };

  const handleCancel = () => {
    setEditData(profile);

    setIsEditing(false);
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();

    formData.append("image", file);

    try {
      const response = await api.put(
        "/users/profile-image",

        formData,

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setProfile(response.data.user);

      alert("Image Updated Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getCoordinatorProfile = async () => {
      try {
        const response = await api.get("/users/profile");

        console.log("Coordinator Profile:", response.data);

        setProfile(response.data.user);

        setEditData(response.data.user);
      } catch (error) {
        console.log(error);
      }
    };

    getCoordinatorProfile();
  }, []);
  if (!profile) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="coordinator-profile-page">
      <section className="coordinator-profile-card">
        {/* =========================
            COVER
        ========================== */}

        <div className="coordinator-profile-cover"></div>

        {/* =========================
            PROFILE HEADER
        ========================== */}

        <div className="coordinator-profile-header">
          <div className="coordinator-profile-image-wrap">
          <img
            src={
              profile.profileImage
                ? profile.profileImage.startsWith("data:") || profile.profileImage.startsWith("http")
                  ? profile.profileImage
                  : `/uploads/profileImages/${profile.profileImage}`
                : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
            }
            alt="Coordinator Profile"
            className="coordinator-profile-image"
          />

            <label className="change-photo-btn">

Change Photo

<input
type="file"
accept="image/*"
onChange={handleImageUpload}
/>

</label>

            <span className="coordinator-profile-status-dot"></span>
          </div>

          <div className="coordinator-profile-main-info">
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleChange}
                  className="coordinator-profile-name-input"
                />

                <p className="coordinator-profile-id">{profile.employee_id}</p>
              </>
            ) : (
              <>
                <h2 className="coordinator-profile-name">{profile.name}</h2>

                <p className="coordinator-profile-id">{profile.employee_id}</p>
              </>
            )}
          </div>

          {!isEditing && (
            <button
              type="button"
              className="coordinator-profile-edit-btn"
              onClick={handleEdit}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* =========================
            INFORMATION SECTION
        ========================== */}

        <div className="coordinator-profile-info-section">
          <div className="coordinator-profile-section-header">
            <div>
              <h3>Coordinator Information</h3>

              <p>Manage your personal and university information.</p>
            </div>

            <span className="coordinator-profile-status-badge">
              {profile.status ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="coordinator-profile-grid">
            {/* EMAIL */}
            <div className="coordinator-profile-field">
              <label>Email</label>

              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.email}</p>
              )}
            </div>

            {/* PHONE */}
            <div className="coordinator-profile-field">
              <label>Phone</label>

              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={editData.phone}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.phone || "Not Available"}</p>
              )}
            </div>

            {/* CAMPUS */}
            <div className="coordinator-profile-field">
              <label>Campus</label>

              {isEditing ? (
                <input
                  type="text"
                  name="campus"
                  value={editData.campus}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.campus_id?.name || "Not Added"}</p>
              )}
            </div>

            {/* FACULTY */}
            <div className="coordinator-profile-field">
              <label>Faculty</label>

              {isEditing ? (
                <input
                  type="text"
                  name="faculty"
                  value={editData.faculty}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.faculty_id?.name || "Not Added"}</p>
              )}
            </div>

            {/* DEPARTMENT */}
            <div className="coordinator-profile-field">
              <label>Department</label>

              {isEditing ? (
                <input
                  type="text"
                  name="department"
                  value={editData.department}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.department_id?.name || "Not Added"}</p>
              )}
            </div>

            {/* DESIGNATION */}
            <div className="coordinator-profile-field">
              <label>Designation</label>

              {isEditing ? (
                <input
                  type="text"
                  name="designation"
                  value={editData.designation}
                  onChange={handleChange}
                />
              ) : (
                <p>Coordinator</p>
              )}
            </div>

            {/* EMPLOYEE ID */}
            <div className="coordinator-profile-field">
              <label>Employee ID</label>

              <p>{profile.employee_id}</p>
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

        {/* =========================
            EDIT ACTIONS
        ========================== */}

        {isEditing && (
          <div className="coordinator-profile-actions">
            <button
              type="button"
              className="coordinator-profile-cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="button"
              className="coordinator-profile-save-btn"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        )}
      </section>
      console.log(profile);
    </div>
    
  );
};

export default CoordinatorProfile;
