const Semester = require("../models/Semester");


// Get All Semesters
const getSemesters = async (req, res) => {

    try {

        const semesters = await Semester.find()
        .populate("degree_id");


        res.status(200).json(semesters);


    } catch(error){

        res.status(500).json({
            message: error.message
        });

    }

};



// Add Semester
const addSemester = async (req, res) => {

    try {

        const semester = await Semester.create(req.body);


        res.status(201).json({

            message: "Semester Added Successfully",
            semester

        });


    } catch(error){

        res.status(500).json({

            message: error.message

        });

    }

};



module.exports = {

    getSemesters,
    addSemester

};