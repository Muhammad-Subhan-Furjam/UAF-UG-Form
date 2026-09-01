const express = require("express");
const router = express.Router();

const {
  getDegrees,
  addDegree,
  addWithHierarchy,
  updateDegree,
  deleteDegree,
} = require("../controllers/degreeController");

router.get("/", getDegrees);
router.post("/", addDegree);
router.post("/add-with-hierarchy", addWithHierarchy);
router.put("/:id", updateDegree);
router.delete("/:id", deleteDegree);

module.exports = router;