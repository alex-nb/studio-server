const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/employee');
const Department = require('../models/department');

exports.signup = async (req, res) => {
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    try {
        const hashedPw =  await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPw,
            name: name
        });
        await user.save();
        res.status(201).json({message: 'Employee created!', userId: user._id});
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
    try {
        const user = await User.findOne({email: email});
        if (!user || !user.active) {
            return res
                .status(400)
                .json({ errors: [{ msg: 'User with this email could not be found.' }] });
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            return res
                .status(401)
                .json({ errors: [{ msg: 'Wrong password!' }] });
        }
        let roles = await Department.find({ employees: loadedUser._id }, {systemTitle:1, _id:0});
        roles = roles.map(role => role.systemTitle);
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 'supersuperverysecretlongstring', { expiresIn: '3h' });
        res.status(200).json({token: token, userId: loadedUser._id.toString(), balance: loadedUser.balance, roles: roles})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};