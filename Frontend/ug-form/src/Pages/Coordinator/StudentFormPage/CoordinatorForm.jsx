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
    schemeOfStudy: "2024",
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

  // Add Department State
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [addingDepartment, setAddingDepartment] = useState(false);
  const [departmentMsg, setDepartmentMsg] = useState("");

  const handleAddDepartmentSubmit = async (e) => {
    e.preventDefault();
    if (!newDepartmentName.trim() || !campus || !faculty) return;
    setAddingDepartment(true);
    setDepartmentMsg("");
    try {
      const res = await api.post("/departments", {
        name: newDepartmentName.trim(),
        campus_id: campus,
        faculty_id: faculty,
      });
      const created = res.data?.department;
      setDepartmentMsg("Department added successfully!");

      // Refresh departments
      const deptRes = await api.get("/departments");
      const selectedCampusId = String(campus);
      const selectedFacultyId = String(faculty);

      const filtered = (deptRes.data || []).filter((d) => {
        const getRefId = (ref) => {
          if (!ref) return "";
          if (typeof ref === "object") return String(ref._id || ref.id || "");
          return String(ref);
        };
        const dFacultyId = getRefId(d.faculty_id);
        const dCampusId = getRefId(d.campus_id);
        return dFacultyId === selectedFacultyId && (!dCampusId || dCampusId === selectedCampusId);
      });
      setDepartments(filtered);

      if (created?._id) {
        setDepartment(created._id);
      }
      setTimeout(() => {
        setShowDepartmentModal(false);
        setNewDepartmentName("");
        setDepartmentMsg("");
      }, 1000);
    } catch (err) {
      setDepartmentMsg(err.response?.data?.message || "Failed to add department");
    } finally {
      setAddingDepartment(false);
    }
  };

  // Add Degree State
  const [showDegreeModal, setShowDegreeModal] = useState(false);
  const [newDegreeName, setNewDegreeName] = useState("");
  const [addingDegree, setAddingDegree] = useState(false);
  const [degreeMsg, setDegreeMsg] = useState("");

  const handleAddDegreeSubmit = async (e) => {
    e.preventDefault();
    if (!newDegreeName.trim() || !campus || !faculty || !department) return;
    setAddingDegree(true);
    setDegreeMsg("");
    try {
      const res = await api.post("/degrees", {
        name: newDegreeName.trim(),
        campus_id: campus,
        faculty_id: faculty,
        department_id: department,
      });
      const created = res.data?.degree;
      setDegreeMsg("Degree added successfully!");

      // Refresh degrees
      const degRes = await api.get("/degrees");
      const selectedCampusId = String(campus);
      const selectedFacultyId = String(faculty);
      const selectedDeptId = String(department);

      const filtered = (degRes.data || []).filter((d) => {
        const getRefId = (ref) => {
          if (!ref) return "";
          if (typeof ref === "object") return String(ref._id || ref.id || "");
          return String(ref);
        };
        const dDeptId = getRefId(d.department_id);
        const dFacultyId = getRefId(d.faculty_id);
        const dCampusId = getRefId(d.campus_id);
        return dDeptId === selectedDeptId && (!dFacultyId || dFacultyId === selectedFacultyId) && (!dCampusId || dCampusId === selectedCampusId);
      });
      setDegrees(filtered);

      if (created?._id) {
        setDegree(created._id);
      }
      setTimeout(() => {
        setShowDegreeModal(false);
        setNewDegreeName("");
        setDegreeMsg("");
      }, 1000);
    } catch (err) {
      setDegreeMsg(err.response?.data?.message || "Failed to add degree");
    } finally {
      setAddingDegree(false);
    }
  };

  // My Courses Table State
  const [myCourses, setMyCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Manage Degrees Modal State
  const [showManageDegreesModal, setShowManageDegreesModal] = useState(false);
  const [deletingDegreeId, setDeletingDegreeId] = useState("");

  // Edit Course Modal State
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseData, setEditCourseData] = useState({
    courseCode: "",
    courseTitle: "",
    creditHours: "",
    schemeOfStudy: "2024",
    courseCategory: "General Course",
    semesterNumber: "1",
    teacherName: "",
    totalMarks: "",
    remarks: "",
  });
  const [savingEditCourse, setSavingEditCourse] = useState(false);
  const [editCourseMsg, setEditCourseMsg] = useState("");

  const fetchMyCourses = async () => {
    try {
      setCoursesLoading(true);
      const res = await api.get("/courses");
      const filtered = (res.data || []).filter((c) => {
        const cDeptId = c.department_id?._id || c.department_id;
        const cCampusId = c.campus_id?._id || c.campus_id;
        const matchDept = department ? String(cDeptId) === String(department) : true;
        const matchCampus = campus ? String(cCampusId) === String(campus) : true;
        return matchDept && matchCampus;
      });
      setMyCourses(filtered);
    } catch (err) {
      console.log("Fetch my courses error:", err);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    if (department) {
      fetchMyCourses();
    }
  }, [department, campus]);

  const handleDeleteCourse = async (courseId, code) => {
    if (window.confirm(`Are you sure you want to delete course '${code}'?`)) {
      try {
        await api.delete(`/courses/${courseId}`);
        fetchMyCourses();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete course");
      }
    }
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setEditCourseData({
      courseCode: course.courseCode || "",
      courseTitle: course.courseTitle || "",
      creditHours: course.creditHours || "3 (3-0)",
      schemeOfStudy: course.schemeOfStudy || "2024",
      courseCategory: course.courseCategory || "General Course",
      semesterNumber: course.semester_id?.number || "1",
      teacherName: course.teacherName || "",
      totalMarks: course.totalMarks || "",
      remarks: course.remarks || "",
    });
    setEditCourseMsg("");
    setShowEditCourseModal(true);
  };

  const handleSaveEditCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    setSavingEditCourse(true);
    setEditCourseMsg("");

    const courseCodeRegex = /^([A-Z]{2,7}-\d{2,4}|[A-Z]{2,7}-[A-Z]{2,7}-\d{2,4})$/;
    if (!courseCodeRegex.test((editCourseData.courseCode || "").trim())) {
      setEditCourseMsg("Invalid Course Code format! Allowed: 2-7 uppercase letters-2-4 digits (e.g. CS-101) or 2-7 uppercase letters-2-7 uppercase letters-2-4 digits (e.g. CS-MATH-101).");
      setSavingEditCourse(false);
      return;
    }

    try {
      await api.put(`/courses/${editingCourse._id}`, {
        courseCode: editCourseData.courseCode.trim().toUpperCase(),
        courseTitle: editCourseData.courseTitle.trim(),
        creditHours: editCourseData.creditHours,
        schemeOfStudy: editCourseData.schemeOfStudy,
        courseCategory: editCourseData.courseCategory,
        semesterNumber: editCourseData.semesterNumber,
        teacherName: editCourseData.teacherName.trim(),
        totalMarks: editCourseData.totalMarks.trim(),
        remarks: editCourseData.remarks.trim(),
      });
      setEditCourseMsg("Course updated successfully!");
      fetchMyCourses();
      setTimeout(() => {
        setShowEditCourseModal(false);
        setEditingCourse(null);
        setEditCourseMsg("");
      }, 1000);
    } catch (err) {
      setEditCourseMsg(err.response?.data?.message || "Failed to update course");
    } finally {
      setSavingEditCourse(false);
    }
  };

  const handleDeleteDegree = async (degreeId, degreeName) => {
    if (window.confirm(`Are you sure you want to delete degree '${degreeName}'? This will remove it from the department.`)) {
      try {
        setDeletingDegreeId(degreeId);
        await api.delete(`/degrees/${degreeId}`);
        
        const degRes = await api.get("/degrees");
        const selectedDeptId = String(department);
        const filtered = (degRes.data || []).filter((d) => {
          const getRefId = (ref) => {
            if (!ref) return "";
            if (typeof ref === "object") return String(ref._id || ref.id || "");
            return String(ref);
          };
          return getRefId(d.department_id) === selectedDeptId;
        });
        setDegrees(filtered);
        if (degree === degreeId) setDegree("");
        fetchMyCourses();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete degree");
      } finally {
        setDeletingDegreeId("");
      }
    }
  };

  const filteredMyCourses = myCourses.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.courseCode && c.courseCode.toLowerCase().includes(q)) ||
      (c.courseTitle && c.courseTitle.toLowerCase().includes(q)) ||
      (c.degree_id?.name && c.degree_id.name.toLowerCase().includes(q)) ||
      (c.department_id?.name && c.department_id.name.toLowerCase().includes(q)) ||
      (c.schemeOfStudy && c.schemeOfStudy.toLowerCase().includes(q))
    );
  });

  // Course Category Options
  const courseCategories = [
    "General Course",
    "Non-Credit Course",
    "Major Course",
    "Minor Course",
    "Compulsory course",
    "Compulsory minor course",
    "Defficiency course",
    "Audit course",
    "Elective-I",
    "Elective-II",
    "Elective-III",
    "Elective-IV",
    "Elective-V",
    "Elective-VI",
    "Allied Course",
    "Interdisciplinary course",
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
    "2 (2-0)",
    "3 (1-2)",
    "3 (2-1)",
    "3 (3-0)",
    "3 (0-3)",
    "4 (3-1)",
    "4 (0-4)",
    "4 (4-0)",
  ];

  /* =========================
      DYNAMIC SEMESTER COMMENCING OPTIONS
  ========================== */
  const getCommencingOptions = () => {
    const selectedSemester = formData.semester;
    if (selectedSemester === "Spring") {
      return [
        { value: "2", label: "Semester 2" },
        { value: "4", label: "Semester 4" },
        { value: "6", label: "Semester 6" },
        { value: "8", label: "Semester 8" },
        { value: "10", label: "Semester 10" },
        { value: "12", label: "Semester 12" },
        { value: "14", label: "Semester 14" },
      ];
    }
    if (selectedSemester === "Winter") {
      return [
        { value: "1", label: "Semester 1" },
        { value: "3", label: "Semester 3" },
        { value: "5", label: "Semester 5" },
        { value: "7", label: "Semester 7" },
        { value: "9", label: "Semester 9" },
        { value: "11", label: "Semester 11" },
        { value: "13", label: "Semester 13" },
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
        { value: "Summer semester 7", label: "Summer semester 7" },
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
        const allCampuses = cRes.data || [];
        setCampuses(allCampuses);
        if (coordCampusId) {
          setCampus(coordCampusId);
        }

        // 2. Faculty
        const allFaculties = fRes.data || [];
        setFaculties(allFaculties);
        if (coordFacultyId) {
          setFaculty(coordFacultyId);
        }

        // 3. Department
        const allDepts = dRes.data || [];
        setDepartments(allDepts);
        if (coordDepartmentId) {
          setDepartment(coordDepartmentId);
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
        const allDegrees = res.data || [];
        const filtered = allDegrees.filter(
          (d) =>
            !d.department_id || d.department_id === department || d.department_id?._id === department || String(d.department_id) === String(department)
        );
        setDegrees(filtered.length > 0 ? filtered : allDegrees);
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
      !formData.schemeOfStudy ||
      !formData.courseCategory ||
      !formData.courseCode.trim() ||
      !formData.courseTitle.trim() ||
      !formData.creditHours
    ) {
      setMessage("Please fill in all mandatory fields (*)");
      return;
    }

    // Course Code Regex Validation:
    // Format 1: "2-7 uppercase letters- 2-4 numbers" (e.g. CS-10, CS-101, BIOTECH-1001)
    // Format 2: "2-7 uppercase letters-2-7 uppercase letters-2-4 numbers" (e.g. CS-SE-10, CS-MATH-101)
    const courseCodeRegex = /^([A-Z]{2,7}-\d{2,4}|[A-Z]{2,7}-[A-Z]{2,7}-\d{2,4})$/;
    if (!courseCodeRegex.test(formData.courseCode.trim())) {
      setMessage(
        "Invalid Course Code format! Allowed formats: 2-7 uppercase letters-2-4 digits (e.g. CS-101) or 2-7 uppercase letters-2-7 uppercase letters-2-4 digits (e.g. CS-MATH-101)."
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
        schemeOfStudy: formData.schemeOfStudy,
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
      fetchMyCourses();

      setFormData({
        semester: "",
        semesterCommencing: "",
        schemeOfStudy: "2024",
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ margin: 0 }}>Select Department *</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowDepartmentModal(true);
                    setDepartmentMsg("");
                    setNewDepartmentName("");
                  }}
                  disabled={!faculty}
                  style={{
                    background: "#0284c7",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "3px 9px",
                    fontSize: "12px",
                    cursor: faculty ? "pointer" : "not-allowed",
                    fontWeight: "600",
                    opacity: faculty ? 1 : 0.6,
                  }}
                >
                  + Add Department
                </button>
              </div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
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

            {/* DEGREE (MANDATORY) */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ margin: 0 }}>Select Degree *</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDegreeModal(true);
                      setDegreeMsg("");
                      setNewDegreeName("");
                    }}
                    disabled={!department}
                    style={{
                      background: "#0284c7",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "3px 9px",
                      fontSize: "12px",
                      cursor: department ? "pointer" : "not-allowed",
                      fontWeight: "600",
                      opacity: department ? 1 : 0.6,
                    }}
                  >
                    + Add Degree
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManageDegreesModal(true)}
                    disabled={!department || degrees.length === 0}
                    style={{
                      background: "#dc2626",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "3px 9px",
                      fontSize: "12px",
                      cursor: department && degrees.length > 0 ? "pointer" : "not-allowed",
                      fontWeight: "600",
                      opacity: department && degrees.length > 0 ? 1 : 0.6,
                    }}
                  >
                    Manage / Delete Degrees
                  </button>
                </div>
              </div>
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
                <option value="Winter">Winter</option>
                <option value="Spring">Spring</option>
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

            {/* SCHEME OF STUDY (MANDATORY - 2022, 2023, 2024, 2025, 2026) */}
            <div className="form-group">
              <label>Scheme of Study *</label>
              <select
                name="schemeOfStudy"
                value={formData.schemeOfStudy}
                onChange={handleChange}
                required
              >
                <option value="">Select Scheme of Study</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
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

            {/* COURSE CODE (MANDATORY - Formats: 2-7 Letters-2-4 Digits or 2-7 Letters-2-7 Letters-2-4 Digits) */}
            <div className="form-group">
              <label>Course Code *</label>
              <input
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                placeholder="e.g. CS-101 or CS-MATH-101"
                required
              />
              <small className="form-hint-text" style={{ color: "#64748b", fontSize: "12px", marginTop: "4px", display: "block", lineHeight: "1.4" }}>
                <strong>Allowed Formats:</strong><br />
                • <strong>Format 1:</strong> 2 to 7 Uppercase Letters - 2 to 4 Digits (e.g. <code>CS-101</code>, <code>BIOTECH-301</code>)<br />
                • <strong>Format 2:</strong> 2 to 7 Uppercase Letters - 2 to 7 Uppercase Letters - 2 to 4 Digits (e.g. <code>CS-MATH-101</code>)
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

      {/* MY ADDED COURSES TABLE SECTION */}
      <section className="coordinator-form-card" style={{ marginTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Department Added Courses Overview ({filteredMyCourses.length})</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>View, edit, or delete courses added for your department.</p>
          </div>
          <input
            type="text"
            placeholder="Search added courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", width: "260px" }}
          />
        </div>

        {coursesLoading ? (
          <p style={{ textAlign: "center", padding: "20px" }}>Loading courses...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                  <th style={{ padding: "12px 10px", borderBottom: "2px solid #e2e8f0" }}>Sr. No.</th>
                  <th style={{ padding: "12px 10px", borderBottom: "2px solid #e2e8f0" }}>Course Code</th>
                  <th style={{ padding: "12px 10px", borderBottom: "2px solid #e2e8f0" }}>Course Title</th>
                  <th style={{ padding: "12px 10px", borderBottom: "2px solid #e2e8f0" }}>Credit Hours</th>
                  <th style={{ padding: "12px 10px", borderBottom: "2px solid #e2e8f0" }}>Offering Semester</th>
                  <th style={{ padding: "12px 10px", borderBottom: "2px solid #e2e8f0" }}>Degree</th>
                  <th style={{ padding: "12px 10px", borderBottom: "2px solid #e2e8f0" }}>Department</th>
                  <th style={{ padding: "12px 10px", borderBottom: "2px solid #e2e8f0" }}>Faculty</th>
                  <th style={{ padding: "12px 10px", borderBottom: "2px solid #e2e8f0" }}>Campus</th>
                  <th style={{ padding: "12px 10px", borderBottom: "2px solid #e2e8f0", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMyCourses.length > 0 ? (
                  filteredMyCourses.map((course, idx) => (
                    <tr key={course._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "600" }}>{idx + 1}</td>
                      <td style={{ padding: "12px 10px", fontWeight: "700", color: "#0f172a" }}>{course.courseCode}</td>
                      <td style={{ padding: "12px 10px", fontWeight: "600" }}>{course.courseTitle}</td>
                      <td style={{ padding: "12px 10px" }}>{course.creditHours}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600" }}>
                          {course.semester_id?.name || (course.semester_id?.number ? `Semester ${course.semester_id.number}` : "N/A")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 10px" }}>{course.degree_id?.name || "N/A"}</td>
                      <td style={{ padding: "12px 10px" }}>{course.department_id?.name || "N/A"}</td>
                      <td style={{ padding: "12px 10px" }}>{course.faculty_id?.name || "N/A"}</td>
                      <td style={{ padding: "12px 10px" }}>{course.campus_id?.name || "N/A"}</td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditCourse(course)}
                            style={{ background: "#0284c7", color: "#fff", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(course._id, course.courseCode)}
                            style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      No courses found for this department. Add a course above to see it listed here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ADD DEPARTMENT MODAL */}
      {showDepartmentModal && (
        <div className="admin-modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "8px", width: "100%", maxWidth: "480px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Add New Department to Faculty</h3>
              <button type="button" onClick={() => setShowDepartmentModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <form onSubmit={handleAddDepartmentSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px", color: "#334155" }}>Department Name *</label>
                <input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="e.g. Department of Biochemistry"
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>
              {departmentMsg && (
                <p style={{ color: departmentMsg.includes("success") ? "green" : "red", fontSize: "14px", marginBottom: "12px", fontWeight: "600" }}>{departmentMsg}</p>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowDepartmentModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={addingDepartment} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#0284c7", color: "#fff", cursor: "pointer", fontWeight: "600" }}>
                  {addingDepartment ? "Saving..." : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DEGREE MODAL */}
      {showDegreeModal && (
        <div className="admin-modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "8px", width: "100%", maxWidth: "480px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Add New Degree to Department</h3>
              <button type="button" onClick={() => setShowDegreeModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <form onSubmit={handleAddDegreeSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px", color: "#334155" }}>Degree Name * (Supports Morning/Evening details)</label>
                <input
                  type="text"
                  value={newDegreeName}
                  onChange={(e) => setNewDegreeName(e.target.value)}
                  placeholder="e.g. BS Biochemistry (Morning) or BS Biochemistry (Evening)"
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>
              {degreeMsg && (
                <p style={{ color: degreeMsg.includes("success") ? "green" : "red", fontSize: "14px", marginBottom: "12px", fontWeight: "600" }}>{degreeMsg}</p>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowDegreeModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={addingDegree} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#0284c7", color: "#fff", cursor: "pointer", fontWeight: "600" }}>
                  {addingDegree ? "Saving..." : "Save Degree"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE / DELETE DEGREES MODAL */}
      {showManageDegreesModal && (
        <div className="admin-modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "8px", width: "100%", maxWidth: "550px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Department Degrees ({degrees.length})</h3>
              <button type="button" onClick={() => setShowManageDegreesModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ maxHeight: "350px", overflowY: "auto" }}>
              {degrees.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {degrees.map((d) => (
                    <li key={d._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontWeight: "600", fontSize: "14px", color: "#1e293b" }}>{d.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteDegree(d._id, d.name)}
                        disabled={deletingDegreeId === d._id}
                        style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 10px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}
                      >
                        {deletingDegreeId === d._id ? "Deleting..." : "Delete Degree"}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>No degrees found for this department.</p>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button type="button" onClick={() => setShowManageDegreesModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {showEditCourseModal && editingCourse && (
        <div className="admin-modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "8px", width: "100%", maxWidth: "600px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Edit Course: {editingCourse.courseCode}</h3>
              <button type="button" onClick={() => setShowEditCourseModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <form onSubmit={handleSaveEditCourse}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "13px" }}>Course Code *</label>
                  <input
                    type="text"
                    value={editCourseData.courseCode}
                    onChange={(e) => setEditCourseData({ ...editCourseData, courseCode: e.target.value.toUpperCase() })}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "13px" }}>Course Title *</label>
                  <input
                    type="text"
                    value={editCourseData.courseTitle}
                    onChange={(e) => setEditCourseData({ ...editCourseData, courseTitle: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "13px" }}>Credit Hours *</label>
                  <select
                    value={editCourseData.creditHours}
                    onChange={(e) => setEditCourseData({ ...editCourseData, creditHours: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    {creditHoursOptions.map((ch) => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "13px" }}>Scheme of Study *</label>
                  <select
                    value={editCourseData.schemeOfStudy}
                    onChange={(e) => setEditCourseData({ ...editCourseData, schemeOfStudy: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "13px" }}>Course Category *</label>
                  <select
                    value={editCourseData.courseCategory}
                    onChange={(e) => setEditCourseData({ ...editCourseData, courseCategory: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    {courseCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "13px" }}>Offering Semester Number *</label>
                  <input
                    type="text"
                    value={editCourseData.semesterNumber}
                    onChange={(e) => setEditCourseData({ ...editCourseData, semesterNumber: e.target.value })}
                    required
                    placeholder="e.g. 1, 2, 3..."
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "13px" }}>Teacher Name (Optional)</label>
                  <input
                    type="text"
                    value={editCourseData.teacherName}
                    onChange={(e) => setEditCourseData({ ...editCourseData, teacherName: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "13px" }}>Total Marks (Optional)</label>
                  <input
                    type="text"
                    value={editCourseData.totalMarks}
                    onChange={(e) => setEditCourseData({ ...editCourseData, totalMarks: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>
              {editCourseMsg && (
                <p style={{ color: editCourseMsg.includes("success") ? "green" : "red", fontSize: "14px", marginTop: "12px", fontWeight: "600" }}>{editCourseMsg}</p>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button type="button" onClick={() => setShowEditCourseModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={savingEditCourse} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#0284c7", color: "#fff", cursor: "pointer", fontWeight: "600" }}>
                  {savingEditCourse ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorForm;