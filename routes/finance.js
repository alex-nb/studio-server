const express = require('express');
const financeController = require('../controllers/finance');
const isAuth = require('../middleware/is-auth');
const checkPermission = require('../middleware/check-permission');
const router = express.Router();

router.get('/expenditure', isAuth, checkPermission('workExpenditures'), financeController.getExpenditures);
router.post('/expenditure', isAuth, checkPermission('workExpenditures'), financeController.updateExpenditure);

router.get('/request', isAuth, checkPermission('workRequests'), financeController.getRequests);
router.post('/request', isAuth, financeController.createRequest);
router.post('/request/answer', isAuth, checkPermission('workRequests'), financeController.setAnswerRequest);

router.get('/transaction', isAuth, checkPermission('workTransaction'), financeController.getTransaction);
router.post('/transaction', isAuth, checkPermission('workTransaction'), financeController.updateTransaction);

router.all('*', function(req, res){
    res
        .status(404)
        .json({ errors: [{ msg: 'Route not found.' }] });
});
module.exports = router;