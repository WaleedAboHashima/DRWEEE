const bcrypt = require("bcrypt");
const { User } = require("./../../models/User");
const expressAsyncHandler = require("express-async-handler");

exports.Login = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    await User.findOne({ email }).then(async (user) => {
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      else {
        const verifyPassword = await bcrypt.compare(password, user.password);
        if (!verifyPassword)
          return res
            .status(403)
            .json({ success: false, message: "Incorrect password" });
        else {
          delete user._doc.password && delete user._doc.__V;
          res.status(200).json({ success: true, user });
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
});

exports.Register = expressAsyncHandler(async (req, res) => {
  const { fullName, email, password, phone, type } = req.body;
  if (!email || !fullName || !password || !phone)
    return res
      .status(403)
      .json({ success: false, message: "All Fields Are Required" });
  else {
    try {
      const duplicate = await User.findOne({ $or: [{ email }, { phone }] });
      if (duplicate)
        return res.status(409).json({
          success: false,
          message: "User with this info already exists",
        });
      else {
        const newPassword = await bcrypt.hash(password, 10);
        await User.create({
          fullName,
          email,
          password: newPassword,
          phone,
          role: type === "merchant" ? "Merchant" : "User",
        }).then((user) => res.status(201).json({ success: true, user }));
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err });
    }
  }
});
