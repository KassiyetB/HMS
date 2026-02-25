require('dotenv').config();
const chalk = require('chalk');
const app = require('./src/app');
const pool = require('./src/config/db');
const initDb = require('./src/config/initDb');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await pool.connect();
        console.log(chalk.green.bold("Connected to PostgreSQL"));

        await initDb();

        app.listen(PORT, () => {
            console.log(chalk.green(`Server is running on ${chalk.blue.underline('http://localhost:' + chalk.bold(PORT))}`));
        });


    } catch(err) {
        console.error(chalk.red("Database connection error"), err);
    }
}

startServer();
