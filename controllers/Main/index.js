const expressAsyncHandler = require("express-async-handler");
const { User } = require("../../models/User");
const bcrypt = require("bcrypt");
const { CountriesCities } = require("../../models/CountriesAndCities");
const { Reports } = require("../../models/Reports");
const {Orders} = require('../../models/Order');
exports.AddUser = expressAsyncHandler(async (req, res) => {
  const { fullName, email, phone, password, permission, role } = req.body;
  try {
    await User.findOne({ email }).then(async (user) => {
      if (user)
        return res
          .status(409)
          .json({ success: false, message: "User already exists" });
      else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
          fullName,
          email,
          phone,
          password: hashedPassword,
          role,
          permission,
        }).then((newUser) => {
          delete newUser._doc.password;
          res
            .status(200)
            .json({ success: true, message: "User Created", newUser });
        });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetAllCountries = expressAsyncHandler(async (req, res) => {
  try {
    await CountriesCities.findOne({}).then((countries) => {
      res.status(200).json({ success: true, data: countries });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetAllReports = expressAsyncHandler(async (req, res) => {
  try {
    await Reports.find({}).then(reports => {
      res.status(200).json({ success: true, reports });
    });
  } catch (err) {}
});

exports.GetAllOrders = expressAsyncHandler(async (req, res) => {
  try {
    await Orders.find({}).then(orders => {
      res.status(200).json({ success: true, orders});
    })
  }
  catch (err) {
    res.status(500).json({success: false, message: err.message})
  }
})