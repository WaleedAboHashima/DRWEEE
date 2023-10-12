const router = require("express").Router();
const { ChangePassword, GetProfile } = require("../../controllers/User");
const { JWTGuard } = require("../../middleswares/JWTGuard");

router.post("/changepwd", JWTGuard("User"), ChangePassword);
router.get('/profile', JWTGuard('User') , GetProfile)

module.exports = router;
