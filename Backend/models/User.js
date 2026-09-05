const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    employee_id: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["student", "coordinator", "superadmin"],
      default: "student",
    },

    ag_number: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },

    fatherName: {
      type: String,
      default: "",
      trim: true,
    },

    cnic: {
      type: String,
      default: "",
      trim: true,
    },

    admissionDate: {
      type: Date,
      default: null,
    },

campus_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Campus",
  default: null,
},

faculty_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Faculty",
  default: null,
},

department_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Department",
  default: null,
},

degree_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Degree",
  default: null,
},

    lastPasswordChange: {
      type: Date,
      default: null,
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
