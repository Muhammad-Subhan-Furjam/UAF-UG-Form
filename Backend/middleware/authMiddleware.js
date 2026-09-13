const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getClientIp } = require("./securityMiddleware");

const authMiddleware = async (req, res, next) => {
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

    if (userId) {
      const dbUser = await User.findById(userId).select("status role department_id");
      if (!dbUser) {
        return res.status(401).json({ message: "User account no longer exists." });
      }

      if (dbUser.status === false) {
        return res.status(403).json({
          message: "Your account has been blocked by the Super Admin. Please contact administration for assistance.",
        });
      }

      const clientIp = getClientIp(req);
      User.findByIdAndUpdate(userId, {
        lastActiveAt: new Date(),
        lastIp: clientIp,
      }).catch(() => {});
    }

    req.user = {
      id: userId,
      _id: userId,
      role: decoded.role,
      department_id: decoded.department_id || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = authMiddleware;