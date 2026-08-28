import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import "./AddDegree.css";

const AddDegree = () => {
  const navigate = useNavigate();

  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [degreeName, setDegreeName] = useState("");

  const [campusesList, setCampusesList] = useState([]);
  const [facultiesList, setFacultiesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ======================
  // LOAD COORDINATOR HIERARCHY
  // ======================
  useEffect(() => {
    const fetchHierarchyAndUser = async () => {
      try {
        const userRes = await api.get("/users/profile");
        const user = userRes.data?.user || {};

        const [cRes, fRes, dRes] = await Promise.all([
          api.get("/campuses"),
          api.get("/faculties"),
          api.get("/departments"),
        ]);

        setCampusesList(cRes.data || []);

        const coordCampusId =
          user.campus_id?._id || user.campus_id || "";
        const coordFacultyId =
          user.faculty_id?._id || user.faculty_id || "";
        const coordDepartmentId =
          user.department_id?._id || user.department_id || "";

        // Campus set
        if (coordCampusId) {
          const foundCampus = cRes.data.find(
            (c) => String(c._id) === String(coordCampusId)
          );
          setCampus(foundCampus ? foundCampus.name : "");

          // Filter Faculties
          const filteredFac = fRes.data.filter(
            (f) =>
              String(f.campus_id?._id || f.campus_id) === String(coordCampusId)
          );
          setFacultiesList(filteredFac);

          if (coordFacultyId) {
            const foundFaculty = filteredFac.find(
              (f) => String(f._id) === String(coordFacultyId)
            );
            setFaculty(foundFaculty ? foundFaculty.name : "");

            // Filter Departments
            const filteredDept = dRes.data.filter(
              (d) =>
                String(d.faculty_id?._id || d.faculty_id) ===
                String(coordFacultyId)
            );
            setDepartmentsList(filteredDept);

            if (coordDepartmentId) {
              const foundDept = filteredDept.find(
                (d) => String(d._id) === String(coordDepartmentId)
              );
              setDepartment(foundDept ? foundDept.name : "");
            }
          }
        }
      } catch (err) {
        console.log("Error loading coordinator hierarchy:", err);
      }
    };

    fetchHierarchyAndUser();
  }, []);

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!campus || !faculty || !department || !degreeName.trim()) {
      setMessage("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        campus: campus.trim(),
        faculty: faculty.trim(),
        department: department.trim(),
        degree: degreeName.trim(),
      };

      await api.post("/degrees/add-with-hierarchy", payload);

      setMessage("Degree added successfully!");
      setDegreeName("");

      setTimeout(() => {
        navigate("/coordinator/courses");
      }, 1500);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to add degree. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-form-page">
      <div className="add-form-card">
        <div className="add-form-header">
          <h2>Add Departmental Degree</h2>
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-form">
          {/* ========== CAMPUS ========== */}
          <div className="form-group">
            <label>Registered Campus *</label>
            <input
              type="text"
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              placeholder="Campus Name"
              required
            />
          </div>

          {/* ========== FACULTY ========== */}
          <div className="form-group">
            <label>Registered Faculty *</label>
            <input
              type="text"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              placeholder="Faculty Name"
              required
            />
          </div>

          {/* ========== DEPARTMENT ========== */}
          <div className="form-group">
            <label>Registered Department *</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department Name"
              required
            />
          </div>

          {/* ========== DEGREE NAME ========== */}
          <div className="form-group">
            <label>New Degree / Discipline Name *</label>
            <input
              type="text"
              value={degreeName}
              onChange={(e) => setDegreeName(e.target.value)}
              placeholder="e.g. B.Sc. (Hons.) Computer Science"
              required
            />
          </div>

          {/* Message */}
          {message && (
            <p
              className={`form-message ${
                message.includes("success") ? "success" : "error"
              }`}
            >
              {message}
            </p>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Degree"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDegree;