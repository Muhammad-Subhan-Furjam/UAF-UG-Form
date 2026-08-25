const express = require("express");
const router = express.Router();

const {
  getCourses,
  addCourse,
  updateCourse,   // ← yahan add hai
} = require("../controllers/courseController");

// GET All Courses
router.get("/", getCourses);

// POST Add Course
router.post("/", addCourse);

// PUT Update Course
router.put("/:id", updateCourse);   // ← yahan add hai

module.exports = router;