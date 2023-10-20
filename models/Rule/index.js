const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "country"],
    required: true,
  },
  Video: {
    title: String,
    description: String,
    videoData: Buffer,
    mimeType: String,
  },
  Countries: [
    {
      Name: String,
      Cities: [],
      Flag: String,
    },
  ],
});

exports.Rules = mongoose.model("Rules", ruleSchema);
