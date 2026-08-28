import React, { useState, useEffect } from "react";
import api from "../../../api/api";
import "./CoordinatorForm.css";

const CoordinatorForm = () => {
  /* =========================
      DROPDOWN STATES
  ========================== */
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [degree, setDegree] = useState("");

  /* =========================
      API DATA
  ========================== */
  const [campuses, setCampuses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);

  /* =========================
      FORM DATA
  ========================== */
  const [formData, setFormData] = useState({
    semester: "",
    semesterCommencing: "",
    courseCode: "",
    courseTitle: "",
    creditHours: "",
    teacherName: "",
    totalMarks: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================
      LOAD PROFILE + FILTERED HIERARCHY
  ========================== */
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        const profileRes = await api.get("/users/profile");
        const user = profileRes.data?.user || {};

        const [cRes, fRes, dRes] = await Promise.all([
          api.get("/campuses"),
          api.get("/faculties"),
          api.get("/departments"),
        ]);

        const coordCampusId = user.campus_id?._id || user.campus_id || "";
        const coordFacultyId = user.faculty_id?._id || user.faculty_id || "";
        const coordDepartmentId = user.department_id?._id || user.department_id || "";

        // 1. Campus
        let campusList = cRes.data || [];
        if (coordCampusId) {
          const match = campusList.filter(
            (c) => String(c._id) === String(coordCampusId)
          );
          if (match.length > 0) campusList = match;
          setCampus(coordCampusId);
        }
        setCampuses(campusList);

        // 2. Faculty
        let facultyList = fRes.data || [];
        if (coordFacultyId) {
          const match = facultyList.filter(
            (f) => String(f._id) === String(coordFacultyId)
          );
          if (match.length > 0) facultyList = match;
          setFaculty(coordFacultyId);
        }
        setFaculties(facultyList);

        // 3. Department
        let deptList = dRes.data || [];
        if (coordDepartmentId) {
          const match = deptList.filter(
            (d) => String(d._id) === String(coordDepartmentId)
          );
          if (match.length > 0) deptList = match;
          setDepartment(coordDepartmentId);
        }
        setDepartments(deptList);

      } catch (error) {
        console.log("Initial load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  /* =========================
      LOAD DEGREES
  ========================== */
  useEffect(() => {
    if (!department) {
      setDegrees([]);
      return;
    }

    const fetchDegrees = async () => {
      try {
        const res = await api.get("/degrees");
        const filtered = res.data.filter(
          (d) =>
            d.department_id === department || d.department_id?._id === department
        );
        setDegrees(filtered);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDegrees();
  }, [department]);

  /* =========================
      INPUT CHANGE
  ========================== */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
      SUBMIT
  ========================== */
  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        campus_id: campus,
        faculty_id: faculty,
        department_id: department,
        degree_id: degree,
        semesterNumber: formData.semesterCommencing,
        courseCode: formData.courseCode,
        courseTitle: formData.courseTitle,
        creditHours: formData.creditHours,
        teacherName: formData.teacherName,
        totalMarks: formData.totalMarks,
        remarks: formData.remarks,
      };

      const res = await api.post("/courses", payload);

      setMessage(res.data.message || "Course Added Successfully");

      setFormData({
        semester: "",
        semesterCommencing: "",
        courseCode: "",
        courseTitle: "",
        creditHours: "",
        teacherName: "",
        totalMarks: "",
        remarks: "",
      });
      setDegree("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add course");
    }
  };

  return (
    <div className="coordinator-form-page">
      {/* HEADER */}
      <div className="coordinator-form-header">
        <h2>Manage Course Information</h2>
        <p>Add and manage course details for students.</p>
      </div>

      <section className="coordinator-form-card">
        {loading ? (
          <p style={{ textAlign: "center", padding: "30px" }}>Loading...</p>
        ) : (
          <form className="coordinator-course-form" onSubmit={submitHandler}>
            {/* CAMPUS */}
            <div className="form-group">
              <label>Select Campus</label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                required
              >
                {campuses.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* FACULTY */}
            <div className="form-group">
              <label>Select Faculty</label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                required
              >
                {faculties.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DEPARTMENT */}
            <div className="form-group">
              <label>Select Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                {departments.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DEGREE */}
            <div className="form-group">
              <label>Select Degree</label>
              <select
                value={degree}
                disabled={!department}
                onChange={(e) => setDegree(e.target.value)}
                required
              >
                <option value="">Select Degree</option>
                {degrees.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SEMESTER */}
            <div className="form-group">
              <label>Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
              >
                <option value="">Select Semester</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
                <option value="Fall">Fall</option>
              </select>
            </div>

            {/* SEMESTER COMMENCING */}
            <div className="form-group">
              <label>Semester Commencing</label>
              <select
                name="semesterCommencing"
                value={formData.semesterCommencing}
                onChange={handleChange}
                required
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* COURSE CODE */}
            <div className="form-group">
              <label>Course Code</label>
              <input
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                placeholder="Enter Course Code"
                required
              />
            </div>

            {/* COURSE TITLE */}
            <div className="form-group">
              <label>Course Title</label>
              <input
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleChange}
                placeholder="Enter Course Title"
                required
              />
            </div>

            {/* CREDIT HOURS */}
            <div className="form-group">
              <label>Credit Hours</label>
              <input
                name="creditHours"
                value={formData.creditHours}
                onChange={handleChange}
                placeholder="Enter Credit Hours"
                required
              />
            </div>

            {/* TEACHER */}
            <div className="form-group">
              <label>Teacher Name</label>
              <input
                name="teacherName"
                value={formData.teacherName}
                onChange={handleChange}
                placeholder="Enter Teacher Name"
              />
            </div>

            {/* TOTAL MARKS */}
            <div className="form-group">
              <label>Total Marks</label>
              <input
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                placeholder="Enter Total Marks"
              />
            </div>

            {/* REMARKS */}
            <div className="form-group full-width">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter Remarks"
              />
            </div>

            {message && (
              <p
                style={{
                  textAlign: "center",
                  color: message.includes("Success") ? "green" : "red",
                  marginBottom: "15px",
                }}
              >
                {message}
              </p>
            )}

            {/* BUTTONS */}
            <div className="form-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => window.location.reload()}
              >
                Cancel
              </button>

              <button type="submit" className="save-btn">
                Submit
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default CoordinatorForm;