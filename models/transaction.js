const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    idEmployee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: false
    },
    expenditure: {
        idExp: {
            type: Schema.Types.ObjectId,
            ref: 'Expenditure',
            required: true
        },
        title: {
            type: String,
            required: true
        }
    },
    whom: {
        type: String,
        required: false
    },
    summ: {
        type: String,
        required: true
    },
    /*
    * expense
    * income
    * */
    type: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);