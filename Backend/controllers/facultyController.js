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


const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json({ message: "Faculty updated successfully", faculty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json({ message: "Faculty deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFaculties,
  addFaculty,
  updateFaculty,
  deleteFaculty,
};