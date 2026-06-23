const Report = require("../models/Report");
const SymptomQuery = require("../models/SymptomQuery");


// GET /api/history/dashboard
const getDashboard = async (req, res) => {
  const [recentReports, recentQueries] = await Promise.all([
    Report.find({ user: req.user._id })
      .sort({ updatedAt: -1 }) 
      .limit(5)
      .select("fileType thumbnailUrl fileDate analyses createdAt updatedAt"),

    SymptomQuery.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("inputText detectedLang createdAt suggestions"),
  ]);

  res.json({ recentReports, recentQueries });
};


// GET /api/history
const getFullHistory = async (req, res) => {
  const [reports, queries] = await Promise.all([
    Report.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select("fileType thumbnailUrl fileDate analyses createdAt updatedAt"),

    SymptomQuery.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("inputText detectedLang createdAt"),
  ]);

  const combined = [
    ...reports.map((r) => ({ ...r.toObject(), itemType: "report" })),
    ...queries.map((q) => ({ ...q.toObject(), itemType: "symptom" })),
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  res.json({ history: combined });
};


module.exports = { getDashboard, getFullHistory };