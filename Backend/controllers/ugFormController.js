const UGForm = require("../models/UGForm");
const User = require("../models/User");
const Semester = require("../models/Semester");

// ==========================
// Get All UG Forms
// ==========================
const getUGForms = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const role = req.user.role;

    let query = {};

    if (role === "student") {
      query.student_id = userId;
    } else if (role === "coordinator") {
      if (req.user.department_id) {
        query.department_id = req.user.department_id;
      }
      query.status = { $in: ["Submitted", "Approved", "Rejected"] };
    }

    const forms = await UGForm.find(query)
      .populate("student_id")
      .populate("campus_id")
      .populate("faculty_id")
      .populate("department_id")
      .populate("degree_id")
      .populate("semester_id")
      .populate("courses.course_id")
      .sort({ createdAt: -1 });

    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// Get Single UG Form
// ==========================
const getUGFormById = async (req, res) => {
  try {
    const form = await UGForm.findById(req.params.id)
      .populate("student_id")
      .populate("campus_id")
      .populate("faculty_id")
      .populate("department_id")
      .populate("degree_id")
      .populate("semester_id")
      .populate("courses.course_id");

    if (!form) {
      return res.status(404).json({ message: "UG Form Not Found" });
    }

    // Student sirf apna form dekh sake
    if (req.user.role === "student") {
      const formStudentId = form.student_id?._id
        ? form.student_id._id.toString()
        : form.student_id.toString();

      const currentUserId = (req.user.id || req.user._id).toString();

      if (formStudentId !== currentUserId) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    res.status(200).json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// Create UG Form
// ==========================
const addUGForm = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const student = await User.findById(userId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.degree_id) {
      return res.status(400).json({
        message: "Student degree not found. Please complete your profile.",
      });
    }

    const { semesterNumber, courses, fatherName, address, voucher, degree, semesterCommencing } = req.body;

    if (!semesterNumber) {
      return res.status(400).json({ message: "Semester is required" });
    }

    const semNum = Number(String(semesterNumber).replace(/\D/g, "")) || 1;
    let semester = await Semester.findOne({
      degree_id: student.degree_id,
      number: semNum,
    });

    if (!semester) {
      semester = await Semester.create({
        name: typeof semesterNumber === "string" && semesterNumber.startsWith("Summer")
          ? semesterNumber
          : `Semester ${semesterNumber}`,
        number: semNum,
        degree_id: student.degree_id,
      });
    }

    const form = await UGForm.create({
      student_id: student._id,
      campus_id: student.campus_id,
      faculty_id: student.faculty_id,
      department_id: student.department_id,
      degree_id: student.degree_id,
      semester_id: semester._id,
      courses: courses || [],
      studentName: student.name,
      agNumber: student.ag_number,
      email: student.email,
      phone: student.phone,
      fatherName: fatherName || student.fatherName || "",
      address: address || "",
      degree: degree || "",
      semesterCommencing: semesterCommencing || "",
      voucher: voucher || { uploaded: false },
      status: req.body.status || "Submitted",
    });

    res.status(201).json({
      message: "UG Form Submitted Successfully",
      form,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// Update UG Form
// ==========================
const updateUGForm = async (req, res) => {
  try {
    const form = await UGForm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!form) {
      return res.status(404).json({ message: "UG Form Not Found" });
    }

    res.status(200).json({
      message: "UG Form Updated Successfully",
      form,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// Delete UG Form
// ==========================
const deleteUGForm = async (req, res) => {
  try {
    await UGForm.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "UG Form Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// Coordinator Dashboard
// ==========================
const getCoordinatorDashboard = async (req, res) => {
  try {
    let matchQuery = {
      status: { $in: ["Submitted", "Approved", "Rejected"] },
    };

    if (req.user.department_id) {
      matchQuery.department_id = req.user.department_id;
    }

    const totalRequests = await UGForm.countDocuments(matchQuery);

    const pendingRequests = await UGForm.countDocuments({
      ...matchQuery,
      status: "Submitted",
    });

    const approvedRequests = await UGForm.countDocuments({
      ...matchQuery,
      status: "Approved",
    });

    const requests = await UGForm.find(matchQuery)
      .populate("student_id")
      .populate("semester_id")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      requests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// Upload Voucher
// ==========================
const uploadVoucher = async (req, res) => {
  try {
    const form = await UGForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: "UG Form not found" });
    }

    const formStudentId = form.student_id?._id
      ? form.student_id._id.toString()
      : form.student_id.toString();

    const currentUserId = (req.user.id || req.user._id || "").toString();

    if (formStudentId !== currentUserId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let fileUrl = "";
    if (req.file.buffer) {
      const base64Data = req.file.buffer.toString("base64");
      fileUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    } else if (req.file.filename) {
      fileUrl = `/uploads/vouchers/${req.file.filename}`;
    }

    form.voucher = {
      fileUrl,
      uploaded: true,
    };

    await form.save();

    res.status(200).json({
      message: "Voucher uploaded successfully",
      form,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUGForms,
  getUGFormById,
  addUGForm,
  updateUGForm,
  deleteUGForm,
  getCoordinatorDashboard,
  uploadVoucher,
};