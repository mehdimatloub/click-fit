const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password", 
    database: "your_database",
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error("Erreur de connexion à la base de données : " + err.message);
    } else {
        console.log("Connecté à la base de données MySQL.");
    }
});

module.exports = db;
