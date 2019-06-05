const express = require('express');
const { body } = require('express-validator/check');

const financeController = require('../controllers/finance');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/expenditure', isAuth, financeController.getExpenditures);

router.get('/request', isAuth, financeController.getRequests);

router.get('/transaction', isAuth, financeController.getTransaction);

router.post(
    '/expenditure', isAuth, financeController.createExpenditure
);

module.exports = router;