require('dotenv').config();
const chalk = require('chalk');
const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;

pool.connect()
.then(() => {
    console.log(chalk.green.bold("Connected to PostgreSQL"));
    app.listen(PORT, () => {
        console.log(chalk.green(`Server is running on ${chalk.blue.underline('http://localhost:' + chalk.bold(PORT))}`));
    });
})
.catch(err => {
    console.error(chalk.red("Database connection error"), err);
})

