const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
  Name: String,
  Cities: { type: [String], default: [] },
  Governments: { type: [String], default: [] },
});

const ruleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "countries", "home"],
    required: true,
  },
  // Video: {
  //   title: String,
  //   description: String,
  //   videoData: Buffer,
  //   mimeType: String,
  // },
  Countries: [countrySchema],

  Home: {
    text: { type: String },
    images: [],
    video: { type: String },
  },
});

exports.Rules = mongoose.model("Rules", ruleSchema);
