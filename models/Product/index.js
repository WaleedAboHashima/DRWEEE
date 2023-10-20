const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  Image: {
    type: String,
  },
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  Name: {
    type: String,
    required: true,
  },
  Points: {
    type: Number,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
});

exports.Product = mongoose.model("Products", productSchema);
