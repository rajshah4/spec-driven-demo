const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderManagerOptions(employees, selectedManagerId = null, excludeId = null) {
  const options = ['<option value="">No manager</option>'];

  for (const employee of employees) {
    if (employee.id === excludeId) {
      continue;
    }

    const selected = employee.id === selectedManagerId ? ' selected' : '';
    options.push(
      `<option value="${employee.id}"${selected}>${escapeHtml(employee.name)} · ${escapeHtml(employee.title)}</option>`
    );
  }

  return options.join('');
}

function renderEmployeeRows(employees) {
  return employees
    .map(
      (employee) => `
        <tr>
          <td>
            <div class="employee-primary">
              <strong>${escapeHtml(employee.name)}</strong>
              <span>#EMP-${String(employee.id).padStart(3, '0')}</span>
            </div>
          </td>
          <td>${escapeHtml(employee.title)}</td>
          <td>${currencyFormatter.format(employee.salary)}</td>
          <td>${employee.managerName ? escapeHtml(employee.managerName) : '<span class="muted">Unassigned</span>'}</td>
          <td>${escapeHtml(employee.homeAddress)}</td>
        </tr>
      `
    )
    .join('');
}

function renderEmployeeCards(employees) {
  return employees
    .map(
      (employee) => `
        <details class="employee-card">
          <summary>
            <div>
              <h3>${escapeHtml(employee.name)}</h3>
              <p>${escapeHtml(employee.title)}</p>
            </div>
            <div class="employee-card-meta">
              <span>${currencyFormatter.format(employee.salary)}</span>
              <span>${employee.managerName ? `Manager: ${escapeHtml(employee.managerName)}` : 'No manager assigned'}</span>
            </div>
          </summary>
          <form method="post" action="/employees/${employee.id}/update" class="employee-form">
            <div class="form-grid">
              <label>
                <span>Full name</span>
                <input type="text" name="name" value="${escapeHtml(employee.name)}" required />
              </label>
              <label>
                <span>Title</span>
                <input type="text" name="title" value="${escapeHtml(employee.title)}" required />
              </label>
              <label>
                <span>Annual salary</span>
                <input type="number" name="salary" min="0" step="1000" value="${employee.salary}" required />
              </label>
              <label>
                <span>Manager</span>
                <select name="managerId">
                  ${renderManagerOptions(employees, employee.managerId, employee.id)}
                </select>
              </label>
              <label class="full-width">
                <span>Home address</span>
                <input type="text" name="homeAddress" value="${escapeHtml(employee.homeAddress)}" required />
              </label>
            </div>
            <div class="form-actions">
              <button type="submit" class="button button-primary">Save changes</button>
            </div>
          </form>
          <form method="post" action="/employees/${employee.id}/delete" class="delete-form">
            <button type="submit" class="button button-danger" onclick="return confirm('Remove ${escapeHtml(employee.name)} from payroll?');">
              Remove employee
            </button>
          </form>
        </details>
      `
    )
    .join('');
}

function renderDashboard({ employees, summary, message }) {
  const individualContributors = summary.headcount - summary.managerCount;

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payroll Command Center</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="/static/styles.css" />
    </head>
    <body>
      <div class="app-shell">
        <header class="topbar">
          <div>
            <p class="eyebrow">Enterprise Payroll</p>
            <h1>Payroll Command Center</h1>
            <p class="subtle">Maintain employee compensation, reporting lines, and contact details from a single internal dashboard.</p>
          </div>
          <div class="topbar-badge">${summary.headcount} active records</div>
        </header>

        ${message ? `<div class="banner">${escapeHtml(message)}</div>` : ''}

        <section class="stats-grid">
          <article class="stat-card">
            <span>Headcount</span>
            <strong>${summary.headcount}</strong>
            <small>Current employee roster</small>
          </article>
          <article class="stat-card">
            <span>Annual payroll</span>
            <strong>${currencyFormatter.format(summary.totalPayroll)}</strong>
            <small>Total compensation on file</small>
          </article>
          <article class="stat-card">
            <span>Average salary</span>
            <strong>${currencyFormatter.format(summary.averageSalary)}</strong>
            <small>Average base salary</small>
          </article>
          <article class="stat-card">
            <span>Individual contributors</span>
            <strong>${individualContributors}</strong>
            <small>Employees without direct reports</small>
          </article>
        </section>

        <div class="workspace-grid">
          <aside class="panel sticky-panel">
            <div class="panel-heading">
              <div>
                <p class="eyebrow">Add employee</p>
                <h2>New payroll profile</h2>
              </div>
            </div>
            <form method="post" action="/employees" class="employee-form">
              <div class="form-grid single-column">
                <label>
                  <span>Full name</span>
                  <input type="text" name="name" placeholder="Jordan Lee" required />
                </label>
                <label>
                  <span>Title</span>
                  <input type="text" name="title" placeholder="Compensation Analyst" required />
                </label>
                <label>
                  <span>Annual salary</span>
                  <input type="number" name="salary" min="0" step="1000" placeholder="85000" required />
                </label>
                <label>
                  <span>Manager</span>
                  <select name="managerId">
                    ${renderManagerOptions(employees)}
                  </select>
                </label>
                <label>
                  <span>Home address</span>
                  <input type="text" name="homeAddress" placeholder="123 Market Street, Chicago, IL 60606" required />
                </label>
              </div>
              <div class="form-actions">
                <button type="submit" class="button button-primary button-block">Add employee</button>
              </div>
            </form>
          </aside>

          <main class="dashboard-content">
            <section class="panel">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">Roster</p>
                  <h2>Employee directory</h2>
                </div>
              </div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Title</th>
                      <th>Salary</th>
                      <th>Manager</th>
                      <th>Home address</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${renderEmployeeRows(employees)}
                  </tbody>
                </table>
              </div>
            </section>

            <section class="panel">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">Manage profiles</p>
                  <h2>Edit employee records</h2>
                </div>
                <p class="subtle">Expand a card to update salary, title, address, manager, or remove the employee from payroll.</p>
              </div>
              <div class="cards-grid">
                ${renderEmployeeCards(employees)}
              </div>
            </section>
          </main>
        </div>
      </div>
    </body>
  </html>`;
}

module.exports = {
  renderDashboard,
};
