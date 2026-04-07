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

function redirectWithMessage(res, message, queryParams = {}) {
  const params = new URLSearchParams({ message });
  
  if (queryParams.filterName) params.set('filterName', queryParams.filterName);
  if (queryParams.filterTitle) params.set('filterTitle', queryParams.filterTitle);
  if (queryParams.minSalary) params.set('minSalary', queryParams.minSalary);
  if (queryParams.maxSalary) params.set('maxSalary', queryParams.maxSalary);
  
  res.redirect(`/?${params.toString()}`);
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
  
  const filters = {
    filterName: typeof req.query.filterName === 'string' ? req.query.filterName : '',
    filterTitle: typeof req.query.filterTitle === 'string' ? req.query.filterTitle : '',
    minSalary: typeof req.query.minSalary === 'string' ? req.query.minSalary : '',
    maxSalary: typeof req.query.maxSalary === 'string' ? req.query.maxSalary : ''
  };

  res.type('html').send(renderDashboard({ employees, summary, message, filters }));
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
    redirectWithMessage(res, `${employee.name} added to payroll.`, req.query);
  } catch (error) {
    redirectWithMessage(res, error.message || 'Unable to add employee.', req.query);
  }
});

app.post('/employees/:id/update', (req, res) => {
  const employeeId = parseId(req.params.id);

  if (!employeeId || !employeeExists(employeeId)) {
    return redirectWithMessage(res, 'Employee record could not be found.', req.query);
  }

  try {
    const employee = parseEmployeeInput(req.body, employeeId);
    updateEmployee(employeeId, employee);
    return redirectWithMessage(res, `${employee.name}'s profile was updated.`, req.query);
  } catch (error) {
    return redirectWithMessage(res, error.message || 'Unable to update employee.', req.query);
  }
});

app.post('/employees/:id/delete', (req, res) => {
  const employeeId = parseId(req.params.id);

  if (!employeeId || !employeeExists(employeeId)) {
    return redirectWithMessage(res, 'Employee record could not be found.', req.query);
  }

  const removedEmployee = deleteEmployee(employeeId);
  return redirectWithMessage(res, `${removedEmployee.name} was removed from payroll.`, req.query);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Payroll app running at http://localhost:${port}`);
  });
}

module.exports = app;
