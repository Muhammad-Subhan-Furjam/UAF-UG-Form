const express = require("express");
const router = express.Router();

const {
  getDegrees,
  addDegree,
  addWithHierarchy,        // ← yeh add karo
} = require("../controllers/degreeController");

router.get("/", getDegrees);

router.post("/", addDegree);

router.post("/add-with-hierarchy", addWithHierarchy);

module.exports = router;