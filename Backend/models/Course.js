const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^([A-Z]{2,7}-\d{2,4}|[A-Z]{2,7}-[A-Z]{2,7}-\d{2,4})$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid course code format! Allowed: 2-7 uppercase letters-2-4 digits (e.g. CS-101) or 2-7 uppercase letters-2-7 uppercase letters-2-4 digits (e.g. CS-MATH-101).`,
      },
    },

    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },

    creditHours: {
      type: String,
      required: true,
      trim: true,
    },

    // ========== NEW FIELDS ==========
    totalMarks: {
      type: String,
      default: "",
      trim: true,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    courseCategory: {
      type: String,
      default: "General Course",
      trim: true,
    },
    // ================================

    campus_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },

    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    degree_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Degree",
      required: true,
    },

    semester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },

    courseType: {
      type: String,
      default: "Compulsory",
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);