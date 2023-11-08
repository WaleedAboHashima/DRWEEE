const moongoose = require("mongoose");

const requestSchema = new moongoose.Schema({
  User: {
    type: moongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  Image: {
    type: String,
    default: `https://cdn.vectorstock.com/i/preview-1x/79/10/product-icon-simple-element-vector-27077910.jpg`
  },
  Name: {
    type: String,
    required: true,
  },
  Location: {
    type: Object,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Quantity: {
    type: Number,
    required: true,
  },
});

exports.Requests = moongoose.model("Requests", requestSchema);
