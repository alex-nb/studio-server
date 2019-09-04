const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    orderNum: {
        type: Number,
        required: true
    },
    employees: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: false
    }]
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);