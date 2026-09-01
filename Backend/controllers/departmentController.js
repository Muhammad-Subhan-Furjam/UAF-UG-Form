const Department = require("../models/Department");


const getDepartments = async(req,res)=>{

    try{

       const departments = await Department.find()
.populate("campus_id")
.populate("faculty_id");

        res.json(departments);

    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};



const addDepartment = async(req,res)=>{

    try{

        const department = await Department.create(req.body);


        res.status(201).json({
            message:"Department Added Successfully",
            department
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};


const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res
      .status(200)
      .json({ message: "Department updated successfully", department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
};