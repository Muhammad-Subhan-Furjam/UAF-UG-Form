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

  /* =========================================
     SEMESTERS
  ========================================= */
  const semesters = [
    "Semester I",
    "Semester II",
    "Semester III",
    "Semester IV",
    "Semester V",
    "Semester VI",
    "Semester VII",
    "Semester VIII",
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
    };
    return map[semesterName] || 1;
  };

  /* =========================================
     LOAD COORDINATOR DATA (FILTERED TO REGISTERED HIERARCHY)
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

        const coordCampusId = user.campus_id?._id || user.campus_id || "";
        const coordFacultyId = user.faculty_id?._id || user.faculty_id || "";
        const coordDepartmentId = user.department_id?._id || user.department_id || "";

        // 1. Campuses
        let campusList = cRes.data || [];
        if (coordCampusId) {
          const match = campusList.filter(
            (c) => String(c._id) === String(coordCampusId)
          );
          if (match.length > 0) campusList = match;
        }
        setCampuses(campusList);

        // 2. Faculties
        let facultyList = fRes.data || [];
        if (coordFacultyId) {
          const match = facultyList.filter(
            (f) => String(f._id) === String(coordFacultyId)
          );
          if (match.length > 0) facultyList = match;
        } else if (coordCampusId) {
          facultyList = facultyList.filter(
            (f) => String(f.campus_id?._id || f.campus_id) === String(coordCampusId)
          );
        }
        setFaculties(facultyList);

        // 3. Departments
        let deptList = dRes.data || [];
        if (coordDepartmentId) {
          const match = deptList.filter(
            (d) => String(d._id) === String(coordDepartmentId)
          );
          if (match.length > 0) deptList = match;
        } else if (coordFacultyId) {
          deptList = deptList.filter(
            (d) => String(d.faculty_id?._id || d.faculty_id) === String(coordFacultyId)
          );
        }
        setDepartments(deptList);

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
            d.department_id === selectedDepartment._id ||
            d.department_id?._id === selectedDepartment._id
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
            course.degree_id === selectedDiscipline._id ||
            course.degree_id?._id === selectedDiscipline._id;

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
    setSelectedFaculty(null);
    setSelectedDepartment(null);
    setSelectedDiscipline(null);
    setSelectedSemester("");
  };

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty);
    setSelectedDepartment(null);
    setSelectedDiscipline(null);
    setSelectedSemester("");
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setSelectedDiscipline(null);
    setSelectedSemester("");
  };

  const handleDisciplineSelect = (discipline) => {
    setSelectedDiscipline(discipline);
    setSelectedSemester("");
  };

  const handleSemesterSelect = (semester) => {
    setSelectedSemester(semester);
  };

  /* =========================================
     BACK BUTTON
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
    if (selectedDepartment) {
      setSelectedDepartment(null);
      return;
    }
    if (selectedFaculty) {
      setSelectedFaculty(null);
      return;
    }
    if (selectedCampus) {
      setSelectedCampus(null);
    }
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

      for (const course of editCourses) {
        await api.put(`/courses/${course._id}`, {
          courseCode: course.courseCode,
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
    if (selectedDepartment) return "Select Discipline";
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
            <p className="courses-path">
              {selectedCampus?.name}
              {selectedFaculty && ` / ${selectedFaculty.name}`}
              {selectedDepartment && ` / ${selectedDepartment.name}`}
              {selectedDiscipline && ` / ${selectedDiscipline.name}`}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {selectedSemester && courses.length > 0 && !isEditing && (
            <button
              type="button"
              className="courses-back-btn"
              onClick={() => setIsEditing(true)}
              style={{ background: "#1e3a5f", color: "white" }}
            >
              Edit
            </button>
          )}

          {selectedCampus && (
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

      {/* STEP 1 - CAMPUS (Filtered strictly to Coordinator Campus) */}
      {!selectedCampus && !loading && (
        <div className="course-cards-grid">
          {campuses.length > 0 ? (
            campuses.map((c) => (
              <button
                type="button"
                key={c._id}
                className="course-selection-card"
                onClick={() => handleCampusSelect(c)}
              >
                {c.name}
              </button>
            ))
          ) : (
            <div className="courses-empty-state">
              <h3>No Campus Found</h3>
              <p>Please register campus first.</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 2 - FACULTY (Filtered strictly to Coordinator Faculty) */}
      {selectedCampus && !selectedFaculty && !loading && (
        <div className="course-cards-grid">
          {faculties.length > 0 ? (
            faculties.map((f) => (
              <button
                type="button"
                key={f._id}
                className="course-selection-card"
                onClick={() => handleFacultySelect(f)}
              >
                {f.name}
              </button>
            ))
          ) : (
            <div className="courses-empty-state">
              <h3>No Faculty Found</h3>
              <p>No faculty available for this campus.</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 3 - DEPARTMENT (Filtered strictly to Coordinator Department) */}
      {selectedCampus && selectedFaculty && !selectedDepartment && !loading && (
        <div className="course-cards-grid">
          {departments.length > 0 ? (
            departments.map((d) => (
              <button
                type="button"
                key={d._id}
                className="course-selection-card"
                onClick={() => handleDepartmentSelect(d)}
              >
                {d.name}
              </button>
            ))
          ) : (
            <div className="courses-empty-state">
              <h3>No Department Found</h3>
              <p>No department available for this faculty.</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 4 - DISCIPLINE */}
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
              <p>No degree/discipline available. Please add from Dashboard.</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 5 - SEMESTER */}
      {selectedDiscipline && !selectedSemester && (
        <div className="semester-cards-grid">
          {semesters.map((semester) => (
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
                            <input
                              type="text"
                              value={course.creditHours}
                              onChange={(e) =>
                                handleEditChange(index, "creditHours", e.target.value)
                              }
                              style={{ width: "100%", padding: "6px" }}
                            />
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