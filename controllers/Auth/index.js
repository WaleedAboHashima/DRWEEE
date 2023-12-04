const bcrypt = require("bcrypt");
const { User } = require("./../../models/User");
const expressAsyncHandler = require("express-async-handler");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const { SendOTP, VerifyOTP } = require("../../config/OTP");
const jwt = require("jsonwebtoken");
const { Rules } = require("./../../models/Rule");
const googleRegex = /^ya29\.[A-Za-z\d_-]+$/;
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
  const { fullName, email, password, phone, type } = req.body;
  if (!email || !fullName || !password)
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
          password: newPassword,
          phone: phone && phone,
          role: type === "merchant" ? "Merchant" : "User",
        }).then((user) =>
          res
            .status(201)
            .json({ success: true, message: "User created successfully", user })
        );
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
        res.status(200).json({
          success: true,
          message: "Countries retreived successfully",
          countries: rule.Countries,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Countries retreived successfully",
          countries: [],
        });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetCitiesOrGove = expressAsyncHandler(async (req, res) => {
  const { type, country, city } = req.params;
  const rule = await Rules.findOne({ type: "countries" });
  const selectedCountry = rule.Countries.find((c) => c.Name === country);
  try {
    if (selectedCountry) {
      if (type === "cities") {
        const foundCities = selectedCountry.Cities.map(
          ({ Governments, ...rest }) => rest
        );
        res.status(200).json({
          success: true,
          message: "Cities Retrieved Successfully",
          cities: foundCities,
        });
      } else if (type === "governments") {
        const foundCity = await selectedCountry.Cities.find(
          (c) => c.Name === city
        );
        if (foundCity) {
          res.status(200).json({
            success: true,
            message: "Gove Retreived Successfully",
            governments: foundCity.Governments,
          });
        } else {
          res
            .status(200)
            .json({ success: true, message: "City not found", cities: [] });
        }
      } else {
        res.status(200).json({ success: true, message: "invalid type" });
      }
    } else {
      res.status(200).json({
        success: true,
        message: "No country with this name found",
        cities: [],
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.CompleteProfile = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { country, city, government } = req.body;
  if (!country || !city | !government)
    return res
      .status(200)
      .json({ success: false, message: "All Fields Are Required" });
  try {
    await User.findById(id).then(async (user) => {
      user.Country = country;
      user.City = city;
      user.Government = government;
      user.complete = true;
      await user.save();
      res.status(200).json({ success: true, message: "Profile Completed" });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GoogleLogin = expressAsyncHandler(async (req, res) => {
  try {
    const { email, fullName, accessToken, image } = req.body;
    if (!email || !fullName || !accessToken)
      return res
        .status(200)
        .json({ success: false, message: "All fields are required" });
    const client = await User.findOne({ email });
    if (client && googleRegex.test(accessToken)) {
      const token = jwt.sign(
        { id: client.id, role: client.role, email: client.email },
        process.env.TOKEN,
        { expiresIn: "30d" }
      );
      res
        .status(200)
        .json({ success: true, message: "LoginSuccess", user: client, token });
    } else if (!client && googleRegex.test(accessToken)) {
      const password = await bcrypt.hash(Math.floor((Math.random() * (999999 - 100000 + 1)) + 100000).toString(), 10)
      const newClient = await User.create({
        Image: image,
        fullName,
        email,
        password: 0o0000000000,
        password,
      });
      const token = jwt.sign(
        { id: newClient.id, role: newClient.role, email: newClient.email },
        process.env.TOKEN,
        { expiresIn: "30d" }
      );
      res
        .status(200)
        .json({ success: true, message: "LoginSuccess", user: newClient, token });
    } else {
      res.status(200).json({ success: false, message: "Invalid access token" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
