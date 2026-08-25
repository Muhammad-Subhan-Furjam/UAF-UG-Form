const mongoose = require("mongoose");


const degreeSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },


    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },


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


    duration: {
        type: String,
        default: ""
    },


    status: {
        type: Boolean,
        default: true
    }

},
{
    timestamps: true
});


module.exports = mongoose.model("Degree", degreeSchema);