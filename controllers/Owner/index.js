const { User } = require("../../models/User");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { Rules } = require("../../models/Rule/index");
const { Orders } = require("../../models/Order");
const { Products } = require("../../models/Products");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// exports.AddVideo = expressAsyncHandler(async (req, res) => {
//   const video = req.file;
//   try {
//     if (!video)
//       return res
//         .status(403)
//         .json({ success: false, message: "Please provide a video" });
//     else {
//       const newVideo = new Rules({
//         type: "video",
//         Video: {
//           title: video.title,
//           description: video.description,
//           videoData: video.buffer,
//           mimeType: video.mimetype,
//         },
//       });
//       await newVideo.save();
//       res.status(200).json({ success: true, message: "Video uploaded " });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

exports.AddVideo = expressAsyncHandler(async (req, res) => {
  const { url } = req.body;
  try {
    const rule = await Rules.findOne({ type: "home" });
    if (!rule) {
      const newHome = new Rules({
        type: "home",
        Home: {
          Video: url,
        },
      });
      await newHome.save();
      res.status(201).json({
        success: true,
        message: "Video added successfully",
        data: newHome.Home.Video,
      });
    } else {
      rule.Home.Video = url;
      await rule.save();
      res.status(201).json({
        success: true,
        message: "Video Updated successfully",
        video: rule.Home.Video,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.AddCountriesandCities = expressAsyncHandler(async (req, res) => {
  const { country, city, government } = req.body;
  try {
    const rule = await Rules.findOne({ type: "countries" });
    if (!rule) {
      const newCountry = new Rules({
        type: "countries",
        Countries: [
          {
            Name: country,
            Cities: [city],
            Governments: [government],
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
        const existingGovernments = existingCountry.Governments.find(
          (govRule) => govRule === government
        );
        if (existingGovernments) {
          return res
            .status(409)
            .json({ success: false, message: "Government Already Exists" });
        } else if (existingCity)
          return res
            .status(409)
            .json({ success: false, message: "City Already Exists" });
        else {
          existingCountry.Cities.push(city);
          existingCountry.Governments.push(government);
          await rule.save();
          res
            .status(200)
            .json({ success: true, message: "City & Government Added", rule });
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
      Description: description,
    }).then(() => {
      res.status(201).json({ success: true, message: "Product Added" });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.AddInfo = expressAsyncHandler(async (req, res) => {
  const { text } = req.body;
  const { images } = req.files;
  try {
    const uploadedImages = await Promise.all(
      images.map(
        async (image) =>
          (
            await cloudinary.uploader.upload(image.path)
          ).secure_url
      )
    );
    const rule = await Rules.findOne({ type: "home" });
    if (rule) {
      rule.Home.text = text;
      rule.Home.images = uploadedImages;
      await rule.save();
      res.status(200).json({
        success: true,
        message: "Information updated",
        data: rule.Home,
      });
    } else {
      await Rules.create({
        type: "home",
        Home: {
          text,
          images: uploadedImages,
        },
      }).then((rule) =>
        res.status(200).json({ success: true, message: "Rule Created", rule })
      );
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetAllProducts = expressAsyncHandler(async (req, res) => {
  try {
    await Products.find({}).then((products) => {
      res.status(200).json({ success: true, products });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetAllOrders = expressAsyncHandler(async (req, res) => {
  try {
    await Orders.find({}).then((orders) => {
      res.status(200).json({ success: true, orders });
    });
  } catch (err) {}
});
