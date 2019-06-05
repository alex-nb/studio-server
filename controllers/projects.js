const Project = require('../models/project');

exports.getProjects = (req, res, next) => {
    Project.find()
        .then(projects => {
            res.status(200).json({
                message: 'Fetched projects successfully.',
                projects: projects
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getNewProjects = (req, res, next) => {
    Project.find({ status: 'new'})
        .then(projects => {
            res.status(200).json({
                message: 'Fetched new projects successfully.',
                projects: projects
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getProcessProjects = (req, res, next) => {
    Project.find({ status: 'process'}).populate('reports.idEmployee', 'name').populate('reports.idReport')
        .then(projects => {
            res.status(200).json({
                message: 'Fetched process projects successfully.',
                projects: projects
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getCloseProjects = (req, res, next) => {
    Project.find({ status: 'close'}).populate('reports.idEmployee', 'name').populate('reports.idReport')
        .then(projects => {
            res.status(200).json({
                message: 'Fetched close projects successfully.',
                projects: projects
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getProject = (req, res, next) => {
    const projectId = req.params.projectId;
    Project.findById(projectId)
        .then(project => {
            if (!project) {
                const error = new Error('Could not find project.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'Project fetched.', project: project });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};