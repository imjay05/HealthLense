const express = require("express");
const router = express.Router();
const { register, login, getMe, updateLang } = require("../controllers/AuthController");
const { protect } = require("../middleware/AuthMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/lang", protect, updateLang);


module.exports = router;