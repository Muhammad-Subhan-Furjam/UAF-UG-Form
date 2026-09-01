const express = require("express");

const router = express.Router();

const {
    getCampuses,
    addCampus,
    updateCampus,
    deleteCampus
} = require("../controllers/campusController");


router.get("/", getCampuses);
router.post("/", addCampus);
router.put("/:id", updateCampus);
router.delete("/:id", deleteCampus);

module.exports = router;