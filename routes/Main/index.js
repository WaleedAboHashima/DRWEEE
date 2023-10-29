const { AddUser, GetAllCountries, GetAllReports, GetAllOrders, GetRules, DeleteProduct } = require('../../controllers/Main');
const router = require('express').Router();

router.post('/add', AddUser);
router.get('/countries', GetAllCountries)
router.get('/reports', GetAllReports)
router.get('/orders', GetAllOrders)
router.get("/countries-cities", GetRules);
router.delete('/product/:id', DeleteProduct);
module.exports = router;