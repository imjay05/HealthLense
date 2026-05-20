const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/AuthMiddleware");
const { rateLimiter } = require("../middleware/RateLimiter");
const { analyze, getQueries, getQuery, deleteQuery } = require("../controllers/SymptomController");

router.use(protect);

router.post("/analyze", rateLimiter(), analyze);
router.get("/", getQueries);
router.get("/:id", getQuery);
router.delete("/:id", deleteQuery);


module.exports = router;