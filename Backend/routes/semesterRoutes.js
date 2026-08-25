const express = require("express");

const router = express.Router();


const {
    getSemesters,
    addSemester

} = require("../controllers/semesterController");



router.get("/", getSemesters);


router.post("/", addSemester);



module.exports = router;