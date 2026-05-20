const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/AuthMiddleware");
const { rateLimiter } = require("../middleware/RateLimiter");
const {analyze, getReports, getReport, deleteReport } = require("../controllers/ReportController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP, and PDF files are allowed"), false);
    }

  },
});

router.use(protect);

router.post("/analyze", rateLimiter(), upload.array("files", 5), analyze);
router.get("/", getReports);
router.get("/:id", getReport);
router.delete("/:id", deleteReport);

module.exports = router;