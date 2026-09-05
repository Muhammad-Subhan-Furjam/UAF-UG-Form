import React, { useState, useEffect } from "react";
import api from "../../../api/api";
import "./CoordinatorCourses.css";

const CoordinatorCourses = () => {
  /* =========================================
     SELECTED VALUES
  ========================================= */
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");

  /* =========================================
     DATA FROM API
  ========================================= */
  const [campuses, setCampuses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCourses, setEditCourses] = useState([]);
  const [coordInfo, setCoordInfo] = useState(null);

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

  /* =========================================
     SEMESTERS
  ========================================= */
  const regularSemesters = [
    "Semester I",
    "Semester II",
    "Semester III",
    "Semester IV",
    "Semester V",
    "Semester VI",
    "Semester VII",
    "Semester VIII",
    "Semester IX",
    "Semester X",
    "Semester XI",
    "Semester XII",
  ];

  const summerSemesters = [
    "Summer Semester I",
    "Summer Semester II",
    "Summer Semester III",
    "Summer Semester IV",
    "Summer Semester V",
    "Summer Semester VI",
  ];

  const getSemesterNumber = (semesterName) => {
    const map = {
      "Semester I": 1,
      "Semester II": 2,
      "Semester III": 3,
      "Semester IV": 4,
      "Semester V": 5,
      "Semester VI": 6,
      "Semester VII": 7,
      "Semester VIII": 8,
      "Semester IX": 9,
      "Semester X": 10,
      "Semester XI": 11,
      "Semester XII": 12,
      "Summer Semester I": 101,
      "Summer Semester II": 102,
      "Summer Semester III": 103,
      "Summer Semester IV": 104,
      "Summer Semester V": 105,
      "Summer Semester VI": 106,
    };
    return map[semesterName] || 1;
  };

  /* =========================================
     LOAD COORDINATOR PROFILE & LOCK TO REGISTERED DEPARTMENT
  ========================================= */
  useEffect(() => {
    const loadCoordinatorStructure = async () => {
      try {
        setLoading(true);
        const userRes = await api.get("/users/profile");
        const user = userRes.data?.user || {};
        setCoordInfo(user);

        const [cRes, fRes, dRes] = await Promise.all([
          api.get("/campuses"),
          api.get("/faculties"),
          api.get("/departments"),
        ]);

        const coordCampusObj =
          typeof user.campus_id === "object" && user.campus_id
            ? user.campus_id
            : cRes.data.find(
                (c) => String(c._id) === String(user.campus_id) || c.name === user.campus_id
              );

        const coordFacultyObj =
          typeof user.faculty_id === "object" && user.faculty_id
            ? user.faculty_id
            : fRes.data.find(
                (f) => String(f._id) === String(user.faculty_id) || f.name === user.faculty_id
              );

        const coordDeptObj =
          typeof user.department_id === "object" && user.department_id
            ? user.department_id
            : dRes.data.find(
                (d) => String(d._id) === String(user.department_id) || d.name === user.department_id
              );

        // Lock lists strictly to assigned hierarchy
        if (coordCampusObj) {
          setCampuses([coordCampusObj]);
          setSelectedCampus(coordCampusObj);
        } else {
          setCampuses(cRes.data || []);
        }

        if (coordFacultyObj) {
          setFaculties([coordFacultyObj]);
          setSelectedFaculty(coordFacultyObj);
        } else if (coordCampusObj) {
          const filteredFac = fRes.data.filter(
            (f) => String(f.campus_id?._id || f.campus_id) === String(coordCampusObj._id)
          );
          setFaculties(filteredFac);
        }

        if (coordDeptObj) {
          setDepartments([coordDeptObj]);
          setSelectedDepartment(coordDeptObj);
        } else if (coordFacultyObj) {
          const filteredDept = dRes.data.filter(
            (d) => String(d.faculty_id?._id || d.faculty_id) === String(coordFacultyObj._id)
          );
          setDepartments(filteredDept);
        }

      } catch (error) {
        console.log("Coordinator Structure Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCoordinatorStructure();
  }, []);

  /* =========================================
     LOAD DEGREES FOR SELECTED DEPARTMENT
  ========================================= */
  useEffect(() => {
    if (!selectedDepartment) {
      setDisciplines([]);
      return;
    }

    const fetchDegrees = async () => {
      try {
        setLoading(true);
        const res = await api.get("/degrees");
        const filtered = res.data.filter(
          (d) =>
            String(d.department_id?._id || d.department_id) === String(selectedDepartment._id)
        );
        setDisciplines(filtered);
      } catch (error) {
        console.log("Degree Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDegrees();
  }, [selectedDepartment]);

  /* =========================================
     LOAD COURSES
  ========================================= */
  useEffect(() => {
    if (!selectedDiscipline || !selectedSemester) {
      setCourses([]);
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/courses");
        const semesterNumber = getSemesterNumber(selectedSemester);

        const filtered = res.data.filter((course) => {
          const degreeMatch =
            String(course.degree_id?._id || course.degree_id) === String(selectedDiscipline._id);

          const semesterMatch =
            course.semester_id?.number === semesterNumber ||
            course.semester_id === semesterNumber;

          return degreeMatch && semesterMatch;
        });

        setCourses(filtered);
        setEditCourses(filtered.map((c) => ({ ...c })));
        setIsEditing(false);
      } catch (error) {
        console.log("Courses Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedDiscipline, selectedSemester]);

  /* =========================================
     CLICK HANDLERS
  ========================================= */
  const handleCampusSelect = (campus) => {
    setSelectedCampus(campus);
  };

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty);
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
  };

  const handleDisciplineSelect = (discipline) => {
    setSelectedDiscipline(discipline);
    setSelectedSemester("");
  };

  const handleSemesterSelect = (semester) => {
    setSelectedSemester(semester);
  };

  /* =========================================
     BACK BUTTON (Locked to Coordinator Scope)
  ========================================= */
  const handleBack = () => {
    if (selectedSemester) {
      setSelectedSemester("");
      setIsEditing(false);
      return;
    }
    if (selectedDiscipline) {
      setSelectedDiscipline(null);
      return;
    }
    // Cannot go back past assigned department level
  };

  /* =========================================
     EDIT HANDLERS
  ========================================= */
  const handleEditChange = (index, field, value) => {
    const updated = [...editCourses];
    updated[index] = { ...updated[index], [field]: value };
    setEditCourses(updated);
  };

  const handleSaveCourses = async () => {
    try {
      setLoading(true);

      const courseCodeRegex = /^([A-Z]{2,7}-\d{2,4}|[A-Z]{2,7}-[A-Z]{2,7}-\d{2,4})$/;
      for (const course of editCourses) {
        if (!courseCodeRegex.test((course.courseCode || "").trim())) {
          alert(`Invalid Course Code format for '${course.courseCode}'. Allowed: 2-7 uppercase letters-2-4 digits (e.g. CS-101) or 2-7 uppercase letters-2-7 uppercase letters-2-4 digits (e.g. CS-MATH-101)`);
          setLoading(false);
          return;
        }
      }

      for (const course of editCourses) {
        await api.put(`/courses/${course._id}`, {
          courseCode: (course.courseCode || "").trim().toUpperCase(),
          courseTitle: course.courseTitle,
          creditHours: course.creditHours,
          totalMarks: course.totalMarks || "",
          remarks: course.remarks || "",
        });
      }

      setCourses(editCourses);
      setIsEditing(false);
      alert("Courses updated successfully");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to update courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditCourses(courses.map((c) => ({ ...c })));
    setIsEditing(false);
  };

  /* =========================================
     PAGE TITLE
  ========================================= */
  const getPageTitle = () => {
    if (selectedSemester) return selectedSemester;
    if (selectedDiscipline) return "Select Semester";
    if (selectedDepartment) return "Select Discipline / Degree";
    if (selectedFaculty) return "Select Department";
    if (selectedCampus) return "Select Faculty";
    return "Select Campus";
  };

  return (
    <div className="coordinator-courses-page">
      {/* HEADER */}
      <div className="courses-navigation-header">
        <div>
          <h2>{getPageTitle()}</h2>

          {(selectedCampus ||
            selectedFaculty ||
            selectedDepartment ||
            selectedDiscipline) && (
            <p>
              Navigation: Root{" "}
              {selectedCampus && `> ${selectedCampus.name}`}
              {selectedFaculty && `> ${selectedFaculty.name}`}
              {selectedDepartment && `> ${selectedDepartment.name}`}
              {selectedDiscipline && `> ${selectedDiscipline.name}`}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {(selectedSemester || selectedDiscipline) && (
            <button
              type="button"
              className="courses-back-btn"
              onClick={handleBack}
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {loading && (
        <p style={{ textAlign: "center", padding: "20px" }}>Loading...</p>
      )}

      {/* STEP 1 - CAMPUS (Locked to Coordinator Campus) */}
      {!selectedCampus && !loading && (
        <div className="course-cards-grid">
          {campuses.map((c) => (
            <button
              type="button"
              key={c._id}
              className="course-selection-card"
              onClick={() => handleCampusSelect(c)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* STEP 2 - FACULTY (Locked to Coordinator Faculty) */}
      {selectedCampus && !selectedFaculty && !loading && (
        <div className="course-cards-grid">
          {faculties.map((f) => (
            <button
              type="button"
              key={f._id}
              className="course-selection-card"
              onClick={() => handleFacultySelect(f)}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* STEP 3 - DEPARTMENT (Locked to Coordinator Department) */}
      {selectedCampus && selectedFaculty && !selectedDepartment && !loading && (
        <div className="course-cards-grid">
          {departments.map((d) => (
            <button
              type="button"
              key={d._id}
              className="course-selection-card"
              onClick={() => handleDepartmentSelect(d)}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}

      {/* STEP 4 - DISCIPLINE (Departmental Degrees) */}
      {selectedDepartment && !selectedDiscipline && !loading && (
        <div className="course-cards-grid">
          {disciplines.length > 0 ? (
            disciplines.map((discipline) => (
              <button
                type="button"
                key={discipline._id}
                className="course-selection-card"
                onClick={() => handleDisciplineSelect(discipline)}
              >
                {discipline.name}
              </button>
            ))
          ) : (
            <div className="courses-empty-state">
              <h3>No Discipline Found</h3>
              <p>No degree/discipline available for this department yet.</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 5 - SEMESTER */}
      {selectedDiscipline && !selectedSemester && (
        <div className="semester-selection-section">
          <h3 className="semester-section-heading">Regular Semesters</h3>
          <div className="semester-cards-grid">
            {regularSemesters.map((semester) => (
              <button
                type="button"
                key={semester}
                className="semester-card"
                onClick={() => handleSemesterSelect(semester)}
              >
                {semester}
              </button>
            ))}
          </div>

          <h3 className="semester-section-heading summer-heading">
            Summer Semesters
          </h3>
          <div className="semester-cards-grid">
            {summerSemesters.map((semester) => (
              <button
                type="button"
                key={semester}
                className="semester-card"
                onClick={() => handleSemesterSelect(semester)}
              >
                {semester}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 6 - COURSE DETAILS */}
      {selectedSemester && (
        <div className="course-details-card">
          <div className="course-details-heading">
            <h3>{selectedDiscipline?.name}</h3>
            <p>{selectedSemester}</p>
          </div>

          {courses.length > 0 ? (
            <>
              <div className="course-table-wrapper">
                <table className="course-details-table">
                  <thead>
                    <tr>
                      <th>Course #</th>
                      <th>Course Title</th>
                      <th>Credit Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isEditing ? editCourses : courses).map((course, index) => (
                      <tr key={course._id}>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={course.courseCode}
                              onChange={(e) =>
                                handleEditChange(index, "courseCode", e.target.value)
                              }
                              style={{ width: "100%", padding: "6px" }}
                            />
                          ) : (
                            course.courseCode
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={course.courseTitle}
                              onChange={(e) =>
                                handleEditChange(index, "courseTitle", e.target.value)
                              }
                              style={{ width: "100%", padding: "6px" }}
                            />
                          ) : (
                            course.courseTitle
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              value={course.creditHours}
                              onChange={(e) =>
                                handleEditChange(index, "creditHours", e.target.value)
                              }
                              style={{ width: "100%", padding: "6px" }}
                            >
                              {creditHoursOpts.map((ch) => (
                                <option key={ch} value={ch}>
                                  {ch}
                                </option>
                              ))}
                            </select>
                          ) : (
                            course.creditHours
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isEditing && (
                <div style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="courses-back-btn"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="courses-back-btn"
                    onClick={handleSaveCourses}
                    style={{ background: "#1e3a5f", color: "white" }}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="courses-empty-state course-data-empty">
              <h3>No courses found</h3>
              <p>
                No courses have been added for this semester yet.
                Please add courses from the "Add the Courses" page.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoordinatorCourses;