import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import "./AddDegree.css";

const AddDegree = () => {
  const navigate = useNavigate();

  // ======================
  // UAF STATIC DATA
  // ======================
  const universityData = {
    "Main Campus": {
      "Faculty of Agriculture": [
        "Department of Agronomy",
        "Department of Plant Breeding & Genetics",
        "Department of Entomology",
        "Department of Plant Pathology",
        "Department of Forestry and Range Management",
        "Institute of Soil & Environmental Sciences",
        "Institute of Horticultural Sciences",
        "Centre of Agricultural Biochemistry and Biotechnology",
        "Department of Crop Physiology",
      ],
      "Faculty of Sciences": [
        "Department Of Computer Science",
        "Department of Botany",
        "Department of Chemistry",
        "Department of Biochemistry",
        "Department of Physics",
        "Department of Mathematics and Statistics",
        "Department of Zoology, Wildlife and Fisheries",
      ],
      "Faculty of Animal Husbandry": ["Institute of Animal and Dairy Sciences"],
      "Faculty of Food Nutrition and Home Sciences": [
        "National Institute of Food Science and Technology (NIFSAT)",
        "Institute of Home Sciences",
      ],
      "Faculty of Veterinary Sciences": [
        "Department of Anatomy",
        "Department of Pathology",
        "Department of Clinical Medicine & Surgery",
        "Department of Theriogenology",
        "Department of Parasitology",
        "Institute of Microbiology",
        "Institute of Physiology and Pharmacology",
      ],
      "Faculty of Agricultural Engineering and Technology": [
        "Department of Farm Machinery and Power",
        "Department of Fiber and Textile Technology",
        "Department of Structures & Environmental Engineering",
        "Department of Energy Systems Engineering",
        "Department of Food Engineering",
        "Department of Irrigation and Drainage",
      ],
      "Faculty of Social Sciences": [
        "Institute of Agricultural Extension, Education and Rural Development",
        "Institute of Agricultural and Resource Economics",
        "Institute of Business Management Sciences",
        "Department of English and Linguistics",
      ],
    },
    "UAF Sub-Campus PARS": {
      "Faculty of Sciences": [
        "Department Of Computer Science",
        "Department of Botany",
        "Department of Chemistry",
        "Department of Biochemistry",
        "Department of Physics",
        "Department of Mathematics and Statistics",
        "Department of Zoology, Wildlife and Fisheries",
      ],
    },
    "UAF Sub-Campus Burewala-Vehari": {
      "Faculty of Agriculture": ["Department of Agricultural Sciences"],
      "Faculty of Sciences": ["Department of Computer Science"],
      "Faculty of Social Sciences": [
        "Department of BBA (Agribusiness)",
        "Department of MBA (Regular)",
      ],
      "Faculty of Arts and Humanities": [],
    },
    "UAF Sub-Campus Depalpur": {
      "Faculty of Agriculture": ["Agriculture"],
      "Faculty of Food, Nutrition & Home Sciences": [
        "Food Science & Technology",
        "Human Nutrition & Dietetics",
        "Home Economics",
        "Human Development & Family Studies",
        "Dairy Technology",
      ],
    },
  };

  // ======================
  // STATES
  // ======================
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [degreeName, setDegreeName] = useState("");

  // New values (when Add New is selected)
  const [newCampus, setNewCampus] = useState("");
  const [newFaculty, setNewFaculty] = useState("");
  const [newDepartment, setNewDepartment] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ======================
  // DERIVED DATA
  // ======================
  const campuses = Object.keys(universityData);

  const faculties =
    campus && campus !== "__new__" && universityData[campus]
      ? Object.keys(universityData[campus])
      : [];

  const departments =
    campus &&
    campus !== "__new__" &&
    faculty &&
    faculty !== "__new__" &&
    universityData[campus]?.[faculty]
      ? universityData[campus][faculty]
      : [];

  // ======================
  // HANDLERS
  // ======================
  const handleCampusChange = (e) => {
    setCampus(e.target.value);
    setFaculty("");
    setDepartment("");
    setNewCampus("");
    setNewFaculty("");
    setNewDepartment("");
  };

  const handleFacultyChange = (e) => {
    setFaculty(e.target.value);
    setDepartment("");
    setNewFaculty("");
    setNewDepartment("");
  };

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
    setNewDepartment("");
  };

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Final values
    const finalCampus = campus === "__new__" ? newCampus.trim() : campus;
    const finalFaculty = faculty === "__new__" ? newFaculty.trim() : faculty;
    const finalDepartment =
      department === "__new__" ? newDepartment.trim() : department;

    if (!finalCampus || !finalFaculty || !finalDepartment || !degreeName.trim()) {
      setMessage("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      // Payload for backend
      const payload = {
        campus: finalCampus,
        faculty: finalFaculty,
        department: finalDepartment,
        degree: degreeName.trim(),
        isNewCampus: campus === "__new__",
        isNewFaculty: faculty === "__new__",
        isNewDepartment: department === "__new__",
      };

      await api.post("/degrees/add-with-hierarchy", payload);

      setMessage("Degree added successfully!");
      
      // Reset form
      setCampus("");
      setFaculty("");
      setDepartment("");
      setDegreeName("");
      setNewCampus("");
      setNewFaculty("");
      setNewDepartment("");

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
          <h2>Add New Degree / Discipline</h2>
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-form">
          {/* ========== CAMPUS ========== */}
          <div className="form-group">
            <label>Select Campus *</label>
            <select value={campus} onChange={handleCampusChange} required>
              <option value="">-- Select Campus --</option>
              {campuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="__new__">+ Add New Campus</option>
            </select>
          </div>

          {campus === "__new__" && (
            <div className="form-group new-input">
              <label>New Campus Name *</label>
              <input
                type="text"
                value={newCampus}
                onChange={(e) => setNewCampus(e.target.value)}
                placeholder="Enter new campus name"
                required
              />
            </div>
          )}

          {/* ========== FACULTY ========== */}
          <div className="form-group">
            <label>Select Faculty *</label>
            <select
              value={faculty}
              onChange={handleFacultyChange}
              required
              disabled={!campus}
            >
              <option value="">
                {!campus
                  ? "Select Campus First"
                  : campus === "__new__"
                  ? "-- Select or Add Faculty --"
                  : "-- Select Faculty --"}
              </option>

              {faculties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="__new__">+ Add New Faculty</option>
            </select>
          </div>

          {faculty === "__new__" && (
            <div className="form-group new-input">
              <label>New Faculty Name *</label>
              <input
                type="text"
                value={newFaculty}
                onChange={(e) => setNewFaculty(e.target.value)}
                placeholder="Enter new faculty name"
                required
              />
            </div>
          )}

          {/* ========== DEPARTMENT ========== */}
          <div className="form-group">
            <label>Select Department *</label>
            <select
              value={department}
              onChange={handleDepartmentChange}
              required
              disabled={!faculty}
            >
              <option value="">
                {!faculty
                  ? "Select Faculty First"
                  : faculty === "__new__"
                  ? "-- Select or Add Department --"
                  : "-- Select Department --"}
              </option>

              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="__new__">+ Add New Department</option>
            </select>
          </div>

          {department === "__new__" && (
            <div className="form-group new-input">
              <label>New Department Name *</label>
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Enter new department name"
                required
              />
            </div>
          )}

          {/* ========== DEGREE NAME ========== */}
          <div className="form-group">
            <label>Degree / Discipline Name *</label>
            <input
              type="text"
              value={degreeName}
              onChange={(e) => setDegreeName(e.target.value)}
              placeholder="e.g. Computer Science, Software Engineering"
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