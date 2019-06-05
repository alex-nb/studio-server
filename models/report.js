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
    hours: {
        type: Number,
        required: true
    },
    /*
    * new
    * accepted
    * rejected
    * neutral
    * */
    status: {
        type: String,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);