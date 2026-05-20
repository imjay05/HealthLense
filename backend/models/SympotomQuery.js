const mongoose = require("mongoose");

const symptomQuerySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    inputText: { 
      type: String, 
      required: true 
    },
    detectedLang: { 
      type: String, 
      enum: ["en", "hi", "mr", "hinglish"], 
      default: "en" 
    },
    selectedChips: [{ 
      type: String 
    }],
    suggestions: [
      {
        testName: { 
          type: String, 
          required: true 
        },
        reason: { 
          type: String 
        },
      },
    ],
    nearbyLabs: [
      {
        name: { 
          type: String 
        },
        lat: { 
          type: Number 
        },
        lon: { 
          type: Number 
        },
        address: { 
          type: String 
        },
        distance: { 
          type: Number 
        },
        type: { 
          type: String 
        },
        phone:{ 
          type: String, 
          default: null 
        },
      },
    ],
    userLat: { 
      type: Number, 
      default: null 
    },
    userLon: { 
      type: Number, 
      default: null 
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("SymptomQuery", symptomQuerySchema);