const router = require("express").Router();
const { AddVideo, AddCountriesandCities, GetAllUsers, AddCategory } = require("../../controllers/Owner");
const multer = require("multer");
const ImgUploader = require("../../middleswares/ImgUploader");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.get('/users', GetAllUsers);
router.post("/video", upload.single('video') ,AddVideo);
router.post('/country-cities', AddCountriesandCities);
router.post('/new/category', ImgUploader.fields([{name: 'image', maxCount: 1}]) ,AddCategory);
module.exports = router;
