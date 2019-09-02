const express = require('express');
const { body } = require('express-validator/check');

const employeesController = require('../controllers/employees');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', isAuth, employeesController.getEmployeesList);
router.get('/departments', isAuth, employeesController.getDepartmentsStructure);
router.get('/info/:postId', isAuth, employeesController.getPersonalInfo);
router.get('/person', isAuth, employeesController.getPersonalInfo);
router.post('/', isAuth, employeesController.addEmployee);

module.exports = router;