const pw = require("./pw.js");

const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");


// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // establish port
  port: 3306,

  // your username
  user: "root",

  // your password
  password: pw,
  database: "employees_db"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  console.log ("Connected to database!")
  // run the start function after the connection is made to prompt the user
  start();
});