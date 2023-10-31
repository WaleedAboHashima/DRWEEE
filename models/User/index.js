const mongoose = require("mongoose");

const userScehma = new mongoose.Schema({
  fullName: {
    type: "String",
    required: true,
    min: 3,
  },
  Admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  Country: {
    type: String,
  },
  City: {
    type: String,
  },
  Government: {
    type: String,
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
    enum: ["Merchant", "User", "Admin", "SuperVisor", "CityAdmin"],
    default: "User",
  },
  phone: {
    type: "Number",
    required: true,
    unique: true,
  },
  permission: {
    type: String,
    enum: ['AddAdmins', 'AddSuperVisors', 'AddCityAdmin', '']
  },
});

exports.User = mongoose.model("Users", userScehma);
