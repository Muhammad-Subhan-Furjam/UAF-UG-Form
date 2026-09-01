import React, { useState, useEffect } from "react";
import api from "../../api/api";
import "./AdminForms.css";

const AdminForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/forms");
      setForms(res.data || []);
    } catch (error) {
      console.error("Failed to load admin forms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const filteredForms = forms.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (f.studentName && String(f.studentName).toLowerCase().includes(q)) ||
      (f.agNumber && String(f.agNumber).toLowerCase().includes(q)) ||
      (f.degree && String(f.degree).toLowerCase().includes(q)) ||
      (f.degree_id?.name && String(f.degree_id.name).toLowerCase().includes(q)) ||
      (f.status && String(f.status).toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-forms-page">
      <div className="admin-page-header">
        <h2>System UG Form Submissions</h2>
        <p>Centralized view of all undergraduate forms submitted by students university-wide.</p>
      </div>

      <div className="admin-table-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by Student Name, AG Number, Degree, Status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="forms-badge-count">Total Submissions: {forms.length}</span>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading UG Form submissions...</p>
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>AG Number</th>
                  <th>Student Name</th>
                  <th>CNIC</th>
                  <th>Campus</th>
                  <th>Department</th>
                  <th>Degree / Discipline</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.length > 0 ? (
                  filteredForms.map((f) => (
                    <tr key={f._id}>
                      <td className="font-bold">{f.agNumber || f.student_id?.ag_number || "N/A"}</td>
                      <td><strong>{f.studentName || f.student_id?.name || "N/A"}</strong></td>
                      <td>{f.cnic || f.student_id?.cnic || "N/A"}</td>
                      <td>{f.campus_id?.name || f.campus || "N/A"}</td>
                      <td>{f.department_id?.name || f.department || "N/A"}</td>
                      <td>{f.degree_id?.name || f.degree || "N/A"}</td>
                      <td>
                        <span className={`status-badge ${(f.status || "").toLowerCase()}`}>
                          {f.status || "Submitted"}
                        </span>
                      </td>
                      <td>{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "30px" }}>
                      No UG forms found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminForms;
