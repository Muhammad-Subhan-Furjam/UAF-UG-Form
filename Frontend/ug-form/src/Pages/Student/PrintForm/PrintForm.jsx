import React, { useState, useEffect } from "react";
import api from "../../../api/api";
import "./PrintForm.css";
import "../MyForms/MyForms.css";
import { useNavigate, useLocation } from "react-router-dom";

const PrintForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedForm = location.state?.formData;
  const passedCourses = location.state?.coursesData;
  const isPreview = location.state?.isPreview;

  const [form, setForm] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);

      // Agar My Forms se data aaya hai to wahi use karo
      if (passedForm) {
        setForm(passedForm);
        setCourses(passedCourses || []);
        setLoading(false);
        return;
      }

      // Warna database se latest form (normal case)
      const profileRes = await api.get("/users/profile");
      const currentUserId = profileRes.data.user._id;

      const formsRes = await api.get("/ugforms");
      const myForms = formsRes.data
        .filter((f) => {
          const studentId =
            typeof f.student_id === "object"
              ? f.student_id?._id
              : f.student_id;
          return (
            String(studentId) === String(currentUserId) &&
            f.status !== "Draft"
          );
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (myForms.length === 0) {
        setForm(null);
        setLoading(false);
        return;
      }

      const latestForm = myForms[0];
      setForm(latestForm);

      if (latestForm.degree_id && latestForm.semester_id) {
        const coursesRes = await api.get("/courses");

        const degreeId =
          typeof latestForm.degree_id === "object"
            ? latestForm.degree_id._id
            : latestForm.degree_id;

        const semesterId =
          typeof latestForm.semester_id === "object"
            ? latestForm.semester_id._id
            : latestForm.semester_id;

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
      console.log("Print form load error:", error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [passedForm, passedCourses]);

  const handlePrint = () => {
    window.print();
  };

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
        <h3>No submitted form found</h3>
        <p>Please submit a UG Form first.</p>
        <button
          onClick={() => navigate("/student/ug-form")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#1e3a5f",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Fill UG-Form
        </button>
      </div>
    );
  }

  return (
    <div className="print-form-page">
      {/* Actions (screen only) */}
      <div className="print-form-actions no-print">
        <button type="button" onClick={() => navigate("/student/forms")}>
          Back
        </button>
        <button type="button" onClick={handlePrint}>
          Print Copy
        </button>
      </div>

      {/* =========================
          ACTUAL FORM
      ========================== */}
      <div className="ug-form-sheet print-sheet">
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
            <div className="info-field student-name">
              <strong>Name of Student:</strong>
              <span>{form.studentName || "-"}</span>
            </div>
            <div className="info-field father-name">
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

        {/* CREDIT COMPLETED TABLE */}
        <div className="credit-table-wrapper">
          <table className="credit-table">
            <tbody>
              <tr>
                <th className="credit-title-cell">
                  Credit Completed
                  <br />
                  Semester-wise
                </th>
                <th>I</th>
                <th>II</th>
                <th>S</th>
                <th>III</th>
                <th>IV</th>
                <th>S</th>
                <th>V</th>
                <th>VI</th>
                <th>S</th>
                <th>VII</th>
                <th>VIII</th>
                <th>S</th>
              </tr>
            </tbody>
          </table>
        </div>

        {/* COURSES TABLE */}
        <h4 className="courses-heading">
          Courses to be taken during Semester
        </h4>

        <div className="courses-table-wrapper">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Course #</th>
                <th>Course Title</th>
                <th>
                  Credit
                  <br />
                  Hours
                </th>
                <th>
                  Total
                  <br />
                  Marks
                </th>
                <th>Marks Obtained</th>
                <th>Grade</th>
                <th>Quality Points</th>
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
        <td>{course.totalMarks || ""}</td>
        <td></td>
        <td></td>
        <td></td>
        <td>{course.remarks || ""}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="8" style={{ textAlign: "center" }}>
        No courses found for this semester
      </td>
    </tr>
  )}

  <tr className="total-row">
    <td></td>
    <td>Total</td>
    <td>
      {courses.reduce((sum, c) => {
        const hours = parseFloat(c.creditHours) || 0;
        return sum + hours;
      }, 0)}
    </td>
    <td>
      {courses.reduce((sum, c) => {
        const marks = parseFloat(c.totalMarks) || 0;
        return sum + marks;
      }, 0) || ""}
    </td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
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
            <strong>Treasure</strong>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <strong>Signature of Teacher</strong>
          </div>
        </div>

        {/* FEES / DEAN */}
        <div className="bottom-info">
          <div className="fees-info">
            <div className="fees-row">
              <strong>Fees Paid to:</strong>
              <span></span>
            </div>
            <div className="fees-row">
              <strong>Dated:</strong>
              <span></span>
            </div>
          </div>
          <div className="dean-info">
            <strong>DEAN,</strong>
            <strong>{form.faculty_id?.name || "Faculty of Sciences"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintForm;