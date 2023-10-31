const mongoose = require("mongoose");
const { User } = require("../User");

const orderSchema = new mongoose.Schema({
  OrderNo: {
    type: Number,
    default:
      Math.floor(Math.random() * (999999999999 - 100000000000 + 1)) +
      100000000000,
  },
  Info: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  User: {
    type: Object,
  },
  TotalPoints: { type: Number },
  TotalPrice: { type: Number },
  Status: {
    type: String,
    enum: ["Pending", "Delivered", "On the way", "Canceled"],
    default: "Pending",
  },
  Products: [],
  Archived: {
    type: Boolean,
    default: false,
  },
});

exports.Orders = mongoose.model("Orders", orderSchema);
