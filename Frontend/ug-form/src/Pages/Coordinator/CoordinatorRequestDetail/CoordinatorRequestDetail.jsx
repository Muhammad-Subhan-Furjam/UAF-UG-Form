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
          <h3>Fee Voucher</h3>
          {form.voucher?.uploaded && form.voucher?.fileUrl ? (
            <div>
              <p style={{ marginBottom: "10px" }}>Voucher uploaded by student:</p>
              <a
                href={form.voucher.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#1e3a5f",
                  fontWeight: 500,
                  textDecoration: "underline",
                }}
              >
                View / Download Voucher
              </a>
            </div>
          ) : (
            <p className="no-courses">No voucher uploaded yet</p>
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
    </div>
  );
};

export default CoordinatorRequestDetail;