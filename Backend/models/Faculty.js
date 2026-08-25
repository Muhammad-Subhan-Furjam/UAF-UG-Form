const mongoose = require("mongoose");


const facultySchema = new mongoose.Schema(
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

    status: {
        type: Boolean,
        default: true
    }

},
{
    timestamps: true
});


module.exports = mongoose.model("Faculty", facultySchema);