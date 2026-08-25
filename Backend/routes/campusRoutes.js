const express = require("express");

const router = express.Router();

const {
    getCampuses,
    addCampus
} = require("../controllers/campusController");


router.get("/", getCampuses);

router.post("/", addCampus);


module.exports = router;