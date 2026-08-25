const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  getUGForms,
  getUGFormById,
  addUGForm,
  updateUGForm,
  deleteUGForm,
  getCoordinatorDashboard,
  uploadVoucher,
} = require("../controllers/ugFormController");

// Get All Forms (student / coordinator – filtered inside controller)
router.get("/", authMiddleware, getUGForms);

// Coordinator Dashboard
router.get(
  "/coordinator-dashboard",
  authMiddleware,
  getCoordinatorDashboard
);

// Get Single Form
router.get("/:id", authMiddleware, getUGFormById);

// Student Submit Form
router.post("/", authMiddleware, addUGForm);

// Update Form
router.put("/:id", authMiddleware, updateUGForm);

// Delete Form
router.delete("/:id", authMiddleware, deleteUGForm);

// Voucher Upload
router.put(
  "/:id/voucher",
  authMiddleware,
  upload.single("voucher"),
  uploadVoucher
);

module.exports = router;