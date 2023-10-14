const { User } = require("../../models/User");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

exports.ChangePassword = expressAsyncHandler(async (req, res) => {
  const { id } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    const foundUser = await User.findById(id);
    if (!foundUser)
      return res
        .status(200)
        .json({ success: false, message: "No user with this id." });
    else {
      const compare = await bcrypt.compare(oldPassword, foundUser.password);
      if (!compare)
        return res
          .status(200)
          .json({ success: false, message: "Password mismatch." });
      else {
        const replacePassword = await bcrypt.hash(newPassword, 10);
        foundUser.password = replacePassword;
        await foundUser.save();
        res
          .status(200)
          .json({ success: true, message: "Password Changed Successfully" });
      }
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetProfile = expressAsyncHandler(async (req, res) => {
  const { id } = req.user;
  try {
    await User.findById(id).then((user) => {
      if (!user)
        return res
          .status(200)
          .json({ success: false, message: "User not found" });
      else {
        delete user._doc.password && delete user._doc.__v;
        res
          .status(200)
          .json({
            success: true,
            message: "User Retrieved Successfully",
            user,
          });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
