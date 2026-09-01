import React, { useState, useEffect } from "react";
import api from "../../api/api";
import "./StudentsList.css";

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Hierarchy Data
  const [campuses, setCampuses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    ag_number: "",
    fatherName: "",
    admissionDate: "",
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
  // LOAD STUDENTS & HIERARCHY
  // =========================================
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/students");
      setStudents(res.data || []);
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

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
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      cnic: student.cnic || "",
      ag_number: student.ag_number || "",
      fatherName: student.fatherName || "",
      admissionDate: student.admissionDate
        ? new Date(student.admissionDate).toISOString().split("T")[0]
        : "",
      campus_id: student.campus_id?._id || student.campus_id || "",
      faculty_id: student.faculty_id?._id || student.faculty_id || "",
      department_id: student.department_id?._id || student.department_id || "",
      degree_id: student.degree_id?._id || student.degree_id || "",
      status: student.status !== undefined ? student.status : true,
      newPassword: "",
    });
    setModalMessage("");
  };

  // =========================================
  // SAVE EDIT
  // =========================================
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalMessage("");

    try {
      const payload = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        cnic: editFormData.cnic,
        ag_number: editFormData.ag_number,
        fatherName: editFormData.fatherName,
        admissionDate: editFormData.admissionDate || null,
        campus_id: editFormData.campus_id || null,
        faculty_id: editFormData.faculty_id || null,
        department_id: editFormData.department_id || null,
        degree_id: editFormData.degree_id || null,
        status: editFormData.status,
      };

      if (editFormData.newPassword.trim()) {
        payload.password = editFormData.newPassword.trim();
      }

      await api.put(`/admin/users/${editingStudent._id}`, payload);
      setModalMessage("Student details updated successfully!");

      fetchStudents();
      setTimeout(() => {
        setEditingStudent(null);
      }, 1200);
    } catch (error) {
      setModalMessage(
        error.response?.data?.message || "Failed to update student."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // DELETE STUDENT
  // =========================================
  const handleDeleteStudent = async (studentId, studentName) => {
    if (
      window.confirm(
        `Are you sure you want to delete student '${studentName}'? This action will remove their account and submitted forms.`
      )
    ) {
      try {
        await api.delete(`/admin/users/${studentId}`);
        fetchStudents();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete student");
      }
    }
  };

  // =========================================
  // FILTERED STUDENTS
  // =========================================
  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (s.ag_number && String(s.ag_number).toLowerCase().includes(q)) ||
      (s.name && String(s.name).toLowerCase().includes(q)) ||
      (s.email && String(s.email).toLowerCase().includes(q)) ||
      (s.phone && String(s.phone).toLowerCase().includes(q)) ||
      (s.cnic && String(s.cnic).toLowerCase().includes(q)) ||
      (s.campus_id?.name && String(s.campus_id.name).toLowerCase().includes(q)) ||
      (s.department_id?.name && String(s.department_id.name).toLowerCase().includes(q))
    );
  });

  // Filtered dropdown lists for Edit Modal
  const availableFaculties = editFormData.campus_id
    ? faculties.filter(
        (f) =>
          String(f.campus_id?._id || f.campus_id) ===
          String(editFormData.campus_id)
      )
    : faculties;

  const availableDepartments = editFormData.faculty_id
    ? departments.filter(
        (d) =>
          String(d.faculty_id?._id || d.faculty_id) ===
          String(editFormData.faculty_id)
      )
    : departments;

  const availableDegrees = editFormData.department_id
    ? degrees.filter(
        (deg) =>
          String(deg.department_id?._id || deg.department_id) ===
          String(editFormData.department_id)
      )
    : degrees;

  return (
    <div className="admin-students-page">
      {/* HEADER */}
      <div className="admin-page-header">
        <h2>Students Governance Directory</h2>
        <p>View, alter, and manage all registered student accounts system-wide.</p>
      </div>

      {/* TOOLBAR */}
      <div className="admin-table-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by AG Number, Name, CNIC, Email, Campus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="table-count-badge">
          Total Students: <strong>{filteredStudents.length}</strong>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading students...</p>
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>AG Number</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>CNIC</th>
                  <th>Campus</th>
                  <th>Faculty</th>
                  <th>Department</th>
                  <th>Degree / Discipline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td className="font-bold">{student.ag_number || "N/A"}</td>
                      <td>
                        <strong>{student.name}</strong>
                        {student.fatherName && (
                          <div className="sub-text">S/O {student.fatherName}</div>
                        )}
                      </td>
                      <td>{student.email}</td>
                      <td>{student.phone || "N/A"}</td>
                      <td>{student.cnic || "N/A"}</td>
                      <td>{student.campus_id?.name || "Not Assigned"}</td>
                      <td>{student.faculty_id?.name || "Not Assigned"}</td>
                      <td>{student.department_id?.name || "Not Assigned"}</td>
                      <td>{student.degree_id?.name || "Not Assigned"}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            student.status ? "active" : "disabled"
                          }`}
                        >
                          {student.status ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="admin-edit-btn"
                            onClick={() => handleOpenEdit(student)}
                            title="Edit / Alter Details"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() =>
                              handleDeleteStudent(student._id, student.name)
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
                    <td colSpan="11" style={{ textAlign: "center", padding: "30px" }}>
                      No student records found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingStudent && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Edit Student Account: {editingStudent.name}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setEditingStudent(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="admin-edit-form">
              <div className="modal-form-grid">
                {/* NAME */}
                <div className="form-group">
                  <label>Student Name *</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* AG NUMBER */}
                <div className="form-group">
                  <label>AG Number (YYYY-ag-XXXX) *</label>
                  <input
                    type="text"
                    value={editFormData.ag_number}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, ag_number: e.target.value })
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

                {/* CNIC */}
                <div className="form-group">
                  <label>CNIC Number (13-digits)</label>
                  <input
                    type="text"
                    value={editFormData.cnic}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, cnic: e.target.value })
                    }
                  />
                </div>

                {/* FATHER NAME */}
                <div className="form-group">
                  <label>Father's Name</label>
                  <input
                    type="text"
                    value={editFormData.fatherName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, fatherName: e.target.value })
                    }
                  />
                </div>

                {/* ADMISSION DATE */}
                <div className="form-group">
                  <label>Date of Admission</label>
                  <input
                    type="date"
                    value={editFormData.admissionDate}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, admissionDate: e.target.value })
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
                        degree_id: "",
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
                        degree_id: "",
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

                {/* ALTER DEGREE / DISCIPLINE */}
                <div className="form-group">
                  <label>Assigned Degree / Discipline</label>
                  <select
                    value={editFormData.degree_id}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        degree_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Degree / Discipline</option>
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
                  onClick={() => setEditingStudent(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "Save Student Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;
