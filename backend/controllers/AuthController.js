const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendWelcomeEmail, sendAdminSignupNotification } = require("../services/EmailService");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });


// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password){
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = await User.findOne({ email });

  if (existing){
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  // Non-blocking emails
  sendWelcomeEmail({ name: user.name, email: user.email });
  sendAdminSignupNotification({ name: user.name, email: user.email });

  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.name.charAt(0).toUpperCase(),
      preferredLang: user.preferredLang,
    },
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password){
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))){
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.name.charAt(0).toUpperCase(),
      preferredLang: user.preferredLang,
    },
  });
};


// GET /api/auth/me
const getMe = async (req, res) => {
  const user = req.user;
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.name.charAt(0).toUpperCase(),
    preferredLang: user.preferredLang,
  });
};


// PATCH /api/auth/lang
const updateLang = async (req, res) => {
  const { lang } = req.body;
  if (!["en", "hi", "mr"].includes(lang))
    return res.status(400).json({ message: "Invalid language" });
             
  await User.findByIdAndUpdate(req.user._id, { preferredLang: lang });
  res.json({ preferredLang: lang });
};

module.exports = { register, login, getMe, updateLang };