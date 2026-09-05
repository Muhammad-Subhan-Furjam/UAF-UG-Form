const Campus = require("../models/Campus");

const ensureRequiredFaculties = async () => {
  try {
    const requiredFaculties = [
      "Faculty of Arts and Humanities",
      "Faculty of Health and Pharmaceutical Sciences",
    ];

    let mainCampus =
      (await Campus.findOne({ name: /Main Campus/i })) ||
      (await Campus.findOne());
    if (!mainCampus) return;

    for (const facName of requiredFaculties) {
      const exists = await Faculty.findOne({
        name: new RegExp(
          `^${facName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        ),
      });

      if (!exists) {
        const code =
          "F" +
          facName
            .replace(/FACULTY OF/i, "")
            .trim()
            .substring(0, 4)
            .toUpperCase() +
          Math.floor(1000 + Math.random() * 9000);

        await Faculty.create({
          name: facName,
          code: code,
          campus_id: mainCampus._id,
          status: true,
        });
        console.log(`Auto-created required faculty: ${facName}`);
      }
    }
  } catch (err) {
    console.log("Ensure faculties error:", err.message);
  }
};

// Get all faculties
const getFaculties = async (req, res) => {
  try {
    await ensureRequiredFaculties();
    const faculties = await Faculty.find({ status: { $ne: false } }).populate(
      "campus_id"
    );
    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({
      message: error.message,
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