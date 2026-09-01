const Degree = require("../models/Degree");
const Campus = require("../models/Campus");
const Faculty = require("../models/Faculty");
const Department = require("../models/Department");

// Helper function - name se code banane ke liye
const generateCode = (name) => {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 12);
};

// Get All Degrees
const getDegrees = async (req, res) => {
  try {
    const degrees = await Degree.find()
      .populate("campus_id")
      .populate("faculty_id")
      .populate("department_id");

    res.status(200).json(degrees);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Degree (simple - purana)
const addDegree = async (req, res) => {
  try {
    const degree = await Degree.create(req.body);

    res.status(201).json({
      message: "Degree Added Successfully",
      degree,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================================
// Add Degree with Hierarchy (Final)
// ================================
const addWithHierarchy = async (req, res) => {
  try {
    const { campus, faculty, department, degree } = req.body;

    if (!campus || !faculty || !department || !degree) {
      return res.status(400).json({
        message: "Campus, Faculty, Department and Degree are required",
      });
    }

    // 1. Handle Campus
    let campusDoc = await Campus.findOne({ name: campus });

    if (!campusDoc) {
      campusDoc = await Campus.create({
        name: campus,
        code: generateCode(campus),
      });
    }

    // 2. Handle Faculty
    let facultyDoc = await Faculty.findOne({
      name: faculty,
      campus_id: campusDoc._id,
    });

    if (!facultyDoc) {
      facultyDoc = await Faculty.create({
        name: faculty,
        code: generateCode(faculty),
        campus_id: campusDoc._id,
      });
    }

    // 3. Handle Department
    let departmentDoc = await Department.findOne({
      name: department,
      faculty_id: facultyDoc._id,
    });

    if (!departmentDoc) {
      departmentDoc = await Department.create({
        name: department,
        code: generateCode(department),
        campus_id: campusDoc._id,
        faculty_id: facultyDoc._id,
      });
    }

    // 4. Check if Degree already exists
    const existingDegree = await Degree.findOne({
      name: degree,
      department_id: departmentDoc._id,
    });

    if (existingDegree) {
      return res.status(400).json({
        message: "This degree already exists under the selected department",
      });
    }

    // 5. Create Degree
    const newDegree = await Degree.create({
      name: degree,
      code: generateCode(degree),
      campus_id: campusDoc._id,
      faculty_id: facultyDoc._id,
      department_id: departmentDoc._id,
    });

    res.status(201).json({
      message: "Degree added successfully",
      data: {
        campus: campusDoc,
        faculty: facultyDoc,
        department: departmentDoc,
        degree: newDegree,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
};

const updateDegree = async (req, res) => {
  try {
    const degree = await Degree.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!degree) {
      return res.status(404).json({ message: "Degree not found" });
    }
    res.status(200).json({ message: "Degree updated successfully", degree });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDegree = async (req, res) => {
  try {
    const degree = await Degree.findByIdAndDelete(req.params.id);
    if (!degree) {
      return res.status(404).json({ message: "Degree not found" });
    }
    res.status(200).json({ message: "Degree deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDegrees,
  addDegree,
  addWithHierarchy,
  updateDegree,
  deleteDegree,
};