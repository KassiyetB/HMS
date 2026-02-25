const express = require('express');
const router = express.Router();
const patientsController = require("../controllers/patients.controller");

router.get('/', patientsController.getPatients);
router.post('/', patientsController.createPatient);

module.exports = router;