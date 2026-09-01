const mongoose = require("mongoose");


const ugFormSchema = new mongoose.Schema(
{
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    // Academic Relations

    campus_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campus",
        required: true
    },


    faculty_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: true
    },


    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },


    degree_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Degree",
        required: true
    },


    semester_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester",
        required: true
    },


    // Selected Courses

    courses: [
        {
            course_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            },

            courseCode: String,

            courseTitle: String,

            creditHours: Number
        }
    ],


    // Student Information

    studentName: {
        type: String,
        required: true
    },


    fatherName: {
        type: String,
        default: ""
    },


    agNumber: {
        type: String,
        required: true
    },


    email: {
        type: String,
        default: ""
    },


    phone: {
        type: String,
        default: ""
    },


    address: {
        type: String,
        default: ""
    },

    degree: {
        type: String,
        default: ""
    },

    semesterCommencing: {
        type: String,
        default: ""
    },


    // Voucher

    voucher: {
        fileUrl: {
            type: String,
            default: ""
        },

        uploaded: {
            type: Boolean,
            default: false
        }
    },


    // Form Status

    status: {
        type: String,

        enum: [
            "Draft",
            "Submitted",
            "Approved",
            "Rejected"
        ],

        default: "Draft"
    },


    coordinatorRemarks: {
        type: String,
        default: ""
    }


},
{
    timestamps:true
});


module.exports = mongoose.model(
    "UGForm",
    ugFormSchema
);