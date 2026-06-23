const mongoose = require("mongoose");


// Schema for rate limit tracking
const rateLimitSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true 
},
  requests: [{ 
    type: Number 
}],
  updatedAt: { 
    type: Date, 
    default: Date.now, 
    expires: 120 
}, 
});


const RateLimit = mongoose.models.RateLimit || mongoose.model("RateLimit", rateLimitSchema);


const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = parseInt(process.env.GROK_RATE_LIMIT_PER_MIN) || 10,
    keyPrefix = "rl",
    message = "Too many requests, please try again later.",
  } = options;

  return async (req, res, next) => {
    try {
      const userId = req.user?._id?.toString() || req.ip;
      const key = `${keyPrefix}:${userId}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Find or create rate limit doc
      let doc = await RateLimit.findOne({ key });

      if (!doc) {
        // First request — create doc
        doc = await RateLimit.create({ key, requests: [now], updatedAt: new Date() });
        res.setHeader("X-RateLimit-Limit", max);
        res.setHeader("X-RateLimit-Remaining", max - 1);
        return next();
      }

      const validRequests = (doc.requests || []).filter((ts) => ts > windowStart);

      if (validRequests.length >= max) {
        // Find oldest request in window to compute retry-after
        const oldest = Math.min(...validRequests);
        const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
        return res.status(429).json({ message, retryAfter });
      }

      // Add current request and save
      validRequests.push(now);
      await RateLimit.findOneAndUpdate(
        { key },
        { requests: validRequests, updatedAt: new Date() },
        { upsert: true }
      );

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - validRequests.length);
      next();
    } catch (err) {
      // Fail open — don't block requests if DB has issues
      console.warn("Rate limiter error, skipping:", err.message);
      next();
    }
  };
};


module.exports = { rateLimiter };