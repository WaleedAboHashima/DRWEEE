const router = require("express").Router();
const {
  AddCountriesandCities,
  GetAllUsers,
  AddProduct,
  AddInfo,
  GetAllProducts,
  GetAllOrders,
  DeleteUser,
  GetRequests,
  ConfirmRequest,
  Addcitytocountry,
  AddAds,
} = require("../../controllers/Owner");
const multer = require("multer");
const ImgUploader = require("../../middleswares/ImgUploader");
const { RemoveRequest } = require("../../controllers/Owner");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.get("/users", GetAllUsers);
// router.post("/video", upload.single('video') ,AddVideo);
router.post("/country-cities", AddCountriesandCities);
router.post(
  "/new/product",
  ImgUploader.fields([{ name: "image", maxCount: 1 }]),
  AddProduct
);
router.post("/info", ImgUploader.fields([{ name: "images" }]), AddInfo);
router.get("/products", GetAllProducts);
router.get("/orders", GetAllOrders);
router.delete("/user/:id", DeleteUser);
router.get("/requests", GetRequests);
router.put("/request/:requestId", ConfirmRequest);
router.delete("/request/:id", RemoveRequest);
router.post("/add/city/:country", Addcitytocountry);
router.post(
  "/ad",
  ImgUploader.fields([{ name: "images" }]),
  AddAds
);
module.exports = router;
