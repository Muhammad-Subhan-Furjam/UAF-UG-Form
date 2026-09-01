const express = require("express");

const router = express.Router();


const {
    getFaculties,
    addFaculty,
    updateFaculty,
    deleteFaculty
} = require("../controllers/facultyController");


router.get("/", getFaculties);
router.post("/", addFaculty);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);

module.exports = router;