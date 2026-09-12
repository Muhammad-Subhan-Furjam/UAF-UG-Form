import React, { useState, useEffect } from "react";
import api from "../../api/api";
import "./AdminForms.css";

const AdminForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal States
  const [viewingForm, setViewingForm] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [adminDocPreviewModal, setAdminDocPreviewModal] = useState(null);

  const [editData, setEditData] = useState({
    studentName: "",
    agNumber: "",
    fatherName: "",
    address: "",
    section: "",
    semesterCommencing: "",
    firstEnrollmentDate: "",
    voucherNumber: "",
    status: "Submitted",
    remarks: "",
  });

  const [saving, setSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // =========================================
  // FETCH ALL UG FORMS FOR SUPER ADMIN
  // =========================================
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

  // =========================================
  // CHANGE STATUS (ACCEPT / REJECT)
  // =========================================
  const handleUpdateStatus = async (formId, newStatus) => {
    const confirmMsg =
      newStatus === "Approved"
        ? "Are you sure you want to ACCEPT / APPROVE this UG Form?"
        : `Are you sure you want to mark this UG Form as ${newStatus}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await api.put(`/admin/forms/${formId}/status`, { status: newStatus });
      alert(`UG Form has been marked as '${newStatus}' successfully!`);
      fetchForms();
      if (viewingForm && viewingForm._id === formId) {
        setViewingForm((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Failed to update form status:", error);
      alert(error.response?.data?.message || "Failed to update form status.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // OPEN EDIT MODAL
  // =========================================
  const handleOpenEdit = (form) => {
    setEditingForm(form);
    setEditData({
      studentName: form.studentName || form.student_id?.name || "",
      agNumber: form.agNumber || form.student_id?.ag_number || "",
      fatherName: form.fatherName || form.student_id?.fatherName || "",
      address: form.address || "",
      section: form.section || "",
      semesterCommencing: form.semesterCommencing || "",
      firstEnrollmentDate: form.firstEnrollmentDate || "",
      voucherNumber: form.voucherNumber || "",
      status: form.status || "Submitted",
      remarks: form.remarks || "",
    });
    setModalMessage("");
  };

  // =========================================
  // SAVE FULL FORM EDIT
  // =========================================
  const handleSaveFormEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalMessage("");

    try {
      await api.put(`/admin/forms/${editingForm._id}`, editData);
      setModalMessage("UG Form updated successfully!");
      fetchForms();
      setTimeout(() => {
        setEditingForm(null);
      }, 1000);
    } catch (error) {
      setModalMessage(error.response?.data?.message || "Failed to update UG Form.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // DELETE FORM
  // =========================================
  const handleDeleteForm = async (formId) => {
    if (!window.confirm("Are you sure you want to DELETE this UG Form submission? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/admin/forms/${formId}`);
      alert("UG Form deleted successfully!");
      fetchForms();
      if (viewingForm && viewingForm._id === formId) {
        setViewingForm(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete UG Form.");
    }
  };

  // =========================================
  // FILTERING LOGIC
  // =========================================
  const filteredForms = forms.filter((f) => {
    if (filterStatus !== "all") {
      const statusLower = (f.status || "").toLowerCase();
      if (filterStatus === "approved" && statusLower !== "approved" && statusLower !== "accepted") {
        return false;
      }
      if (filterStatus === "rejected" && statusLower !== "rejected") {
        return false;
      }
      if (filterStatus === "submitted" && statusLower !== "submitted") {
        return false;
      }
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (f.studentName && String(f.studentName).toLowerCase().includes(q)) ||
      (f.agNumber && String(f.agNumber).toLowerCase().includes(q)) ||
      (f.student_id?.ag_number && String(f.student_id.ag_number).toLowerCase().includes(q)) ||
      (f.degree && String(f.degree).toLowerCase().includes(q)) ||
      (f.degree_id?.name && String(f.degree_id.name).toLowerCase().includes(q)) ||
      (f.status && String(f.status).toLowerCase().includes(q)) ||
      (f.section && String(f.section).toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-forms-page">
      {/* HEADER */}
      <div className="admin-page-header">
        <h2>UG Form Submissions Control Center</h2>
        <p>Full Super Admin authority to view, edit, accept/approve, reject, or delete undergraduate form submissions.</p>
      </div>

      {/* TOOLBAR & SEARCH */}
      <div className="admin-table-toolbar-container">
        <div className="admin-table-toolbar">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by AG Number, Student Name, Degree, Section, Status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="table-filters-group" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="admin-select-filter"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted (Pending Review)</option>
              <option value="approved">Approved / Accepted</option>
              <option value="rejected">Rejected</option>
            </select>

            <span className="forms-badge-count">Total Submissions: {filteredForms.length}</span>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
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
                  <th>CNIC / Father</th>
                  <th>Campus / Department</th>
                  <th>Degree & Section</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: "center" }}>Super Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.length > 0 ? (
                  filteredForms.map((f) => {
                    const statusClass = (f.status || "submitted").toLowerCase();
                    return (
                      <tr key={f._id}>
                        <td className="font-bold">{f.agNumber || f.student_id?.ag_number || "N/A"}</td>
                        <td>
                          <strong>{f.studentName || f.student_id?.name || "N/A"}</strong>
                        </td>
                        <td>
                          <div style={{ fontSize: "12px" }}>
                            {f.cnic || f.student_id?.cnic || "N/A"}
                            <br />
                            <small style={{ color: "#64748b" }}>
                              S/O: {f.fatherName || f.student_id?.fatherName || "N/A"}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "12px" }}>
                            <strong>{f.campus_id?.name || f.campus || "N/A"}</strong>
                            <br />
                            <small style={{ color: "#64748b" }}>
                              {f.department_id?.name || f.department || "N/A"}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "12px" }}>
                            {f.degree_id?.name || f.degree || "N/A"}
                            {f.section ? ` (${f.section})` : ""}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            {f.status === "Approved" ? "Accepted / Approved" : f.status || "Submitted"}
                          </span>
                        </td>
                        <td>{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "N/A"}</td>
                        <td>
                          <div className="action-buttons-cell" style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            {/* VIEW BUTTON */}
                            <button
                              className="admin-action-btn view-btn"
                              title="View Full Form Details"
                              onClick={() => setViewingForm(f)}
                            >
                              View
                            </button>

                            {/* EDIT BUTTON */}
                            <button
                              className="admin-action-btn edit-btn"
                              title="Edit UG Form Data"
                              onClick={() => handleOpenEdit(f)}
                            >
                              Edit
                            </button>

                            {/* ACCEPT / APPROVE BUTTON */}
                            {f.status !== "Approved" && f.status !== "Accepted" && (
                              <button
                                className="admin-action-btn approve-btn"
                                title="Accept & Approve UG Form"
                                onClick={() => handleUpdateStatus(f._id, "Approved")}
                              >
                                Accept
                              </button>
                            )}

                            {/* REJECT BUTTON */}
                            {f.status !== "Rejected" && (
                              <button
                                className="admin-action-btn reject-btn"
                                title="Reject UG Form"
                                onClick={() => handleUpdateStatus(f._id, "Rejected")}
                              >
                                Reject
                              </button>
                            )}

                            {/* DELETE BUTTON */}
                            <button
                              className="admin-action-btn delete-btn"
                              title="Delete Form Submission"
                              onClick={() => handleDeleteForm(f._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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

      {/* =========================================
          VIEW UG FORM MODAL
      ========================================= */}
      {viewingForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card wide-modal" style={{ maxWidth: "850px", width: "90%" }}>
            <div className="admin-modal-header">
              <div>
                <h3>UG Form Submission Details</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  AG Number: <strong>{viewingForm.agNumber || viewingForm.student_id?.ag_number}</strong> | Form Status:{" "}
                  <strong style={{ color: viewingForm.status === "Approved" ? "#166534" : viewingForm.status === "Rejected" ? "#991b1b" : "#1e40af" }}>
                    {viewingForm.status || "Submitted"}
                  </strong>
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setViewingForm(null)}>
                ✕
              </button>
            </div>

            <div className="admin-view-modal-content" style={{ maxHeight: "70vh", overflowY: "auto", padding: "15px" }}>
              {/* STUDENT & ACADEMIC INFO CARDS */}
              <div className="view-details-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                <div className="view-card" style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#082f5c" }}>Student Profile</h4>
                  <p style={{ margin: "4px 0" }}><strong>Name:</strong> {viewingForm.studentName || viewingForm.student_id?.name || "N/A"}</p>
                  <p style={{ margin: "4px 0" }}><strong>AG Number:</strong> {viewingForm.agNumber || viewingForm.student_id?.ag_number || "N/A"}</p>
                  <p style={{ margin: "4px 0" }}><strong>Father Name:</strong> {viewingForm.fatherName || viewingForm.student_id?.fatherName || "N/A"}</p>
                  <p style={{ margin: "4px 0" }}><strong>CNIC / B-Form:</strong> {viewingForm.cnic || viewingForm.student_id?.cnic || "N/A"}</p>
                  <p style={{ margin: "4px 0" }}><strong>Email:</strong> {viewingForm.email || viewingForm.student_id?.email || "N/A"}</p>
                  <p style={{ margin: "4px 0" }}><strong>Phone:</strong> {viewingForm.phone || viewingForm.student_id?.phone || "N/A"}</p>
                </div>

                <div className="view-card" style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#082f5c" }}>Academic Placement</h4>
                  <p style={{ margin: "4px 0" }}><strong>Campus:</strong> {viewingForm.campus_id?.name || viewingForm.campus || "N/A"}</p>
                  <p style={{ margin: "4px 0" }}><strong>Faculty:</strong> {viewingForm.faculty_id?.name || "N/A"}</p>
                  <p style={{ margin: "4px 0" }}><strong>Department:</strong> {viewingForm.department_id?.name || viewingForm.department || "N/A"}</p>
                  <p style={{ margin: "4px 0" }}><strong>Degree:</strong> {viewingForm.degree_id?.name || viewingForm.degree || "N/A"}</p>
                  <p style={{ margin: "4px 0" }}><strong>Section:</strong> {viewingForm.section || "N/A"}</p>
                  <p style={{ margin: "4px 0" }}><strong>Commencing Date:</strong> {viewingForm.semesterCommencing || "N/A"}</p>
                </div>

                <div className="view-card" style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#082f5c" }}>Form & Payment Status</h4>
                  <p style={{ margin: "4px 0" }}><strong>Voucher No:</strong> {viewingForm.voucherNumber || "N/A"}</p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Fee Voucher:</strong>{" "}
                    {viewingForm.voucher?.uploaded ? (
                      <span style={{ color: "#166534", fontWeight: "bold" }}>Uploaded</span>
                    ) : (
                      <span style={{ color: "#991b1b" }}>Not Uploaded</span>
                    )}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Fee Deferment:</strong>{" "}
                    {viewingForm.deferment?.uploaded ? (
                      <span style={{ color: "#166534", fontWeight: "bold" }}>Approved Application Uploaded</span>
                    ) : (
                      <span style={{ color: "#64748b" }}>None</span>
                    )}
                  </p>
                  {viewingForm.remarks && (
                    <p style={{ margin: "4px 0" }}><strong>Super Admin / Coordinator Remarks:</strong> {viewingForm.remarks}</p>
                  )}
                </div>
              </div>

              {/* STUDENT UPLOADED DOCUMENTS PREVIEWS FOR SUPER ADMIN */}
              {(viewingForm.voucher?.uploaded || viewingForm.deferment?.uploaded) && (
                <div className="view-card" style={{ background: "#f8fafc", padding: "14px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                  <h4 style={{ margin: "0 0 12px 0", color: "#082f5c" }}>Uploaded Fee Vouchers & Deferment Forms</h4>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    {viewingForm.voucher?.uploaded && (viewingForm.voucher?.fileUrl || viewingForm.voucher?.base64Data) && (
                      <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "bold", color: "#166534" }}>
                          ✓ Paid Fee Voucher
                        </p>
                        {(viewingForm.voucher.fileUrl || viewingForm.voucher.base64Data).startsWith("data:image") || (viewingForm.voucher.fileUrl || "").includes("/uploads/") ? (
                          <img
                            src={viewingForm.voucher.fileUrl || viewingForm.voucher.base64Data}
                            alt="Fee Voucher"
                            style={{ width: "160px", height: "110px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer" }}
                            onClick={() => setAdminDocPreviewModal({ title: "Student Paid Fee Voucher", url: viewingForm.voucher.fileUrl || viewingForm.voucher.base64Data })}
                          />
                        ) : (
                          <p style={{ fontSize: "12px", color: "#64748b" }}>Document file uploaded</p>
                        )}
                        <br />
                        <button
                          type="button"
                          className="admin-action-btn view-btn"
                          style={{ marginTop: "8px", fontSize: "12px" }}
                          onClick={() => setAdminDocPreviewModal({ title: "Student Paid Fee Voucher", url: viewingForm.voucher.fileUrl || viewingForm.voucher.base64Data })}
                        >
                          View / Preview Full Voucher
                        </button>
                      </div>
                    )}

                    {viewingForm.deferment?.uploaded && (viewingForm.deferment?.fileUrl || viewingForm.deferment?.base64Data) && (
                      <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "bold", color: "#166534" }}>
                          ✓ Approved Fee Deferment Form
                        </p>
                        {(viewingForm.deferment.fileUrl || viewingForm.deferment.base64Data).startsWith("data:image") || (viewingForm.deferment.fileUrl || "").includes("/uploads/") ? (
                          <img
                            src={viewingForm.deferment.fileUrl || viewingForm.deferment.base64Data}
                            alt="Fee Deferment"
                            style={{ width: "160px", height: "110px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer" }}
                            onClick={() => setAdminDocPreviewModal({ title: "Approved Fee Deferment Application Form", url: viewingForm.deferment.fileUrl || viewingForm.deferment.base64Data })}
                          />
                        ) : (
                          <p style={{ fontSize: "12px", color: "#64748b" }}>Document file uploaded</p>
                        )}
                        <br />
                        <button
                          type="button"
                          className="admin-action-btn view-btn"
                          style={{ marginTop: "8px", fontSize: "12px" }}
                          onClick={() => setAdminDocPreviewModal({ title: "Approved Fee Deferment Application Form", url: viewingForm.deferment.fileUrl || viewingForm.deferment.base64Data })}
                        >
                          View / Preview Deferment Form
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ENROLLED COURSES */}
              <div className="view-courses-section">
                <h4 style={{ color: "#082f5c", margin: "15px 0 10px 0" }}>Enrolled Courses ({viewingForm.courses?.length || 0})</h4>
                {viewingForm.courses && viewingForm.courses.length > 0 ? (
                  <table className="admin-data-table" style={{ fontSize: "13px" }}>
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Title</th>
                        <th>Credit Hours</th>
                        <th>Category</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingForm.courses.map((item, idx) => {
                        const c = item.course_id || item;
                        return (
                          <tr key={idx}>
                            <td><strong>{c.courseCode || item.courseCode || "N/A"}</strong></td>
                            <td>{c.courseTitle || item.courseTitle || "N/A"}</td>
                            <td>{c.creditHours || item.creditHours || "N/A"}</td>
                            <td>{c.courseCategory || item.courseCategory || "General Course"}</td>
                            <td>{c.courseType || item.courseType || "Compulsory"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: "#64748b", fontStyle: "italic" }}>No courses attached to this form.</p>
                )}
              </div>
            </div>

            <div className="modal-actions-row" style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              {viewingForm.status !== "Approved" && viewingForm.status !== "Accepted" && (
                <button
                  className="admin-action-btn approve-btn"
                  onClick={() => handleUpdateStatus(viewingForm._id, "Approved")}
                >
                  Accept & Approve Form
                </button>
              )}

              {viewingForm.status !== "Rejected" && (
                <button
                  className="admin-action-btn reject-btn"
                  onClick={() => handleUpdateStatus(viewingForm._id, "Rejected")}
                >
                  Reject Form
                </button>
              )}

              <button
                className="admin-action-btn edit-btn"
                onClick={() => {
                  const targetForm = viewingForm;
                  setViewingForm(null);
                  handleOpenEdit(targetForm);
                }}
              >
                Edit Form Data
              </button>

              <button className="modal-cancel-btn" onClick={() => setViewingForm(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          EDIT UG FORM MODAL
      ========================================= */}
      {editingForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Edit UG Form: {editData.agNumber}</h3>
              <button className="modal-close-btn" onClick={() => setEditingForm(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFormEdit} className="admin-modal-form">
              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Student Name</label>
                  <input
                    type="text"
                    value={editData.studentName}
                    onChange={(e) => setEditData({ ...editData, studentName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>AG Number</label>
                  <input
                    type="text"
                    value={editData.agNumber}
                    onChange={(e) => setEditData({ ...editData, agNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Father's Name</label>
                  <input
                    type="text"
                    value={editData.fatherName}
                    onChange={(e) => setEditData({ ...editData, fatherName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Section</label>
                  <input
                    type="text"
                    value={editData.section}
                    onChange={(e) => setEditData({ ...editData, section: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Semester Commencing Date</label>
                  <input
                    type="text"
                    value={editData.semesterCommencing}
                    onChange={(e) => setEditData({ ...editData, semesterCommencing: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Voucher Number</label>
                  <input
                    type="text"
                    value={editData.voucherNumber}
                    onChange={(e) => setEditData({ ...editData, voucherNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>UG Form Status *</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  >
                    <option value="Submitted">Submitted (Pending)</option>
                    <option value="Approved">Accepted / Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Super Admin Remarks / Notes</label>
                  <textarea
                    rows="3"
                    value={editData.remarks}
                    onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                    placeholder="Add approval comments or rejection reasons..."
                  />
                </div>
              </div>

              {modalMessage && (
                <p className={`modal-msg ${modalMessage.includes("success") ? "success" : "error"}`}>
                  {modalMessage}
                </p>
              )}

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setEditingForm(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save Form Updates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* SUPER ADMIN DOCUMENT PREVIEW LIGHTBOX MODAL */}
      {adminDocPreviewModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
          onClick={() => setAdminDocPreviewModal(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              maxWidth: "850px",
              width: "95%",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#082f5c",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                Super Admin Document Inspection: {adminDocPreviewModal.title}
              </h3>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "20px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
                onClick={() => setAdminDocPreviewModal(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px", overflowY: "auto", textAlign: "center", flex: 1, background: "#f8fafc" }}>
              {adminDocPreviewModal.url.startsWith("data:image") || adminDocPreviewModal.url.includes("/uploads/") ? (
                <img
                  src={adminDocPreviewModal.url}
                  alt={adminDocPreviewModal.title}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "65vh",
                    objectFit: "contain",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                />
              ) : (
                <iframe
                  src={adminDocPreviewModal.url}
                  title={adminDocPreviewModal.title}
                  style={{ width: "100%", height: "60vh", border: "none" }}
                />
              )}
            </div>

            <div style={{ padding: "12px 20px", background: "#f1f5f9", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>
              <button
                style={{
                  padding: "8px 18px",
                  background: "#475569",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
                onClick={() => setAdminDocPreviewModal(null)}
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminForms;
