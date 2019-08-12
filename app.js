require('dotenv').config();

const axios = require('axios');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


//const Transaction = require('./models/transaction');

const projectsRoutes = require('./routes/projects');
const financeRoutes = require('./routes/finance');
const reportsRoutes = require('./routes/reports');
const employeesRoutes = require('./routes/employees');
const authRoutes = require('./routes/auth');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

app.use((error, req, res, next) => {
   console.log(error);
   const status = error.statusCode || 500;
   const message = error.message;
   const data = error.data;
   res.status(status).json({ message: message, data: data });
});

mongoose
    .connect(
        process.env.DATABASE_HOST, { useNewUrlParser: true }
    )
    .then(result => {

       app.listen(8000);

       /*let req = new Transaction({
          title: 'Трата 1',
          expenditure: {
               idExp: '5cf4f508c5ad1829dd742621',
               title: 'Подстатья 8',
          },
          whom: 'Подрядчику',
          summ: 20000
       });
       req.save();

       req = new Transaction({
          title: 'Трата 2',
          expenditure: {
               idExp: '5cf4f4b21add0629771246c3',
               title: 'Подстатья 1',
          },
          idEmployee: '5cdabed4654de84c9f08d1f1',
          summ: 30000
       });
       req.save();*/
    })
    .catch(err => console.log(err));