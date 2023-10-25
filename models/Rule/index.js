const mongoose = require("mongoose");

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
  Countries: {
    type: Array,
    Name: String,
    Cities: [],
    Governments: [],
    Flag: String,
  },

  Home: {
    text: { type: String },
    images: [],
    Video: { type: String },
  },
});

exports.Rules = mongoose.model("Rules", ruleSchema);
