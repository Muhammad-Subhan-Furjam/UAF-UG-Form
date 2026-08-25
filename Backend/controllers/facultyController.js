const Faculty = require("../models/Faculty");


// Get all faculties
const getFaculties = async (req, res) => {

    try {

        const faculties = await Faculty.find({
            status: true
        }).populate("campus_id");

        res.status(200).json(faculties);

    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};


// Add Faculty
const addFaculty = async (req,res)=>{

    try{

        const faculty = await Faculty.create(req.body);

        res.status(201).json({
            message:"Faculty Added Successfully",
            faculty
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};


module.exports = {
    getFaculties,
    addFaculty
};