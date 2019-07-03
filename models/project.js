const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    costTotal: {
        type: Number,
        required: false
    },
    dateStart: {
        type: String,
        required: false
    },
    deadline: {
        type: String,
        required: false
    },
    dateEnd: {
        type: String,
        required: false
    },
    hoursPlan: {
        type: Number,
        required: false
    },
    hoursFact: {
        type: Number,
        required: false
    },
    hoursBad: {
        type: Number,
        required: false
    },
    premium: {
        type: Number,
        required: false
    },
    fine: {
        type: Number,
        required: false
    },
    infoDepartments: [
        {
            idDept: {
                type: Schema.Types.ObjectId,
                ref: 'Departments',
                required: false
            },
            nameDept: {
                type: String,
                required: false
            },
            cost: {
                type: Number,
                required: false
            },
            rate: {
                type: Number,
                required: false
            },
            hoursPlan: {
                type: Number,
                required: false
            },
            hoursFact: {
                type: Number,
                required: false
            }
        }
    ],
    participants: [
        {
            idEmployee: {
                type: Schema.Types.ObjectId,
                ref: 'Employee',
                required: false
            },
            idDept: {
                type: Schema.Types.ObjectId,
                ref: 'Department',
                required: false
            },
            nameDept: {
                type: String,
                required: false
            },
            revenue: {
                type: Number,
                required: false
            },
            premium: {
                type: Number,
                required: false
            },
            fine: {
                type: Number,
                required: false
            }
        }
    ],
    reports: [
        {
            idEmployee: {
                type: Schema.Types.ObjectId,
                ref: 'Employee',
                required: false
            },
            idReport: {
                type: Schema.Types.ObjectId,
                ref: 'Report',
                required: false
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);