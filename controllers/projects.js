const Project = require('../models/project');
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
        //return res.status(400).json({ errors: errors.array() });
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

    /*
    * status
    * costTotal
    * hoursPlan
    * */

    /*
    * infoDepartments: [
        {
            idDept: {
                type: Schema.Types.ObjectId,
                ref: 'Departments',
                required: false
            },
            nameDept: {
                type: String,
                required: false
            },
            cost: {
                type: Number,
                required: false
            },
            rate: {
                type: Number,
                required: false
            },
            hoursPlan: {
                type: Number,
                required: false
            },
            hoursFact: {
                type: Number,
                required: false
            }
        }
    ]
    * */

    /*
    * participants: [
        {
            idEmployee: {
                type: Schema.Types.ObjectId,
                ref: 'Employee',
                required: false
            },
            idDept: {
                type: Schema.Types.ObjectId,
                ref: 'Department',
                required: false
            },
            nameDept: {
                type: String,
                required: false
            },
            revenue: {
                type: Number,
                required: false
            },
            premium: {
                type: Number,
                required: false
            },
            fine: {
                type: Number,
                required: false
            }
        }
    ]
    * */

    const projectFields = {};
    projectFields.participants = [];
    projectFields.infoDepartments = [];
    if (dateStart) projectFields.dateStart = dateStart;
    if (dateEnd) projectFields.deadline = dateEnd;
    if (fine) projectFields.fine = fine;
    if (premium) projectFields.premium = premium;
    if (totalSum) projectFields.costTotal = totalSum;

    if (employees) {
        employees.forEach(employee => {

        });
        projectFields.participants.push({
            idEmployee: {
                type: Schema.Types.ObjectId,
                ref: 'Employee',
                required: false
            },
            idDept: {
                type: Schema.Types.ObjectId,
                ref: 'Department',
                required: false
            },
            nameDept: {
                type: String,
                required: false
            },
            revenue: {
                type: Number,
                required: false
            },
            premium: {
                type: Number,
                required: false
            },
            fine: {
                type: Number,
                required: false
            }
        });
    }

    /*if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;*/

    try {
        let project = await Project.findOneAndUpdate(
            { _id: id },
            { $set: projectFields }
        );
        res.status(201).json({message: 'Report created!', project: project._id});
    } catch (err) {
        console.error(err.message);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};