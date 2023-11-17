const bcrypt = require("bcrypt");
const { User } = require("./../../models/User");
const expressAsyncHandler = require("express-async-handler");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const { SendOTP, VerifyOTP } = require("../../config/OTP");
const jwt = require("jsonwebtoken");
const { Rules } = require("./../../models/Rule");

exports.Login = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    await User.findOne({ email }).then(async (user) => {
      if (!user)
        return res
          .status(200)
          .json({ success: false, message: "User not found" });
      else {
        const verifyPassword = await bcrypt.compare(password, user.password);
        if (!verifyPassword)
          return res
            .status(200)
            .json({ success: false, message: "Incorrect password" });
        else {
          delete user._doc.password && delete user._doc.__v;
          const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.TOKEN,
            { expiresIn: "30d" }
          );
          res.status(200).json({
            success: true,
            message: "Logged in Successfully.",
            user: user.toObject(),
            token,
          });
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
});

exports.Register = expressAsyncHandler(async (req, res) => {
  const { fullName, email, password, phone, type, country, city, government } =
    req.body;
  if (!email || !fullName || !password || !phone)
    return res
      .status(200)
      .json({ success: false, message: "All Fields Are Required" });
  else {
    try {
      const duplicate = await User.findOne({ $or: [{ email }, { phone }] });
      if (duplicate)
        return res.status(200).json({
          success: false,
          message: "User with this info already exists",
        });
      else {
        const newPassword = await bcrypt.hash(password, 10);
        await User.create({
          fullName,
          email,
          Country: country && country,
          Government: government && government,
          City: city && city,
          password: newPassword,
          phone,
          role: type === "merchant" ? "Merchant" : "User",
        }).then(async (user) => {
          if (user.City && user.Country && user.Government) {
            user.complete = true;
            await user.save();
            res.status(201).json({
              success: true,
              message: "User created successfully",
              user,
            });
          } else {
            res.status(201).json({
              success: true,
              message: "User created successfully",
              user,
            });
          }
        });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err });
    }
  }
});

exports.ForgetPassword = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    if (!emailRegex.test(email)) {
      res.status(200).json({ success: false, message: "Invalid email" });
    } else {
      const findOne = await User.findOne({ email });
      if (!findOne) {
        res.status(200).json({ success: false, message: "Email not found" });
      } else {
        const OTP = await SendOTP(email);
        if (!OTP) {
          res
            .status(200)
            .json({ success: false, message: "Failed to send the OTP" });
        } else {
          res
            .status(200)
            .json({ success: true, message: "Email Sent Successfully" });
        }
      }
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.OTPCheck = expressAsyncHandler(async (req, res) => {
  const { OTP, email } = req.body;
  if (!email || !OTP)
    res
      .status(200)
      .json({ success: false, message: "All Fields Are Required" });
  else {
    try {
      const validate = await VerifyOTP(OTP, email);
      const user = await User.findOne({ email });
      if (!user) {
        res
          .status(200)
          .json({ success: false, message: "Can't Find Your Email." });
      } else {
        if (!validate) {
          res.status(200).json({ success: false, message: "Invalid Otp" });
        } else {
          res
            .status(200)
            .json({ success: true, message: "Correct OTP", id: user.id });
        }
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

exports.UpdatePassword = expressAsyncHandler(async (req, res) => {
  const { id, newPassword } = req.body;
  if (!id || !newPassword)
    res
      .status(200)
      .json({ success: false, message: "All Fields Are Required." });
  else {
    try {
      const password = await bcrypt.hash(newPassword, 10);
      const user = await User.findByIdAndUpdate(id, { password }).exec();
      if (!user) {
        res.status(200).json({ success: false, message: "User Not Found" });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Password Successfully Updated." });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err });
    }
  }
});

exports.GetCountries = expressAsyncHandler(async (req, res) => {
  try {
    await Rules.findOne({ type: "countries" }).then((rule) => {
      if (rule) {
        rule.Countries.map(
          (country) =>
            delete country._doc.Cities && delete country._doc.Governments
        );
        res.status(200).json({ success: true, countries: rule.Countries });
      } else {
        res.status(200).json({ success: true, countries: [] });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetCitiesOrGove = expressAsyncHandler(async (req, res) => {
  const { type, country } = req.params;
  const rule = await Rules.findOne({ type: "countries" });
  const selectedCountry = rule.Countries.find((c) => c.Name === country);
  try {
    if (selectedCountry) {
      if (type === "cities") {
        res.status(200).json({
          success: true,
          message: "Cities Retreived Successfully",
          cities: selectedCountry.Cities,
        });
      } else if (type === "governments") {
        res.status(200).json({
          success: true,
          message: "Gove Retreived Successfully",
          governments: selectedCountry.Governments,
        });
      } else {
        res.status(200).json({ success: false, message: "invalid type" });
      }
    } else {
      res
        .status(200)
        .json({ success: false, message: "No country with this name found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
