// =========================================================
// SECURITY MIDDLEWARE (Rate Limiting, XSS & NoSQL Sanitization, Headers, Password Policy)
// =========================================================

// Memory store for IP Rate Limiting
const rateLimitStores = new Map();

// Clean up stale IP records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStores.entries()) {
    if (now - data.resetTime > 15 * 60 * 1000) {
      rateLimitStores.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * IP Rate Limiter for Authentication & API Endpoints
 */
const rateLimiter = (maxAttempts = 10, windowMs = 15 * 60 * 1000, prefix = "auth") => {
  return (req, res, next) => {
    const rawIp = req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "global";
    const ip = `${prefix}:${rawIp}`;
    const now = Date.now();

    let record = rateLimitStores.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStores.set(ip, record);
      return next();
    }

    record.count += 1;

    if (record.count > maxAttempts) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        message: `Too many requests from this IP. Security lockdown active. Please try again after ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
      });
    }

    next();
  };
};

/**
 * XSS & Script Tag Sanitization Helper
 */
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
};

/**
 * Recursive Payload Sanitizer
 * Strips NoSQL operators ($ / .) and XSS script injections
 */
const sanitizeValue = (val) => {
  if (val === null || val === undefined) return val;

  if (typeof val === "string") {
    return sanitizeString(val);
  }

  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }

  if (typeof val === "object" && val.constructor === Object) {
    const cleanObj = {};
    for (const key of Object.keys(val)) {
      // Strip keys starting with $ or containing . (NoSQL Injection Defense)
      if (typeof key === "string" && (key.startsWith("$") || key.includes("."))) {
        continue;
      }
      cleanObj[key] = sanitizeValue(val[key]);
    }
    return cleanObj;
  }

  return val;
};

const sanitizeNoSQL = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

/**
 * Strong Password Policy Validator
 * Enforces: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
 */
const validatePasswordStrength = (password) => {
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least 1 uppercase letter (A-Z).";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least 1 lowercase letter (a-z).";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least 1 number (0-9).";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Password must contain at least 1 special character (!@#$%^&*).";
  }
  return null;
};

/**
 * HTTP Security Headers Middleware
 * Protects against XSS, Clickjacking, MIME-Sniffing, HSTS, and Frame Attacks
 */
const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
};

module.exports = {
  rateLimiter,
  sanitizeNoSQL,
  securityHeaders,
  validatePasswordStrength,
  sanitizeString,
};
