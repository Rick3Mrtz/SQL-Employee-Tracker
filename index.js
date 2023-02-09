const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer')
const cTable = require('console.table');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'Brinaztyy03!',
    database: 'employees_db'
  },
  console.log(`Connected to the employee_db database.`)
);

// View All Departments
const viewDepartments = () => {
    let sql = `
      SELECT id, dept_name AS "Department" FROM department ORDER BY dept_name;`;
  
    db.query(sql, (err, rows) => {
      if (err) {
        console.log(err);
        return;
      }
      console.table(`\n`, rows);
      firstPrompt();
    });
  };
  
  // View All Roles
  const viewRoles = () => {
    let sql = `
      SELECT roles.title AS "Title", 
        roles.id AS "Role ID",
        department.dept_name AS "Department", 
        roles.salary AS "Salary"
      FROM roles JOIN department 
      ON roles.department_id = department.id
      ORDER BY roles.title;`;
  
    db.query(sql, (err, rows) => {
      if (err) {
        console.log(err);
        return;
      }
      console.table(`\n`, rows);
      firstPrompt();
    });
  };
  
  // View All Employees
  const viewEmployees = async () => {

    let sql = `
      SELECT a.id,
        a.first_name AS "First Name",
        a.last_name AS "Last Name",
        roles.title AS "Title",
        department.dept_name AS "Department",
        roles.salary AS "Salary",
        CONCAT(b.first_name, " ", b.last_name) AS "Manager"
      FROM employee AS a
      JOIN roles 
      ON a.role_id = roles.id
      JOIN department 
      ON roles.department_id = department.id
      LEFT OUTER JOIN employee AS b 
      ON a.manager_id = b.id
      ORDER BY a.id;`;
  
    db.query(sql, (err, rows) => {
      if (err) {
        console.log(err);
        return;
      }
      console.table(`\n`, rows);
      firstPrompt();
    });
  };
  
  
  // new dept
  const addDepartment = () => {
    inquirer
      .prompt({
        type: "input",
        name: "deptName",
        message: "Please enter the name of the department to add:",
      })
      .then((data) => {
        const sql = `INSERT INTO department (dept_name) VALUES (?);`;
        db.query(sql, data.deptName, (err, rows) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log(`Added ${data.deptName} to the database.\n`);
          viewDepartments();
        });
      });
  };
  
  // new role
  const addRole = () => {
    
    db.query(`SELECT * FROM department;`, (err, deptSelectAll) => {
      if (err) {
        console.log(err);
        return;
      }
      let arrDeptChoices = [];
      deptSelectAll.forEach((item) => {
        arrDeptChoices.push(item.dept_name);
      });
      inquirer
        .prompt([
          {
            type: "input",
            name: "roleName",
            message: "What is the name of the new role?",
          },
          {
            type: "input",
            name: "roleSalary",
            message: "What is the salary of new role?",
          },
          {
            type: "list",
            name: "roleDepartment",
            message: "Please select a department for the new role:",
            choices: arrDeptChoices,
          },
        ])
        .then((data) => {
          let department_id;
          const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?);`;
  
          for (let i = 0; i < deptSelectAll.length; i++) {
            if (deptSelectAll[i].dept_name === data.roleDepartment) {
              department_id = deptSelectAll[i].id;
            }
          }
  
          const params = [data.roleName, data.roleSalary, department_id];
  
          db.query(sql, params, (err, rows) => {
            if (err) {
              console.log(err);
              return;
            }
            console.log(`Added ${data.roleName} to the database.\n`);
            viewRoles();
          });
        });
    });
  };
  
  // Add a new employee
  const addEmployee = () => {
    // Look up existing roles for roles array
    db.query(`SELECT * FROM roles;`, (err, rolesSelectAll) => {
      if (err) {
        console.log(err);
        return;
      }
      let arrRolesChoices = [];
      rolesSelectAll.forEach((item) => {
        arrRolesChoices.push(item.title);
      });
      // Lookup existing managers
      db.query(
        `SELECT id, CONCAT(first_name, ' ', last_name) AS full_name
    FROM employee;`,
        (err, fNamesAll) => {
          if (err) {
            console.log(err);
            return;
          }
          let arrManagerChoices = [];
          fNamesAll.forEach((item) => {
            arrManagerChoices.push(item.full_name);
          });
          inquirer
            .prompt([
              {
                type: "input",
                name: "firstName",
                message: "Please enter the FIRST NAME of the new employee:",
              },
              {
                type: "input",
                name: "lastName",
                message: "Please enter the LAST NAME of the new employee:",
              },
              {
                type: "list",
                name: "empRole",
                message: "Please select the ROLE of the new employee:",
                choices: arrRolesChoices,
              },
              {
                type: "list",
                message: "Please select a MANAGER for the new employee:",
                name: "empManager",
                choices: arrManagerChoices,
              },
            ])
            .then((data) => {
              let role_id;
              let manager_id;
              const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);`;
  
              for (let i = 0; i < rolesSelectAll.length; i++) {
                if (rolesSelectAll[i].title === data.empRole) {
                  role_id = rolesSelectAll[i].id;
                }
              }
  
              for (let i = 0; i < fNamesAll.length; i++) {
                if (fNamesAll[i].full_name === data.empManager) {
                  manager_id = fNamesAll[i].id;
                }
              }
  
              const params = [data.firstName, data.lastName, role_id, manager_id];
  
              db.query(sql, params, (err, rows) => {
                if (err) {
                  console.log(err);
                  return;
                }
                console.log(
                  `Added ${data.firstName} ${data.lastName} to the database.\n`
                );
                viewEmployees();
              });
            });
        }
      );
    });
  };
  
  // Update Employee
  const updateEmployee = () => {
    
    db.query(`SELECT * FROM roles;`, (err, rolesSelectAll) => {
      if (err) {
        console.log(err);
        return;
      }
      let arrRolesChoices = [];
      rolesSelectAll.forEach((item) => {
        arrRolesChoices.push(item.title);
      });
      
      db.query(
        `SELECT id, CONCAT(first_name, ' ', last_name) AS full_name
            FROM employee;`,
        (err, fNamesAll) => {
          if (err) {
            console.log(err);
            return;
          }
          let arrNameChoices = [];
          fNamesAll.forEach((item) => {
            arrNameChoices.push(item.full_name);
          });
          inquirer
            .prompt([
              {
                type: "list",
                name: "empNameSelect",
                message: "Please select the NAME of the employee to update:",
                choices: arrNameChoices,
              },
              {
                type: "list",
                name: "empRoleSelect",
                message: "Please select the new ROLE for this employee:",
                choices: arrRolesChoices,
              },
              {
                type: "list",
                name: "empManagerSelect",
                message: "Please select the new MANAGER for this employee:",
                choices: arrNameChoices,
              },
            ])
            .then((data) => {
              let role_id;
              let manager_id;
              let id;

              const sql = `UPDATE employee SET role_id = ?, manager_id = ? WHERE id = ?;`;
  
              for (let i = 0; i < rolesSelectAll.length; i++) {
                if (rolesSelectAll[i].title === data.empRoleSelect) {
                  role_id = rolesSelectAll[i].id;
                }
              }
  
              for (let i = 0; i < fNamesAll.length; i++) {
                if (fNamesAll[i].full_name === data.empManagerSelect) {
                  manager_id = fNamesAll[i].id;
                }
              }
  
              for (let i = 0; i < fNamesAll.length; i++) {
                if (fNamesAll[i].full_name === data.empNameSelect) {
                  id = fNamesAll[i].id;
                }
              }
  
              const params = [role_id, manager_id, id];
  
              db.query(sql, params, (err, rows) => {
                if (err) {
                  console.log(err);
                  return;
                }
                console.log(
                  `\nDone! ${data.empNameSelect} is now ${data.empRoleSelect}, reporting to ${data.empManagerSelect}.\n`
                );
                viewEmployees();
              });
            });
        }
      );
    });
  };
  
  // Total salary bonus
  const viewTotalSalary = async () => {
    try {
      // Query DB to get SUM salary GROUPED by Dept
      const totalSalary = await db.promise().query(`
      SELECT department.dept_name AS 'Department', SUM(roles.salary) AS 'Total Salary'
      FROM employee JOIN roles ON role_id = roles.id
      JOIN department ON roles.department_id = department.id
      GROUP BY department.dept_name ORDER BY 'Salary' DESC;
    `);
  
      console.table("\n", totalSalary[0]);
  
      firstPrompt();
    } catch (err) {
      console.log(err);
    }
  };
  // Prompts for user input
  const firstPrompt = () => {
    console.log("\n");
    inquirer
      .prompt([
        {
          type: "list",
          message: "Main Menu: What would you like to do?",
          name: "firstChoice",
          choices: [
            "View All Departments",
            "View All Roles",
            "View All Employees",
            "Add a Department",
            "Add a Role",
            "Add an Employee",
            "Update an Employee Role",
            "View Total Salary by Department"
          ],
        },
      ])
      .then((data) => {
        switch (data.firstChoice) {
          case "View All Departments":
            viewDepartments();
            break;
          case "View All Roles":
            viewRoles();
            break;
          case "View All Employees":
            viewEmployees();
            break;
          case "Add a Department":
            addDepartment();
            break;
          case "Add a Role":
            addRole();
            break;
          case "Add an Employee":
            addEmployee();
            break;
          case "Update an Employee Role & Manager":
            updateEmployee();
            break;
          case "View Employees by Manager":
            viewEmpByManager();
            break;
          case "View Employees by Department":
            viewEmpByDepartment();
            break;
          case "View Total Salary by Department":
            viewTotalSalary();
            break;
          case "Quit":
            process.exit(0);
        }
      });
  };
  
  const init = () => firstPrompt();
  
  init();