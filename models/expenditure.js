const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenditureSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    idExpParent: {
        type: Schema.Types.ObjectId,
        ref: 'Expenditure',
        required: false
    },
    type: {
        type: String,
        required: false
    },
    count: {
        type: Number,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Expenditure', expenditureSchema);