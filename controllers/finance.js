const Expenditure = require('../models/expenditure');
const Request = require('../models/request');
const Transaction = require('../models/transaction');

const { validationResult } = require('express-validator/check');

exports.getExpenditures = (req, res, next) => {
    Expenditure.find()
        .then(expenditures => {
            res.status(200).json({
                message: 'Fetched expenditures successfully.',
                expenditures: expenditures
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getRequests = (req, res, next) => {
    Request.find().populate('idEmployee', 'name')
        .then(requests => {
            res.status(200).json({
                message: 'Fetched requests successfully.',
                requests: requests
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getTransaction = (req, res, next) => {
    Transaction.find().populate('idEmployee', 'name')
        .then(transaction => {
            res.status(200).json({
                message: 'Fetched transaction successfully.',
                transaction: transaction
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.createExpenditure = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const nameEx = req.body.nameEx;
    const expenditure = new Expenditure({
        title: nameEx
    });
    try {
        await expenditure.save();
        res.status(201).json({
            message: 'Expenditure created successfully!',
            expenditure: expenditure
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};