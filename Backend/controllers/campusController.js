const Campus = require("../models/Campus");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const ensureCampuses = async () => {
  try {
    const count = await Campus.countDocuments();
    if (count === 0) {
      const filePath = path.join(__dirname, "../../jsons/UGFormDB.campus.json");
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const json = JSON.parse(raw);
        const parsed = json.map((item) => ({
          _id: item._id?.$oid ? new mongoose.Types.ObjectId(item._id.$oid) : item._id,
          name: item.name,
          code: item.code || "C100",
          status: item.status !== false,
        }));
        await Campus.insertMany(parsed);
      }
    }
  } catch (err) {
    console.log("Ensure campuses error:", err);
  }
};

const getCampuses = async (req, res) => {
  try {
    await ensureCampuses();
    const campuses = await Campus.find({ status: { $ne: false } });
    res.status(200).json(campuses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



const addCampus = async (req,res)=>{

    try{

        const campus = await Campus.create(req.body);

        res.status(201).json({
            message:"Campus Added Successfully",
            campus
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};



const updateCampus = async (req, res) => {
  try {
    const campus = await Campus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!campus) {
      return res.status(404).json({ message: "Campus not found" });
    }
    res.status(200).json({ message: "Campus updated successfully", campus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCampus = async (req, res) => {
  try {
    const campus = await Campus.findByIdAndDelete(req.params.id);
    if (!campus) {
      return res.status(404).json({ message: "Campus not found" });
    }
    res.status(200).json({ message: "Campus deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCampuses,
  addCampus,
  updateCampus,
  deleteCampus,
};