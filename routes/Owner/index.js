const router = require("express").Router();
const { AddVideo, AddCountriesandCities, GetAllUsers, AddProduct } = require("../../controllers/Owner");
const multer = require("multer");
const ImgUploader = require("../../middleswares/ImgUploader");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.get('/users', GetAllUsers);
router.post("/video", upload.single('video') ,AddVideo);
router.post('/country-cities', AddCountriesandCities);
router.post('/new/product', ImgUploader.fields([{name: 'image', maxCount: 1}]) ,AddProduct)
module.exports = router;
