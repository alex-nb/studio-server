const Report = require('../models/report');
const Project = require('../models/project');

exports.getReports = (req, res, next) => {
    Project.find({reports:{$exists: true, $ne: []}}, '_id title hoursPlan hoursFact')
        .populate('reports.idEmployee', 'name')
        .populate('reports.idReport', 'date report hours status')
        .then(reports => {
            res.status(200).json({
                message: 'Fetched reports successfully.',
                reports: reports
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    /*Report.find().populate('idEmployee', 'name').populate('idProject', 'title hoursPlan hoursFact')
        .then(reports => {
            res.status(200).json({
                message: 'Fetched reports successfully.',
                reports: reports
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });*/
};