const { User } = require("../../models/User");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { Rules } = require("../../models/Rule/index");
const { Orders } = require("../../models/Order");
const { Products } = require("../../models/Products");
const { Requests } = require("../../models/Requests");
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

exports.AddCountriesandCities = expressAsyncHandler(async (req, res) => {
  const { country, city, government } = req.body;
  try {
    let rule = await Rules.findOne({ type: "countries" });
    if (!rule) {
      const newCountry = new Rules({
        type: "countries",
        Countries: [
          {
            Name: country,
            Cities: city ? [city] : [],
            Governments: government ? [government] : [],
          },
        ],
      });
      rule = await newCountry.save();
      res
        .status(200)
        .json({ success: true, message: "Country Added", Results: rule });
    } else {
      const existingCountry = rule.Countries.find(
        (countryRule) => countryRule.Name === country
      );
      if (existingCountry) {
        const existingCityIndex = existingCountry.Cities.findIndex(
          (cityRule) => cityRule === city
        );
        const existingGovernmentIndex = existingCountry.Governments.findIndex(
          (govRule) => govRule === government
        );

        if (existingGovernmentIndex !== -1) {
          return res
            .status(409)
            .json({ success: false, message: "Government Already Exists" });
        } else if (existingCityIndex !== -1) {
          return res
            .status(409)
            .json({ success: false, message: "City Already Exists" });
        } else {
          city && existingCountry.Cities.push(city);
          government && existingCountry.Governments.push(government);
          await rule.save(); // Save the changes to the database
          res
            .status(200)
            .json({ success: true, message: "City & Government Added", rule });
        }
      } else {
        rule.Countries.push({
          Name: country,
          Cities: [city],
          Governments: [government],
        });
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
  const { text, video } = req.body;
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
      rule.Home.video = video;
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
          video,
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
    await Orders.find({})
      .populate("Info")
      .then((orders) => {
        res.status(200).json({ success: true, orders });
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.DeleteUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id).then(
      res
        .status(200)
        .json({ success: true, message: "User deleted successfully" })
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetRequests = expressAsyncHandler(async (req, res) => {
  try {
    await Requests.find({})
      .populate("User")
      .then((requests) => res.status(200).json({ success: true, requests }));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.ConfirmRequest = expressAsyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { price, points } = req.body;
  try {
    const request = await Requests.findById(requestId).populate("User");
    if (!request)
      return res
        .status(200)
        .json({ success: false, message: "Request not found" });
    else {
      const newOrder = await Orders.create({
        Info: request.User._id.toString(),
        User: {
          Name: request.User.fullName,
          Phone: request.User.phone,
          Location: request.Location,
        },
        Products: [
          {
            Image: request.Image,
            Name: request.Name,
            Description: request.Description,
            Price: price,
            Points: points,
          },
        ],
        TotalPoints: points,
        TotalPrice: price,
      });
      await Requests.findByIdAndRemove(requestId);
      res.status(200).json({
        success: true,
        message: "Order created successfully",
        order: newOrder,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.RemoveRequest = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await Requests.findByIdAndDelete(id).then(
      res.status(200).json({ success: true, message: "Request Deleted" })
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.Addcitytocountry = expressAsyncHandler(async (req, res) => {
  const { country } = req.params;
  const { city, gove } = req.body;

  // Find the rule for countries
  let rules = await Rules.findOne({ type: "countries" });

  if (!rules) {
    // If there are no rules for countries, create a new one
    let newRules = await Rules.create({ type: "countries", Countries: [] });
    rules = newRules;
  }

  // Check if the country already exists in the rules
  const countryIndex = rules.Countries.findIndex((c) => c.Name === country);

  if (countryIndex === -1) {
    // If the country doesn't exist, add it with the new city and gove
    await Rules.updateOne(
      { type: "countries" },
      {
        $push: {
          Countries: {
            Name: country,
            Cities: [{ Name: city, Governments: [gove] }],
          },
        },
      }
    );
  } else {
    // If the country exists, find the city index
    const cityIndex = rules.Countries[countryIndex].Cities.findIndex(
      (c) => c.Name === city
    );

    if (cityIndex === -1) {
      // If the city doesn't exist, add it with the new gove
      await Rules.updateOne(
        { type: "countries", "Countries.Name": country },
        {
          $push: {
            "Countries.$.Cities": {
              Name: city,
              Governments: [gove],
            },
          },
        }
      );
    } else {
      // If the city exists, check if the government already exists
      const governmentExists =
        rules.Countries[countryIndex].Cities[cityIndex].Governments.includes(
          gove
        );

      if (!governmentExists) {
        // If the government doesn't exist, append it to the array
        await Rules.updateOne(
          {
            type: "countries",
            "Countries.Name": country,
            "Countries.Cities.Name": city,
          },
          {
            $push: {
              "Countries.$[country].Cities.$[city].Governments": gove,
            },
          },
          {
            arrayFilters: [{ "country.Name": country }, { "city.Name": city }],
          }
        );
      } else {
        res.status(409).json({ success: false, message: "Government Exists" });
      }
    }
  }

  res.status(200).json({ success: true, message: "Data added successfully" });
});

exports.AddAds = expressAsyncHandler(async (req, res) => {
  const { video, text } = req.body;
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
    const rule = await Rules.findOne({ type: "ad" })
      .select("-Countries -Home")
      .exec();
    if (rule) {
      text ? (rule.Ad.text = text) : (rule.Ad.text = rule.Ad.text);
      images
        ? (rule.Ad.image = uploadedImages)
        : (rule.Ad.image = rule.Ad.image);
      video ? (rule.Ad.video = video) : (rule.Ad.video = rule.Ad.video);
      await rule.save();
      res
        .status(200)
        .json({ success: true, message: "Ad updated successfully", rule });
    } else {
      await Rules.create({
        type: "ad",
        Ad: { text, image: uploadedImages, video },
      }).then((rule) => {
        delete rule._doc.Home &&
          delete rule._doc.Countries &&
          delete rule._doc.__v;
        res
          .status(201)
          .json({ success: true, message: "Ad added successfully", rule });
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
