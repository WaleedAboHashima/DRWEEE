const moongoose = require("mongoose");

const categorySchema = new moongoose.Schema({
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
  Products: [
    {
      type: moongoose.Schema.Types.ObjectId,
      ref: "Products",
    },
  ],
});

exports.Categories = moongoose.model("Categories", categorySchema);
