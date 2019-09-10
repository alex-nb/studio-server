const Report = require('../models/report');
const Dept = require('../models/department');
const Project = require('../models/project');
const Employee = require('../models/employee');
const Transaction = require('../models/transaction');
const { validationResult } = require('express-validator/check');

exports.getReports = async (req, res) => {
    try {
        const userId = req.userId;
        let roles = await Dept.find({ employees: userId }, {systemTitle:1});
        roles = roles.map(role => role.systemTitle);
        let reports;
        if (roles.indexOf('studio')>-1) {
            reports = await Project.find(
                {reports:{$exists: true, $ne: []}},
                '_id title hoursPlan hoursFact hoursBad hoursFactWork hoursBadWork hoursFactStudy hoursBadStudy'
            )
                .populate('reports.idEmployee', 'name')
                .populate('reports.idReport',
                    'date report hoursWork acceptedHoursWork hoursStudy acceptedHoursStudy reason status');
        }
        else {
            if (roles.indexOf('pm')>-1) {
                reports = await Project.find(
                    {reports:{$exists: true, $ne: []}, "participants.idEmployee": userId},
                    '_id title hoursPlan hoursFact hoursBad hoursFactWork hoursBadWork hoursFactStudy hoursBadStudy'
                )
                    .populate('reports.idEmployee', 'name')
                    .populate('reports.idReport',
                        'date report hoursWork acceptedHoursWork hoursStudy acceptedHoursStudy reason status');
            }
            else {
                reports = await Project.find(
                    {reports:{$exists: true, $ne: []}, "participants.idEmployee": userId},
                    '_id title hoursPlan hoursFact hoursBad hoursFactWork hoursBadWork hoursFactStudy hoursBadStudy'
                )
                    .populate({
                        path: 'reports.idEmployee',
                        match: { _id: userId},
                        select: 'name'
                    })
                    .populate({
                        path: 'reports.idReport',
                        match: { idEmployee: userId},
                        select: 'date report hoursWork acceptedHoursWork hoursStudy acceptedHoursStudy reason status'
                    });
            }

        }
        res.status(200).json({
            message: 'Fetched reports successfully.',
            reports: reports
        });
    } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ errors: [{ msg: 'Server error.' }] });
    }
};

exports.addReport = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const newReport = new Report({
            report: req.body.report,
            date: req.body.date,
            hoursWork: req.body.timeWork,
            hoursStudy: req.body.timeStudy,
            idProject: req.body.idProject,
            idEmployee: req.userId
        });

        const report = await newReport.save();
        const project = await Project.findOneAndUpdate(
            {_id: req.body.idProject},
            {$push: {reports: {
                    idEmployee: req.userId,
                    idReport: report._id
                }
            }},
            {new: true}
            ).populate('reports.idEmployee', 'name')
            .populate(
                'reports.idReport',
                'date report hoursWork acceptedHoursWork hoursStudy acceptedHoursStudy reason status'
            );
        res.status(201).json({message: 'Report for project created!', project: project});
    } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ errors: [{ msg: 'Server error.' }] });
    }
};

exports.updateReport = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {action, id} = req.body;
        let report = await Report.findById(id);
        const idEmp = report.idEmployee;
        const idProject = report.idProject;
        let newReport;
        let hoursBadWork = 0;
        let hoursBadStudy = 0;
        if (action==="accept") {
            newReport = await Report.findOneAndUpdate({_id: id}, { $set: {
                "status": "accepted",
                "acceptedHoursWork" : Number(report.hoursWork),
                "acceptedHoursStudy" : Number(report.hoursStudy)
            }}, {new: true});
            await Employee.findOneAndUpdate({_id: idEmp}, {$inc: {balance: 5}});
            await Employee.findOneAndUpdate({status: "studio"}, {$inc: {balance: -5}});
            let transaction = new Transaction({
                title: 'Начисление за отчет',
                idEmployee: idEmp,
                summ: 5,
                type: 'expense'
            });
            await transaction.save();
        }
        if (action==="reject") {
            const {acceptedHoursWork, acceptedHoursStudy, reason} = req.body;
            newReport = await Report.findOneAndUpdate({_id: id}, { $set: {
                "status": "rejected",
                "acceptedHoursWork" : Number(acceptedHoursWork),
                "acceptedHoursStudy" : Number(acceptedHoursStudy),
                "reason": reason
            }}, {new: true});
            hoursBadWork = (Number(report.hoursWork)-Number(acceptedHoursWork));
            hoursBadStudy = (Number(report.hoursStudy)-Number(acceptedHoursStudy));
            await Employee.findOneAndUpdate({_id: idEmp}, {$inc: {balance: -5}});
            await Employee.findOneAndUpdate({status: "studio"}, {$inc: {balance: 5}});
            let transaction = new Transaction({
                title: 'Вычет за отчет',
                idEmployee: idEmp,
                summ: 5,
                type: 'income'
            });
            await transaction.save();
        }
        if (action==="mark") {
            newReport = await Report.findOneAndUpdate({_id: id}, { $set: {
                "status": "neutral",
                "acceptedHoursWork" : Number(report.hoursWork),
                "acceptedHoursStudy" : Number(report.hoursStudy)
            }}, {new: true});
        }
        await Project.findOneAndUpdate({_id: idProject}, {$inc: {
                hoursFact: Number(report.hoursWork)+ Number(report.hoursStudy),
                hoursBad: hoursBadWork+hoursBadStudy,
                hoursFactWork: Number(report.hoursWork),
                hoursBadWork: hoursBadWork,
                hoursFactStudy: Number(report.hoursStudy),
                hoursBadStudy: hoursBadStudy,
            }});
        res.status(201).json({message: 'Report updated!', report: newReport});
    } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ errors: [{ msg: 'Server error.' }] });
    }
};