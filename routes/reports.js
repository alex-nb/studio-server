const express = require('express');
const reportsController =require('../controllers/reports');

const isAuth = require('../middleware/is-auth');
const checkPermission = require('../middleware/check-permission');

const router = express.Router();

router.get('/', isAuth, reportsController.getReports);
router.post('/', isAuth, reportsController.addReport);
router.post('/update', isAuth, checkPermission('editReport'), reportsController.updateReport);
router.all('*', function(req, res){
    res
        .status(404)
        .json({ errors: [{ msg: 'Route not found.' }] });
});
module.exports = router;