const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  OrderNo: {
    type: Number,
    default:
      Math.floor(Math.random() * (999999999999 - 100000000000 + 1)) +
      100000000000,
  },
  TotalPoints: {},
  TotalPrice: {},
  Status: {
    type: String,
    enum: ["Pending", "Delivered", "On the way"],
  },
  Products: [],
});

exports.Orders = mongoose.model("Orders", orderSchema);
