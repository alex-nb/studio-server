const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    idEmployee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    idProject: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    report: {
        type: String,
        required: true
    },
    hoursWork: {
        type: Number,
        required: false
    },
    acceptedHoursWork: {
        type: Number,
        required: false
    },
    hoursStudy: {
        type: Number,
        required: false
    },
    acceptedHoursStudy: {
        type: Number,
        required: false
    },
    reason: {
        type: String,
        required: false
    },
    /*
    * new
    * accepted
    * rejected
    * neutral
    * */
    status: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);