const express = require('express');
const path = require('path');
const {
  listEmployees,
  getSummary,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  employeeExists,
} = require('./db');
const { renderDashboard } = require('./render');

const app = express();
const port = Number.parseInt(process.env.PORT || '3000', 10);

app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static(path.join(__dirname, 'public')));

function redirectWithMessage(res, message) {
  res.redirect(`/?message=${encodeURIComponent(message)}`);
}

function parseId(value) {
  const id = Number.parseInt(String(value), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseEmployeeInput(body, employeeId = null) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const homeAddress = typeof body.homeAddress === 'string' ? body.homeAddress.trim() : '';
  const salary = Number.parseInt(String(body.salary || ''), 10);
  const managerId = body.managerId ? parseId(body.managerId) : null;

  if (!name) {
    throw new Error('Employee name is required.');
  }

  if (!title) {
    throw new Error('Employee title is required.');
  }

  if (!homeAddress) {
    throw new Error('Home address is required.');
  }

  if (!Number.isInteger(salary) || salary < 0) {
    throw new Error('Salary must be a whole number greater than or equal to 0.');
  }

  if (managerId !== null && !employeeExists(managerId)) {
    throw new Error('Selected manager could not be found.');
  }

  if (employeeId !== null && managerId === employeeId) {
    throw new Error('An employee cannot report to themselves.');
  }

  return {
    name,
    title,
    salary,
    homeAddress,
    managerId,
  };
}

app.get('/', (req, res) => {
  const message = typeof req.query.message === 'string' ? req.query.message : '';
  const employees = listEmployees();
  const summary = getSummary();

  res.type('html').send(renderDashboard({ employees, summary, message }));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    employeeCount: listEmployees().length,
  });
});

app.get('/api/employees', (req, res) => {
  res.json({
    employees: listEmployees(),
    summary: getSummary(),
  });
});

app.post('/employees', (req, res) => {
  try {
    const employee = parseEmployeeInput(req.body);
    createEmployee(employee);
    redirectWithMessage(res, `${employee.name} added to payroll.`);
  } catch (error) {
    redirectWithMessage(res, error.message || 'Unable to add employee.');
  }
});

app.post('/employees/:id/update', (req, res) => {
  const employeeId = parseId(req.params.id);

  if (!employeeId || !employeeExists(employeeId)) {
    return redirectWithMessage(res, 'Employee record could not be found.');
  }

  try {
    const employee = parseEmployeeInput(req.body, employeeId);
    updateEmployee(employeeId, employee);
    return redirectWithMessage(res, `${employee.name}'s profile was updated.`);
  } catch (error) {
    return redirectWithMessage(res, error.message || 'Unable to update employee.');
  }
});

app.post('/employees/:id/delete', (req, res) => {
  const employeeId = parseId(req.params.id);

  if (!employeeId || !employeeExists(employeeId)) {
    return redirectWithMessage(res, 'Employee record could not be found.');
  }

  const removedEmployee = deleteEmployee(employeeId);
  return redirectWithMessage(res, `${removedEmployee.name} was removed from payroll.`);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Payroll app running at http://localhost:${port}`);
  });
}

module.exports = app;
