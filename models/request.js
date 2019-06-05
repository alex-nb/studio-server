const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    idEmployee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    dateUntil: {
        type: String,
        required: true
    },
    dateIssue: {
        type: String,
        required: false
    },
    sum: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);