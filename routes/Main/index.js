const { AddUser, GetAllCountries, GetAllReports, GetAllOrders, GetRules, DeleteProduct, UpdateProduct, EditUser } = require('../../controllers/Main');
const ImgUploader = require('../../middleswares/ImgUploader');
const router = require('express').Router();

router.post('/add/user', AddUser);
router.get('/countries', GetAllCountries)
router.get('/reports', GetAllReports)
router.get('/orders', GetAllOrders)
router.get("/countries-cities", GetRules);
router.delete('/delete/product/:id', DeleteProduct);
router.put('/edit/user/:id', EditUser)
router.put('/edit/product/:id', ImgUploader.fields([{name: 'image', maxCount: 1}]), UpdateProduct)
module.exports = router;