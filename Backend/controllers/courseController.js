const Course = require("../models/Course");
const Semester = require("../models/Semester");

// Get All Courses (Supports Query Filtering)
const getCourses = async (req, res) => {
  try {
    const { campus_id, faculty_id, department_id, degree_id, schemeOfStudy } = req.query;

    let filter = {};
    if (campus_id) filter.campus_id = campus_id;
    if (faculty_id) filter.faculty_id = faculty_id;
    if (department_id) filter.department_id = department_id;
    if (degree_id) filter.degree_id = degree_id;
    if (schemeOfStudy) filter.schemeOfStudy = schemeOfStudy;

    const courses = await Course.find(filter)
      .populate("campus_id")
      .populate("faculty_id")
      .populate("department_id")
      .populate("degree_id")
      .populate("semester_id");

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Course
const addCourse = async (req, res) => {
  try {
    const {
      courseCode,
      courseTitle,
      creditHours,
      campus_id,
      faculty_id,
      department_id,
      degree_id,
      semesterNumber,
      teacherName,
      totalMarks,
      remarks,
      courseType,
      courseCategory,
      schemeOfStudy,
    } = req.body;

    if (!courseCode || !courseTitle || !creditHours || !degree_id || !semesterNumber) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    const validSchemes = ["2022", "2024", "2026"];
    const targetScheme = schemeOfStudy && validSchemes.includes(String(schemeOfStudy).trim())
      ? String(schemeOfStudy).trim()
      : "2024";

    const normalizedCode = courseCode.trim().toUpperCase();
    const normalizedTitle = courseTitle.trim();

    const courseCodeRegex = /^([A-Z]{2,7}-\d{2,4}|[A-Z]{2,7}-[A-Z]{2,7}-\d{2,4})$/;
    if (!courseCodeRegex.test(normalizedCode)) {
      return res.status(400).json({
        message:
          "Invalid Course Code format! Allowed formats: 2-7 uppercase letters-2-4 digits (e.g. CS-101) or 2-7 uppercase letters-2-7 uppercase letters-2-4 digits (e.g. CS-MATH-101).",
      });
    }

    // 1. Check for duplicate courseCode for this degree
    const existingCode = await Course.findOne({
      courseCode: { $regex: new RegExp(`^${normalizedCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      degree_id: degree_id,
    });

    if (existingCode) {
      return res.status(400).json({
        message: `Course Code '${normalizedCode}' already exists under the selected degree. Duplicate course codes are not allowed.`,
      });
    }

    // 2. Check for duplicate courseTitle for this degree
    const existingTitle = await Course.findOne({
      courseTitle: { $regex: new RegExp(`^${normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      degree_id: degree_id,
    });

    if (existingTitle) {
      return res.status(400).json({
        message: `Course Title '${normalizedTitle}' already exists under the selected degree. Duplicate course titles are not allowed.`,
      });
    }

    // Find or Create Semester
    const semNum = Number(String(semesterNumber).replace(/\D/g, "")) || 1;
    let semester = await Semester.findOne({
      degree_id,
      number: semNum,
    });

    if (!semester) {
      semester = await Semester.create({
        name: typeof semesterNumber === "string" && semesterNumber.startsWith("Summer")
          ? semesterNumber
          : `Semester ${semesterNumber}`,
        number: semNum,
        degree_id,
      });
    }

    // Create Course
    const course = await Course.create({
      courseCode: normalizedCode,
      courseTitle: normalizedTitle,
      creditHours,
      campus_id,
      faculty_id,
      department_id,
      degree_id,
      semester_id: semester._id,
      courseType: courseType || "Compulsory",
      courseCategory: courseCategory || "General Course",
      schemeOfStudy: targetScheme,
      totalMarks: totalMarks || "",
      remarks: remarks || "",
    });

    res.status(201).json({
      message: "Course Added Successfully",
      course,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Course
const updateCourse = async (req, res) => {
  try {
    const currentCourse = await Course.findById(req.params.id);

    if (!currentCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    const degreeId = req.body.degree_id || currentCourse.degree_id;

    if (req.body.courseCode) {
      const normalizedCode = req.body.courseCode.trim().toUpperCase();

      const courseCodeRegex = /^([A-Z]{2,7}-\d{2,4}|[A-Z]{2,7}-[A-Z]{2,7}-\d{2,4})$/;
      if (!courseCodeRegex.test(normalizedCode)) {
        return res.status(400).json({
          message:
            "Invalid Course Code format! Allowed formats: 2-7 uppercase letters-2-4 digits (e.g. CS-101) or 2-7 uppercase letters-2-7 uppercase letters-2-4 digits (e.g. CS-MATH-101).",
        });
      }

      const duplicateCode = await Course.findOne({
        _id: { $ne: req.params.id },
        courseCode: { $regex: new RegExp(`^${normalizedCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        degree_id: degreeId,
      });

      if (duplicateCode) {
        return res.status(400).json({
          message: `Course Code '${normalizedCode}' is already in use by another course under this degree. Duplicate course codes are not allowed.`,
        });
      }
      req.body.courseCode = normalizedCode;
    }

    if (req.body.courseTitle) {
      const normalizedTitle = req.body.courseTitle.trim();

      const duplicateTitle = await Course.findOne({
        _id: { $ne: req.params.id },
        courseTitle: { $regex: new RegExp(`^${normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        degree_id: degreeId,
      });

      if (duplicateTitle) {
        return res.status(400).json({
          message: `Course Title '${normalizedTitle}' is already in use by another course under this degree. Duplicate course titles are not allowed.`,
        });
      }
      req.body.courseTitle = normalizedTitle;
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      message: "Course Updated Successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
};