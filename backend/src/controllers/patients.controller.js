const pool = require('../config/db');

exports.getPatients = async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM patients');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: err.message });
    }
};

exports.createPatient = async (req, res) => {
    const { first_name, last_name, date_of_birth, gender } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO patients (first_name, last_name, date_of_birth, gender) VALUES ($1, $2, $3, $4) RETURNING *',
            [first_name, last_name, date_of_birth, gender]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
};