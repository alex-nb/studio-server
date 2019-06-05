const express = require('express');
const { body } = require('express-validator/check');

const employeesController = require('../controllers/employees');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/info/:postId', isAuth, employeesController.getPersonalInfo);

module.exports = router;