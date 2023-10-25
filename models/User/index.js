const mongoose = require("mongoose");

const userScehma = new mongoose.Schema({
  fullName: {
    type: "String",
    required: true,
    min: 3,
  },
  password: {
    type: "String",
    required: true,
  },
  email: {
    type: "String",
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["Merchant", "User", "Admin", "SuperAdmin"],
    default: "User",
  },
  phone: {
    type: "Number",
    required: true,
    unique: true,
  },
  permission: {
    type: String,
    enum: ["Admin", "SuperVisor", "CityAdmin"]
  }
});

exports.User = mongoose.model("Users", userScehma);
