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


module.exports={
    getDepartments,
    addDepartment
};