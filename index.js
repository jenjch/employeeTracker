// require pw in separate file using module.exports
const pw = require("./pw.js");

const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
// https://www.npmjs.com/package/console.table
// formats the console log all nice like for tables

// global variable set just for the chooseDepartment function (which grabs department selection from existing database), which is used for the addRole function (function passed)
let globalDept = [];

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // establish port
  port: 3306,

  // your username
  user: "root",

  // your password as a require variable; stored in separate file not uploaded to github
  password: pw,
  database: "employees_db"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected as id " + connection.threadId + " to database!");
  // run the start function after the connection is made, to prompt user actions
  start();
});

// function that prompts the user with list of options
function start() {
  inquirer
    .prompt({
      name: "firstAction",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "Add Department",
        "View Departments",
        "Add Role",
        "View Roles",
        "Add Employee",
        "Update Employee Role",
        "Remove Employee",
        "Exit"
      ]
    })
    .then(function(answer) {
      // based on user selection, run the appropriate function for viewing, adding, editing, or deleting

      if (answer.firstAction === "View All Employees") {
        viewEmployees();
      } else if (answer.firstAction === "Add Department") {
        addDepartment();
      } else if (answer.firstAction === "View Departments") {
        viewDepartments();
      } else if (answer.firstAction === "Add Role") {
        // adding a new role depends on querying and using dynamic database data (selecting an existing dept in this case)
        // this is a different way achieving this (passing functions) than used for add/delete employee, update employee role
        chooseDepartment(addRole);
      } else if (answer.firstAction === "View Roles") {
        viewRoles();
      } else if (answer.firstAction === "Add Employee") {
        addEmployee();
      } else if (answer.firstAction === "Update Employee Role") {
        updateEmployeeRole();
      } else if (answer.firstAction === "Remove Employee") {
        removeEmployee();
      } else {
        connection.end();
      }
    });
}

// use a callback function for generating available departments
function chooseDepartment(CBfunc) {
  // select all from existing department table in employees_db
  connection.query("SELECT * FROM department", function(err, results) {
    if (err) throw err;
    console.table(results);
    // set up empty array to add department name info
    let deptArray = [];
    // make sure globalDept variable matches with results retrieved from database
    globalDept = results;
    // for loop to produce all entries in table
    for (i = 0; i < results.length; i++) {
      // push/add each name result to array
      deptArray.push(results[i].dept_name);
    }

    // call back function used below in addRole function, departmentNames used for the "choices" in dept question
    CBfunc(deptArray);
  });
}

// function displays the queried current data from employee table
function viewEmployees() {
  connection.query("SELECT * FROM employee", function(err, results) {
    if (err) throw err;
    // show results in table format
    console.table(results);
    // console.log(results);
    // re-prompt the user for further actions by calling "start" function
    start();
  });
}

// function to add a new department
function addDepartment() {
  // prompt for info about new department; no need to query since existing database data not needed to add department
  inquirer
    .prompt({
      name: "deptName",
      type: "input",
      message: "What department would you like to add?"
    })
    .then(function(answer) {
      // after collecting answer, insert department into database
      connection.query(
        "INSERT INTO department SET ?",
        {
          dept_name: answer.deptName
          // dept table id (key) should automatically update/increment starting from 1001 (including seed data)
        },
        function(err) {
          if (err) throw err;
          // console log success message plus new department name
          console.log(answer.deptName + " Department is added!");
          // re-prompt the user for further actions by calling "start" function
          start();
        }
      );
    });
}

// function displays the queried current data from department table
function viewDepartments() {
  connection.query("SELECT * FROM department", function(err, results) {
    if (err) throw err;
    // show results in table format
    console.table(results);
    // re-prompt the user for further actions by calling "start" function
    start();
  });
}

// function to add a new role (using department data from the chooseDepartment function)
function addRole(departmentNames) {
  // prompt for info about new role
  inquirer
    .prompt([
      {
        name: "roleName",
        type: "input",
        message: "What role would you like to add?"
      },
      {
        name: "salary",
        type: "input",
        message: "Please enter salary:",
        // will not except non-numerical input
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "deptName",
        type: "list",
        message: "What department is this role in?",
        // list of departments obtained from chooseDepartment function become choices to select
        choices: departmentNames
      }
    ])
    .then(function(answer) {
      // after collecting dept name, find department_id to insert into role table
      // Array.find() is an inbuilt function in JavaScript which is used to get the value of the first element in the array that satisfies the provided condition
      var deptObject = globalDept.find(
        element => element.dept_name === answer.deptName
      );
      console.log(deptObject);
      connection.query(
        // insert role into database (role table)
        "INSERT INTO role SET ?",
        {
          title: answer.roleName,
          salary: answer.salary,
          // use the id from the matching dept entry in globalDept, now the deptObject var
          department_id: deptObject.id
          // role table id (key) should automatically update/increment starting at 1501 (including seed data)
        },
        function(err) {
          if (err) throw err;
          // console log success message plus new role name
          console.log(answer.roleName + " Role is added!");
          // re-prompt the user for further actions by calling "start" function
          start();
        }
      );
    });
}

// function displays the queried current data from role table
function viewRoles() {
  connection.query("SELECT * FROM role", function(err, results) {
    if (err) throw err;
    // show results in table format
    console.table(results);
    // re-prompt the user for further actions by calling "start" function
    start();
  });
}

