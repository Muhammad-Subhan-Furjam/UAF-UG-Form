const express = require("express");
const router = express.Router();

const {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

// GET All Courses
router.get("/", getCourses);

// POST Add Course
router.post("/", addCourse);

// PUT Update Course
router.put("/:id", updateCourse);

// DELETE Course
router.delete("/:id", deleteCourse);

module.exports = router;