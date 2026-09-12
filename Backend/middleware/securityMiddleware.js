// =========================================================
// SECURITY MIDDLEWARE (Rate Limiter, NoSQL Sanitizer, Headers)
// =========================================================

// Memory store for IP Rate Limiting
const rateLimitStore = new Map();

// Clean up stale IP records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 15 * 60 * 1000) {
      rateLimitStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

/**
 * Rate Limiter for Authentication Routes
 * Max 15 attempts per 15 minutes per IP
 */
const rateLimiter = (maxAttempts = 15, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "global";
    const now = Date.now();

    let record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(ip, record);
      return next();
    }

    record.count += 1;

    if (record.count > maxAttempts) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        message: `Too many requests from this IP. Please try again after ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
      });
    }

    next();
  };
};

/**
 * Recursive NoSQL Injection Payload Sanitizer
 * Completely strips keys starting with $ or containing . from incoming HTTP requests
 */
const sanitizeValue = (val) => {
  if (val === null || val === undefined) return val;

  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }

  if (typeof val === "object" && val.constructor === Object) {
    const cleanObj = {};
    for (const key of Object.keys(val)) {
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
 * HTTP Security Headers Middleware
 * Enforces XSS, Clickjacking, MIME-Sniffing, and HSTS Defenses
 */
const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
};

module.exports = {
  rateLimiter,
  sanitizeNoSQL,
  securityHeaders,
};
