const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/employee');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
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
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
    /*bcrypt.hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                email: email,
                password: hashedPw,
                name: name
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({message: 'Employee created!', userId: result._id});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });*/
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
    try {
        const user = await User.findOne({email: email});
        if (!user) {
            const error = new Error('User with this email could not be found.');
            error.statusCode = 401;
            next(error);
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            next(error);
        }
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 'supersuperverysecretlongstring', { expiresIn: '1h' });
        res.status(200).json({token: token, userId: loadedUser._id.toString(), balance: loadedUser.balance})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
  /*User.findOne({email: email})
      .then(user => {
          if (!user) {
              const error = new Error('User with this email could not be found.');
              error.statusCode = 401;
              throw error;
          }
          loadedUser = user;
          return bcrypt.compare(password, user.password);
      })
      .then(isEqual => {
          if (!isEqual) {
              const error = new Error('Wrong password!');
              error.statusCode = 401;
              throw error;
          }
          const token = jwt.sign({
              email: loadedUser.email,
              userId: loadedUser._id.toString()
          }, 'supersuperverysecretlongstring', { expiresIn: '1h' });
          res.status(200).json({token: token, userId: loadedUser._id.toString(), balance: loadedUser.balance})
      })
      .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
      });*/
};