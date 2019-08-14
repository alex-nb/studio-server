const Employee = require('../models/employee');
const Department = require('../models/department');
const Transaction = require('../models/transaction');

exports.getPersonalInfo = async (req, res, next) => {
    const userId = req.params.userId;
    let balance;
    try {
        const user = await Employee.findById(userId, 'balance');
        balance = user.balance;
        const info = await Transaction.find({idEmployee: userId});
        res.status(200).json({
            message: 'Fetched personal info successfully.',
            info: info
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getDepartmentsStructure = async (req, res, next) => {
    try {
        const departmentsStructure = await Department.find().populate('employees.idEmp', 'name img');
        res.status(200).json({
            message: 'Fetched departments structure successfully.',
            departmentsStructure: departmentsStructure
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getEmployeesList = async (req, res, next) => {
    try {
        const employeesList = await Employee.find();
        res.status(200).json({
            message: 'Fetched employees list successfully.',
            employeesList: employeesList
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};