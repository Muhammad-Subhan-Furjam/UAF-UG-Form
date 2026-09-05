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

// Signup
router.post(
  "/signup",
  signup
);

// Login
router.post(
  "/login",
  login
);

// Forgot Password (CNIC + Phone Verification)
router.post(
  "/forgot-password",
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