const Report = require('../models/report');
const Project = require('../models/project');

exports.getReports = async (req, res, next) => {
    try {
        const reports = await Project.find({reports:{$exists: true, $ne: []}}, '_id title hoursPlan hoursFact')
            .populate('reports.idEmployee', 'name')
            .populate('reports.idReport', 'date report hours status');
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