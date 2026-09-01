import React, { useState, useEffect } from "react";
import api from "../../api/api";
import "./AdminHierarchy.css";

const AdminHierarchy = () => {
  const [activeTab, setActiveTab] = useState("campuses"); // campuses, faculties, departments, degrees

  const [campuses, setCampuses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);

  const [loading, setLoading] = useState(true);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // add_campus, edit_campus, add_faculty, edit_faculty, etc.
  const [editItem, setEditItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    campus_id: "",
    faculty_id: "",
    department_id: "",
  });

  const [saving, setSaving] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  // =========================================
  // FETCH ALL DATA
  // =========================================
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [cRes, fRes, dRes, degRes] = await Promise.all([
        api.get("/campuses"),
        api.get("/faculties"),
        api.get("/departments"),
        api.get("/degrees"),
      ]);
      setCampuses(cRes.data || []);
      setFaculties(fRes.data || []);
      setDepartments(dRes.data || []);
      setDegrees(degRes.data || []);
    } catch (error) {
      console.error("Error fetching hierarchy data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // =========================================
  // MODAL HANDLERS
  // =========================================
  const handleOpenAdd = (type) => {
    setModalType(type);
    setEditItem(null);
    setFormData({
      name: "",
      code: "",
      campus_id: campuses[0]?._id || "",
      faculty_id: faculties[0]?._id || "",
      department_id: departments[0]?._id || "",
    });
    setModalMsg("");
    setShowModal(true);
  };

  const handleOpenEdit = (type, item) => {
    setModalType(type);
    setEditItem(item);
    setFormData({
      name: item.name || "",
      code: item.code || "",
      campus_id: item.campus_id?._id || item.campus_id || "",
      faculty_id: item.faculty_id?._id || item.faculty_id || "",
      department_id: item.department_id?._id || item.department_id || "",
    });
    setModalMsg("");
    setShowModal(true);
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalMsg("");

    try {
      if (modalType === "add_campus") {
        await api.post("/campuses", { name: formData.name.trim(), code: formData.code.trim() });
      } else if (modalType === "edit_campus") {
        await api.put(`/campuses/${editItem._id}`, { name: formData.name.trim(), code: formData.code.trim() });
      } else if (modalType === "add_faculty") {
        await api.post("/faculties", { name: formData.name.trim(), campus_id: formData.campus_id });
      } else if (modalType === "edit_faculty") {
        await api.put(`/faculties/${editItem._id}`, { name: formData.name.trim(), campus_id: formData.campus_id });
      } else if (modalType === "add_department") {
        await api.post("/departments", { name: formData.name.trim(), campus_id: formData.campus_id, faculty_id: formData.faculty_id });
      } else if (modalType === "edit_department") {
        await api.put(`/departments/${editItem._id}`, { name: formData.name.trim(), campus_id: formData.campus_id, faculty_id: formData.faculty_id });
      } else if (modalType === "add_degree") {
        await api.post("/degrees", { name: formData.name.trim(), campus_id: formData.campus_id, faculty_id: formData.faculty_id, department_id: formData.department_id });
      } else if (modalType === "edit_degree") {
        await api.put(`/degrees/${editItem._id}`, { name: formData.name.trim(), campus_id: formData.campus_id, faculty_id: formData.faculty_id, department_id: formData.department_id });
      }

      setModalMsg("Saved successfully!");
      fetchAllData();
      setTimeout(() => setShowModal(false), 1000);
    } catch (err) {
      setModalMsg(err.response?.data?.message || "Action failed");
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // DELETE HANDLER
  // =========================================
  const handleDelete = async (type, item) => {
    if (!window.confirm(`Are you sure you want to delete '${item.name}'?`)) return;

    try {
      if (type === "campus") await api.delete(`/campuses/${item._id}`);
      else if (type === "faculty") await api.delete(`/faculties/${item._id}`);
      else if (type === "department") await api.delete(`/departments/${item._id}`);
      else if (type === "degree") await api.delete(`/degrees/${item._id}`);

      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  // Filtered faculties/departments for forms
  const filteredFaculties = formData.campus_id
    ? faculties.filter((f) => String(f.campus_id?._id || f.campus_id) === String(formData.campus_id))
    : faculties;

  const filteredDepartments = formData.faculty_id
    ? departments.filter((d) => String(d.faculty_id?._id || d.faculty_id) === String(formData.faculty_id))
    : departments;

  return (
    <div className="admin-hierarchy-page">
      {/* HEADER */}
      <div className="admin-page-header">
        <h2>Academic Hierarchy Governance</h2>
        <p>Manage, add, edit, and alter all Campuses, Faculties, Departments, and Disciplines.</p>
      </div>

      {/* NAV TABS */}
      <div className="hierarchy-sub-tabs">
        <button
          className={`tab-btn ${activeTab === "campuses" ? "active" : ""}`}
          onClick={() => setActiveTab("campuses")}
        >
          🏛️ Campuses ({campuses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "faculties" ? "active" : ""}`}
          onClick={() => setActiveTab("faculties")}
        >
          🏢 Faculties ({faculties.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "departments" ? "active" : ""}`}
          onClick={() => setActiveTab("departments")}
        >
          📂 Departments ({departments.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "degrees" ? "active" : ""}`}
          onClick={() => setActiveTab("degrees")}
        >
          🎓 Disciplines / Degrees ({degrees.length})
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading academic structure...</p>
      ) : (
        <div className="admin-table-card">
          {/* CAMPUSES TAB */}
          {activeTab === "campuses" && (
            <div>
              <div className="tab-actions-bar">
                <h3>System Campuses</h3>
                <button className="add-new-btn" onClick={() => handleOpenAdd("add_campus")}>
                  + Add New Campus
                </button>
              </div>
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Campus Code</th>
                    <th>Campus Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campuses.map((item) => (
                    <tr key={item._id}>
                      <td className="font-bold">{item.code || "N/A"}</td>
                      <td><strong>{item.name}</strong></td>
                      <td>
                        <div className="action-buttons-group">
                          <button className="admin-edit-btn" onClick={() => handleOpenEdit("edit_campus", item)}>
                            ✏️ Edit
                          </button>
                          <button className="admin-delete-btn" onClick={() => handleDelete("campus", item)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FACULTIES TAB */}
          {activeTab === "faculties" && (
            <div>
              <div className="tab-actions-bar">
                <h3>System Faculties</h3>
                <button className="add-new-btn" onClick={() => handleOpenAdd("add_faculty")}>
                  + Add New Faculty
                </button>
              </div>
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Faculty Name</th>
                    <th>Belongs to Campus</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculties.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.campus_id?.name || "Not Assigned"}</td>
                      <td>
                        <div className="action-buttons-group">
                          <button className="admin-edit-btn" onClick={() => handleOpenEdit("edit_faculty", item)}>
                            ✏️ Edit
                          </button>
                          <button className="admin-delete-btn" onClick={() => handleDelete("faculty", item)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* DEPARTMENTS TAB */}
          {activeTab === "departments" && (
            <div>
              <div className="tab-actions-bar">
                <h3>System Departments</h3>
                <button className="add-new-btn" onClick={() => handleOpenAdd("add_department")}>
                  + Add New Department
                </button>
              </div>
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Campus</th>
                    <th>Faculty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.campus_id?.name || "Not Assigned"}</td>
                      <td>{item.faculty_id?.name || "Not Assigned"}</td>
                      <td>
                        <div className="action-buttons-group">
                          <button className="admin-edit-btn" onClick={() => handleOpenEdit("edit_department", item)}>
                            ✏️ Edit
                          </button>
                          <button className="admin-delete-btn" onClick={() => handleDelete("department", item)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* DEGREES TAB */}
          {activeTab === "degrees" && (
            <div>
              <div className="tab-actions-bar">
                <h3>Disciplines / Degrees</h3>
                <button className="add-new-btn" onClick={() => handleOpenAdd("add_degree")}>
                  + Add New Degree
                </button>
              </div>
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Degree Name</th>
                    <th>Campus</th>
                    <th>Faculty</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {degrees.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.campus_id?.name || "Not Assigned"}</td>
                      <td>{item.faculty_id?.name || "Not Assigned"}</td>
                      <td>{item.department_id?.name || "Not Assigned"}</td>
                      <td>
                        <div className="action-buttons-group">
                          <button className="admin-edit-btn" onClick={() => handleOpenEdit("edit_degree", item)}>
                            ✏️ Edit
                          </button>
                          <button className="admin-delete-btn" onClick={() => handleDelete("degree", item)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>
                {modalType.startsWith("add") ? "Add New" : "Edit"}{" "}
                {modalType.includes("campus")
                  ? "Campus"
                  : modalType.includes("faculty")
                  ? "Faculty"
                  : modalType.includes("department")
                  ? "Department"
                  : "Degree"}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitModal}>
              <div className="modal-form-grid">
                {/* NAME */}
                <div className="form-group full-width">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* CODE (For Campus) */}
                {modalType.includes("campus") && (
                  <div className="form-group full-width">
                    <label>Campus Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                )}

                {/* SELECT CAMPUS */}
                {(modalType.includes("faculty") || modalType.includes("department") || modalType.includes("degree")) && (
                  <div className="form-group">
                    <label>Select Campus *</label>
                    <select
                      value={formData.campus_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          campus_id: e.target.value,
                          faculty_id: "",
                          department_id: "",
                        })
                      }
                      required
                    >
                      <option value="">Select Campus</option>
                      {campuses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* SELECT FACULTY */}
                {(modalType.includes("department") || modalType.includes("degree")) && (
                  <div className="form-group">
                    <label>Select Faculty *</label>
                    <select
                      value={formData.faculty_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          faculty_id: e.target.value,
                          department_id: "",
                        })
                      }
                      required
                    >
                      <option value="">Select Faculty</option>
                      {filteredFaculties.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* SELECT DEPARTMENT */}
                {modalType.includes("degree") && (
                  <div className="form-group full-width">
                    <label>Select Department *</label>
                    <select
                      value={formData.department_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          department_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Department</option>
                      {filteredDepartments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {modalMsg && (
                <p className={`modal-msg ${modalMsg.includes("success") ? "success" : "error"}`}>
                  {modalMsg}
                </p>
              )}

              <div className="modal-actions-row">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHierarchy;
