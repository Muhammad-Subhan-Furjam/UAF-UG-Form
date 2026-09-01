require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb+srv://javeriasher90_db_user:UAFForm%402026Secure@ugformcluster.qslkbuw.mongodb.net/UGFormDB?retryWrites=true&w=majority";

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected to Atlas for Admin Seeding");

    const adminEmail = "admin@uaf.com";
    const rawPassword = "H@ck3r#$";

    // 1. Check if any superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: "superadmin" });
    const existingEmailUser = await User.findOne({ email: adminEmail });

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    if (existingSuperAdmin) {
      console.log(`ℹ️ Super Admin account already exists: ${existingSuperAdmin.email}`);
      // Ensure password and role are synced
      existingSuperAdmin.password = hashedPassword;
      existingSuperAdmin.email = adminEmail;
      await existingSuperAdmin.save();
      console.log("✅ Super Admin password & email verified and updated!");
    } else if (existingEmailUser) {
      existingEmailUser.role = "superadmin";
      existingEmailUser.password = hashedPassword;
      await existingEmailUser.save();
      console.log("✅ Converted existing account to Super Admin!");
    } else {
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "superadmin",
        status: true,
      });
      console.log("🎉 ONE-AND-ONLY SUPER ADMIN ACCOUNT CREATED SUCCESSFULLY!");
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${rawPassword}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Admin Seed Error:", error);
    process.exit(1);
  }
};

seedAdmin();
