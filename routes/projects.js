const express = require('express');

const projectsController = require('../controllers/projects');
const isAuth = require('../middleware/is-auth');
const checkPermission = require('../middleware/check-permission');
const router = express.Router();

router.get('/', isAuth, projectsController.getProjects);
router.get('/new', isAuth, checkPermission('getNewProjects'), projectsController.getNewProjects);
router.get('/process', isAuth, projectsController.getProcessProjects);
router.get('/close', isAuth, projectsController.getCloseProjects);
router.get('/:id', isAuth, checkPermission('getProject'), projectsController.getProject);
router.post('/', isAuth, checkPermission('editProject'), projectsController.updateProject);
router.post('/close', isAuth, checkPermission('closeProject'), projectsController.closeProject);
router.post('/start', isAuth, checkPermission('startProject'), projectsController.startProject);
router.post('/create', isAuth, checkPermission('createProject'), projectsController.createProject);
router.all('*', function(req, res){
    res
        .status(404)
        .json({ errors: [{ msg: 'Route not found.' }] });
});
module.exports = router;