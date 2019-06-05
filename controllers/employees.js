const Employee = require('../models/employee');
const Transaction = require('../models/transaction');

exports.getPersonalInfo = (req, res, next) => {
    const userId = req.params.userId;
    let balance;
    Employee.findById(userId, 'balance')
        .then(user => {
            balance = user.balance;
            Transaction.find({idEmployee: userId})
        })
        .then(info => {
            res.status(200).json({
                message: 'Fetched personal info successfully.',
                info: info
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};