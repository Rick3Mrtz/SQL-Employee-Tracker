USE employees_db;

INSERT INTO department (dept_name) 
VALUES ("Sales"),
    ("Engineering"),
    ("Finance"),
    ("Marketing");

INSERT INTO roles (title, department_id, salary)
VALUES ("Sales Manager", 1, 90000),
    ("Sales Rep", 1, 70000),
    ("Project Manager", 2, 160000),
    ("Software Engineer", 2, 115000),
    ("Lead CPA", 3, 120000),
    ("Accountant", 3, 95000),
    ("Market Rep", 4, 75000),
       

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("Tony", "Stark", 1, NULL),
    ("Steve", "Rodgers", 2, 1),
    ("Tim", "Jackson", 3, NULL),
    ("Christian", "Umphries", 4, NULL),
    ("Star", "Lord", 5, 5),
    ("Baby", "Groot", 6, 7)
