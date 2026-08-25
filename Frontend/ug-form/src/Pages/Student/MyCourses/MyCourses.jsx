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

        // 1. Latest submitted form lao (MyForms jaisa)
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

        // 2. Degree + Semester IDs nikaalo
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

        // 3. Courses lao aur filter karo (exactly MyForms jaisa)
        const coursesRes = await api.get("/courses");

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