import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/api";
import "./MyForms.css";

const MyForms = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const previewData = location.state?.previewData;
  const isPreview = location.state?.isPreview;

  const [form, setForm] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // ========== PREVIEW MODE ==========
        if (isPreview && previewData) {
          setForm({
            studentName: previewData.studentName || "-",
            fatherName: previewData.fatherName || "-",
            agNumber: previewData.agNumber || "-",
            address: previewData.address || "-",
            status: "Preview",
            degree_id: { name: previewData.degree || "-" },
            semester_id: {
              name: previewData.semesterNumber
                ? `Semester ${previewData.semesterNumber}`
                : "-",
            },
            faculty_id: { name: "Faculty of Sciences" },
            createdAt: new Date(),
          });
          setCourses([]);
          setLoading(false);
          return;
        }

        // ========== NORMAL MODE ==========
        // Backend already returns only this student's forms
        const formsRes = await api.get("/ugforms");
        const myForms = (formsRes.data || []).filter(
          (f) => f.status !== "Draft"
        );

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

          const filteredCourses = (coursesRes.data || []).filter((course) => {
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

          setCourses(filteredCourses);
        }
      } catch (error) {
        console.log("Error loading form data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isPreview, previewData]);

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
    <div className="my-forms-page">
      <div className="ug-form-sheet">
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
                    {isPreview
                      ? "Courses will appear after form submission"
                      : "No courses found for this semester"}
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

        <div className="form-actions">
          <button className="outline-form-btn" onClick={() => navigate(-1)}>
            Back
          </button>

          <button
            className="outline-form-btn"
            type="button"
            onClick={() =>
              navigate("/student/print-form", {
                state: {
                  formData: form,
                  coursesData: courses,
                  isPreview: isPreview,
                },
              })
            }
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyForms;