const Project = require('../models/project');
const Dept = require('../models/department');
const { validationResult } = require('express-validator/check');

exports.getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find();
        res.status(200).json({
            message: 'Fetched projects successfully.',
            projects: projects
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getNewProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ status: 'new'});
        res.status(200).json({
            message: 'Fetched new projects successfully.',
            projects: projects
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getProcessProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ status: 'process'})
            .populate('reports.idEmployee', 'name')
            .populate('reports.idReport')
            .populate('participants.idEmployee', 'name img');
        res.status(200).json({
            message: 'Fetched process projects successfully.',
            projects: projects
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getCloseProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ status: 'close'})
            .populate('reports.idEmployee', 'name')
            .populate('reports.idReport')
            .populate('participants.idEmployee', 'name img');
        res.status(200).json({
            message: 'Fetched close projects successfully.',
            projects: projects
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getProject = async (req, res, next) => {
    const projectId = req.params.projectId;
    try {
        const project = await Project.findById(projectId).populate('participants.idEmployee', 'name img');
        if (!project) {
            const error = new Error('Could not find project.');
            error.statusCode = 404;
            next(error);1
        }
        res.status(200).json({ message: 'Project fetched.', project: project });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateProject = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
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
        );
        res.status(201).json({message: 'Project updates!', project: project});
    } catch (err) {
        console.error(err.message);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

/*
* status: close
* dateEnd
* participants: [
        {
            idEmployee: ,
            idDept: ,
            nameDept: ,
            revenue: ,
            premium: ,
            fine:
        }
    ]
* */

exports.closeProject= async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    try {
        const {summ, id, dateEnd} = req.body;
        console.log(summ, id, dateEnd);
        await Project.findOneAndUpdate(
            { _id: req.body.id },
            { $set: {
                    "status": "close",
                    "dateEnd": dateEnd,
                }}
        );
        for (let idEmp in summ) {
            console.log(summ[idEmp]);
            console.log(await  Project.findOne({"_id": id, "participants.idEmployee": idEmp, "participants.idDept": summ[idEmp].idDept}));
            await Project.findOneAndUpdate(
                {"_id": id, "participants.idEmployee": idEmp, "participants.idDept": summ[idEmp].idDept},
                {$set: {
                        "participants.$.premium": Number(summ[idEmp].premium),
                        "participants.$.fine": Number(summ[idEmp].fine)
                    }}
            );
        }
        const project = await Project.findById(id);
        res.status(201).json({message: 'Project close!', project: project});
    } catch (err) {
        console.error(err.message);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};