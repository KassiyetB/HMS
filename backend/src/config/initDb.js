const pool = require('./db');
const chalk = require('chalk');

const initDb = async () => {
    try{
        console.log(chalk.blue("Initializing database..."));

        await pool.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                date_of_birth DATE NOT NULL,
                gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
                phone VARCHAR(20),
                email VARCHAR(150),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log(chalk.green("Database initialized successfully."));
    } catch (err) {
        console.error(chalk.red("Error initializing database:"), err);
    }
}

module.exports = initDb;