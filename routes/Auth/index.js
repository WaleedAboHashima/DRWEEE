const router = require("express").Router();
const {
  Login,
  Register,
  ForgetPassword,
  OTPCheck,
  UpdatePassword,
} = require("../../controllers/Auth");

router.post("/login", Login);
router.post("/register", Register);
router.post("/forget", ForgetPassword);
router.post("/otp", OTPCheck);
router.post("/reset", UpdatePassword);
module.exports = router;
