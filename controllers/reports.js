const Report = require('../models/report');
const Project = require('../models/project');
const { validationResult } = require('express-validator/check');

exports.getReports = async (req, res, next) => {
    try {
        const reports = await Project.find({reports:{$exists: true, $ne: []}}, '_id title hoursPlan hoursFact')
            .populate('reports.idEmployee', 'name')
            .populate('reports.idReport',
                'date report hoursWork acceptedHoursWork hoursStudy acceptedHoursStudy reason status');
        res.status(200).json({
            message: 'Fetched reports successfully.',
            reports: reports
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.addReport = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
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
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};