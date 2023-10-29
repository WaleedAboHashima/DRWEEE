const { User } = require("../../models/User");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { Reports } = require("../../models/Reports/index");
const { Rules } = require("../../models/Rule/index");
const { Products } = require("../../models/Products");
const { Carts } = require("../../models/Cart");
const { Orders } = require("../../models/Order");
const { json } = require("express");
require("dotenv").config();
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

exports.GetProducts = expressAsyncHandler(async (req, res) => {
  try {
    await Products.find({}).then((products) => {
      res.json({ success: true, message: "Products Retrieved", products }, 200);
    });
  } catch (err) {
    res.json({ status: false, message: err.message }, 500);
  }
});

exports.AddToCart = expressAsyncHandler(async (req, res) => {
  const id = req.user.id;
  const { prodId } = req.params;
  const { quantity } = req.body;
  try {
    const foundProduct = await Products.findById(prodId);
    if (!foundProduct)
      return res
        .status(200)
        .json({ success: false, message: "Product Not Found" });
    else {
      const foundCart = await Carts.findOne({ User: id });
      if (foundCart) {
        const duplicatedProductIndex = foundCart.Products.findIndex(
          (product) => product._id.toString() === prodId
        );
        if (duplicatedProductIndex !== -1) {
          foundCart.Products[duplicatedProductIndex].Quantity += quantity;
          foundCart.Products[duplicatedProductIndex].Points =
            foundProduct.Points *
            foundCart.Products[duplicatedProductIndex].Quantity;
          foundCart.Products[duplicatedProductIndex].Price =
            foundProduct.Price *
            foundCart.Products[duplicatedProductIndex].Quantity;
        } else {
          foundProduct.Quantity = quantity;
          foundProduct.Points = foundProduct.Points * quantity;
          foundProduct.Price = foundProduct.Price * quantity;
          foundCart.Products.push(foundProduct);
        }

        const points = foundCart.Products.reduce(
          (sum, product) => sum + product.Points,
          0
        );
        const price = foundCart.Products.reduce(
          (sum, product) => sum + product.Price,
          0
        );
        foundCart.totalPrice = price;
        foundCart.totalPoints = points;

        const updatedCart = await Carts.findOneAndUpdate(
          { User: id },
          {
            $set: {
              Products: foundCart.Products,
              totalPrice: foundCart.totalPrice,
              totalPoints: foundCart.totalPoints,
            },
          },
          { new: true }
        );

        res
          .status(200)
          .json({ success: true, message: "Added to cart", cart: updatedCart });
      } else {
        foundProduct.Quantity = quantity;
        foundProduct.Points = foundProduct.Points * quantity;
        foundProduct.Price = foundProduct.Price * quantity;
        await Carts.create({
          User: id,
          Products: [foundProduct],
          totalPrice: foundProduct.Price,
          totalPoints: foundProduct.Points,
        }).then((cart) =>
          res.status(200).json({
            success: true,
            message: "Product and Cart Added Successfully",
            cart,
          })
        );
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.DeleteFromCart = expressAsyncHandler(async (req, res) => {
  const { cartId, prodId } = req.params;
  try {
    await Carts.findById(cartId).then(async (cart) => {
      if (!cart)
        return res
          .status(200)
          .json({ success: false, message: "Cart Not Found" });
      else {
        const prodIndex = cart.Products.findIndex(
          (product) => product._id.toString() === prodId
        );
        if (prodIndex !== -1) {
          cart.Products.pop(prodIndex);
          console.log(cart.Products.length);
          if (cart.Products.length > 0) {
            cart.totalPoints = cart.Products.reduce(
              (sum, product) => sum + product.Points,
              0
            );
            cart.totalPrice = cart.Products.reduce(
              (sum, product) => sum + product.Price,
              0
            );
            await cart.save();
            res.status(200).json({
              success: true,
              message: "Product deleted from cart",
              cart,
            });
          } else {
            await Carts.findByIdAndDelete(cartId);
            res.status(200).json({
              success: true,
              message: "Product deleted from cart",
            });
          }
        } else {
          res
            .status(200)
            .json({ success: false, message: "Product not found in cart" });
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetCart = expressAsyncHandler(async (req, res) => {
  const id = req.user.id;
  try {
    const foundCart = await Carts.findOne({ User: id });
    if (!foundCart)
      return res.status(200).json({
        success: true,
        message: "Cart Not Found",
        cart: { Products: [] },
      });
    else {
      res.status(200).json({
        success: true,
        message: "Cart retrieved successfully",
        cart: foundCart,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
});

exports.DeleteCart = expressAsyncHandler(async (req, res) => {
  const { cartId } = req.params;
  try {
    await Carts.findByIdAndDelete(cartId).then((cart) => {
      if (!cart)
        res.status(200).json({ success: false, message: "Cart not found" });
      else {
        res
          .status(200)
          .json({ success: true, message: "Cart Deleted Successfully" });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.AddOrder = expressAsyncHandler(async (req, res) => {
  const { cartId } = req.params;
  const { name, phone, location } = req.body;
  const { id } = req.user;
  try {
    await Carts.findById(cartId).then(async (cart) => {
      if (!cart)
        res.status(200).json({ success: false, message: "Cart not found" });
      else {
        await Orders.create({
          Info: id,
          User: {
            Name: name,
            Phone: phone,
            Location: { lat: location.lat, lng: location.lng },
          },
          Products: cart.Products,
          TotalPoints: cart.totalPoints,
          TotalPrice: cart.totalPrice,
        }).then(async (order) => {
          await Carts.findByIdAndDelete(cartId);
          res
            .status(200)
            .json({ success: true, message: "Order added", order });
        });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetOrder = expressAsyncHandler(async (req, res) => {
  const { id } = req.user;
  try {
    await Orders.find({ Info: id }).then((order) => {
      if (!order)
        return res
          .status(200)
          .json({ success: false, message: "No orders for this user" });
      else {
        res.status(200).json({
          success: true,
          message: "Order retrieved successfully",
          order,
        });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.DeleteOrder = expressAsyncHandler(async (req, res) => {
  const { orderId } = req.params;
  try {
    await Orders.findByIdAndDelete(orderId).then(() => {
      res.status(200).json({ success: true, message: "Order Deleted" });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

exports.GetInfo = expressAsyncHandler(async (req, res) => {
  try {
    await Rules.findOne({ type: "home" }).then((rule) => {
      if (!rule) return res.status(200).json({ success: true, data: {} });
      else {
        res.status(200).json({ success: true, data: rule.Home });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
