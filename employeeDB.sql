-- Drops the employees_db if it already exists --
DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;
USE employees_db;

CREATE TABLE department(
  id INTEGER AUTO_INCREMENT NOT NULL,
  dept_name VARCHAR(30),
  PRIMARY KEY (id)
); 
ALTER TABLE department AUTO_INCREMENT=1001;

CREATE TABLE role(
  id INTEGER AUTO_INCREMENT NOT NULL,
  title VARCHAR(30),
  salary DECIMAL NOT NULL,
  department_id INTEGER NOT NULL,
  PRIMARY KEY (id)
);
ALTER TABLE role AUTO_INCREMENT=1501;

CREATE TABLE employee(
  id INTEGER AUTO_INCREMENT NOT NULL,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INTEGER NOT NULL,
  manager_id INTEGER,
  PRIMARY KEY (id)
);

INSERT INTO department (dept_name) VALUES ("Engineering");
INSERT INTO department (dept_name) VALUES ("Marketing");
INSERT INTO department (dept_name) VALUES ("HR");
INSERT INTO department (dept_name) VALUES ("Legal");
SELECT * FROM department;

INSERT INTO role (title, salary, department_id) VALUES ("Software Engineer", 120000, 1001);
INSERT INTO role (title, salary, department_id) VALUES ("Engineer", 160000, 1001);
INSERT INTO role (title, salary, department_id) VALUES ("Marketing Rep", 90000, 1002);
INSERT INTO role (title, salary, department_id) VALUES ("Marketing Lead", 110000, 1002);
INSERT INTO role (title, salary, department_id) VALUES ("HR Rep", 80000, 1003);
INSERT INTO role (title, salary, department_id) VALUES ("HR Lead", 100000, 1003);
INSERT INTO role (title, salary, department_id) VALUES ("Lawyer", 130000, 1004);
INSERT INTO role (title, salary, department_id) VALUES ("Legal Lead", 200000, 1004);
SELECT * FROM role;

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Jane", "Westin", 1501, 2);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Daria", "Sanchez", 1502, NULL);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Eliza", "Lim", 1503, 4);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Maggie", "Sisi", 1504, NULL);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Penny", "Singh", 1505, 6);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Hyrim", "Williams", 1506, NULL);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Vera", "Madson", 1507, 8);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Avery", "Hassan", 1508, NULL);
SELECT * FROM employee;
