const expressAsyncHandler = require("express-async-handler");
const { User } = require("../../models/User");
const bcrypt = require("bcrypt");
const { CountriesCities } = require("../../models/CountriesAndCities");
const { Reports } = require("../../models/Reports");
const { Orders } = require("../../models/Order");
const { Rules } = require("../../models/Rule");
const { Products } = require("../../models/Products");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.AddUser = expressAsyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    password,
    permission,
    role,
    adminId,
    city,
    country,
    government,
  } = req.body;
  if (!fullName || !email || !phone || !password)
    return res
      .status(403)
      .json({ success: false, message: "All Fields Are Required" });
  try {
    await User.findOne({ email }).then(async (user) => {
      if (user)
        return res
          .status(409)
          .json({ success: false, message: "User already exists" });
      else {
        const hashedPassword = await bcrypt.hash(password, 10);
        switch (role) {
          case "CityAdmin":
            await User.create({
              fullName,
              email,
              phone,
              password: hashedPassword,
              role,
              City: city,
              Admin: adminId,
              permission,
            }).then((newUser) => {
              delete newUser._doc.password;
              res
                .status(200)
                .json({ success: true, message: "User Created", newUser });
            });
            break;
          case "SuperVisor":
            await User.create({
              fullName,
              email,
              phone,
              password: hashedPassword,
              role,
              Government: government,
              Admin: adminId,
              permission,
            }).then((newUser) => {
              delete newUser._doc.password;
              res
                .status(200)
                .json({ success: true, message: "User Created", newUser });
            });
            break;
          default:
            await User.create({
              fullName,
              email,
              phone,
              password: hashedPassword,
              role,
              Country: country,
              permission,
            }).then((newUser) => {
              delete newUser._doc.password;
              res
                .status(200)
                .json({ success: true, message: "User Created", newUser });
            });
            break;
        }
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
    await Reports.find({}).then((reports) => {
      res.status(200).json({ success: true, reports });
    });
  } catch (err) {}
});

exports.GetAllOrders = expressAsyncHandler(async (req, res) => {
  try {
    await Orders.find({}).then((orders) => {
      res.status(200).json({ success: true, orders });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetRules = expressAsyncHandler(async (req, res) => {
  try {
    await Rules.findOne({ type: "countries" }).then((rules) => {
      delete rules._doc.Home;
      res
        .status(200)
        .json({ success: true, message: "Countries retrieved", rules });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.DeleteProduct = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await Products.findByIdAndDelete(id).then(
      res.status(200).json({ success: true, message: "Product Deleted" })
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.UpdateProduct = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, points, description, price } = req.body;
  const { image } = req.files;
  try {
    if (image) {
      const imageUpload = (await cloudinary.uploader.upload(image[0].path))
        .secure_url;
      await Products.findByIdAndUpdate(id, {
        Image: imageUpload && imageUpload,
      }).then((product) =>
        res
          .status(200)
          .json({ success: true, message: "ProductUpdated", product })
      );
    } else {
      await Products.findById(id).then(async (product) => {
        product.Name = name ? name : product.Name;
        product.Points = points ? points : product.Points;
        product.Description = description ? description : product.Description;
        product.Price = price ? price : product.Price;
        await product.save();
        res.status(200).json({ success: true, message: "Product updated" });
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.EditUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, email, permission, city, country, government, phone } =
    req.body;
  try {
    const duplicate = await User.findOne({ $or: [{ email }, { phone }] });
    if (duplicate) {
      res.status(409).json({
        success: false,
        message: "User with this info already exists.",
      });
    } else {
      await User.findByIdAndUpdate(id, {
        fullName,
        phone,
        email,
        permission,
        City: city,
        Country: country,
        Government: government,
      }).then(() => {
        res
          .status(200)
          .json({ success: true, message: "User updated successfully" });
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.ArchiveOrder = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await Orders.findById(id).then(async (order) => {
      order.Archived = !order.Archived;
      await order.save();
      res.status(200).json({ success: true, message: "Order Archived" });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.EditStatus = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await Orders.findById(id).then(async (order) => {
      order.Status = status;
      await order.save();
      res.status(200).json({ success: true, message: "Order Status changed" });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.DeleteCountry = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const rule = await Rules.findOne({ type: "countries" });
    if (!rule)
      return res
        .status(404)
        .json({ success: false, message: "No countries found" });
    else {
      const cIndex = rule.Countries.findIndex(
        (country) => country._id.toString() === id
      );
      if (cIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Country not found" });
      } else {
        rule.Countries.splice(cIndex, 1);
        await rule.save();
        res.status(200).json({ success: true, message: "Country Deleted" });
      }
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
