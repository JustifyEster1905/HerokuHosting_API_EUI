const mysql = require('mysql');

const conn = mysql.createConnection({
    host: 'db4free.net',
    user: 'justifyester1905',
    password: 'esterpasaribu1905',
    database: 'esterbersyukur',
    port: 3306
});

module.exports = conn;