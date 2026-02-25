const express = require('express');
const patientsRoutes = require('./routes/patients.routes');
const app = express();

app.use(express.json());

app.use('/api/patients', patientsRoutes);

module.exports = app;