const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
	host: "localhost",
	user: "root", // Default Laragon user
	password: "", // Default Laragon password is empty
	database: "carwash",
});

module.exports = db.promise();
