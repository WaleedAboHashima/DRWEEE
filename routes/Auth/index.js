const router = require("express").Router();
const {
  Login,
  Register,
  ForgetPassword,
  OTPCheck,
  UpdatePassword,
  GetCitiesOrGove,
  GetCountries,
  CompleteProfile,
  GoogleLogin
} = require("../../controllers/Auth");

router.post("/login", Login);
router.post("/register", Register);
router.post("/forget", ForgetPassword);
router.post("/otp", OTPCheck);
router.post("/reset", UpdatePassword);
router.get('/countries', GetCountries);
router.post('/profile/complete/:id', CompleteProfile)
router.get('/countries/:type/:country/:city', GetCitiesOrGove)
router.post('/google', GoogleLogin);
module.exports = router;
