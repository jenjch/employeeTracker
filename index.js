// require pw in separate file using module.exports
const pw = require("./pw.js");

const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
// https://www.npmjs.com/package/console.table


// global variable set just for the chooseDepartment function, which is used for the addRole function (function passed)
let globalDept = [];

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
  console.log("Connected to database!");
  // run the start function after the connection is made, to prompt user actions
  start();
});

// function that prompts the user for what they want to do first
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
      // based on user selection, run the function for showing all table data (joined?), view individual dept/role tables, add to dept/role/employee tables, update employee role, or delete employee
      if (answer.firstAction === "View All Employees") {
        viewEmployees();
      } else if (answer.firstAction === "Add Department") {
        addDepartment();
      } else if (answer.firstAction === "View Departments") {
        viewDepartments();
      } else if (answer.firstAction === "Add Role") {
        // adding a new role depends on selecting a dept from database
        // a different way of doing it than for update employee role and add employee
        chooseDepartment(addRole);
      } else if (answer.firstAction === "View Roles") {
        viewRoles();
      } else if (answer.firstAction === "Add Employee") {
        addEmployee();
      } else if (answer.firstAction === "Update Employee Role") {
        console.log("update employee")
        // updating employee role depends on selecting from available employees in database, and on selecting from availabel role
        updateEmployeeRole();
      } else if (answer.firstAction === "Remove Employee") {
        removeEmployee();
      } else {
        connection.end();
      }
    });
}


function chooseDepartment (CBfunc) {
  connection.query("SELECT * FROM department", function(err, results) {
    
    if (err) throw err;
    console.table(results);
    // let dep= results.each(x=>x.name);
    // set up empty array to add department name info
    let deptArray =[];
    // make sure globalDept variable matches with results retrieved from database
    globalDept=results;
    for (i = 0; i<results.length; i++) {

      // push/add each name to result
      deptArray.push(results[i].dept_name)
    }

    // pass to departmentNames below in addRole to use as choices; from above chooseDepartment(addRole);
    // call back function
    CBfunc(deptArray)
  });
}

// displays the current roster of employees and data combined from employee, department, role tables
function viewEmployees() {
  connection.query("SELECT * FROM employee", function(err, results) {
    if (err) throw err;
    console.table(results);
    console.log(results);
    // re-prompt the user for further actions by calling "start" function
    start();
})
}

// function to add a new department
function addDepartment() {
  // prompt for info about new department
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
          dept_name: answer.deptName,
          // id should automatically update/increment starting at 1001
        },
        function(err) {
          if (err) throw err;
          console.log("Department is added!");
          // re-prompt the user for further actions by calling "start" function
          start();
        }
      );
    });
}

// function to view all departments
function viewDepartments() {
  // need to figure out how to query all department table data, then console log table
  connection.query("SELECT * FROM department", function(err, results) {
    if (err) throw err;
    console.table(results);
    // re-prompt the user for further actions by calling "start" function
    start();
})
}

// function to add a new role
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
        message: "Please enter the salary:",
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
        choices:departmentNames
        // function to generate list of department choices to select, then use department_id to add to table in below  
      }
    ])
    .then(function(answer) {
      // after collecting answer, insert role into database
      // write something to find dept_id
     var deptObject = globalDept.find(element=>element.dept_name === answer.deptName);
     console.log (deptObject); 
      connection.query(
        "INSERT INTO role SET ?",
        {
          title: answer.roleName,
          salary: answer.salary,
          department_id: deptObject.id
          // id should automatically update/increment starting at 1501
          // need to figure out how to get department_id (function)
        },
        function(err) {
          if (err) throw err;
          console.log("Role is added!");
          // re-prompt the user for further actions by calling "start" function
          start();
        }
      );
    });
}

// function to view all roles
function viewRoles() {
  connection.query("SELECT * FROM role", function(err, results) {
    if (err) throw err;
    console.table(results);
    // re-prompt the user for further actions by calling "start" function
    start();
})

}

// function to add new employees
function addEmployee() {
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
        choices: [
          // "Software Engineer",
          // "Lead Engineer",
          // "Marketing Rep",
          // "Marketing Lead",
          // "HR Rep",
          // "HR Lead",
          // "Laywer",
          // "Legal Lead"
          // need to dynamically generate list of roles from table for selection
          // another inquire.prompt (query for list)
          // choices:results
          // select from roles 
        ]
      },
      {
        name: "manager",
        type: "list",
        message: "Who is the employee's manager?",
        choices: []
        // need to dynamically generate list of employees from table to select, then use the manager id to inset into table
        // need to have a NULL option
      }
    ])
    .then(function(answer) {
      // when finished prompting, insert a new employee into the db with info
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: answer.employeeFirst,
          last_name: answer.employeeLast
          // role_id:,
          // manager_id:
          // need to get above info based on mySQL data
        },
        function(err) {
          if (err) throw err;
          console.log("Employee is added!");
          // re-prompt the user for further actions by calling "start" function
          start();
        }
      );
    });
}

function updateEmployeeRole() {
  // query the database for all employees
  connection.query("SELECT * FROM employee", function(err, results) {
    const employeesObject = {};
    if (err) throw err;
    console.log(results);

    const employeesArray = results.map((employee) => {
      employeesObject[employee.first_name + " " + employee.last_name] = employee.id
      return employee.first_name + " " + employee.last_name
    })
 
    // console.log(employeesArray);
    // map runs the function on each element of the array
    connection.query("SELECT * FROM role", function(err, results) {
      const rolesObject = {};
      if (err) throw err;
        // console.log(results);
        const rolesArray = results.map((role) => {
          rolesObject[role.title]= role.id
          return role.title
        })
        console.log(rolesObject);
        // once you have the list of employees, prompt user on which they'd like to update
      inquirer
        .prompt([
          {
            name: "chooseEmployee",
            type: "list",
            message: "Which employee's role would you like to update?",
            choices: employeesArray
          // need to figure out how to dynamically query/add employee choices from database (with both first and last name)
          },
          {
            name: "updateRole",
            type: "list",
            message: "What is their new role?",
            choices: rolesArray
          }
        ])
        .then(function(answer) {
          console.log(rolesObject[answer.updateRole]);
          console.log(employeesObject[answer.chooseEmployee])
          // when finished prompting, update role of employee
          connection.query(
            // double check this update
            "UPDATE employee SET ? WHERE ?",
            [{
              role_id: rolesObject[answer.updateRole]
              // based on name match? then need to insert role id match? 
            },
            {
              id: employeesObject[answer.chooseEmployee]
            }
            ],
            function(err) {
              if (err) throw err;
              console.log("Employee role is updated!");
              // re-prompt the user for further actions by calling "start" function
              start();
            }
          );
        });
      });
  });
}

function removeEmployee() {
  inquirer
    .prompt({
      name: "deleteEmployee",
      type: "list",
      message: "Which employee would you like to remove?",
      choices: []
      // need to dynamically add employee choices from get employees function
    })
    .then(function(answer) {
      // when finished prompting, delete employee from database (wrap inquirer with SELECT FROM?)
      connection.query(
        // double check this delete
        "DELETE FROM employee WHERE ?",
        {
          // need to get this info based on mySQL data
          // based on name match? id match?
        },
        function(err) {
          if (err) throw err;
          console.log("Employee is deleted!");
          // re-prompt the user for further actions by calling "start" function
          start();
        }
      );
    });
}
