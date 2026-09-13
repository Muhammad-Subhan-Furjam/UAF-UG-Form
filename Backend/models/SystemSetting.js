const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema(
  {
    studentSignupEnabled: {
      type: Boolean,
      default: true,
    },
    coordinatorSignupEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
