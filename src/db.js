const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDirectory = path.join(__dirname, '..', 'data');
const databasePath = path.join(dataDirectory, 'payroll.sqlite');

fs.mkdirSync(dataDirectory, { recursive: true });

const db = new Database(databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    salary INTEGER NOT NULL CHECK (salary >= 0),
    home_address TEXT NOT NULL,
    manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const seedEmployees = [
  {
    name: 'Sophia Carter',
    title: 'Chief Executive Officer',
    salary: 245000,
    homeAddress: '18 Westbridge Lane, Chicago, IL 60601',
    managerId: null,
  },
  {
    name: 'Marcus Chen',
    title: 'Director of Finance',
    salary: 182000,
    homeAddress: '404 North Harbor Drive, Chicago, IL 60611',
    managerId: 1,
  },
  {
    name: 'Elena Rodriguez',
    title: 'People Operations Manager',
    salary: 154000,
    homeAddress: '2218 North Damen Avenue, Chicago, IL 60647',
    managerId: 1,
  },
  {
    name: 'Priya Patel',
    title: 'Senior Accountant',
    salary: 118000,
    homeAddress: '76 Greenview Terrace, Evanston, IL 60201',
    managerId: 2,
  },
  {
    name: 'Daniel Kim',
    title: 'Payroll Specialist',
    salary: 98000,
    homeAddress: '512 Lakeshore Circle, Oak Park, IL 60302',
    managerId: 2,
  },
  {
    name: 'Nina Brooks',
    title: 'HR Generalist',
    salary: 92000,
    homeAddress: '10 Maple Court, Naperville, IL 60540',
    managerId: 3,
  },
];

const countEmployeesStatement = db.prepare('SELECT COUNT(*) AS count FROM employees');
const insertEmployeeStatement = db.prepare(`
  INSERT INTO employees (name, title, salary, home_address, manager_id)
  VALUES (@name, @title, @salary, @homeAddress, @managerId)
`);

if (countEmployeesStatement.get().count === 0) {
  const seed = db.transaction(() => {
    for (const employee of seedEmployees) {
      insertEmployeeStatement.run(employee);
    }
  });

  seed();
}

const listEmployeesStatement = db.prepare(`
  SELECT
    employee.id,
    employee.name,
    employee.title,
    employee.salary,
    employee.home_address AS homeAddress,
    employee.manager_id AS managerId,
    manager.name AS managerName,
    employee.updated_at AS updatedAt
  FROM employees AS employee
  LEFT JOIN employees AS manager ON manager.id = employee.manager_id
  ORDER BY employee.name COLLATE NOCASE
`);

const summaryStatement = db.prepare(`
  SELECT
    COUNT(*) AS headcount,
    COALESCE(SUM(salary), 0) AS totalPayroll,
    COALESCE(ROUND(AVG(salary), 0), 0) AS averageSalary,
    COALESCE((SELECT COUNT(DISTINCT manager_id) FROM employees WHERE manager_id IS NOT NULL), 0) AS managerCount
  FROM employees
`);

const employeeExistsStatement = db.prepare('SELECT 1 FROM employees WHERE id = ?');
const createEmployeeStatement = insertEmployeeStatement;
const updateEmployeeStatement = db.prepare(`
  UPDATE employees
  SET
    name = @name,
    title = @title,
    salary = @salary,
    home_address = @homeAddress,
    manager_id = @managerId,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = @id
`);
const deleteEmployeeStatement = db.prepare('DELETE FROM employees WHERE id = ?');
const getEmployeeStatement = db.prepare(`
  SELECT id, name, title, salary, home_address AS homeAddress, manager_id AS managerId
  FROM employees
  WHERE id = ?
`);

function listEmployees() {
  return listEmployeesStatement.all();
}

function getSummary() {
  return summaryStatement.get();
}

function employeeExists(id) {
  return Boolean(employeeExistsStatement.get(id));
}

function createEmployee(employee) {
  return createEmployeeStatement.run(employee);
}

function updateEmployee(id, employee) {
  return updateEmployeeStatement.run({ id, ...employee });
}

function deleteEmployee(id) {
  const employee = getEmployeeStatement.get(id);

  if (!employee) {
    return null;
  }

  deleteEmployeeStatement.run(id);
  return employee;
}

module.exports = {
  listEmployees,
  getSummary,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  employeeExists,
};
