const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const secret = process.env.JWT_SECRET || "UAF_UG_FORM_SECRET_2026";
    const decoded = jwt.verify(token, secret);

    const userId = decoded.id || decoded._id;

    // id hamesha available rahe
    req.user = {
      id: userId,
      _id: userId,
      role: decoded.role,
      department_id: decoded.department_id || null,
    };

    // Track active user timestamp and IP address asynchronously
    if (userId) {
      const rawIp =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.ip ||
        req.connection?.remoteAddress ||
        "127.0.0.1";

      User.findByIdAndUpdate(userId, {
        lastActiveAt: new Date(),
        lastIp: rawIp,
      }).catch(() => {});
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = authMiddleware;