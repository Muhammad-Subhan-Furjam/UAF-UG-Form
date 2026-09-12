import React, { useState, useEffect } from "react";
import api from "../../../api/api";
import "./MyCourses.css";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterName, setSemesterName] = useState("Current Semester");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);

        // 1. Student profile fetch for filtering
        const userRes = await api.get("/users/profile");
        const user = userRes.data?.user || {};

        const userCampusId = user.campus_id?._id || user.campus_id || "";
        const userFacultyId = user.faculty_id?._id || user.faculty_id || "";
        const userDeptId = user.department_id?._id || user.department_id || "";

        // Determine scheme of study from batch
        let studentScheme = "2024";
        let session = user.session || user.batch || "";
        if (!session && user.ag_number) {
          const match = user.ag_number.match(/^(\d{4})/);
          if (match) {
            const year = parseInt(match[1]);
            session = `${year}-${year + 4}`;
          }
        }
        if (session === "2026-2030" || session.startsWith("2026")) {
          studentScheme = "2026";
        } else if (session === "2023-2027" || session.startsWith("2023")) {
          studentScheme = "2022";
        } else {
          studentScheme = "2024";
        }

        // 2. Latest submitted form
        const formsRes = await api.get("/ugforms");
        const myForms = formsRes.data.filter((f) => f.status !== "Draft");

        if (myForms.length === 0) {
          setCourses([]);
          setLoading(false);
          return;
        }

        const latestForm = myForms[0];

        // Semester name set karo
        if (latestForm.semester_id?.name) {
          setSemesterName(latestForm.semester_id.name);
        } else if (latestForm.semester_id?.number) {
          setSemesterName(`Semester ${latestForm.semester_id.number}`);
        }

        // Degree + Semester IDs nikaalo
        const degreeId =
          typeof latestForm.degree_id === "object"
            ? latestForm.degree_id?._id
            : latestForm.degree_id;

        const semesterId =
          typeof latestForm.semester_id === "object"
            ? latestForm.semester_id?._id
            : latestForm.semester_id;

        if (!degreeId || !semesterId) {
          setCourses([]);
          setLoading(false);
          return;
        }

        // 3. Courses lao aur filter karo
        const coursesRes = await api.get("/courses");

        const filtered = coursesRes.data.filter((course) => {
          const courseCampusId = course.campus_id?._id || course.campus_id || "";
          const courseFacultyId = course.faculty_id?._id || course.faculty_id || "";
          const courseDeptId = course.department_id?._id || course.department_id || "";
          const courseDegreeId = course.degree_id?._id || course.degree_id || "";
          const courseSemesterId = course.semester_id?._id || course.semester_id || "";

          const campusMatch = !courseCampusId || !userCampusId || String(courseCampusId) === String(userCampusId);
          const facultyMatch = !courseFacultyId || !userFacultyId || String(courseFacultyId) === String(userFacultyId);
          const deptMatch = !courseDeptId || !userDeptId || String(courseDeptId) === String(userDeptId);
          const degreeMatch = String(courseDegreeId) === String(degreeId);
          const semesterMatch = String(courseSemesterId) === String(semesterId);
          const schemeMatch = !course.schemeOfStudy || String(course.schemeOfStudy) === String(studentScheme);

          return campusMatch && facultyMatch && deptMatch && degreeMatch && semesterMatch && schemeMatch;
        });

        setCourses(filtered);
      } catch (error) {
        console.log("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="my-courses-page">
      <section className="my-courses-card">
        {/* Header */}
        <div className="courses-header">
          <div>
            <h2>My Courses</h2>
            <p>Courses assigned to you for the current semester.</p>
          </div>

          <div className="semester-badge">{semesterName}</div>
        </div>

        {/* Table */}
        <div className="my-courses-table-wrapper">
          {loading ? (
            <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>
          ) : courses.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              No courses found for your degree / semester.
            </p>
          ) : (
            <table className="my-courses-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Credit Hours</th>
                  <th>Semester</th>
                </tr>
              </thead>

              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td className="course-code">{course.courseCode}</td>
                    <td>{course.courseTitle}</td>
                    <td>{course.creditHours}</td>
                    <td>
                      {course.semester_id?.name ||
                        (course.semester_id?.number
                          ? `${course.semester_id.number}th`
                          : "-")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyCourses;