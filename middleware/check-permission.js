const Department = require('../models/department');
const Project = require('../models/project');

module.exports = (action) => async (req, res, next) => {
    if (!action) {
        return res
            .status(404)
            .json({ errors: [{ msg: 'No action.' }] });
    }
    const userId = req.userId;
    let roles = await Department.find({ employees: userId }, {systemTitle:1, _id:0});
    roles = roles.map(role => role.systemTitle);
    if (!roles) {
        return res
            .status(401)
            .json({ errors: [{ msg: 'No role.' }] });
    }
    switch (action) {
        case 'getProject':
        case 'getNewProjects':
            if (roles.indexOf('studio')>-1 || roles.indexOf('pm') > -1) return next();
            break;
        case 'editProject': //если проект в процессе, то только студия, новый - оба
            if (roles.indexOf('studio')>-1) return next();
            if (roles.indexOf('pm') > -1) {
                const project =  await Project.findById(req.body.id);
                if (project.status==='new') return next();
            }
            break;
        case 'closeProject': //для pm только по своему проекту
        case 'startProject':
            if (roles.indexOf('studio')>-1) return next();
            if (roles.indexOf('pm') > -1) {
                const project =  await Project.findById(req.body.id);
                const dept = await Department.findOne({systemTitle: 'pm'});
                const participant = project.participants.filter(emp => String(emp.idEmployee)===String(userId) && String(emp.idDept)===String(dept._id));
                if (participant.length > 0) return next();
            }
            break;
        case 'editEmployee':
            if (roles.indexOf('studio')>-1) return next();
            break;
        case 'workTransaction':
            if (roles.indexOf('studio')>-1) return next();
            break;
        case 'workExpenditures':
            if (roles.indexOf('studio')>-1) return next();
            break;
        case 'workRequests':
            if (roles.indexOf('studio')>-1) return next();
            break;
        case 'editReport': //для pm только по своему проекту
            if (roles.indexOf('studio')>-1) return next();
            if (roles.indexOf('pm') > -1) {
                const project =  await Project.findOne({"reports.idReport": req.body.id});
                const dept = await Department.findOne({systemTitle: 'pm'});
                const participant = project.participants.filter(emp => emp.idEmployee===userId && emp.idDept===dept._id);
                if (participant) return next();
            }
            break;
        default:
            return res
                .status(403)
                .json({ errors: [{ msg: 'Required action not supported.' }] });
    }
    return res
        .status(403)
        .json({ errors: [{ msg: 'Not have permission.' }] });
};