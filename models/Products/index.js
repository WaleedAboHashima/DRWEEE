const moongoose = require("mongoose");

const productsSchema = new moongoose.Schema({
  Image: {
    type: String,
  },
  Name: {
    type: String,
    unique: true,
  },
  Points: {
    type: Number,
  },
  Description: {
    type: String,
  },
  Quantity: {
    type: Number,
    default: 1,
  },
  Price: {
    type: Number,
    default: 1,
  },
  Index: {
    type: Number,
  },
});

exports.Products = moongoose.model("Products", productsSchema);
