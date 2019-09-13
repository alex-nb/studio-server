const Employee = require('../models/employee');
const Department = require('../models/department');
const Transaction = require('../models/transaction');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const fs = require('fs');

exports.getDepartmentsStructure = async (req, res) => {
    try {
        const departmentsStructure = await Department.find().populate('employees', 'name img');
        res.status(200).json({
            message: 'Fetched departments structure successfully.',
            departmentsStructure: departmentsStructure
        });
    } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ errors: [{ msg: 'Server error.' }] });
    }
};

exports.getEmployeesList = async (req, res) => {
    try {
        const employeesList = await Employee.find({active: true});
        res.status(200).json({
            message: 'Fetched employees list successfully.',
            employeesList: employeesList
        });
    } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ errors: [{ msg: 'Server error.' }] });
    }
};

exports.getPersonalInfo = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const employee = await Employee.findById(req.userId, 'name balance email status img');
        const departments = await Department.find({ employees: req.userId }, 'title');
        res.status(201).json({message: 'Personal info.', employee: employee, departments:departments});
    } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ errors: [{ msg: 'Server error.' }] });
    }
};
const ITEMS_PER_PAGE = 7;
exports.getBalanceHistory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const page = +req.params.page || 1;
        const balanceHistory = await Transaction.find({idEmployee: req.userId}).sort({createdAt: -1}).skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        const totalItems = await Transaction.find({idEmployee: req.userId}).countDocuments();
        res.status(201).json({
            message: 'Balance history.',
            balanceHistory:balanceHistory,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ errors: [{ msg: 'Server error.' }] });
    }
};

exports.updatePersonalInfo = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const employee = await Employee.findById(req.userId);

        if (req.body.name) employee.name = req.body.name;
        if (req.body.email) employee.email = req.body.email;
        if (req.body.password) {
            employee.password = await bcrypt.hash(req.body.password, 12);
        }
        if (req.body.img) {
            const data = req.body.img.replace(/^data:image\/\w+;base64,/, "");
            const buf = new Buffer(data, 'base64');
            await fs.writeFile(__dirname + '/../public/img/avatar_'+req.userId+'.png', buf, (error)=>{
                if (error) {
                    console.log(error);
                    return res
                        .status(500)
                        .json({ errors: [{ msg: 'Ошибка сохранения аватара.' }] });
                }
            });
            employee.img='/img/avatar_'+req.userId+'.png';
            await employee.save();
        }
        res.status(201).json({message: 'Personal info.', employee: employee});
    } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ errors: [{ msg: 'Server error.' }] });
    }
};

exports.addEmployee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
        res
            .status(500)
            .json({ errors: [{ msg: 'Server error.' }] });
    }
};

exports.updateDepartments = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
        res
            .status(500)
            .json({ errors: [{ msg: 'Server error.' }] });
    }
};

exports.deleteEmployee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
        res
            .status(500)
            .json({ errors: [{ msg: 'Server error.' }] });
    }
};