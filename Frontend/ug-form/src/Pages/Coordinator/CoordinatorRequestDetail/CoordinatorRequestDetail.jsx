import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import "./CoordinatorRequestDetail.css";

const CoordinatorRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [coordDocPreviewModal, setCoordDocPreviewModal] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/ugforms/${id}`);
        const formData = res.data;
        setForm(formData);
        setRemarks(formData.coordinatorRemarks || "");

        // Courses fetch (degree + semester ke hisaab se)
        if (formData.degree_id && formData.semester_id) {
          const coursesRes = await api.get("/courses");

          const degreeId =
            typeof formData.degree_id === "object"
              ? formData.degree_id._id
              : formData.degree_id;

          const semesterId =
            typeof formData.semester_id === "object"
              ? formData.semester_id._id
              : formData.semester_id;

          const filtered = coursesRes.data.filter((course) => {
            const courseDegreeId =
              typeof course.degree_id === "object"
                ? course.degree_id?._id
                : course.degree_id;

            const courseSemesterId =
              typeof course.semester_id === "object"
                ? course.semester_id?._id
                : course.semester_id;

            return (
              String(courseDegreeId) === String(degreeId) &&
              String(courseSemesterId) === String(semesterId)
            );
          });

          setCourses(filtered);
        }
      } catch (error) {
        console.log(error);
        alert("Form not found");
        navigate("/coordinator/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchForm();
  }, [id, navigate]);

  const handleStatusUpdate = async (status) => {
    try {
      setActionLoading(true);

      await api.put(`/ugforms/${id}`, {
        status,
        coordinatorRemarks: remarks,
      });

      alert(`Form ${status} Successfully`);
      navigate("/coordinator/dashboard");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="request-detail-loading">
        Loading request details...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="request-detail-loading">
        Form not found
      </div>
    );
  }

  return (
    <div className="request-detail-page">
      {/* Header */}
      <div className="request-detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Student UG Form Request</h2>
        <span className={`status-badge ${form.status?.toLowerCase()}`}>
          {form.status}
        </span>
      </div>

      {/* =========================
          OFFICIAL UG FORM LAYOUT
      ========================== */}
      <div className="ug-form-sheet request-form-sheet">
        {/* HEADER */}
        <div className="form-heading">
          <div className="form-heading-top">
            <h1>UNIVERSITY OF AGRICULTURE, FAISALABAD, PAKISTAN</h1>
            <div className="form-copy-label">Coordinator View</div>
          </div>

          <h2>
            Form for listing courses to be taken in{" "}
            {form.semester_id?.name || "Semester"}, 2025-2026
          </h2>
          <h3>{form.faculty_id?.name || "Faculty of Sciences"}</h3>
        </div>

        {/* STUDENT INFORMATION */}
        <div className="student-form-info">
          <div className="info-row info-row-three">
            <div className="info-field">
              <strong>Admission to:</strong>
              <span>{form.semester_id?.name || "-"}</span>
            </div>
            <div className="info-field">
              <strong>Degree:</strong>
              <span>{form.degree_id?.name || "-"}</span>
            </div>
            <div className="info-field">
              <strong>Semester:</strong>
              <span>{form.semester_id?.name || "-"}</span>
            </div>
          </div>

          <div className="info-row info-row-three">
            <div className="info-field">
              <strong>AG Number:</strong>
              <span>{form.agNumber || "-"}</span>
            </div>
            <div className="info-field">
              <strong>Status:</strong>
              <span>{form.status || "-"}</span>
            </div>
            <div className="info-field">
              <strong>Submitted On:</strong>
              <span>
                {form.createdAt
                  ? new Date(form.createdAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>

          <div className="info-row info-row-two">
            <div className="info-field">
              <strong>Name of Student:</strong>
              <span>{form.studentName || "-"}</span>
            </div>
            <div className="info-field">
              <strong>Father’s Name:</strong>
              <span>{form.fatherName || "-"}</span>
            </div>
          </div>

          <div className="info-row">
            <div className="info-field full-width">
              <strong>Permanent Address:</strong>
              <span>{form.address || "-"}</span>
            </div>
          </div>
        </div>

        {/* COURSES TABLE */}
        <h4 className="courses-heading">Courses to be taken during Semester</h4>

        <div className="courses-table-wrapper">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Course #</th>
                <th>Course Title</th>
                <th>Credit Hours</th>
                <th>Total Marks</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course._id}>
                    <td>{course.courseCode}</td>
                    <td>{course.courseTitle}</td>
                    <td>{course.creditHours}</td>
                    <td>{course.totalMarks || "-"}</td>
                    <td>{course.remarks || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
          VOUCHER SECTION
      ========================== */}
      <div className="request-detail-card" style={{ marginTop: "24px" }}>
        <div className="detail-section">
          <h3>Fee Voucher / Deferment Form</h3>
          {form.voucher?.uploaded && (form.voucher?.fileUrl || form.voucher?.base64Data) ? (
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <p style={{ marginBottom: "10px", fontWeight: "bold", color: "#166534" }}>✓ Paid Fee Voucher uploaded by student:</p>

              {(form.voucher.fileUrl || form.voucher.base64Data).startsWith("data:image") || (form.voucher.fileUrl || "").includes("/uploads/") ? (
                <div style={{ marginBottom: "10px" }}>
                  <img
                    src={form.voucher.fileUrl || form.voucher.base64Data}
                    alt="Fee Voucher Preview"
                    style={{
                      maxWidth: "240px",
                      maxHeight: "160px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      cursor: "pointer"
                    }}
                    onClick={() => setCoordDocPreviewModal({ title: "Paid Fee Voucher", url: form.voucher.fileUrl || form.voucher.base64Data })}
                  />
                </div>
              ) : null}

              <button
                type="button"
                className="approve-btn"
                style={{ fontSize: "13px", padding: "6px 14px" }}
                onClick={() => setCoordDocPreviewModal({ title: "Paid Fee Voucher", url: form.voucher.fileUrl || form.voucher.base64Data })}
              >
                Preview Full Document
              </button>
            </div>
          ) : form.deferment?.uploaded && (form.deferment?.fileUrl || form.deferment?.base64Data) ? (
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <p style={{ marginBottom: "10px", fontWeight: "bold", color: "#166534" }}>✓ Approved Fee Deferment Application Form uploaded by student:</p>

              {(form.deferment.fileUrl || form.deferment.base64Data).startsWith("data:image") || (form.deferment.fileUrl || "").includes("/uploads/") ? (
                <div style={{ marginBottom: "10px" }}>
                  <img
                    src={form.deferment.fileUrl || form.deferment.base64Data}
                    alt="Fee Deferment Form Preview"
                    style={{
                      maxWidth: "240px",
                      maxHeight: "160px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      cursor: "pointer"
                    }}
                    onClick={() => setCoordDocPreviewModal({ title: "Approved Fee Deferment Application Form", url: form.deferment.fileUrl || form.deferment.base64Data })}
                  />
                </div>
              ) : null}

              <button
                type="button"
                className="approve-btn"
                style={{ fontSize: "13px", padding: "6px 14px" }}
                onClick={() => setCoordDocPreviewModal({ title: "Approved Fee Deferment Application Form", url: form.deferment.fileUrl || form.deferment.base64Data })}
              >
                Preview Full Document
              </button>
            </div>
          ) : (
            <p className="no-courses">No Fee Voucher or Deferment Application uploaded yet</p>
          )}
        </div>

        {/* Remarks */}
        <div className="detail-section">
          <h3>Coordinator Remarks</h3>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Write remarks (optional)"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        {form.status === "Submitted" && (
          <div className="action-buttons">
            <button
              className="reject-btn"
              disabled={actionLoading}
              onClick={() => handleStatusUpdate("Rejected")}
            >
              {actionLoading ? "Processing..." : "Reject"}
            </button>

            <button
              className="approve-btn"
              disabled={actionLoading}
              onClick={() => handleStatusUpdate("Approved")}
            >
              {actionLoading ? "Processing..." : "Approve"}
            </button>
          </div>
        )}

        {form.status !== "Submitted" && (
          <div className="already-actioned">
            This form has already been <strong>{form.status}</strong>.
          </div>
        )}
      </div>
      {/* COORDINATOR DOCUMENT PREVIEW LIGHTBOX MODAL */}
      {coordDocPreviewModal && (
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
          onClick={() => setCoordDocPreviewModal(null)}
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
                Coordinator Document Review: {coordDocPreviewModal.title}
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
                onClick={() => setCoordDocPreviewModal(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px", overflowY: "auto", textAlign: "center", flex: 1, background: "#f8fafc" }}>
              {coordDocPreviewModal.url.startsWith("data:image") || coordDocPreviewModal.url.includes("/uploads/") ? (
                <img
                  src={coordDocPreviewModal.url}
                  alt={coordDocPreviewModal.title}
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
                  src={coordDocPreviewModal.url}
                  title={coordDocPreviewModal.title}
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
                onClick={() => setCoordDocPreviewModal(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorRequestDetail;