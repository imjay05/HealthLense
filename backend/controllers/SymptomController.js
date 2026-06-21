const SymptomQuery = require("../models/SympotomQuery");
const { analyzeSymptoms } = require("../services/AIService");
const { getNearbyLabs } = require("../services/OverPassService");


const analyze = async (req, res) => {
  const { inputText, selectedChips = [], lat, lon } = req.body;

  if (!inputText || inputText.trim().length < 3) {
    return res.status(400).json({ message: "Please describe your symptoms" });
  }

  try {
    const grokResult = await analyzeSymptoms(inputText, selectedChips);

    const suggestions = (grokResult.suggestions || [])
      .slice(0, 7)
      .map(({ testName, reason }) => ({ testName, reason }));

    let nearbyLabs = [];
    if (lat && lon) {
      try {
        nearbyLabs = await getNearbyLabs(parseFloat(lat), parseFloat(lon), 10, 8);
      } catch (err) {
        console.warn("Nominatim fetch failed:", err.message);
      }
    }

    const query = await SymptomQuery.create({
      user: req.user._id,
      inputText,
      detectedLang: grokResult.detectedLang || "en",
      selectedChips,
      suggestions,
      nearbyLabs,
      userLat: lat || null,
      userLon: lon || null,
    });

    res.status(201).json({
      query,
      detectedLang: grokResult.detectedLang,
      summary: grokResult.summary,
      suggestions,
      nearbyLabs,
    });

  } catch (err) {
    const status = err?.status || err?.response?.status || 500;
    const message =
      status === 403 ? "AI service has no credits — contact admin" :
      status === 429 ? "AI rate limit reached — try again shortly" :
      "Analysis failed — please try again";
    console.error("Symptom analyze error:", err.message);
    res
      .status(status >= 400 && status < 600 ? status : 500)
      .json({ message });
  }
};


const getQueries = async (req, res) => {
  const queries = await SymptomQuery
    .find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select("-nearbyLabs");
  res.json({ queries });
};

const getQuery = async (req, res) => {
  const query = await SymptomQuery.findOne({ _id: req.params.id, user: req.user._id });

  if (!query){
    return res.status(404).json({ message: "Query not found" });
  }

  res.json({ query });
};

const deleteQuery = async (req, res) => {
  const query = await SymptomQuery.findOne({ _id: req.params.id, user: req.user._id });

  if (!query){
    return res.status(404).json({ message: "Query not found" });
  }

  await query.deleteOne();
  res.json({ message: "Query deleted" });
};


module.exports = { analyze, getQueries, getQuery, deleteQuery };