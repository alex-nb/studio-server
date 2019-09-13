require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const projectsRoutes = require('./routes/projects');
const financeRoutes = require('./routes/finance');
const reportsRoutes = require('./routes/reports');
const employeesRoutes = require('./routes/employees');
const authRoutes = require('./routes/auth');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader(
       'Access-Control-Allow-Methods',
       'OPTIONS, GET, POST, PUT, PATCH, DELETE'
   );
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
   next();
});

app.use('/projects', projectsRoutes);
app.use('/finance', financeRoutes);
app.use('/reports', reportsRoutes);
app.use('/employees', employeesRoutes);
app.use('/auth', authRoutes);
app.use(express.static('public'));
app.use((req, res, next) => {
   res.status(404).json({ errors: [{ msg: 'Route not found.' }] });
});
app.use((error, req, res, next) => {
   const status = error.statusCode || 500;
   const message = error.message;
   res.status(status).json({ errors: [{ msg: message }] });
});

mongoose
    .connect(
        process.env.DATABASE_HOST, { useNewUrlParser: true, useFindAndModify: false }
    )
    .then(result => {
       app.listen(8000);
    })
    .catch(err => console.log(err));
