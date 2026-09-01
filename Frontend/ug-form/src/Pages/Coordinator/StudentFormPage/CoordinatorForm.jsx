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
    courseCategory: "",
    courseCode: "",
    courseTitle: "",
    creditHours: "",
    teacherName: "",
    totalMarks: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Course Category Options
  const courseCategories = [
    "General Course",
    "Non-Credit Course",
    "Major Course",
    "Minor Course",
    "Allied Course",
    "Internship",
    "Capstone Project",
    "Others",
  ];

  // Credit Hours Options
  const creditHoursOptions = [
    "1 (1-0)",
    "1 (0-1)",
    "2 (0-2)",
    "2 (1-1)",
    "3 (1-2)",
    "3 (2-1)",
    "3 (3-0)",
    "3 (0-3)",
    "4 (3-1)",
    "4 (0-4)",
  ];

  /* =========================
      DYNAMIC SEMESTER COMMENCING OPTIONS
  ========================== */
  const getCommencingOptions = () => {
    const selectedSemester = formData.semester;
    if (selectedSemester === "Fall") {
      return [{ value: "1", label: "Semester 1" }];
    }
    if (selectedSemester === "Spring") {
      return [
        { value: "2", label: "Semester 2" },
        { value: "4", label: "Semester 4" },
        { value: "6", label: "Semester 6" },
        { value: "8", label: "Semester 8" },
        { value: "10", label: "Semester 10" },
        { value: "12", label: "Semester 12" },
      ];
    }
    if (selectedSemester === "Winter") {
      return [
        { value: "3", label: "Semester 3" },
        { value: "5", label: "Semester 5" },
        { value: "7", label: "Semester 7" },
        { value: "9", label: "Semester 9" },
        { value: "11", label: "Semester 11" },
      ];
    }
    if (selectedSemester === "Summer") {
      return [
        { value: "Summer semester 1", label: "Summer semester 1" },
        { value: "Summer semester 2", label: "Summer semester 2" },
        { value: "Summer semester 3", label: "Summer semester 3" },
        { value: "Summer semester 4", label: "Summer semester 4" },
        { value: "Summer semester 5", label: "Summer semester 5" },
        { value: "Summer semester 6", label: "Summer semester 6" },
      ];
    }
    return [];
  };

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
    const { name, value } = e.target;
    if (name === "semester") {
      setFormData((prev) => ({
        ...prev,
        semester: value,
        semesterCommencing: "", // reset dependent field
      }));
    } else if (name === "courseCode") {
      setFormData((prev) => ({
        ...prev,
        courseCode: value.toUpperCase(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /* =========================
      SUBMIT
  ========================== */
  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    // Mandatory fields check
    if (
      !campus ||
      !faculty ||
      !department ||
      !degree ||
      !formData.semester ||
      !formData.semesterCommencing ||
      !formData.courseCategory ||
      !formData.courseCode.trim() ||
      !formData.courseTitle.trim() ||
      !formData.creditHours
    ) {
      setMessage("Please fill in all mandatory fields (*)");
      return;
    }

    // Course Code Regex Validation:
    // Format 1: "3-4 uppercase letters- 3-4 numbers" (e.g. CS-101, CPSC-1001)
    // Format 2: "3-4 uppercase letters-3-4 uppercase letters-3-4 numbers" (e.g. CS-MATH-101, CPSC-SOFT-1001)
    const courseCodeRegex = /^([A-Z]{3,4}-\d{3,4}|[A-Z]{3,4}-[A-Z]{3,4}-\d{3,4})$/;
    if (!courseCodeRegex.test(formData.courseCode.trim())) {
      setMessage(
        "Invalid Course Code format! Allowed formats: 'XXX-123', 'XXXX-1234' or 'XXX-YYY-123' (e.g. CS-101 or CS-MATH-101)"
      );
      return;
    }

    try {
      const payload = {
        campus_id: campus,
        faculty_id: faculty,
        department_id: department,
        degree_id: degree,
        semester: formData.semester,
        semesterNumber: formData.semesterCommencing,
        courseCategory: formData.courseCategory,
        courseCode: formData.courseCode.trim(),
        courseTitle: formData.courseTitle.trim(),
        creditHours: formData.creditHours,
        teacherName: formData.teacherName.trim(),
        totalMarks: formData.totalMarks.trim(),
        remarks: formData.remarks.trim(),
      };

      const res = await api.post("/courses", payload);

      setMessage(res.data.message || "Course Added Successfully");

      setFormData({
        semester: "",
        semesterCommencing: "",
        courseCategory: "",
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

  const commencingOpts = getCommencingOptions();

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
            {/* CAMPUS (MANDATORY) */}
            <div className="form-group">
              <label>Select Campus *</label>
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

            {/* FACULTY (MANDATORY) */}
            <div className="form-group">
              <label>Select Faculty *</label>
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

            {/* DEPARTMENT (MANDATORY) */}
            <div className="form-group">
              <label>Select Department *</label>
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

            {/* DEGREE (MANDATORY) */}
            <div className="form-group">
              <label>Select Degree *</label>
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

            {/* SEMESTER (MANDATORY) */}
            <div className="form-group">
              <label>Semester *</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
              >
                <option value="">Select Semester</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Winter">Winter</option>
                <option value="Summer">Summer</option>
              </select>
            </div>

            {/* SEMESTER COMMENCING (MANDATORY, DYNAMIC DEPENDING ON SEMESTER) */}
            <div className="form-group">
              <label>Semester Commencing *</label>
              <select
                name="semesterCommencing"
                value={formData.semesterCommencing}
                onChange={handleChange}
                disabled={!formData.semester}
                required
              >
                <option value="">
                  {formData.semester
                    ? "Select Semester Commencing"
                    : "Select Semester First"}
                </option>
                {commencingOpts.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* COURSE CATEGORY (MANDATORY - Positioned after Semester Commencing and before Course Code) */}
            <div className="form-group">
              <label>Course Category *</label>
              <select
                name="courseCategory"
                value={formData.courseCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select Course Category</option>
                {courseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* COURSE CODE (MANDATORY - Formats: XXX-123 or XXX-YYY-123) */}
            <div className="form-group">
              <label>Course Code *</label>
              <input
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                placeholder="e.g. CS-101 or CS-MATH-101"
                required
              />
              <small className="form-hint-text">
                Formats: XXX-123, XXXX-1234 or XXX-YYY-123 (e.g. CS-101)
              </small>
            </div>

            {/* COURSE TITLE (MANDATORY) */}
            <div className="form-group">
              <label>Course Title *</label>
              <input
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleChange}
                placeholder="Enter Course Title"
                required
              />
            </div>

            {/* CREDIT HOURS (MANDATORY DROPDOWN) */}
            <div className="form-group">
              <label>Credit Hours *</label>
              <select
                name="creditHours"
                value={formData.creditHours}
                onChange={handleChange}
                required
              >
                <option value="">Select Credit Hours</option>
                {creditHoursOptions.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            {/* TEACHER NAME (OPTIONAL) */}
            <div className="form-group">
              <label>Teacher Name (Optional)</label>
              <input
                name="teacherName"
                value={formData.teacherName}
                onChange={handleChange}
                placeholder="Enter Teacher Name"
              />
            </div>

            {/* TOTAL MARKS (OPTIONAL) */}
            <div className="form-group">
              <label>Total Marks (Optional)</label>
              <input
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                placeholder="Enter Total Marks"
              />
            </div>

            {/* REMARKS (OPTIONAL) */}
            <div className="form-group full-width">
              <label>Remarks (Optional)</label>
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
                  color: message.includes("Successfully") ? "green" : "red",
                  marginBottom: "15px",
                  gridColumn: "span 2",
                  fontWeight: 600,
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