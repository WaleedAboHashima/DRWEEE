const { User } = require("../../models/User");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { Rules } = require("../../models/Rule/index");
const { Products } = require("../../models/Products");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.AddVideo = expressAsyncHandler(async (req, res) => {
  const video = req.file;
  try {
    if (!video)
      return res
        .status(403)
        .json({ success: false, message: "Please provide a video" });
    else {
      const newVideo = new Rules({
        type: "video",
        Video: {
          title: video.title,
          description: video.description,
          videoData: video.buffer,
          mimeType: video.mimetype,
        },
      });
      await newVideo.save();
      res.status(200).json({ success: true, message: "Video uploaded " });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.AddCountriesandCities = expressAsyncHandler(async (req, res) => {
  const { country, city } = req.body;
  try {
    const rule = await Rules.findOne({ type: "country" });
    if (!rule) {
      const newCountry = new Rules({
        type: "country",
        Countries: [
          {
            Name: country,
            Cities: [city],
          },
        ],
      });
      await newCountry.save();
      res
        .status(200)
        .json({ success: true, message: "Country Added", Results: newCountry });
    } else {
      const existingCountry = rule.Countries.find(
        (countryRule) => countryRule.Name === country
      );
      if (existingCountry) {
        const existingCity = existingCountry.Cities.find(
          (cityRule) => cityRule === city
        );
        if (existingCity)
          return res
            .status(409)
            .json({ success: false, message: "City Already Exists" });
        else {
          existingCountry.Cities.push(city);
          res.status(200).json({ success: true, message: "City Added", rule });
        }
      } else {
        rule.Countries.push({ Name: country, Cities: [city] });
        await rule.save();
        res
          .status(200)
          .json({ success: true, message: "Country Added Successfully", rule });
      }
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetAllUsers = expressAsyncHandler(async (req, res) => {
  try {
    await User.find({}).then((users) => {
      const allUsers = users.map((user) => delete user._doc.password && user);
      res.json(
        { success: true, message: "Users Retrieved Successfully", allUsers },
        200
      );
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.AddProduct = expressAsyncHandler(async (req, res) => {
  const { name, points, description, price } = req.body;
  const { image } = req.files;
  try {
    const imageUpload = (await cloudinary.uploader.upload(image[0].path))
      .secure_url;
    await Products.create({
      Image: imageUpload,
      Name: name,
      Points: points,
      Price: price,
      Description: description
    }).then(() => {
      res.status(201).json({ success: true, message: "Product Added" });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
