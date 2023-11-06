const router = require("express").Router();
const ImgUploader = require("../../middleswares/ImgUploader");

const {
  ChangePassword,
  GetProfile,
  GetRules,
  GetVideo,
  UpdateProfile,
  SubmitReports,
  GetCart,
  AddToCart,
  GetProducts,
  DeleteFromCart,
  DeleteCart,
  AddOrder,
  GetOrder,
  DeleteOrder,
  GetInfo,
  UpdateCart,
  AddItem,
} = require("../../controllers/User");

router.post("/changepwd", ChangePassword);
router.get("/profile", GetProfile);
router.put("/profile/update", UpdateProfile);
router.post("/report", SubmitReports);
router.get("/products", GetProducts);
router.post("/cart/add/:prodId", AddToCart);
router.get("/cart", GetCart);
router.put("/cart/product/:prodId", UpdateCart);
router.delete("/cart/:cartId/product/:prodId", DeleteFromCart);
router.delete("/remove/cart/:cartId", DeleteCart);
router.post("/order/:cartId", AddOrder);
router.get("/order", GetOrder);
router.delete("/order/:orderId", DeleteOrder);
router.get("/home", GetInfo);
router.post(
  "/request",
  ImgUploader.fields([{ name: "image", maxCount: 1 }]),
  AddItem
);
module.exports = router;
