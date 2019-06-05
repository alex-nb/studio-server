const express = require('express');
const { body } = require('express-validator/check');

const projectsController = require('../controllers/projects');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', isAuth, projectsController.getProjects);
router.get('/new', isAuth, projectsController.getNewProjects);
router.get('/process', isAuth, projectsController.getProcessProjects);
router.get('/close', isAuth, projectsController.getCloseProjects);
router.get('/:projectId', isAuth, projectsController.getProject);

module.exports = router;