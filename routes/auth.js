const  express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/employee');
const authController = require('../controllers/auth');
//const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put(
    "/signup",
    [
        body('email').isEmail().withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
                return User.findOne({email: value}).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email address already exist.');
                    }
                })
            })
            .normalizeEmail(),
        //body('password').trim().isLength({min: 5}),
        //!body('name').trim().isEmpty()
    ],
    authController.signup
);

router.post('/login', authController.login);

router.all('*', function(req, res){
    res
        .status(404)
        .json({ errors: [{ msg: 'Route not found.' }] });
});

module.exports = router;