const Report = require("../models/Report");
const SymptomQuery = require("../models/SymptomQuery");


// Helper: expand a report's analyses into one virtual card per unique IST date
const expandReportByDate = (report) => {
  const byDate = {};
  for (const entry of report.analyses) {
    const dateKey = new Date(entry.analyzedAt)
      .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // "YYYY-MM-DD"
    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push(entry);
  }

  return Object.entries(byDate).map(([dateKey, entries]) => ({
    ...report.toObject(),
    analyses: entries,
    displayDate: dateKey,
    _virtualId: `${report._id}_${dateKey}`,
    itemType: "report",
  }));
};


// GET /api/history/dashboard
const getDashboard = async (req, res) => {
  const [reports, recentQueries] = await Promise.all([
    Report.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select("fileType thumbnailUrl analyses createdAt updatedAt"),

    SymptomQuery.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("inputText detectedLang createdAt suggestions"),
  ]);

  const expandedReports = reports.flatMap(expandReportByDate);
  expandedReports.sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate));
  const recentReports = expandedReports.slice(0, 5);

  res.json({ recentReports, recentQueries });
};


// GET /api/history
const getFullHistory = async (req, res) => {
  const [reports, queries] = await Promise.all([
    Report.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select("fileType thumbnailUrl filePublicId analyses createdAt updatedAt fileUrl"),

    SymptomQuery.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("inputText detectedLang createdAt"),
  ]);

  const expandedReports = reports.flatMap(expandReportByDate);

  const combined = [
    ...expandedReports,
    ...queries.map((q) => ({ ...q.toObject(), itemType: "symptom" })),
  ].sort((a, b) =>
    new Date(b.displayDate || b.createdAt) - new Date(a.displayDate || a.createdAt)
  );

  res.json({ history: combined });
};


module.exports = { getDashboard, getFullHistory };