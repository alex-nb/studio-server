const Expenditure = require('../models/expenditure');
const Request = require('../models/request');
const Transaction = require('../models/transaction');
const Employee = require('../models/employee');

const { validationResult } = require('express-validator/check');

exports.getExpenditures = async (req, res) => {
    try {
        const expenditures= await Expenditure.find();
        res.status(200).json({
            message: 'Fetched expenditures successfully.',
            expenditures: expenditures
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.find().populate('idEmployee', 'name');
        res.status(200).json({
            message: 'Fetched requests successfully.',
            requests: requests
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getTransaction = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({createdAt: -1}).populate('idEmployee', 'name');
        res.status(200).json({
            message: 'Fetched transaction successfully.',
            transactions: transactions
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.updateExpenditure = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });;
    }
    let expenditure;
    const {id, name, parent, type} = req.body;
    let updateFields = {
        title: name,
        type: type,
    };
    parent.length > 1 ? updateFields.idExpParent = parent : updateFields.idExpParent = null;
    try {
        if (id) {
            const oldExp = await Expenditure.findById(id);
            expenditure = await Expenditure.findOneAndUpdate(
                { _id: id},
                { $set: updateFields},
                {new: true}
            );
            if (oldExp.idExpParent !== expenditure.idExpParent) {
                if (oldExp.idExpParent) await Expenditure.findOneAndUpdate(
                    {_id:oldExp.idExpParent},
                    {$inc: {count: 0-expenditure["count"]}}
                );
                if (expenditure.idExpParent) await Expenditure.findOneAndUpdate(
                    {_id:expenditure.idExpParent},
                    {$inc: {count: expenditure["count"]}}
                );
            }
        }
        else {
            updateFields["count"] = 0;
            expenditure = new Expenditure(updateFields);
            await expenditure.save();
        }
        res.status(201).json({message: 'Expenditure created successfully!', expenditure: expenditure});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.updateTransaction = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {id, type,
        title, whom, summ,
        exp_id, employee} = req.body;
    let updateFields = {
        title: title,
        summ: summ,
        type: type
    };
    let deleteFields = {};
    if (exp_id) {
        const newExp = await Expenditure.findById(exp_id);
        updateFields.expenditure = {
            idExp: newExp._id,
            title: newExp.title
        }
    }
    else deleteFields.expenditure = 1;
    if (whom) updateFields.whom = whom;
    else deleteFields.whom = 1;
    if (employee) updateFields.idEmployee = employee;
    else deleteFields.idEmployee = 1;
    let transaction;
    try {
        //Изменение старой транзакции
        if (id) {
            const oldTransaction = await Transaction.findById(id);
            if (Object.keys(deleteFields).length === 0) {
                transaction = await Transaction.findOneAndUpdate(
                    { _id: id},
                    { $set: updateFields},
                    {new: true}
                );
            }
            else {
                transaction = await Transaction.findOneAndUpdate(
                    { _id: id},
                    { $set: updateFields, $unset: deleteFields},
                    {new: true}
                );
            }
            //Изменение статьи расхода
            if (oldTransaction.expenditure.idExp !== transaction.expenditure.idExp) {
                if (oldTransaction.expenditure.idExp) {
                    const oldExp = await Expenditure.findOneAndUpdate({"_id": oldTransaction.expenditure.idExp}, {$inc: {count: 0-1}}, {new: true});
                    if (oldExp.idExpParent) await Expenditure.findOneAndUpdate({"_id": oldExp.idExpParent}, {$inc: {count: 0-1}});
                }
                if (transaction.expenditure.idExp) {
                    const newExp = await Expenditure.findOneAndUpdate({"_id": transaction.expenditure.idExp}, {$inc: {count: 1}});
                    if (newExp.idExpParent) await Expenditure.findOneAndUpdate({"_id": newExp.idExpParent}, {$inc: {count: 1}});
                }
            }
            //Изменение суммы или типа транзакции (доход/расход)
            if (oldTransaction.summ !== transaction.summ || oldTransaction.type !== transaction.type) {
                const oldBalance = oldTransaction.type==="expense" ? Number(oldTransaction.summ) : 0-Number(oldTransaction.summ);
                const newBalance = transaction.type==="expense" ? 0-Number(transaction.summ) : Number(transaction.summ);
                await Employee.findOneAndUpdate({status: "studio"}, {$inc: {balance: oldBalance+newBalance}});
            }
            //Изменение сотрудника
            if (oldTransaction.idEmployee !== transaction.idEmployee) {
                const oldBalance = oldTransaction.type==="expense" ? 0-Number(oldTransaction.summ) : Number(oldTransaction.summ);
                const newBalance = transaction.type==="expense" ? Number(transaction.summ) : 0-Number(transaction.summ);
                if (oldTransaction.idEmployee) await Employee.findOneAndUpdate({_id: oldTransaction.idEmployee}, {$inc: {balance: oldBalance}});
                if (transaction.idEmployee) await Employee.findOneAndUpdate({_id: transaction.idEmployee}, {$inc: {balance: newBalance}});
            }
        }
        //Сохдание новой транзакции
        else {
            transaction = new Transaction(updateFields);
            await transaction.save();
            const newBalance = type==="expense" ? 0-summ : summ;
            await Employee.findOneAndUpdate({status: "studio"}, {$inc: {balance: newBalance}});
            if (type==="expense" && exp_id) {
                const newExp = await Expenditure.findOneAndUpdate({"_id": exp_id}, {$inc: {count: 1}});
                if (newExp.idExpParent) await Expenditure.findOneAndUpdate({"_id": newExp.idExpParent}, {$inc: {count: 1}});
            }
            if (transaction.idEmployee) await Employee.findOneAndUpdate({_id: transaction.idEmployee}, {$inc: {balance: 0-newBalance}});
        }
        await transaction.populate('idEmployee', 'name').execPopulate();
        res.status(201).json({message: 'Transaction created successfully!', transaction: transaction});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.setAnswerRequest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {id, status} = req.body;
        const request = await Request.findOneAndUpdate(
            { _id: id},
            { $set: {status: status}},
            {new: true}
        ).populate('idEmployee', 'name');
        if (status==="granted") {
            await Employee.findOneAndUpdate({_id: request.idEmployee}, {$inc: {balance: request.sum}});
            await Employee.findOneAndUpdate({status: "studio"}, {$inc: {balance: 0-request.sum}});
            const newTransaction = new Transaction({
                title: "Выдача ДС",
                idEmployee: request.idEmployee,
                /*expenditure: {
                    idExp: "5cf4f45fbaafcb28d537a658",
                    title: "Главная статья"
                },*/
                summ: request.sum,
                type: "expense"
            });
            await newTransaction.save();
        }
        res.status(201).json({message: 'Set request answer successfully!', request: request});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.createRequest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {time, money} = req.body;
        const request = new Request({
            idEmployee: req.userId,
            dateUntil: time.split("-").reverse().join("."),
            sum: money,
            status: "new",
        });
        await request.save();
        res.status(201).json({message: 'Create request successfully!', request: request});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};