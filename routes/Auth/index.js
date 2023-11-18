const router = require("express").Router();
const {
  Login,
  Register,
  ForgetPassword,
  OTPCheck,
  UpdatePassword,
  GetCitiesOrGove,
  GetCountries,
  CompleteProfile
} = require("../../controllers/Auth");

router.post("/login", Login);
router.post("/register", Register);
router.post("/forget", ForgetPassword);
router.post("/otp", OTPCheck);
router.post("/reset", UpdatePassword);
router.get('/countries', GetCountries);
router.post('/profile/complete/:id', CompleteProfile)
router.get('/countries/:type/:country/:city', GetCitiesOrGove)
module.exports = router;
