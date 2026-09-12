const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const fs = require("fs");
const mongoose = require("mongoose");

const Campus = require("./models/Campus");
const Faculty = require("./models/Faculty");
const Department = require("./models/Department");
const Degree = require("./models/Degree");
const Semester = require("./models/Semester");
const Course = require("./models/Course");
const User = require("./models/User");
const UGForm = require("./models/UGForm");

const parseExtendedJson = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(parseExtendedJson);
  }

  if (typeof obj === "object") {
    if (obj.$oid && Object.keys(obj).length === 1) {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    if (obj.$date && Object.keys(obj).length === 1) {
      return new Date(obj.$date);
    }

    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = parseExtendedJson(value);
    }
    return newObj;
  }

  return obj;
};

const isValidObjectId = (val) => {
  return (
    val instanceof mongoose.Types.ObjectId ||
    (typeof val === "string" && mongoose.Types.ObjectId.isValid(val) && /^[0-9a-fA-F]{24}$/.test(val))
  );
};

const jsonDir = path.join(__dirname, "../jsons");

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected to Atlas");

    // 1. First import reference datasets
    const refMapping = [
      { file: "UGFormDB.campus.json", model: Campus, name: "Campus" },
      { file: "UGFormDB.faculties.json", model: Faculty, name: "Faculty" },
      { file: "UGFormDB.departments.json", model: Department, name: "Department" },
      { file: "UGFormDB.degrees.json", model: Degree, name: "Degree" },
      { file: "UGFormDB.semesters.json", model: Semester, name: "Semester" },
      { file: "UGFormDB.courses.json", model: Course, name: "Course" },
    ];

    for (const item of refMapping) {
      const filePath = path.join(jsonDir, item.file);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const json = JSON.parse(raw);
        const parsedData = parseExtendedJson(json);

        if (item.name === "Course") {
          for (const c of parsedData) {
            if (c.courseCode) {
              let codeStr = String(c.courseCode).trim().toUpperCase();
              if (!codeStr.includes("-")) {
                codeStr = codeStr.replace(/^([A-Z]+)\s*(\d+)$/, "$1-$2");
              }
              c.courseCode = codeStr;
            }
            if (typeof c.creditHours === "number") {
              c.creditHours = `${c.creditHours} (${c.creditHours}-0)`;
            }
            if (!c.schemeOfStudy) {
              c.schemeOfStudy = "2024";
            }
          }
        }

        await item.model.deleteMany({});
        await item.model.insertMany(parsedData);
        console.log(`📥 Imported ${parsedData.length} records into [${item.name}] collection`);
      }
    }

    // 2. Import Users (resolve string names for campus_id/faculty_id/department_id/degree_id if present)
    const userFilePath = path.join(jsonDir, "UGFormDB.users.json");
    if (fs.existsSync(userFilePath)) {
      const raw = fs.readFileSync(userFilePath, "utf-8");
      const json = JSON.parse(raw);
      const parsedUsers = parseExtendedJson(json);

      for (const u of parsedUsers) {
        if (u.campus_id && !isValidObjectId(u.campus_id)) {
          const found = await Campus.findOne({ name: u.campus_id });
          u.campus_id = found ? found._id : null;
        }
        if (u.faculty_id && !isValidObjectId(u.faculty_id)) {
          const found = await Faculty.findOne({ name: u.faculty_id });
          u.faculty_id = found ? found._id : null;
        }
        if (u.department_id && !isValidObjectId(u.department_id)) {
          const found = await Department.findOne({ name: u.department_id });
          u.department_id = found ? found._id : null;
        }
        if (u.degree_id && !isValidObjectId(u.degree_id)) {
          const found = await Degree.findOne({ name: u.degree_id });
          u.degree_id = found ? found._id : null;
        }
      }

      for (const u of parsedUsers) {
        const query = u._id ? { _id: u._id } : { email: u.email };
        const existing = await User.findOne(query);
        if (!existing) {
          await User.create(u);
        } else {
          await User.updateOne({ _id: existing._id }, { $set: u });
        }
      }
      console.log(`📥 Processed ${parsedUsers.length} records into [User] collection non-destructively`);
    }

    // 3. Import UGForms
    const ugFormFilePath = path.join(jsonDir, "UGFormDB.ugforms.json");
    if (fs.existsSync(ugFormFilePath)) {
      const raw = fs.readFileSync(ugFormFilePath, "utf-8");
      const json = JSON.parse(raw);
      const parsedForms = parseExtendedJson(json);

      for (const f of parsedForms) {
        const query = f._id ? { _id: f._id } : { student_id: f.student_id };
        const existing = await UGForm.findOne(query);
        if (!existing) {
          await UGForm.create(f);
        } else {
          await UGForm.updateOne({ _id: existing._id }, { $set: f });
        }
      }
      console.log(`📥 Processed ${parsedForms.length} records into [UGForm] collection non-destructively`);
    }

    console.log("\n🎉 ALL DATA FROM JSON FILES IMPORTED SUCCESSFULLY INTO YOUR MONGODB DATABASE!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Import Error:", error);
    process.exit(1);
  }
};

importData();
