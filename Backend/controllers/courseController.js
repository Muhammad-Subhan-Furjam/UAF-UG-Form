const Course = require("../models/Course");
const Semester = require("../models/Semester");

// Get All Courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
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
    } = req.body;

    if (!courseCode || !courseTitle || !creditHours || !degree_id || !semesterNumber) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    const normalizedCode = courseCode.trim().toUpperCase();

    const courseCodeRegex = /^([A-Z]{2,4}-\d{2,4}|[A-Z]{2,4}-[A-Z]{2,4}-\d{2,4})$/;
    if (!courseCodeRegex.test(normalizedCode)) {
      return res.status(400).json({
        message:
          "Invalid Course Code format! Allowed formats: 2-4 uppercase letters-2-4 digits (e.g. CS-101) or 2-4 uppercase letters-2-4 uppercase letters-2-4 digits (e.g. CS-MATH-101).",
      });
    }

    // Check for duplicate courseCode for this degree
    const existingCourse = await Course.findOne({
      courseCode: { $regex: new RegExp(`^${normalizedCode}$`, "i") },
      degree_id: degree_id,
    });

    if (existingCourse) {
      return res.status(400).json({
        message: `Course code '${normalizedCode}' already exists for this degree. Duplicate entries are not allowed.`,
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
      courseTitle,
      creditHours,
      campus_id,
      faculty_id,
      department_id,
      degree_id,
      semester_id: semester._id,
      courseType: courseType || "Compulsory",
      courseCategory: courseCategory || "General Course",
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
    if (req.body.courseCode) {
      const normalizedCode = req.body.courseCode.trim().toUpperCase();

      const courseCodeRegex = /^([A-Z]{2,4}-\d{2,4}|[A-Z]{2,4}-[A-Z]{2,4}-\d{2,4})$/;
      if (!courseCodeRegex.test(normalizedCode)) {
        return res.status(400).json({
          message:
            "Invalid Course Code format! Allowed formats: 2-4 uppercase letters-2-4 digits (e.g. CS-101) or 2-4 uppercase letters-2-4 uppercase letters-2-4 digits (e.g. CS-MATH-101).",
        });
      }

      const currentCourse = await Course.findById(req.params.id);

      if (currentCourse) {
        const duplicate = await Course.findOne({
          _id: { $ne: req.params.id },
          courseCode: { $regex: new RegExp(`^${normalizedCode}$`, "i") },
          degree_id: currentCourse.degree_id,
        });

        if (duplicate) {
          return res.status(400).json({
            message: `Course code '${normalizedCode}' is already in use by another course under this degree.`,
          });
        }
      }
      req.body.courseCode = normalizedCode;
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