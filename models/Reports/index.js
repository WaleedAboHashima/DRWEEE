const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

exports.Reports = mongoose.model("Reports", reportSchema);
