const mongoose = require("mongoose");

const AnalysisEntrySchema = new mongoose.Schema({
  analysisType: { 
    type: String, 
    enum: ["full", "conclusion"], 
    required: true 
  },
  outputLang: { 
    type: String, 
    enum: ["en", "hi", "mr"],     
    required: true 
  },
  analysisResult: { 
    type: String, 
    required: true 
  },
  analyzedAt:{ 
    type: Date, 
    default: Date.now 
  },
});

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileUrl: { 
      type: String, 
      required: true 
    },
    filePublicId: { 
      type: String 
    },
    fileType: { 
      type: String, 
      enum: ["pdf", "image", "word"], 
      required: true 
    },
    thumbnailUrl: { 
      type: String 
    },
    fileDate: {
      type: String, 
      required: true 
    }, 
    additionalFiles: [
      {
        fileUrl:      String,
        filePublicId: String,
        fileType:     String,
        thumbnailUrl: String,
      },
    ],
    analyses: [AnalysisEntrySchema], 
  },
  { timestamps: true }
);

ReportSchema.index({ 
  user: 1, 
  filePublicId: 1, 
  fileDate: 1 
}, { 
  unique: true 
});

module.exports = mongoose.model("Report", ReportSchema);