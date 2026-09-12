const Department = require("../models/Department");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const ensureDepartments = async () => {
  try {
    // Delete any existing Department of Irrigation and Drainage
    await Department.deleteMany({
      name: { $regex: /Irrigation and Drainage/i },
    });

    const count = await Department.countDocuments();
    if (count === 0) {
      const filePath = path.join(__dirname, "../../jsons/UGFormDB.departments.json");
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parseExt = (obj) => {
          if (obj === null || obj === undefined) return obj;
          if (Array.isArray(obj)) return obj.map(parseExt);
          if (typeof obj === "object") {
            if (obj.$oid && Object.keys(obj).length === 1) return new mongoose.Types.ObjectId(obj.$oid);
            const n = {};
            for (const [k, v] of Object.entries(obj)) n[k] = parseExt(v);
            return n;
          }
          return obj;
        };
        await Department.insertMany(parseExt(JSON.parse(raw)));
      }
    }
  } catch (err) {
    console.log("Ensure departments error:", err);
  }
};

const getDepartments = async (req, res) => {
  try {
    await ensureDepartments();
    const departments = await Department.find()
      .populate("campus_id")
      .populate("faculty_id");

    res.json(departments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
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