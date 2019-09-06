const Project = require('../models/project');
const Dept = require('../models/department');
const Employee = require('../models/employee');
const Transaction = require('../models/transaction');

const { validationResult } = require('express-validator/check');

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json({
            message: 'Fetched projects successfully.',
            projects: projects
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getNewProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: 'new'});
        res.status(200).json({
            message: 'Fetched new projects successfully.',
            projects: projects
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getProcessProjects = async (req, res) => {
    try {
        const userId = req.userId;
        let projects;
        const dept = await Dept.find({ employees: userId }, {systemTitle:1});
        const roles = dept.map(role => role.systemTitle);
        if (roles.indexOf('studio')>-1) {
            projects = await Project.find({ status: 'process'})
                .populate('reports.idEmployee', 'name')
                .populate('reports.idReport')
                .populate('participants.idEmployee', 'name img');
        }
        else {
            if (roles.indexOf('pm')>-1) {
                projects = await Project.find({ status: 'process', "participants.idEmployee": userId})
                    .populate('reports.idEmployee', 'name')
                    .populate('reports.idReport')
                    .populate('participants.idEmployee', 'name img');
            }
            else {
                projects = await Project.find({ status: 'process', "participants.idEmployee": userId})
                    .populate({
                        path: 'reports.idEmployee',
                        match: { _id: userId},
                        select: 'name'
                    })
                    .populate({
                        path: 'reports.idReport',
                        match: { idEmployee: userId}
                    })
                    .populate({
                        path: 'participants.idEmployee',
                        select: 'name img'
                    });
            }
        }
        res.status(200).json({
            message: 'Fetched process projects successfully.',
            projects: projects
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getCloseProjects = async (req, res) => {
    try {
        let projects;
        const userId = req.userId;
        let roles = await Dept.find({ employees: userId }, {systemTitle:1, _id:0});
        roles = roles.map(role => role.systemTitle);
        if (roles.indexOf('studio')>-1) {
            projects = await Project.find({ status: 'close'})
                .populate('reports.idEmployee', 'name')
                .populate('reports.idReport')
                .populate('participants.idEmployee', 'name img');
        }
        else {
            if (roles.indexOf('pm')>-1) {
                projects = await Project.find({ status: 'close', "participants.idEmployee": userId})
                    .populate('reports.idEmployee', 'name')
                    .populate('reports.idReport')
                    .populate('participants.idEmployee', 'name img');
            }
            else {
                projects = await Project.find({ status: 'close', "participants.idEmployee": userId})
                    .populate({
                        path: 'reports.idEmployee',
                        match: { _id: userId},
                        select: 'name'
                    })
                    .populate({
                        path: 'reports.idReport',
                        match: { idEmployee: userId}
                    })
                    .populate({
                        path: 'participants.idEmployee',
                        select: 'name img'
                    });
            }
        }
        res.status(200).json({
            message: 'Fetched close projects successfully.',
            projects: projects
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getProject = async (req, res) => {
    const id = req.params.id;
    try {
        const project = await Project.findById(id).populate('participants.idEmployee', 'name img');
        if (!project) {
            return res
                .status(404)
                .json({ errors: [{ msg: 'Could not find project' }] });
        }
        res.status(200).json({ message: 'Project fetched.', project: project });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.updateProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        id,
        dateStart,
        dateEnd,
        fine,
        premium,
        totalSum,
        employees,
        cost,
        rate,
        hours
    } = req.body;

    const projectFields = {};
    projectFields.participants = [];
    projectFields.infoDepartments = [];
    if (dateStart) projectFields.dateStart = dateStart.split("-").reverse().join(".");
    if (dateEnd) projectFields.deadline = dateEnd.split("-").reverse().join(".");
    if (fine) projectFields.fine = fine;
    if (premium) projectFields.premium = premium;
    if (totalSum) projectFields.costTotal = totalSum;
    if (employees) {
        for (let idDept in employees) {
            for (let employee in employees[idDept]) {
                let idEmp = Object.keys(employees[idDept][employee])[0];
                const dept = await Dept.findById(idDept, 'title');
                projectFields.participants.push({
                    idEmployee: idEmp,
                    idDept: idDept,
                    nameDept: dept.title,
                    revenue: employees[idDept][employee][idEmp]
                });
            }

        }
    }
    if (cost) {
        for (let idDept in cost) {
            const dept = await Dept.findById(idDept, 'title');
            projectFields.infoDepartments.push({
                   idDept: idDept,
                   nameDept: dept.title,
                   cost: cost[idDept],
                   rate: rate[idDept],
                   hoursPlan: hours[idDept],
               }
           );
        }
    }
    try {
        let project = await Project.findOneAndUpdate(
            { _id: id },
            { $set: projectFields },
            {new: true}
        ).populate('participants.idEmployee', 'name img');
        res.status(201).json({message: 'Project updates!', project: project});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.closeProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {summ, id, dateEnd} = req.body;
        const project = await Project.findById(id);
        let participants = project.participants;
        for (let id in summ) {
            let employee = participants.find(employee => String(employee._id)===id);
            participants[participants.indexOf(employee)].premium = Number(summ[id].premium);
            participants[participants.indexOf(employee)].fine = Number(summ[id].fine);
            let newBalance = Number(summ[id].premium)-Number(summ[id].fine)+Number(summ[id].revenue);
            await Employee.findOneAndUpdate({_id: employee.idEmployee}, {$inc: {balance: newBalance}});
            await Employee.findOneAndUpdate({status: "studio"}, {$inc: {balance: 0-newBalance}});
            let transaction = new Transaction({
                title: 'Начисление по проекту "'+project.title+'"',
                idEmployee: employee.idEmployee,
                summ: newBalance,
                type: 'expense'
            });
            await transaction.save();
        }
        const newProject = await Project.findOneAndUpdate(
            { _id: req.body.id },
            { $set: {
                    "status": "close",
                    "dateEnd": dateEnd,
                    participants: participants
                }},
            {new: true}
        ).populate('participants.idEmployee', 'name img');
        res.status(201).json({message: 'Project close!', project: newProject});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.startProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {id} = req.body;
        const newProject = await Project.findOneAndUpdate(
            { _id: id },
            { $set: { "status": "process"}},
            {new: true}
        ).populate('participants.idEmployee', 'name img');
        res.status(201).json({message: 'Project start!', project: newProject});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};