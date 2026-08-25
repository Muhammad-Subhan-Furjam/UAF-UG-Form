const jwt = require("jsonwebtoken");

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

    // id hamesha available rahe
    req.user = {
      id: decoded.id || decoded._id,
      _id: decoded.id || decoded._id,
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