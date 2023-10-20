const router = require("express").Router();
const ImgUploader = require("../../middleswares/ImgUploader");

const {
  ChangePassword,
  GetProfile,
  GetRules,
  GetVideo,
  UpdateProfile,
  SubmitReports,
  GetCategories,
  GetProductsInCategory,
  AddProductToCategory,
} = require("../../controllers/User");

router.post("/changepwd", ChangePassword);
router.get("/profile", GetProfile);
router.get("/rules", GetRules);
router.get('/video', GetVideo);
router.put('/profile/update', UpdateProfile);
router.post('/report', SubmitReports)
router.get('/categories', GetCategories)
router.get('/:catId/products', GetProductsInCategory);
router.post('/new/product/:catId', ImgUploader.fields([{name: "image", maxCount: 1}]), AddProductToCategory)

module.exports = router;
