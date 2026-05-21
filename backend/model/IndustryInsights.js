const mongoose = require("mongoose");

const IndustryInsightsSchema = new mongoose.Schema({

  country: {
    type: String,
    required: true
  },

  data: {
    type: Object,
    required: true
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("IndustryInsights", IndustryInsightsSchema);