import React, { useState, useEffect } from "react";
import api from "../../api/api";
import "./CoordinatorsList.css";

const CoordinatorsList = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCampus, setFilterCampus] = useState("");
  const [filterFaculty, setFilterFaculty] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDegree, setFilterDegree] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Hierarchy Data
  const [campuses, setCampuses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);

  // Edit Modal State
  const [editingCoord, setEditingCoord] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    employee_id: "",
    campus_id: "",
    faculty_id: "",
    department_id: "",
    degree_id: "",
    status: true,
    newPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // =========================================
  // LOAD COORDINATORS & HIERARCHY
  // =========================================
  const fetchCoordinators = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/coordinators");
      setCoordinators(res.data || []);
    } catch (error) {
      console.error("Failed to load coordinators:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinators();

    const fetchHierarchy = async () => {
      try {
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
      } catch (err) {
        console.error("Failed to load academic hierarchy:", err);
      }
    };
    fetchHierarchy();
  }, []);

  // =========================================
  // OPEN EDIT MODAL
  // =========================================
  const handleOpenEdit = (coord) => {
    setEditingCoord(coord);
    setEditFormData({
      name: coord.name || "",
      email: coord.email || "",
      phone: coord.phone || "",
      employee_id: coord.employee_id || "",
      campus_id: coord.campus_id?._id || coord.campus_id || "",
      faculty_id: coord.faculty_id?._id || coord.faculty_id || "",
      department_id: coord.department_id?._id || coord.department_id || "",
      degree_id: coord.degree_id?._id || coord.degree_id || "",
      status: coord.status !== undefined ? coord.status : true,
      newPassword: "",
    });
    setModalMessage("");
  };

  // =========================================
  // SAVE EDIT
  // =========================================
  const handleSaveCoordinator = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalMessage("");

    try {
      const payload = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        employee_id: editFormData.employee_id,
        campus_id: editFormData.campus_id || null,
        faculty_id: editFormData.faculty_id || null,
        department_id: editFormData.department_id || null,
        degree_id: editFormData.degree_id || null,
        status: editFormData.status,
      };

      if (editFormData.newPassword.trim()) {
        payload.password = editFormData.newPassword.trim();
      }

      await api.put(`/admin/users/${editingCoord._id}`, payload);
      setModalMessage("Coordinator details updated successfully!");

      fetchCoordinators();
      setTimeout(() => {
        setEditingCoord(null);
      }, 1200);
    } catch (error) {
      setModalMessage(
        error.response?.data?.message || "Failed to update coordinator."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // DELETE COORDINATOR
  // =========================================
  const handleDeleteCoordinator = async (coordId, coordName) => {
    if (
      window.confirm(
        `Are you sure you want to delete coordinator '${coordName}'?`
      )
    ) {
      try {
        await api.delete(`/admin/users/${coordId}`);
        fetchCoordinators();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete coordinator");
      }
    }
  };

  // =========================================
  // FILTER HANDLERS
  // =========================================
  const handleFilterCampusChange = (e) => {
    setFilterCampus(e.target.value);
    setFilterFaculty("");
    setFilterDepartment("");
    setFilterDegree("");
  };

  const handleFilterFacultyChange = (e) => {
    setFilterFaculty(e.target.value);
    setFilterDepartment("");
    setFilterDegree("");
  };

  const handleFilterDepartmentChange = (e) => {
    setFilterDepartment(e.target.value);
    setFilterDegree("");
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setFilterCampus("");
    setFilterFaculty("");
    setFilterDepartment("");
    setFilterDegree("");
    setFilterStatus("all");
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(filterCampus) ||
    Boolean(filterFaculty) ||
    Boolean(filterDepartment) ||
    Boolean(filterDegree) ||
    filterStatus !== "all";

  // =========================================
  // FILTERED COORDINATORS
  // =========================================
  const filteredCoordinators = (coordinators || []).filter((c) => {
    // 1. Text Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        (c.employee_id && String(c.employee_id).toLowerCase().includes(q)) ||
        (c.name && String(c.name).toLowerCase().includes(q)) ||
        (c.email && String(c.email).toLowerCase().includes(q)) ||
        (c.phone && String(c.phone).toLowerCase().includes(q)) ||
        (c.campus_id?.name && String(c.campus_id.name).toLowerCase().includes(q)) ||
        (c.faculty_id?.name && String(c.faculty_id.name).toLowerCase().includes(q)) ||
        (c.department_id?.name && String(c.department_id.name).toLowerCase().includes(q)) ||
        (c.degree_id?.name && String(c.degree_id.name).toLowerCase().includes(q));

      if (!matchesSearch) return false;
    }

    // 2. Campus Dropdown Filter
    if (filterCampus) {
      const cId = c.campus_id?._id || c.campus_id;
      if (String(cId) !== String(filterCampus)) return false;
    }

    // 3. Faculty Dropdown Filter
    if (filterFaculty) {
      const fId = c.faculty_id?._id || c.faculty_id;
      if (String(fId) !== String(filterFaculty)) return false;
    }

    // 4. Department Dropdown Filter
    if (filterDepartment) {
      const dId = c.department_id?._id || c.department_id;
      if (String(dId) !== String(filterDepartment)) return false;
    }

    // 5. Degree Dropdown Filter
    if (filterDegree) {
      const degId = c.degree_id?._id || c.degree_id;
      if (String(degId) !== String(filterDegree)) return false;
    }

    // 6. Status Dropdown Filter
    if (filterStatus !== "all") {
      const isAct = c.status !== false;
      if (filterStatus === "active" && !isAct) return false;
      if (filterStatus === "disabled" && isAct) return false;
    }

    return true;
  });

  // Filtered dropdown lists for Filter Toolbar & Edit Modal
  const availableFilterFaculties = filterCampus
    ? (faculties || []).filter(
        (f) =>
          String(f.campus_id?._id || f.campus_id) === String(filterCampus)
      )
    : faculties || [];

  const availableFilterDepartments = filterFaculty
    ? (departments || []).filter(
        (d) =>
          String(d.faculty_id?._id || d.faculty_id) === String(filterFaculty)
      )
    : departments || [];

  const availableFilterDegrees = filterDepartment
    ? (degrees || []).filter(
        (deg) =>
          String(deg.department_id?._id || deg.department_id) ===
          String(filterDepartment)
      )
    : degrees || [];

  const availableFaculties = editFormData.campus_id
    ? (faculties || []).filter(
        (f) =>
          String(f.campus_id?._id || f.campus_id) ===
          String(editFormData.campus_id)
      )
    : faculties || [];

  const availableDepartments = editFormData.faculty_id
    ? (departments || []).filter(
        (d) =>
          String(d.faculty_id?._id || d.faculty_id) ===
          String(editFormData.faculty_id)
      )
    : departments || [];

  const availableDegrees = editFormData.department_id
    ? (degrees || []).filter(
        (deg) =>
          String(deg.department_id?._id || deg.department_id) ===
          String(editFormData.department_id)
      )
    : degrees || [];

  return (
    <div className="admin-coordinators-page">
      {/* HEADER */}
      <div className="admin-page-header">
        <h2>Coordinators Governance Directory</h2>
        <p>View, alter, and manage all departmental coordinator accounts system-wide.</p>
      </div>

      {/* TOOLBAR & FILTERS */}
      <div className="admin-table-toolbar-container">
        <div className="admin-table-toolbar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by Employee ID, Name, Email, Campus, Department, Degree..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="table-count-badge">
            Total Coordinators: <strong>{filteredCoordinators.length}</strong>
          </div>
        </div>

        <div className="admin-filters-grid">
          <div className="filter-item">
            <label>Campus Filter</label>
            <select value={filterCampus} onChange={handleFilterCampusChange}>
              <option value="">All Campuses</option>
              {campuses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Faculty Filter</label>
            <select value={filterFaculty} onChange={handleFilterFacultyChange}>
              <option value="">All Faculties</option>
              {availableFilterFaculties.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Department Filter</label>
            <select value={filterDepartment} onChange={handleFilterDepartmentChange}>
              <option value="">All Departments</option>
              {availableFilterDepartments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Degree Filter</label>
            <select
              value={filterDegree}
              onChange={(e) => setFilterDegree(e.target.value)}
            >
              <option value="">All Degrees</option>
              {availableFilterDegrees.map((deg) => (
                <option key={deg._id} value={deg._id}>
                  {deg.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Account Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button className="reset-filters-btn" onClick={resetAllFilters}>
              🔄 Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading coordinators...</p>
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Coordinator Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Campus</th>
                  <th>Faculty</th>
                  <th>Department</th>
                  <th>Degree</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoordinators.length > 0 ? (
                  filteredCoordinators.map((coord) => (
                    <tr key={coord._id}>
                      <td className="font-bold">{coord.employee_id || "N/A"}</td>
                      <td>
                        <strong>{coord.name}</strong>
                      </td>
                      <td>{coord.email}</td>
                      <td>{coord.phone || "N/A"}</td>
                      <td>{coord.campus_id?.name || "Not Assigned"}</td>
                      <td>{coord.faculty_id?.name || "Not Assigned"}</td>
                      <td>{coord.department_id?.name || "Not Assigned"}</td>
                      <td>{coord.degree_id?.name || "Not Assigned"}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            coord.status ? "active" : "disabled"
                          }`}
                        >
                          {coord.status ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="admin-edit-btn"
                            onClick={() => handleOpenEdit(coord)}
                            title="Edit / Alter Details"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() =>
                              handleDeleteCoordinator(coord._id, coord.name)
                            }
                            title="Delete Account"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "30px" }}>
                      No coordinator records found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingCoord && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Edit Coordinator Account: {editingCoord.name}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setEditingCoord(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoordinator} className="admin-edit-form">
              <div className="modal-form-grid">
                {/* NAME */}
                <div className="form-group">
                  <label>Coordinator Name *</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* EMPLOYEE ID */}
                <div className="form-group">
                  <label>Employee ID (5 to 8 digits/chars) *</label>
                  <input
                    type="text"
                    value={editFormData.employee_id}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, employee_id: e.target.value })
                    }
                    required
                  />
                </div>

                {/* EMAIL */}
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    required
                  />
                </div>

                {/* PHONE */}
                <div className="form-group">
                  <label>Phone Number (11-digits)</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                  />
                </div>

                {/* STATUS */}
                <div className="form-group">
                  <label>Account Status</label>
                  <select
                    value={editFormData.status ? "true" : "false"}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Active (Allowed Login)</option>
                    <option value="false">Disabled (Access Blocked)</option>
                  </select>
                </div>

                {/* ALTER CAMPUS */}
                <div className="form-group">
                  <label>Assigned Campus</label>
                  <select
                    value={editFormData.campus_id}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        campus_id: e.target.value,
                        faculty_id: "",
                        department_id: "",
                      })
                    }
                  >
                    <option value="">Select Campus</option>
                    {campuses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ALTER FACULTY */}
                <div className="form-group">
                  <label>Assigned Faculty</label>
                  <select
                    value={editFormData.faculty_id}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        faculty_id: e.target.value,
                        department_id: "",
                      })
                    }
                  >
                    <option value="">Select Faculty</option>
                    {availableFaculties.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ALTER DEPARTMENT */}
                <div className="form-group">
                  <label>Assigned Department</label>
                  <select
                    value={editFormData.department_id}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        department_id: e.target.value,
                        degree_id: "",
                      })
                    }
                  >
                    <option value="">Select Department</option>
                    {availableDepartments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ALTER DEGREE */}
                <div className="form-group">
                  <label>Assigned Degree</label>
                  <select
                    value={editFormData.degree_id}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        degree_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Degree (Optional)</option>
                    {availableDegrees.map((deg) => (
                      <option key={deg._id} value={deg._id}>
                        {deg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* RESET PASSWORD */}
                <div className="form-group full-width">
                  <label>Reset Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Enter new password if changing"
                    value={editFormData.newPassword}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {modalMessage && (
                <p
                  className={`modal-msg ${
                    modalMessage.includes("success") ? "success" : "error"
                  }`}
                >
                  {modalMessage}
                </p>
              )}

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setEditingCoord(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "Save Coordinator Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorsList;
