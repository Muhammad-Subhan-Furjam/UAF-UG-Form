import React, { useState, useEffect } from "react";
import api from "../../api/api";
import "./AdminCourses.css";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Hierarchy Data
  const [campuses, setCampuses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    campus_id: "",
    faculty_id: "",
    department_id: "",
    degree_id: "",
    semesterCommencing: "1",
    courseCategory: "General Course",
    courseCode: "",
    courseTitle: "",
    creditHours: "3 (3-0)",
    teacherName: "",
    totalMarks: "",
    remarks: "",
  });

  const [saving, setSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Options
  const categories = [
    "General Course",
    "Non-Credit Course",
    "Major Course",
    "Minor Course",
    "Allied Course",
    "Internship",
    "Capstone Project",
    "Others",
  ];

  const creditHoursOpts = [
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

  // =========================================
  // FETCH ALL COURSES & HIERARCHY
  // =========================================
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/courses");
      setCourses(res.data || []);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();

    const fetchHierarchy = async () => {
      try {
        const [cRes, fRes, dRes, degRes] = await Promise.all([
          api.get("/campuses"),
          api.get("/faculties"),
          api.get("/departments"),
          api.get("/degrees"),
        ]);
        setCampuses(cRes.data || []);
        setFaculties(fRes.data || []);
        setDepartments(dRes.data || []);
        setDegrees(degRes.data || []);
      } catch (err) {
        console.error("Failed to load hierarchy:", err);
      }
    };
    fetchHierarchy();
  }, []);

  // =========================================
  // OPEN MODALS
  // =========================================
  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      campus_id: campuses[0]?._id || "",
      faculty_id: faculties[0]?._id || "",
      department_id: departments[0]?._id || "",
      degree_id: degrees[0]?._id || "",
      semesterCommencing: "1",
      courseCategory: "General Course",
      courseCode: "",
      courseTitle: "",
      creditHours: "3 (3-0)",
      teacherName: "",
      totalMarks: "",
      remarks: "",
    });
    setModalMessage("");
    setShowModal(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      campus_id: course.campus_id?._id || course.campus_id || "",
      faculty_id: course.faculty_id?._id || course.faculty_id || "",
      department_id: course.department_id?._id || course.department_id || "",
      degree_id: course.degree_id?._id || course.degree_id || "",
      semesterCommencing: course.semester_id?.number || "1",
      courseCategory: course.courseCategory || "General Course",
      courseCode: course.courseCode || "",
      courseTitle: course.courseTitle || "",
      creditHours: course.creditHours || "3 (3-0)",
      teacherName: course.teacherName || "",
      totalMarks: course.totalMarks || "",
      remarks: course.remarks || "",
    });
    setModalMessage("");
    setShowModal(true);
  };

  // =========================================
  // SAVE COURSE
  // =========================================
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalMessage("");

    // Course code format regex: 2-7 alphabets - 2-4 digits OR 2-7 alphabets - 2-7 alphabets - 2-4 digits
    const courseCodeRegex = /^([A-Z]{2,7}-\d{2,4}|[A-Z]{2,7}-[A-Z]{2,7}-\d{2,4})$/;
    if (!courseCodeRegex.test(formData.courseCode.trim())) {
      setModalMessage("Invalid Course Code format! Allowed: 2-7 uppercase letters-2-4 digits (e.g. CS-101) or 2-7 uppercase letters-2-7 uppercase letters-2-4 digits (e.g. CS-MATH-101).");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        campus_id: formData.campus_id,
        faculty_id: formData.faculty_id,
        department_id: formData.department_id,
        degree_id: formData.degree_id,
        semesterNumber: formData.semesterCommencing,
        courseCategory: formData.courseCategory,
        courseCode: formData.courseCode.trim().toUpperCase(),
        courseTitle: formData.courseTitle.trim(),
        creditHours: formData.creditHours,
        teacherName: formData.teacherName.trim(),
        totalMarks: formData.totalMarks.trim(),
        remarks: formData.remarks.trim(),
      };

      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, payload);
        setModalMessage("Course updated successfully!");
      } else {
        await api.post("/courses", payload);
        setModalMessage("Course added successfully!");
      }

      fetchCourses();
      setTimeout(() => setShowModal(false), 1000);
    } catch (error) {
      setModalMessage(error.response?.data?.message || "Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // DELETE COURSE
  // =========================================
  const handleDeleteCourse = async (courseId, code) => {
    if (window.confirm(`Are you sure you want to delete course '${code}'?`)) {
      try {
        await api.delete(`/courses/${courseId}`);
        fetchCourses();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete course");
      }
    }
  };

  // Filtered dropdown lists for Modal
  const availableFaculties = formData.campus_id
    ? faculties.filter((f) => String(f.campus_id?._id || f.campus_id) === String(formData.campus_id))
    : faculties;

  const availableDepartments = formData.faculty_id
    ? departments.filter((d) => String(d.faculty_id?._id || d.faculty_id) === String(formData.faculty_id))
    : departments;

  const availableDegrees = formData.department_id
    ? degrees.filter((deg) => String(deg.department_id?._id || deg.department_id) === String(formData.department_id))
    : degrees;

  // Filtered Table Courses
  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.courseCode && c.courseCode.toLowerCase().includes(q)) ||
      (c.courseTitle && c.courseTitle.toLowerCase().includes(q)) ||
      (c.degree_id?.name && c.degree_id.name.toLowerCase().includes(q)) ||
      (c.department_id?.name && c.department_id.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-courses-page">
      {/* HEADER */}
      <div className="admin-page-header">
        <h2>System Courses Governance</h2>
        <p>Access, view, add, edit, and delete courses across all campuses and departments.</p>
      </div>

      {/* TOOLBAR */}
      <div className="admin-table-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by Course Code, Title, Degree, Department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="add-new-btn" onClick={handleOpenAdd}>
          + Add System Course
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading courses...</p>
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Credit Hours</th>
                  <th>Category</th>
                  <th>Campus</th>
                  <th>Department</th>
                  <th>Degree / Discipline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((c) => (
                    <tr key={c._id}>
                      <td className="font-bold">{c.courseCode}</td>
                      <td><strong>{c.courseTitle}</strong></td>
                      <td>{c.creditHours}</td>
                      <td><span className="category-tag">{c.courseCategory || "General"}</span></td>
                      <td>{c.campus_id?.name || "N/A"}</td>
                      <td>{c.department_id?.name || "N/A"}</td>
                      <td>{c.degree_id?.name || "N/A"}</td>
                      <td>
                        <div className="action-buttons-group">
                          <button className="admin-edit-btn" onClick={() => handleOpenEdit(c)}>
                            ✏️ Edit
                          </button>
                          <button className="admin-delete-btn" onClick={() => handleDeleteCourse(c._id, c.courseCode)}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "30px" }}>
                      No courses found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{editingCourse ? `Edit Course: ${editingCourse.courseCode}` : "Add System Course"}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse}>
              <div className="modal-form-grid">
                {/* CAMPUS */}
                <div className="form-group">
                  <label>Campus *</label>
                  <select
                    value={formData.campus_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        campus_id: e.target.value,
                        faculty_id: "",
                        department_id: "",
                        degree_id: "",
                      })
                    }
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
                  <label>Faculty *</label>
                  <select
                    value={formData.faculty_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        faculty_id: e.target.value,
                        department_id: "",
                        degree_id: "",
                      })
                    }
                    required
                  >
                    <option value="">Select Faculty</option>
                    {availableFaculties.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DEPARTMENT */}
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department_id: e.target.value,
                        degree_id: "",
                      })
                    }
                    required
                  >
                    <option value="">Select Department</option>
                    {availableDepartments.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DEGREE */}
                <div className="form-group">
                  <label>Degree / Discipline *</label>
                  <select
                    value={formData.degree_id}
                    onChange={(e) => setFormData({ ...formData, degree_id: e.target.value })}
                    required
                  >
                    <option value="">Select Degree</option>
                    {availableDegrees.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* COURSE CATEGORY */}
                <div className="form-group">
                  <label>Course Category *</label>
                  <select
                    value={formData.courseCategory}
                    onChange={(e) => setFormData({ ...formData, courseCategory: e.target.value })}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* COURSE CODE */}
                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) =>
                      setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. CS-101 or CS-MATH-101"
                    required
                  />
                </div>

                {/* COURSE TITLE */}
                <div className="form-group">
                  <label>Course Title *</label>
                  <input
                    type="text"
                    value={formData.courseTitle}
                    onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                    placeholder="Enter Course Title"
                    required
                  />
                </div>

                {/* CREDIT HOURS */}
                <div className="form-group">
                  <label>Credit Hours *</label>
                  <select
                    value={formData.creditHours}
                    onChange={(e) => setFormData({ ...formData, creditHours: e.target.value })}
                    required
                  >
                    {creditHoursOpts.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TEACHER NAME */}
                <div className="form-group">
                  <label>Teacher Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  />
                </div>

                {/* TOTAL MARKS */}
                <div className="form-group">
                  <label>Total Marks (Optional)</label>
                  <input
                    type="text"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                  />
                </div>

                {/* REMARKS */}
                <div className="form-group full-width">
                  <label>Remarks (Optional)</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    style={{ width: "100%", height: "80px", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              {modalMessage && (
                <p className={`modal-msg ${modalMessage.includes("success") ? "success" : "error"}`}>
                  {modalMessage}
                </p>
              )}

              <div className="modal-actions-row">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
