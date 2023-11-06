const moongoose = require("mongoose");

const requestSchema = new moongoose.Schema({
  Image: {
    type: String,
    required: true,
  },
  Name: {
    type: String,
    required: true,
    unique: true,
  },
  Description: {
    type: String,
    required: true,
  },
});

exports.Requests = moongoose.model("Requests", requestSchema);
