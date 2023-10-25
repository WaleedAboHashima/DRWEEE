const { AddUser, GetAllCountries, GetAllReports, GetAllOrders } = require('../../controllers/Main');

const router = require('express').Router();

router.post('/add', AddUser);
router.get('/countries', GetAllCountries)
router.get('/reports', GetAllReports)
router.get('/orders', GetAllOrders)
module.exports = router;