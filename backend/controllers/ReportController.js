const Report = require("../models/Report");
const { uploadBuffer, deleteFile, getThumbnailUrl, isWordMime } = require("../services/CloudinaryService");
const { analyzeReport } = require("../services/AIService");


const getFileType = (mimetype) => {
  if (mimetype === "application/pdf") return "pdf";
  if (isWordMime(mimetype)) return "word";
  return "image";
};


const analyze = async (req, res) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0))
      return res.status(400).json({ message: "No file uploaded" });

    const { analysisType = "full", outputLang = "en" } = req.body;

    if (!["full", "conclusion"].includes(analysisType))
      return res.status(400).json({ message: "analysisType must be 'full' or 'conclusion'" });
    if (!["en", "hi", "mr"].includes(outputLang))
      return res
               .status(400)
               .json({ message: "outputLang must be 'en', 'hi', or 'mr'" });

    const files = req.files?.length ? req.files : [req.file];

    if (files.length > 5)
      return res
               .status(400)
               .json({ message: "Maximum 5 files allowed per analysis" });

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileType = getFileType(file.mimetype);
        const resourceType = fileType === "word" ? "raw" : "image";
        const result = await uploadBuffer(file.buffer, "healthlense/reports", resourceType);
        return {
          fileUrl: result.secure_url,
          filePublicId: result.public_id,
          fileType,
          resourceType,
          pages: result.pages || 1,        
          thumbnailUrl: getThumbnailUrl(result.public_id, resourceType),
        };
      })
    );

    const fileUrls    = uploadedFiles.map((f) => f.fileUrl);
    const primaryFile = uploadedFiles[0];

    const analysisResult = await analyzeReport(
      fileUrls,
      primaryFile.fileType,
      analysisType,
      outputLang,
      primaryFile.filePublicId,
      primaryFile.pages          
    );

    const report = await Report.create({
      user: req.user._id,
      fileUrl: primaryFile.fileUrl,
      filePublicId: primaryFile.filePublicId,
      fileType: primaryFile.fileType,
      thumbnailUrl: primaryFile.thumbnailUrl,
      additionalFiles: uploadedFiles.slice(1).map((f) => ({
        fileUrl: f.fileUrl,
        filePublicId: f.filePublicId,
        fileType: f.fileType,
        thumbnailUrl: f.thumbnailUrl,
      })),
      analysisType,
      outputLang,
      analysisResult,
    });

    res
      .status(201)
      .json({ report });
  } catch (err) {
    console.error("[analyze] Error:", err);
    res
      .status(500)
      .json({ message: err.message || "Analysis failed" });
  }
};


const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-analysisResult");
    res.json({ reports });
  } catch (err) {
    console.error("[getReports] Error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch reports" });
  }
};


const getReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });

    if (!report){
      return res
               .status(404)
               .json({ message: "Report not found" });
    }

    res.json({ report });
  } catch (err) {
    console.error("[getReport] Error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch report" });
  }
};


const deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });

    if (!report){
      return res
               .status(404)
               .json({ message: "Report not found" });
    }

    const toResourceType = (ft) => ft === "word" ? "raw" : "image";

    await deleteFile(report.filePublicId, toResourceType(report.fileType));

    if (report.additionalFiles?.length) {
      await Promise.all(
        report.additionalFiles.map((f) =>
          deleteFile(f.filePublicId, toResourceType(f.fileType))
        )
      );
    }

    await report.deleteOne();
    res.json({ message: "Report deleted" });
  } catch (err) {
    console.error("[deleteReport] Error:", err);
    res
      .status(500)
      .json({ message: "Failed to delete report" });
  }
};


module.exports = { analyze, getReports, getReport, deleteReport};