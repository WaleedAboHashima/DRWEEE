const { User } = require("../../models/User");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { Reports } = require("../../models/Reports/index");
const { Rules } = require("../../models/Rule/index");
const { Product } = require("../../models/Product");
const { Categories } = require("../../models/Category");
require('dotenv').config();
const cloudinary = require("cloudinary").v2;


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

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
        res.status(200).json({
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

exports.GetCountriesAndCities = expressAsyncHandler(async (req, res) => {
  try {
  } catch (err) {}
});

exports.GetRules = expressAsyncHandler(async (req, res) => {
  try {
    await Rules.find({}).then((rules) => {
      delete rules[0]._doc.Video.videoData;
      res
        .status(200)
        .json({ success: true, message: "Rules retrieved", rules });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetVideo = expressAsyncHandler(async (req, res) => {
  try {
    await Rules.findById("653087ba5121edfdc7565fa8").then((rule) => {
      res.set("Content-Type", rule.Video.mimeType);
      const video = rule.Video.videoData;
      res.status(200).json({ success: true, message: "Data Retrieved", video });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.UpdateProfile = expressAsyncHandler(async (req, res) => {
  const id = req.user.id;
  const { name, phone, email } = req.body;
  try {
    await User.findByIdAndUpdate(id, { fullName: name, phone, email }).then(
      (user) => {
        res.json({ success: true, message: "Profile updated!" }, 200);
      }
    );
  } catch (err) {
    res.json({ success: false, message: err }, 500);
  }
});

exports.SubmitReports = expressAsyncHandler(async (req, res) => {
  const { email, phone, message } = req.body;
  try {
    await Reports.create({ email, phone, message }).then((report) =>
      res.json({ success: true, message: "Report Added", report }, 200)
    );
  } catch (err) {
    res.json({ success: false, message: err.message }, 500);
  }
});

exports.GetCategories = expressAsyncHandler(async (req, res) => {
  try {
    await Categories.find({}).then((categories) => {
      res.json(
        { success: true, message: "Categoes Retrieved", categories },
        200
      );
    });
  } catch (err) {
    res.json({ status: false, message: err.message }, 500);
  }
});

exports.GetProductsInCategory = expressAsyncHandler(async (req, res) => {
  const { catId } = req.params;
  try {
    const selectedCategory = await Categories.findById(catId).populate(
      "Products"
    );

    const Products = await Promise.all(
      selectedCategory.Products.map(async (productId) => {
        const product = await Product.findById(productId).populate({
          path: "User",
          select: "-password -role -__v",
        });
        return product;
      })
    );

    res.json({ Products }, 200);
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

exports.AddProductToCategory = expressAsyncHandler(async (req, res) => {
  const id = req.user.id;
  const { catId } = req.params;
  const { name, description, points } = req.body;
  const {image} = req.files;
  try {
    const auther = await User.findById(id);
    const selectedCategory = await Categories.findById(catId).populate(
      "Products"
    );
    if (!selectedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    } else {
      const imageUpload = (await cloudinary.uploader.upload(image[0].path))
        .secure_url;
      delete auther._doc.password;
      await Product.create({
        Image: imageUpload,
        User: auther,
        Name: name,
        Description: description,
        Points: points,
      }).then(async (prd) => {
        selectedCategory.Products.push(prd._id);
        await selectedCategory.save();
        res.json({ success: true, message: "Product Added", prd });
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
});
