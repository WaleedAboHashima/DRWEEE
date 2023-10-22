const moongoose = require("mongoose");

const productsSchema = new moongoose.Schema({
  Image: {
    type: String,
    required: true,
  },
  Name: {
    type: String,
    required: true,
    unique: true,
  },
  Points: {
    type: Number,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Quantity: {
    type: Number,
    default: 1,
  },
  Price: {
    type: Number,
    required: true,
    default: 1,
  }
});

exports.Products = moongoose.model("Products", productsSchema);
