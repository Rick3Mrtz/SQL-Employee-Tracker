USE employees_db;

-- View All Departments
SELECT * FROM department;


-- SELECT id, dept_name AS "Department" FROM department
-- ORDER BY dept_name;

-- View All Roles
SELECT  
    roles.title AS "Title", 
    roles.id AS "Role ID",
    department.dept_name AS "Department", 
    roles.salary AS "Salary"
FROM roles
JOIN department ON roles.department_id = department.id;

-- View All Employees
-- Should see id, fName, lName, Title, Department, Salary, Manager NAME
-- Using SELF JOIN, the employees table is aliased as both 'a' and 'b'
SELECT a.id,
    a.first_name AS "First Name",
    a.last_name AS "Last Name",
    roles.title AS "Title",
    department.dept_name AS "Department",
    roles.salary AS "Salary",
    CONCAT(b.first_name, " ", b.last_name) AS "Manager"
FROM employee AS a
JOIN roles ON a.role_id = roles.id
JOIN department ON roles.department_id = department.id
LEFT OUTER JOIN employee AS b ON a.manager_id = b.id;


-- Add Department 
INSERT INTO department (dept_name) VALUES (?);

-- Add Role
INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?);

-- Add Employee
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);

-- Update Employee Role
UPDATE employee SET role_id = ? WHERE id = ?;

-- Update Managers
UPDATE employee SET manager_id = ? WHERE id = ?;

-- Update Employee Role
UPDATE employee SET role_id = ?, manager_id = ? WHERE id = ?;