const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  adminLogin,
  getAdminStats,
  getAllStudents,
  getAllCoordinators,
  getSuperAdmins,
  getAllFormsForAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} = require("../controllers/adminController");

// Super Admin Middleware
const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Super Admin privileges required." });
  }
};

// Public Super Admin Login Route
router.post("/login", adminLogin);

// Protected Super Admin Routes
router.get("/stats", authMiddleware, requireSuperAdmin, getAdminStats);
router.get("/students", authMiddleware, requireSuperAdmin, getAllStudents);
router.get("/coordinators", authMiddleware, requireSuperAdmin, getAllCoordinators);
router.get("/superadmins", authMiddleware, requireSuperAdmin, getSuperAdmins);
router.get("/forms", authMiddleware, requireSuperAdmin, getAllFormsForAdmin);
router.put("/users/:userId", authMiddleware, requireSuperAdmin, updateUserByAdmin);
router.delete("/users/:userId", authMiddleware, requireSuperAdmin, deleteUserByAdmin);

module.exports = router;
