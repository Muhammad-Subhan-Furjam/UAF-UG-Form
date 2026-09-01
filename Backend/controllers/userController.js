const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Campus = require("../models/Campus");
const Faculty = require("../models/Faculty");
const Department = require("../models/Department");

// =====================
// Signup Student / Coordinator
// =====================

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      ag_number,
      employee_id,
      phone,
      fatherName,
      cnic,
      admissionDate,
      campus_id,
      faculty_id,
      department_id,
      degree_id,
    } = req.body;

    // 0. Mandatory Fields Check
    if (
      !name ||
      !name.trim() ||
      !email ||
      !email.trim() ||
      !password ||
      !phone ||
      !phone.trim() ||
      !campus_id ||
      !faculty_id ||
      !department_id
    ) {
      return res.status(400).json({
        message: "All fields are mandatory. Please complete all required information.",
      });
    }

    if (role === "student") {
      if (
        !ag_number ||
        !ag_number.trim() ||
        !fatherName ||
        !fatherName.trim() ||
        !cnic ||
        !cnic.trim() ||
        !admissionDate
      ) {
        return res.status(400).json({
          message:
            "AG Number, Father Name, CNIC, and Admission Date are mandatory for student signup.",
        });
      }
    } else if (role === "coordinator") {
      if (!employee_id || !employee_id.trim()) {
        return res.status(400).json({
          message: "Employee ID is mandatory for coordinator signup.",
        });
      }
    }

    // 1. Check existing Email (Global across all accounts)
    const existingEmail = await User.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, "i") },
    });
    if (existingEmail) {
      if (existingEmail.role !== role) {
        return res.status(400).json({
          message: `This email is already registered as a ${existingEmail.role}. A student cannot be a coordinator and a coordinator cannot be a student.`,
        });
      }
      return res.status(400).json({
        message: `Email '${email}' is already registered. Duplicates are not allowed.`,
      });
    }

    // 2. Check existing Phone (Global across all accounts)
    if (phone && phone.trim()) {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        if (existingPhone.role !== role) {
          return res.status(400).json({
            message: `This phone number is already registered under a ${existingPhone.role} account. A student cannot be a coordinator and a coordinator cannot be a student.`,
          });
        }
        return res.status(400).json({
          message: `Phone number '${phone}' is already registered. Duplicates are not allowed.`,
        });
      }
    }

    // 3. Check Student CNIC / Coordinator CNIC
    if (cnic && cnic.trim()) {
      const existingCnic = await User.findOne({ cnic: cnic.trim() });
      if (existingCnic) {
        if (existingCnic.role !== role) {
          return res.status(400).json({
            message: `This CNIC number is already registered under a ${existingCnic.role} account. A student cannot be a coordinator and a coordinator cannot be a student.`,
          });
        }
        return res.status(400).json({
          message: `CNIC number '${cnic}' is already registered. Duplicates are not allowed.`,
        });
      }
    }

    // 4. Check Student AG Number (For Student Role)
    if (role === "student" && ag_number && ag_number.trim()) {
      const existingAg = await User.findOne({
        ag_number: { $regex: new RegExp(`^${ag_number.trim()}$`, "i") },
      });
      if (existingAg) {
        return res.status(400).json({
          message: `AG Number '${ag_number}' is already registered. Duplicates are not allowed.`,
        });
      }
    }

    // 5. Check Coordinator Employee ID (For Coordinator Role)
    if (role === "coordinator" && employee_id && employee_id.trim()) {
      const existingEmpId = await User.findOne({
        employee_id: { $regex: new RegExp(`^${employee_id.trim()}$`, "i") },
      });
      if (existingEmpId) {
        return res.status(400).json({
          message: `Employee ID '${employee_id}' is already registered. Duplicates are not allowed.`,
        });
      }
    }

    // Password Encrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User (directly ObjectIds use kar rahe hain)
    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      ag_number: role === "student" ? ag_number.trim() : "",
      employee_id: role === "coordinator" ? employee_id.trim() : "",
      phone: phone ? phone.trim() : "",
      fatherName: role === "student" ? fatherName : "",
      cnic: role === "student" ? cnic.trim() : "",
      admissionDate: role === "student" ? admissionDate : null,

      campus_id: campus_id || null,
      faculty_id: faculty_id || null,
      department_id: department_id || null,
      degree_id: degree_id || null,
    });

    res.status(201).json({
      message: "Signup Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Signup Error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================
// Login Student / Coordinator
// =====================

const login = async (req, res) => {
  try {
    const { userId, password, role } = req.body;

    const trimmedId = (userId || "").trim();

    // Check if user exists under ANY role to prevent cross-role login
    const anyUser = await User.findOne({
      $or: [
        { ag_number: { $regex: new RegExp(`^${trimmedId}$`, "i") } },
        { employee_id: { $regex: new RegExp(`^${trimmedId}$`, "i") } },
        { email: { $regex: new RegExp(`^${trimmedId}$`, "i") } },
      ],
    });

    if (anyUser && anyUser.role !== role) {
      return res.status(400).json({
        message: `This account is registered as a ${anyUser.role}. No student can log in as a coordinator and no coordinator can log in as a student.`,
      });
    }

    let user;

    // Student login
    if (role === "student") {
      user = await User.findOne({
        ag_number: { $regex: new RegExp(`^${trimmedId}$`, "i") },
        role: "student",
      });
    }

    // Coordinator login
    else if (role === "coordinator") {
      user = await User.findOne({
        employee_id: { $regex: new RegExp(`^${trimmedId}$`, "i") },
        role: "coordinator",
      });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Password Check

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    // Create Token

   const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
    department_id: user.department_id || null,
  },
  process.env.JWT_SECRET || "UAF_UG_FORM_SECRET_2026",
  { expiresIn: "7d" }
);

    res.status(200).json({
      message: "Login Successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// =====================
// Get Logged In User Profile
// =====================

const mongoose = require("mongoose");

const getProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Resolve string names if any exist on the user document
    if (user.campus_id && typeof user.campus_id === "string" && !mongoose.Types.ObjectId.isValid(user.campus_id)) {
      const found = await mongoose.model("Campus").findOne({ name: user.campus_id });
      if (found) user.campus_id = found._id;
    }
    if (user.faculty_id && typeof user.faculty_id === "string" && !mongoose.Types.ObjectId.isValid(user.faculty_id)) {
      const found = await mongoose.model("Faculty").findOne({ name: user.faculty_id });
      if (found) user.faculty_id = found._id;
    }
    if (user.department_id && typeof user.department_id === "string" && !mongoose.Types.ObjectId.isValid(user.department_id)) {
      const found = await mongoose.model("Department").findOne({ name: user.department_id });
      if (found) user.department_id = found._id;
    }
    if (user.degree_id && typeof user.degree_id === "string" && !mongoose.Types.ObjectId.isValid(user.degree_id)) {
      const found = await mongoose.model("Degree").findOne({ name: user.degree_id });
      if (found) user.degree_id = found._id;
    }

    // Default fallback assignment for coordinators without assigned hierarchy
    if (user.role === "coordinator" && (!user.campus_id || !user.faculty_id || !user.department_id)) {
      const defaultCampus = await mongoose.model("Campus").findOne({ name: /Main Campus/i }) || await mongoose.model("Campus").findOne();
      const defaultFaculty = await mongoose.model("Faculty").findOne({ campus_id: defaultCampus?._id }) || await mongoose.model("Faculty").findOne();
      const defaultDept = await mongoose.model("Department").findOne({ faculty_id: defaultFaculty?._id }) || await mongoose.model("Department").findOne();
      
      if (!user.campus_id && defaultCampus) user.campus_id = defaultCampus._id;
      if (!user.faculty_id && defaultFaculty) user.faculty_id = defaultFaculty._id;
      if (!user.department_id && defaultDept) user.department_id = defaultDept._id;
      await user.save();
    }

    await user.populate([
      "campus_id",
      "faculty_id",
      "department_id",
      "degree_id",
    ]);

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateProfile = async(req,res)=>{

try{


const updatedUser = await User.findByIdAndUpdate(

req.user.id,

req.body,

{
new:true
}

)
.select("-password")
.populate("campus_id")
.populate("faculty_id")
.populate("department_id")
.populate("degree_id");



if(!updatedUser){

return res.status(404).json({

message:"User not found"

});

}



res.status(200).json({

message:"Profile Updated Successfully",

user:updatedUser

});


}
catch(error){

res.status(500).json({

message:error.message

});

}


};
const updateProfileImage = async(req,res)=>{

try{

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let profileImageStr = "";
    if (req.file.buffer) {
      const base64Data = req.file.buffer.toString("base64");
      profileImageStr = `data:${req.file.mimetype};base64,${base64Data}`;
    } else if (req.file.filename) {
      profileImageStr = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profileImage: profileImageStr
      },
      {
        new: true
      }
    );


res.status(200).json({

message:"Profile Image Updated",

user

});


}
catch(error){

console.log(error);

res.status(500).json({

message:error.message

});

}

};

module.exports = {

signup,
login,
getProfile,
updateProfile,
updateProfileImage

};
