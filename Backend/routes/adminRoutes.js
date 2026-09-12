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
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  updateFormStatusByAdmin,
  updateFormByAdmin,
  deleteFormByAdmin,
} = require("../controllers/adminController");

// Super Admin Middleware
const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Super Admin privileges required." });
  }
};

const { rateLimiter } = require("../middleware/securityMiddleware");

// Public Super Admin Login Route (Rate Limited)
router.post("/login", rateLimiter(15, 15 * 60 * 1000), adminLogin);

// Protected Super Admin Routes
router.get("/stats", authMiddleware, requireSuperAdmin, getAdminStats);
router.get("/students", authMiddleware, requireSuperAdmin, getAllStudents);
router.get("/coordinators", authMiddleware, requireSuperAdmin, getAllCoordinators);
router.get("/superadmins", authMiddleware, requireSuperAdmin, getSuperAdmins);
router.get("/forms", authMiddleware, requireSuperAdmin, getAllFormsForAdmin);

router.post("/users", authMiddleware, requireSuperAdmin, createUserByAdmin);
router.put("/users/:userId", authMiddleware, requireSuperAdmin, updateUserByAdmin);
router.delete("/users/:userId", authMiddleware, requireSuperAdmin, deleteUserByAdmin);

router.put("/forms/:formId/status", authMiddleware, requireSuperAdmin, updateFormStatusByAdmin);
router.put("/forms/:formId", authMiddleware, requireSuperAdmin, updateFormByAdmin);
router.delete("/forms/:formId", authMiddleware, requireSuperAdmin, deleteFormByAdmin);

module.exports = router;
