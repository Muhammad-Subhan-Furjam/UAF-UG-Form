require("../models/Campus");
require("../models/Faculty");
require("../models/Department");
require("../models/Degree");
require("../models/Semester");
const User = require("../models/User");
const Course = require("../models/Course");
const UGForm = require("../models/UGForm");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =========================================
// SUPER ADMIN LOGIN (/ladmin endpoint)
// =========================================
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find superadmin user
    const admin = await User.findOne({
      email: trimmedEmail,
      role: "superadmin",
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid Super Admin credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Super Admin credentials",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "superadmin",
      },
      process.env.JWT_SECRET || "UAF_UG_FORM_SECRET_2026",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Super Admin Login Successful",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// DASHBOARD STATS
// =========================================
const getAdminStats = async (req, res) => {
  try {
    const [studentsCount, coordinatorsCount, formsCount, coursesCount] =
      await Promise.all([
        User.countDocuments({ role: { $regex: /^student$/i } }),
        User.countDocuments({ role: { $regex: /^coordinator$/i } }),
        UGForm.countDocuments(),
        Course.countDocuments(),
      ]);

    res.status(200).json({
      studentsCount,
      coordinatorsCount,
      formsCount,
      coursesCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// GET ALL STUDENTS
// =========================================
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: { $regex: /^student$/i } })
      .populate("campus_id")
      .populate("faculty_id")
      .populate("department_id")
      .populate("degree_id")
      .sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// GET ALL COORDINATORS
// =========================================
const getAllCoordinators = async (req, res) => {
  try {
    const coordinators = await User.find({ role: { $regex: /^coordinator$/i } })
      .populate("campus_id")
      .populate("faculty_id")
      .populate("department_id")
      .populate("degree_id")
      .sort({ createdAt: -1 });

    res.status(200).json(coordinators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// UPDATE USER BY ADMIN (Alter Campus, Faculty, Dept, Degree, Status, Profile)
// =========================================
const updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      email,
      phone,
      cnic,
      ag_number,
      employee_id,
      fatherName,
      admissionDate,
      campus_id,
      faculty_id,
      department_id,
      degree_id,
      status,
      password,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res
        .status(403)
        .json({ message: "Cannot modify primary Super Admin account settings" });
    }

    // 1. Check duplicate Email
    if (email && email.trim() && email.trim().toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({
        email: { $regex: new RegExp(`^${email.trim()}$`, "i") },
        _id: { $ne: userId },
      });
      if (existingEmail) {
        return res.status(400).json({
          message: `Email '${email}' is already registered to another user. Duplicates are not allowed.`,
        });
      }
      user.email = email.trim().toLowerCase();
    }

    // 2. Check duplicate Phone
    if (phone && phone.trim() && phone.trim() !== user.phone) {
      const existingPhone = await User.findOne({
        phone: phone.trim(),
        _id: { $ne: userId },
      });
      if (existingPhone) {
        return res.status(400).json({
          message: `Phone number '${phone}' is already registered to another user. Duplicates are not allowed.`,
        });
      }
      user.phone = phone.trim();
    }

    // 3. Check duplicate CNIC
    if (cnic && cnic.trim() && cnic.trim() !== user.cnic) {
      const existingCnic = await User.findOne({
        cnic: cnic.trim(),
        _id: { $ne: userId },
      });
      if (existingCnic) {
        return res.status(400).json({
          message: `CNIC '${cnic}' is already registered to another user. Duplicates are not allowed.`,
        });
      }
      user.cnic = cnic.trim();
    }

    // 4. Check duplicate AG Number (Student)
    if (user.role === "student" && ag_number && ag_number.trim() && ag_number.trim() !== user.ag_number) {
      const existingAg = await User.findOne({
        ag_number: { $regex: new RegExp(`^${ag_number.trim()}$`, "i") },
        _id: { $ne: userId },
      });
      if (existingAg) {
        return res.status(400).json({
          message: `AG Number '${ag_number}' is already registered to another student. Duplicates are not allowed.`,
        });
      }
      user.ag_number = ag_number.trim();
    }

    // 5. Check duplicate Employee ID (Coordinator)
    if (user.role === "coordinator" && employee_id && employee_id.trim() && employee_id.trim() !== user.employee_id) {
      const existingEmp = await User.findOne({
        employee_id: { $regex: new RegExp(`^${employee_id.trim()}$`, "i") },
        _id: { $ne: userId },
      });
      if (existingEmp) {
        return res.status(400).json({
          message: `Employee ID '${employee_id}' is already registered to another coordinator. Duplicates are not allowed.`,
        });
      }
      user.employee_id = employee_id.trim();
    }

    // Update remaining fields if provided
    if (name !== undefined) user.name = name.trim();
    if (fatherName !== undefined) user.fatherName = fatherName.trim();
    if (admissionDate !== undefined) user.admissionDate = admissionDate;
    if (status !== undefined) user.status = Boolean(status);

    // Academic hierarchy alter
    if (campus_id !== undefined) user.campus_id = campus_id || null;
    if (faculty_id !== undefined) user.faculty_id = faculty_id || null;
    if (department_id !== undefined) user.department_id = department_id || null;
    if (degree_id !== undefined) user.degree_id = degree_id || null;

    // Optional password reset by admin
    if (password && password.trim().length >= 6) {
      user.password = await bcrypt.hash(password.trim(), 10);
    }

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate("campus_id")
      .populate("faculty_id")
      .populate("department_id")
      .populate("degree_id");

    res.status(200).json({
      message: "User details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// DELETE USER BY ADMIN
// =========================================
const deleteUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res
        .status(403)
        .json({ message: "Super Admin account cannot be deleted" });
    }

    // Delete user's forms if student
    if (user.role === "student") {
      await UGForm.deleteMany({ student_id: userId });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// GET ALL SUPER ADMINS
// =========================================
const getSuperAdmins = async (req, res) => {
  try {
    const superadmins = await User.find({ role: { $regex: /^superadmin$/i } })
      .select("-password")
    res.status(200).json(superadmins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllFormsForAdmin = async (req, res) => {
  try {
    const forms = await UGForm.find()
      .populate("student_id")
      .populate("campus_id")
      .populate("faculty_id")
      .populate("department_id")
      .populate("degree_id")
      .sort({ createdAt: -1 });

    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  adminLogin,
  getAdminStats,
  getAllStudents,
  getAllCoordinators,
  getSuperAdmins,
  getAllFormsForAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
};
