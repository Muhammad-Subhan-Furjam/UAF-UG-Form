const mongoose = require("mongoose");


const semesterSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },


    number: {
        type: Number,
        required: true
    },


    degree_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Degree",
        required: true
    },


    academic_year: {
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


module.exports = mongoose.model("Semester", semesterSchema);