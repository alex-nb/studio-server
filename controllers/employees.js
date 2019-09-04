const Employee = require('../models/employee');
const Department = require('../models/department');
const Transaction = require('../models/transaction');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');

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
        const departmentsStructure = await Department.find().populate('employees', 'name img');
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
        const employeesList = await Employee.find({active: true});
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

exports.getPersonalInfo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    try {
        const employee = await Employee.findById(req.userId, 'name balance email status');
        const balanceHistory = await Transaction.find({idEmployee: req.userId});
        res.status(201).json({message: 'Personal info.', employee: employee, balanceHistory:balanceHistory});
    } catch (err) {
        console.error(err.message);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.addEmployee = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    try {
        const {idEmp, idDept} = req.body;
        let department;
        if (idEmp && idDept) {
            department = await Department.findOneAndUpdate(
                {_id: idDept},
                {$addToSet: {employees: idEmp}},
                {new: true}
            ).populate('employees', 'name img');
        }
        else {
            const {lastName, firstName, secondName, dept, birthday, email} = req.body;
            const hashedPw =  await bcrypt.hash(firstName, 12);
            const newEmployee = new Employee({
                name: `${lastName} ${firstName} ${secondName}`,
                //img: '',
                email: email,
                birthday: birthday.split("-").reverse().join("."),
                password: hashedPw
            });
            await newEmployee.save();
            department = await Department.findOneAndUpdate(
                {_id: dept},
                {$addToSet: {employees: newEmployee._id}},
                {new: true}
            ).populate('employees', 'name img');
        }
        res.status(201).json({message: 'Add employee successfully!', department: department});
    } catch (err) {
        console.error(err.message);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateDepartments = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    try {
        const departments = req.body;
        for (const dept of departments) {
            await Department.findOneAndUpdate(
                {_id: dept.deptId},
                {$set: {employees: dept.employees}}
            );
        }
        res.status(201).json({message: 'Update departments successfully!'});
    } catch (err) {
        console.error(err.message);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteEmployee = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    try {
        const idEmp = req.params.id;
        const employee = await Employee.findOneAndUpdate(
            {_id: idEmp},
            {$set: {active: false}},
            {new: true}
        );
        await Department.updateMany(
            {},
            {$pull: { 'employees': idEmp}}
        );
        res.status(201).json({message: 'Delete employee successfully!', employee: employee});
    } catch (err) {
        console.error(err.message);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};