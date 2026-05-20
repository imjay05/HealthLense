const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/AuthMiddleware");
const { getDashboard, getFullHistory } = require("../controllers/HistoryController");

router.use(protect);

router.get("/dashboard", getDashboard);
router.get("/", getFullHistory);


module.exports = router;