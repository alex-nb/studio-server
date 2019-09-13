const express = require('express');
const employeesController = require('../controllers/employees');
const isAuth = require('../middleware/is-auth');
const checkPermission = require('../middleware/check-permission');
const router = express.Router();

router.get('/', isAuth, employeesController.getEmployeesList);
router.get('/departments', isAuth, employeesController.getDepartmentsStructure);
router.get('/person', isAuth, employeesController.getPersonalInfo);
router.get('/balance/:page', isAuth, employeesController.getBalanceHistory);
router.post('/person', isAuth, employeesController.updatePersonalInfo);
router.post('/', isAuth, checkPermission('editEmployee'), employeesController.addEmployee);
router.post('/departments', isAuth, checkPermission('editEmployee'), employeesController.updateDepartments);
router.delete('/:id', isAuth, checkPermission('editEmployee'), employeesController.deleteEmployee);
router.all('*', function(req, res){
    res
        .status(404)
        .json({ errors: [{ msg: 'Route not found.' }] });
});
module.exports = router;