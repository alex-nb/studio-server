const express = require('express');
const { body } = require('express-validator/check');

const financeController = require('../controllers/finance');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/expenditure', isAuth, financeController.getExpenditures);
router.post('/expenditure', isAuth, financeController.updateExpenditure);

router.get('/request', isAuth, financeController.getRequests);
router.post('/request', isAuth, financeController.createRequest);
router.post('/request/answer', isAuth, financeController.setAnswerRequest);

router.get('/transaction', isAuth, financeController.getTransaction);
router.post('/transaction', isAuth, financeController.updateTransaction);


module.exports = router;