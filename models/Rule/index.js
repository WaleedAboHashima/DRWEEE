const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
  Name: String,
  Cities: {
    type: Array,
    Name: String,
    Governments: { type: [String], default: [] },
  },
});

const ruleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "countries", "home", "ad"],
  },
  // Video: {
  //   title: String,
  //   description: String,
  //   videoData: Buffer,
  //   mimeType: String,
  // },
  Countries: [countrySchema],
  Ad: {
    text: { type: String },
    image: [],
    video: { type: String },
  },
  Home: {
    text: { type: String },
    images: [],
    video: { type: String },
  },
});

exports.Rules = mongoose.model("Rules", ruleSchema);
