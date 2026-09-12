const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

const {
  signup,
  login,
  getProfile,
  updateProfile,
  updateProfileImage,
  resetPasswordWithCnicAndPhone,
} = require("../controllers/userController");

const { rateLimiter } = require("../middleware/securityMiddleware");

// Signup (Rate Limited)
router.post(
  "/signup",
  rateLimiter(15, 15 * 60 * 1000),
  signup
);

// Login (Rate Limited)
router.post(
  "/login",
  rateLimiter(15, 15 * 60 * 1000),
  login
);

// Forgot Password (CNIC + Phone Verification - Rate Limited)
router.post(
  "/forgot-password",
  rateLimiter(15, 15 * 60 * 1000),
  resetPasswordWithCnicAndPhone
);


// Get Profile
router.get(
"/profile",
authMiddleware,
getProfile
);

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

// Update Profile Image
router.put(
"/profile-image",
authMiddleware,
upload.single("image"),
updateProfileImage
);


module.exports = router;