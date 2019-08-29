const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    img: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "new"
    }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);