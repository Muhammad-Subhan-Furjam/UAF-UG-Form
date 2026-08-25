const express = require("express");

const router = express.Router();


const {
    getFaculties,
    addFaculty
} = require("../controllers/facultyController");



router.get("/", getFaculties);


router.post("/", addFaculty);



module.exports = router;