const express = require('express');
const { body } = require('express-validator/check');

const reportsController =require('../controllers/reports');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', isAuth, reportsController.getReports);


module.exports = router;