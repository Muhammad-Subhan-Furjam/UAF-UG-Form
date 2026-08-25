import { useEffect, useState } from "react";
import api from "../../../api/api";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({});

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await api.get("/users/profile");

        console.log("Profile Data:", response.data);

        setProfile(response.data.user);

        setEditData(response.data.user);
      } catch (error) {
        console.log(error);
      }
    };

    getProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await api.put("/users/profile", {
        email: editData.email,
        phone: editData.phone,
      });

      setProfile(response.data.user);
      setEditData(response.data.user);
      setIsEditing(false);

      alert("Profile Updated Successfully");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditData(profile);

    setIsEditing(false);
  };

  if (!profile) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="profile-page">
      <section className="profile-card">
        <div className="profile-cover"></div>

        <div className="profile-header-area">
         <div className="profile-image-wrap">
  <div className={`profile-role-avatar ${profile.role}`}>
    {profile.role === "student" ? "S" : "C"}
  </div>
  <span className="profile-status-dot"></span>
</div>

          <div className="profile-main-info">
            <h2 className="profile-name">{profile.name}</h2>

            <p className="profile-id">{profile.ag_number}</p>
          </div>

          <button className="top-edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        </div>

        <div className="profile-info-section">
          <div className="profile-section-header">
            <div>
              <h3>Personal Information</h3>

              <p>Manage your personal and academic information.</p>
            </div>

            <span className="profile-account-badge">
              {profile.status ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="profile-info-grid">
            <div className="profile-field">
              <label>Email</label>

              {isEditing ? (
                <input
                  name="email"
                  value={editData.email || ""}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.email}</p>
              )}
            </div>

            <div className="profile-field">
              <label>Phone</label>

              {isEditing ? (
                <input
                  name="phone"
                  value={editData.phone || ""}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.phone || "Not Available"}</p>
              )}
            </div>

            <div className="profile-field">
              <label>AG Number</label>

              <p>{profile.ag_number}</p>
            </div>

            <div className="profile-field">
              <label>Role</label>

              <p>{profile.role}</p>
            </div>

            <div className="profile-field">
              <label>Father Name</label>

              <p>{profile.fatherName || "Not Added"}</p>
            </div>

            <div className="profile-field">
              <label>CNIC</label>

              <p>{profile.cnic || "Not Added"}</p>
            </div>
            <div className="profile-field">
              <label>Date of Admission</label>

              <p>
                {profile.admissionDate
                  ? new Date(profile.admissionDate).toLocaleDateString()
                  : "Not Added"}
              </p>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="profile-actions">
            <button className="profile-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>

            <button className="profile-save-btn" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
