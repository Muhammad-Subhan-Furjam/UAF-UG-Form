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
      LOAD PROFILE + CAMPUSES
  ========================== */
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // 1. Load Campuses
        const campusRes = await api.get("/campuses");
        setCampuses(campusRes.data);

        // 2. Load Coordinator Profile (auto-fill)
        const profileRes = await api.get("/users/profile");
        const user = profileRes.data.user;

        if (user) {
          if (user.campus_id) {
            const campusId =
              typeof user.campus_id === "object"
                ? user.campus_id._id
                : user.campus_id;
            setCampus(campusId);
          }
          if (user.faculty_id) {
            const facultyId =
              typeof user.faculty_id === "object"
                ? user.faculty_id._id
                : user.faculty_id;
            setFaculty(facultyId);
          }
          if (user.department_id) {
            const departmentId =
              typeof user.department_id === "object"
                ? user.department_id._id
                : user.department_id;
            setDepartment(departmentId);
          }
        }
      } catch (error) {
        console.log("Initial load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  /* =========================
      LOAD FACULTIES
  ========================== */
  useEffect(() => {
    if (!campus) {
      setFaculties([]);
      return;
    }

    const fetchFaculties = async () => {
      try {
        const res = await api.get("/faculties");
        const filtered = res.data.filter(
          (f) => f.campus_id === campus || f.campus_id?._id === campus
        );
        setFaculties(filtered);
      } catch (error) {
        console.log(error);
      }
    };

    fetchFaculties();
  }, [campus]);

  /* =========================
      LOAD DEPARTMENTS
  ========================== */
  useEffect(() => {
    if (!faculty) {
      setDepartments([]);
      return;
    }

    const fetchDepartments = async () => {
      try {
        const res = await api.get("/departments");
        const filtered = res.data.filter(
          (d) => d.faculty_id === faculty || d.faculty_id?._id === faculty
        );
        setDepartments(filtered);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDepartments();
  }, [faculty]);

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
                onChange={(e) => {
                  setCampus(e.target.value);
                  setFaculty("");
                  setDepartment("");
                  setDegree("");
                }}
                required
              >
                <option value="">Select Campus</option>
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
                disabled={!campus}
                onChange={(e) => {
                  setFaculty(e.target.value);
                  setDepartment("");
                  setDegree("");
                }}
                required
              >
                <option value="">Select Faculty</option>
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
                disabled={!faculty}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setDegree("");
                }}
                required
              >
                <option value="">Select Department</option>
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
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
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