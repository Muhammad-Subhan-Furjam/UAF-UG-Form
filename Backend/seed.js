require("dotenv").config();
const mongoose = require("mongoose");

const Campus = require("./models/Campus");
const Faculty = require("./models/Faculty");
const Department = require("./models/Department");
const Degree = require("./models/Degree");

// ======================
// Better Code Generator
// ======================
let codeCounter = 1000;
const generateCode = (name, prefix = "") => {
  const words = name
    .toUpperCase()
    .replace(/DEPARTMENT OF|FACULTY OF|INSTITUTE OF|CENTRE OF/g, "")
    .replace(/[^A-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const initials = words.map(w => w[0]).join("").substring(0, 6) || "GEN";
  codeCounter++;
  return `${prefix}${initials}${codeCounter}`;
};

// ======================
// University Data
// ======================
const universityData = {
  "Main Campus": {
    "Faculty of Agriculture": {
      "Department of Agronomy": [],
      "Department of Plant Breeding & Genetics": [],
      "Department of Entomology": [],
      "Department of Plant Pathology": [],
      "Department of Forestry and Range Management": [],
      "Institute of Soil & Environmental Sciences": [],
      "Institute of Horticultural Sciences": [],
      "Centre of Agricultural Biochemistry and Biotechnology": [],
      "Department of Crop Physiology": [],
    },
    "Faculty of Sciences": {
      "Department Of Computer Science": [
        "Computer Science",
        "Information Technology",
        "Software Engineering",
        "Bioinformatics",
        "Data Science",
        "Artificial Intelligence",
      ],
      "Department of Botany": ["BS Botany"],
      "Department of Chemistry": ["BS Chemistry"],
      "Department of Biochemistry": ["BS Bio-Chemistry"],
      "Department of Physics": ["BS Physics"],
      "Department of Mathematics and Statistics": [
        "BS Data Analytics",
        "BS Bio-Statistics",
      ],
      "Department of Zoology, Wildlife and Fisheries": ["BS Aquaculture"],
    },
    "Faculty of Animal Husbandry": {
      "Institute of Animal and Dairy Sciences": [],
    },
    "Faculty of Food Nutrition and Home Sciences": {
      "National Institute of Food Science and Technology (NIFSAT)": [
        "BS (Hons.) HND",
        "BS Food Science",
      ],
      "Institute of Home Sciences": [
        "BS Home Economics",
        "BS Fashion Designing",
        "BS Clothing and Textile",
        "BS Human Development and Family Studies",
        "BS Fine Arts",
      ],
    },
    "Faculty of Veterinary Sciences": {
      "Department of Anatomy": [],
      "Department of Pathology": [],
      "Department of Clinical Medicine & Surgery": [],
      "Department of Theriogenology": [],
      "Department of Parasitology": [],
      "Institute of Microbiology": [],
      "Institute of Physiology and Pharmacology": [],
    },
    "Faculty of Agricultural Engineering and Technology": {
      "Department of Farm Machinery and Power": [],
      "Department of Fiber and Textile Technology": [],
      "Department of Structures & Environmental Engineering": [],
      "Department of Energy Systems Engineering": [],
      "Department of Food Engineering": [],
      "Department of Irrigation and Drainage": [],
    },
    "Faculty of Social Sciences": {
      "Institute of Agricultural Extension, Education and Rural Development": [],
      "Institute of Agricultural and Resource Economics": [],
      "Institute of Business Management Sciences": [],
      "Department of English and Linguistics": [],
    },
  },

  "UAF Sub-Campus PARS": {
    "Faculty of Sciences": {
      "Department Of Computer Science": [],
      "Department of Botany": [],
      "Department of Chemistry": [],
      "Department of Biochemistry": [],
      "Department of Physics": [],
      "Department of Mathematics and Statistics": [],
      "Department of Zoology, Wildlife and Fisheries": [],
    },
  },

  "UAF Sub-Campus Burewala-Vehari": {
    "Faculty of Agriculture": {
      "Department of Agricultural Sciences (BSc Hons)": ["BSc (Hons.) Agriculture"],
    },
    "Faculty of Sciences": {
      "Department of Computer Science": [],
    },
    "Faculty of Social Sciences": {
      "Department of BBA (Agribusiness)": ["BBA Agribusiness"],
      "Department of MBA (Regular)": ["MBA Regular"],
    },
    "Faculty of Arts and Humanities": {},
  },

  "UAF Sub-Campus Depalpur": {
    "Faculty of Agriculture": {
      "Agriculture (BSc Hons)": ["BSc (Hons.) Agriculture"],
    },
    "Faculty of Food, Nutrition & Home Sciences": {
      "Food Science & Technology": ["Food Science & Technology"],
      "Human Nutrition & Dietetics": ["Human Nutrition & Dietetics"],
      "Home Economics (BSc Hons)": ["BSc (Hons.) Home Economics"],
      "Human Development & Family Studies": ["Human Development & Family Studies"],
      "Dairy Technology (MSc Hons)": ["MSc (Hons.) Dairy Technology"],
    },
  },
};

// ======================
// Seed Function
// ======================
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Clear old data
    await Degree.deleteMany({});
    await Department.deleteMany({});
    await Faculty.deleteMany({});
    await Campus.deleteMany({});
    console.log("🗑️  Old data cleared");

    for (const [campusName, faculties] of Object.entries(universityData)) {
      const campus = await Campus.create({
        name: campusName,
        code: generateCode(campusName, "C"),
      });
      console.log(`📍 Campus: ${campusName}`);

      for (const [facultyName, departments] of Object.entries(faculties)) {
        const faculty = await Faculty.create({
          name: facultyName,
          code: generateCode(facultyName, "F"),
          campus_id: campus._id,
        });
        console.log(`   └── Faculty: ${facultyName}`);

        for (const [departmentName, degrees] of Object.entries(departments)) {
          const department = await Department.create({
            name: departmentName,
            code: generateCode(departmentName, "D"),
            campus_id: campus._id,
            faculty_id: faculty._id,
          });
          console.log(`       └── Department: ${departmentName}`);

          for (const degreeName of degrees) {
            await Degree.create({
              name: degreeName,
              code: generateCode(degreeName, "DG"),
              campus_id: campus._id,
              faculty_id: faculty._id,
              department_id: department._id,
            });
            console.log(`           └── Degree: ${degreeName}`);
          }
        }
      }
    }

    console.log("\n✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error.message);
    process.exit(1);
  }
};

seedDatabase();