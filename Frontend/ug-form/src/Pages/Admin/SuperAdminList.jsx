import React, { useState, useEffect } from "react";
import api from "../../api/api";
import "./SuperAdminList.css";

const SuperAdminList = () => {
  const [superadmins, setSuperadmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuperAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/superadmins");
      setSuperadmins(res.data || []);
    } catch (error) {
      console.error("Failed to load Super Admins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  return (
    <div className="superadmin-list-page">
      <div className="admin-page-header">
        <h2>Super Admin Account Directory</h2>
        <p>Isolated governance view for system-wide Super Admin executive accounts.</p>
      </div>

      <div className="admin-table-card">
        <div className="tab-actions-bar">
          <h3>Super Admin Account Details</h3>
          <span className="superadmin-badge-count">Single Executive Account ({superadmins.length})</span>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px" }}>Loading Super Admin account...</p>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>Executive Name</th>
                  <th>Email Address</th>
                  <th>Role Privilege</th>
                  <th>System Control Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {superadmins.length > 0 ? (
                  superadmins.map((admin) => (
                    <tr key={admin._id}>
                      <td className="font-bold">{admin._id}</td>
                      <td><strong>{admin.name}</strong></td>
                      <td>{admin.email}</td>
                      <td><span className="role-tag superadmin">Super Admin</span></td>
                      <td>Full Override (All Campuses & Users)</td>
                      <td>
                        <span className={`status-badge ${admin.status !== false ? "active" : "inactive"}`}>
                          {admin.status !== false ? "Active" : "Disabled"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px" }}>
                      No Super Admin records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminList;
