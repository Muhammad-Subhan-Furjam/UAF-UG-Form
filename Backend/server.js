const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const connectDB = require("./config/db");
const campusRoutes = require("./routes/campusRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const degreeRoutes = require("./routes/degreeRoutes");
const semesterRoutes = require("./routes/semesterRoutes");
const courseRoutes = require("./routes/courseRoutes");
const ugFormRoutes = require("./routes/ugFormRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Ensure database connection middleware for serverless invocations
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection failure", error: err.message });
  }
});

app.use(cors());
app.use(express.json());
app.use("/api/campuses", campusRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/faculties", facultyRoutes);
app.use("/api/degrees", degreeRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/ugforms", ugFormRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
const path = require("path");

app.use("/uploads", express.static("uploads"));

const frontendDist = path.join(__dirname, "../Frontend/ug-form/dist");
app.use(express.static(frontendDist));

app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  const indexPath = path.join(frontendDist, "index.html");
  if (require("fs").existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.send("UG Form Backend Server is Running");
});

if (require.main === module || !process.env.VERCEL) {
  connectDB().catch((err) => console.error("Initial DB connect error:", err.message));
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;

