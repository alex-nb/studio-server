const Project = require('../models/project');

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
    /*Project.find()
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
        });*/
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
    /*Project.find({ status: 'new'})
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
        });*/
};

exports.getProcessProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ status: 'process'}).populate('reports.idEmployee', 'name').populate('reports.idReport')
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
    /*Project.find({ status: 'process'}).populate('reports.idEmployee', 'name').populate('reports.idReport')
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
        });*/
};

exports.getCloseProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ status: 'close'}).populate('reports.idEmployee', 'name').populate('reports.idReport')
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
    /*Project.find({ status: 'close'}).populate('reports.idEmployee', 'name').populate('reports.idReport')
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
        });*/
};

exports.getProject = async (req, res, next) => {
    const projectId = req.params.projectId;
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            const error = new Error('Could not find project.');
            error.statusCode = 404;
            next(error);
        }
        res.status(200).json({ message: 'Project fetched.', project: project });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
    /*Project.findById(projectId)
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
        });*/
};