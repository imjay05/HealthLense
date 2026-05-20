const mongoose = require("mongoose");

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
    analysisType: { 
      type: String, 
      enum: ["full", "conclusion"], 
      required: true 
    },
    outputLang: { 
      type: String, 
      enum: ["en", "hi", "mr"], 
      default: "en" 
    },
    analysisResult: { 
      type: String 
    },
    reportDate: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Report", reportSchema);