// function to add new employees
function addEmployee() {
  // query for existing role options from database for later prompt question
  connection.query("SELECT * FROM role", function(err, results) {
    // set default empty object (curly braces)
    const rolesObject = {};
    if (err) throw err;
    // console.log(results);

    // map() method calls the provided function once for each element in an array, in order
    const rolesArray = results.map(role => {
      rolesObject[role.title] = role.id;
      return role.title;
    });
    console.log(rolesObject);

    // nest this query within above; for existing employee options from database to list as manager
    connection.query("SELECT * FROM employee", function(err, results) {
      // set default empty object (curly braces)
      const employeesObject = {};
      if (err) throw err;
      console.log(results);

      // map() method creates a new array with the results of calling a function for every array element
      const employeesArray = results.map(employee => {
        employeesObject[employee.first_name + " " + employee.last_name] =
          employee.id;
        return employee.first_name + " " + employee.last_name;
      });

      console.log(employeesArray);

      // prompt for info about new employee
      inquirer
        .prompt([
          {
            name: "employeeFirst",
            type: "input",
            message: "What is the employee's first name?"
          },
          {
            name: "employeeLast",
            type: "input",
            message: "What is the employee's last name?"
          },
          {
            name: "employeeRole",
            type: "list",
            message: "What is the employee's role?",
            // uses above roles array data as choices
            choices: rolesArray
          },
          {
            name: "manager",
            type: "list",
            message: "Who is the employee's manager?",
            // uses above employees array data as choices
            choices: employeesArray
          }
        ])
        .then(function(answer) {
          // when finished prompting, insert a new employee into the db with info
          console.log(rolesObject[answer.employeeRole]);
          console.log(employeesObject[answer.manager]);
          connection.query(
            "INSERT INTO employee SET ?",
            {
              first_name: answer.employeeFirst,
              last_name: answer.employeeLast,
              role_id: rolesObject[answer.employeeRole],
              manager_id: employeesObject[answer.manager]
            },
            function(err) {
              if (err) throw err;
              // lists full name of employee added in message
              console.log(
                "Employee " +
                  answer.employeeFirst +
                  " " +
                  answer.employeeLast +
                  " is added!"
              );
              // re-prompt the user for further actions by calling "start" function
              start();
            }
          );
        });
    });
  });
}

// function to update existing employee's role
function updateEmployeeRole() {
  // query the database for all employees
  connection.query("SELECT * FROM employee", function(err, results) {
    const employeesObject = {};
    if (err) throw err;
    console.log(results);

    // map() method calls the provided function once for each element in an array, in order
    const employeesArray = results.map(employee => {
      employeesObject[employee.first_name + " " + employee.last_name] =
        employee.id;
      return employee.first_name + " " + employee.last_name;
    });

    // console.log(employeesArray);
    // map runs the function on each element of the array
    // nest this query inside the employee query
    connection.query("SELECT * FROM role", function(err, results) {
      const rolesObject = {};
      if (err) throw err;
      // console.log(results);
      // map() method creates a new array with the results of calling a function for every array element
      const rolesArray = results.map(role => {
        rolesObject[role.title] = role.id;
        return role.title;
      });
      console.log(rolesObject);
      // once you have the list of employees, prompt user on which they'd like to update
      inquirer
        .prompt([
          {
            name: "chooseEmployee",
            type: "list",
            message: "Which employee's role would you like to update?",
            // uses above employees array data as choices
            choices: employeesArray
          },
          {
            name: "updateRole",
            type: "list",
            message: "What is their new role?",
            // uses above roles array data as choices
            choices: rolesArray
          }
        ])
        .then(function(answer) {
          console.log(rolesObject[answer.updateRole]);
          console.log(employeesObject[answer.chooseEmployee]);
          // when finished prompting, update role of employee
          connection.query(
            // double check this update
            "UPDATE employee SET ? WHERE ?",
            [
              {
                // update employee role to this new role_id
                role_id: rolesObject[answer.updateRole]
              },
              {
                // id of employee
                id: employeesObject[answer.chooseEmployee]
              }
            ],
            function(err) {
              if (err) throw err;
              // lists specific employee and updated role in message
              console.log(
                "Employee " +
                  answer.chooseEmployee +
                  "'s role is updated to " +
                  answer.updateRole +
                  "!"
              );
              // re-prompt the user for further actions by calling "start" function
              start();
            }
          );
        });
    });
  });
}

function removeEmployee() {
  connection.query("SELECT * FROM employee", function(err, results) {
    const employeesObject = {};
    if (err) throw err;
    console.log(results);

    const employeesArray = results.map(employee => {
      employeesObject[employee.first_name + " " + employee.last_name] =
        employee.id;
      return employee.first_name + " " + employee.last_name;
    });

    inquirer
      .prompt({
        name: "deleteEmployee",
        type: "list",
        message: "Which employee would you like to remove?",
        choices: employeesArray
        // need to dynamically add employee choices from get employees function
      })
      .then(function(answer) {
        console.log(employeesObject[answer.deleteEmployee]);
        // when finished prompting, delete employee from database (wrap inquirer with SELECT FROM?)
        connection.query(
          // double check this delete
          "DELETE FROM employee WHERE ?",
          {
            // need to get this info based on mySQL data
            // based on name match? id match?
            id: employeesObject[answer.deleteEmployee]
          },
          function(err) {
            if (err) throw err;
            // lists specific employee deleted in message
            console.log("Employee " + answer.deleteEmployee + " is deleted!");
            // re-prompt the user for further actions by calling "start" function
            start();
          }
        );
      });
  });
}
