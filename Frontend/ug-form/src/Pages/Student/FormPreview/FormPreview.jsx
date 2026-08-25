import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import "./FormPreview.css"; // optional, MyForms.css bhi use kar sakte ho

const FormPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/ugforms/${id}`);
        setForm(res.data);
      } catch (error) {
        console.log("Error fetching form:", error);
        alert("Form not found");
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchForm();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        Loading form...
      </div>
    );
  }

  if (!form) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        Form not found
      </div>
    );
  }

  return (
    <div className="form-preview-page">
      <div className="form-preview-actions">
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="ug-form-sheet">
        {/* HEADER */}
        <div className="form-heading">
          <div className="form-heading-top">
            <h1>UNIVERSITY OF AGRICULTURE, FAISALABAD, PAKISTAN</h1>
            <div className="form-copy-label">
              
Dean Copy / Student Copy / Controller Copy
            </div>
          </div>
          <h2>
            Form for listing courses to be taken in{" "}
            {form.semester_id?.name || "Semester"} , 2025-2026
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

        {/* COURSES TABLE (if available) */}
        <h4 className="courses-heading">Courses to be taken during Semester</h4>

        <div className="courses-table-wrapper">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Course #</th>
                <th>Course Title</th>
                <th>Credit Hours</th>
              </tr>
            </thead>
            <tbody>
              {form.courses && form.courses.length > 0 ? (
                form.courses.map((course, index) => (
                  <tr key={index}>
                    <td>{course.courseCode || "-"}</td>
                    <td>{course.courseTitle || "-"}</td>
                    <td>{course.creditHours || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No courses selected yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SIGNATURES */}
        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <strong>Signature of Student</strong>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <strong>Coordinator</strong>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <strong>Authorized Signature</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;