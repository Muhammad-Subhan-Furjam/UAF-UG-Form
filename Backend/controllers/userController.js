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

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Password Encrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User (directly ObjectIds use kar rahe hain)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      ag_number: role === "student" ? ag_number : "",
      employee_id: role === "coordinator" ? employee_id : "",
      phone,
      fatherName: role === "student" ? fatherName : "",
      cnic: role === "student" ? cnic : "",
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

    let user;

    // Student login

    if (role === "student") {
      user = await User.findOne({
        ag_number: userId,
        role: "student",
      });
    }

    // Coordinator login
    else if (role === "coordinator") {
      user = await User.findOne({
        employee_id: userId,
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
  process.env.JWT_SECRET,
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

const getProfile = async (req,res)=>{

try{

const user = await User.findById(req.user.id)
.select("-password")
.populate("campus_id")
.populate("faculty_id")
.populate("department_id")
.populate("degree_id");


if(!user){

return res.status(404).json({
message:"User not found"
});

}


res.status(200).json({
user
});


}
catch(error){

res.status(500).json({
message:error.message
});

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
