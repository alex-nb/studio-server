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
        idEmp: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: false
        },
        name: {
            type: String,
            required: false
        },
        img: {
            type: String,
            required: false
        }
    }]
});

module.exports = mongoose.model('Department', departmentSchema);