const Report = require("../models/Report");
const { uploadBuffer, deleteFile, getThumbnailUrl, isWordMime } = require("../services/CloudinaryService");
const { analyzeReport } = require("../services/AIService");

const getFileType = (mimetype) => {
  if (mimetype === "application/pdf"){
    return "pdf";
  }
  if (isWordMime(mimetype)){           
    return "word";
  }

  return "image";
};


// IST date string "YYYY-MM-DD" for deduplication key
const getISTDateString = () => {
  return new Date()
    .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // "YYYY-MM-DD"
};

const analyze = async (req, res) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)){
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { analysisType = "full", outputLang = "en" } = req.body;

    if (!["full", "conclusion"].includes(analysisType)){
      return res.status(400).json({ message: "analysisType must be 'full' or 'conclusion'" });
    }

    if (!["en", "hi", "mr"].includes(outputLang)){
      return res.status(400).json({ message: "outputLang must be 'en', 'hi', or 'mr'" });
    }

    const files = req.files?.length ? req.files : [req.file];
    if (files.length > 5)
      return res.status(400).json({ message: "Maximum 5 files allowed per analysis" });

    //Upload all files to Cloudinary
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileType     = getFileType(file.mimetype);
        const resourceType = fileType === "word" ? "raw" : "image";
        const result       = await uploadBuffer(file.buffer, "healthlense/reports", resourceType);
        return {
          fileUrl:      result.secure_url,
          filePublicId: result.public_id,
          fileType,
          resourceType,
          pages:        result.pages || 1,
          thumbnailUrl: getThumbnailUrl(result.public_id, resourceType),
        };
      })
    );

    const primaryFile = uploadedFiles[0];
    const fileUrls    = uploadedFiles.map((f) => f.fileUrl);
    const todayIST    = getISTDateString();

    //Check if this file was already analyzed today
    const existing = await Report.findOne({
      user:         req.user._id,
      filePublicId: primaryFile.filePublicId,
      fileDate:     todayIST,
    });

    const analysisResult = await analyzeReport(
      fileUrls,
      primaryFile.fileType,
      analysisType,
      outputLang,
      primaryFile.filePublicId,
      primaryFile.pages
    );

    const newEntry = { analysisType, outputLang, analysisResult, analyzedAt: new Date() };

    let report;

    if (existing) {
      // Same file, same day — just push new analysis entry, don't duplicate the doc
      existing.analyses.push(newEntry);
      report = await existing.save();
    } else {
      // New file or new day — create fresh document
      report = await Report.create({
        user:         req.user._id,
        fileUrl:      primaryFile.fileUrl,
        filePublicId: primaryFile.filePublicId,
        fileType:     primaryFile.fileType,
        thumbnailUrl: primaryFile.thumbnailUrl,
        fileDate:     todayIST,
        additionalFiles: uploadedFiles.slice(1).map((f) => ({
          fileUrl:      f.fileUrl,
          filePublicId: f.filePublicId,
          fileType:     f.fileType,
          thumbnailUrl: f.thumbnailUrl,
        })),
        analyses: [newEntry],
      });
    }

    res.status(201).json({ report });
  } catch (err) {
    console.error("[analyze] Error:", err);
    res.status(500).json({ message: err.message || "Analysis failed" });
  }
};


const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 }).select("-analyses"); 
    res.json({ reports });
  } catch (err) {
    console.error("[getReports] Error:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};


const getReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report){
      return res.status(404).json({ message: "Report not found" });
    }
    res.json({ report });
  } catch (err) {
    console.error("[getReport] Error:", err);
    res.status(500).json({ message: "Failed to fetch report" });
  }
};


const deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report){ 
      return res.status(404).json({ message: "Report not found" });
    }

    const toResourceType = (ft) => ft === "word" ? "raw" : "image";

    await deleteFile(report.filePublicId, toResourceType(report.fileType));

    if (report.additionalFiles?.length) {
      await Promise.all(
        report.additionalFiles.map((f) => deleteFile(f.filePublicId, toResourceType(f.fileType)))
      );
    }

    await report.deleteOne();
    res.json({ message: "Report deleted" });
  } catch (err) {
    console.error("[deleteReport] Error:", err);
    res.status(500).json({ message: "Failed to delete report" });
  }
};


// Delete a single analysis entry inside a report
const deleteAnalysisEntry = async (req, res) => {
  try {
    const { id, entryId } = req.params;
    const report = await Report.findOne({ _id: id, user: req.user._id });
    if (!report){
      return res.status(404).json({ message: "Report not found" });
    }

    const before = report.analyses.length;
    report.analyses = report.analyses.filter((a) => a._id.toString() !== entryId);

    if (report.analyses.length === before){
      return res.status(404).json({ message: "Analysis entry not found" });
    }

    // If no analyses left, delete the whole report doc + Cloudinary files
    if (report.analyses.length === 0) {
      const toResourceType = (ft) => ft === "word" ? "raw" : "image";
      await deleteFile(report.filePublicId, toResourceType(report.fileType));
      if (report.additionalFiles?.length) {
        await Promise.all(
          report.additionalFiles.map((f) => deleteFile(f.filePublicId, toResourceType(f.fileType)))
        );
      }
      await report.deleteOne();
      return res.json({ message: "Report deleted (no analyses remaining)" });
    }

    await report.save();
    res.json({ report });
  } catch (err) {
    console.error("[deleteAnalysisEntry] Error:", err);
    res.status(500).json({ message: "Failed to delete analysis entry" });
  }
};


module.exports = { analyze, getReports, getReport, deleteReport, deleteAnalysisEntry };