# Task Breakdown: Team Skills Directory

> Spec: [spec.json](./spec.json)
> Plan: [plan.md](./plan.md)
> Status: Ready for Implementation

## Prerequisites

- [ ] Confirm you are on branch `feature/3-demo-specdriven-build-of-a-lig`
- [ ] `npm install` has been run and `better-sqlite3` native bindings are compiled

## Phase 1: Database Layer

### Task 1.1: Add employee_skills table DDL
- **File(s):** `src/db.js`
- **Description:** Add `CREATE TABLE IF NOT EXISTS employee_skills` DDL inside the existing `db.exec(...)` block (after the `employees` table). Schema: `employee_id INTEGER PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE`, `skills TEXT NOT NULL`, `updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`.
- **Depends on:** None
- **Parallel:** No

### Task 1.2: Add DB skill prepared statements and functions
- **File(s):** `src/db.js`
- **Description:** Below the existing prepared statements, add three new prepared statements and three exported functions:
  - `listEmployeesWithSkillsStatement` — LEFT JOIN `employees` with `employee_skills`, accept optional `name` (LIKE) and `title` (exact) filter params; returns `id, name, title, skills`.
  - `getEmployeeSkillsStatement` — SELECT skills for a single `employee_id`.
  - `upsertEmployeeSkillsStatement` — INSERT OR REPLACE into `employee_skills`.
  - Export `listEmployeesWithSkills(nameFilter, titleFilter)`, `getEmployeeSkills(employeeId)`, `upsertEmployeeSkills(employeeId, skills)`.
- **Depends on:** Task 1.1
- **Parallel:** No

## Phase 2: Rendering

### Task 2.1: Add Team Skills nav link to renderDashboard [P]
- **File(s):** `src/render.js`
- **Description:** In `renderDashboard`, locate the topbar/header section and add `<a href="/skills" class="nav-link">Team Skills →</a>` so users can navigate from the main payroll dashboard to the skills directory. Add `class="nav-link"` to the anchor only; do not alter any other topbar elements.
- **Depends on:** None
- **Parallel:** Yes (can run with Task 3.1)

### Task 2.2: Add renderSkillsPage function
- **File(s):** `src/render.js`
- **Description:** Create and export `renderSkillsPage({ employees, titles, message, nameFilter, titleFilter })`. The rendered HTML must include:
  - A page heading and nav link back to `/` (dashboard).
  - A search `<input name="name">` pre-filled with `nameFilter`.
  - A `<select name="title">` with an "All titles" default option and one option per unique title, with `titleFilter` pre-selected.
  - A submit button for the filter form (`GET /skills`).
  - An employee table/list with columns: Name, Title, Skills (rendered via `escapeHtml`; comma-separated tags or plain text), and an "Update Skills" button that expands or links to the update form.
  - An update form per employee (or a single shared form): `POST /employees/:id/skills` with a `<textarea name="skills">` pre-filled with existing skills and a submit button.
  - An empty-state message ("No employees match your filters.") when `employees` is empty.
  - Flash message display if `message` is present (reuse the existing message pattern from `renderDashboard`).
  - All dynamic values pass through `escapeHtml`.
- **Depends on:** Task 2.1
- **Parallel:** No

## Phase 3: Styles

### Task 3.1: Add CSS styles for the skills page [P]
- **File(s):** `src/public/styles.css`
- **Description:** Append the following rule groups to the end of `styles.css`:
  - `.nav-link` — styled anchor consistent with the topbar (e.g., colour, hover underline).
  - `.filter-bar` — flex row with gap for the search/title filter form controls.
  - `.skill-tag` — inline-block pill badge for displaying individual skills.
  - `.skills-cell` — table cell or div wrapper for the skill tag list.
  - `.skills-form` — compact form style for the inline update textarea and button.
- **Depends on:** None
- **Parallel:** Yes (can run with Task 2.1)

## Phase 4: Route Handlers

### Task 4.1: Add GET /skills route
- **File(s):** `src/server.js`
- **Description:** Import `listEmployeesWithSkills` from `./db`. Add a `GET /skills` handler that:
  1. Reads `req.query.name` and `req.query.title` (default to empty strings).
  2. Calls `listEmployeesWithSkills(nameFilter, titleFilter)`.
  3. Derives the unique sorted list of titles for the dropdown from the full (unfiltered) employee list, or queries separately.
  4. Reads `req.query.message` for flash messages.
  5. Returns `res.send(renderSkillsPage({ employees, titles, message, nameFilter, titleFilter }))`.
- **Depends on:** Task 1.2, Task 2.2
- **Parallel:** No

### Task 4.2: Add POST /employees/:id/skills route [P]
- **File(s):** `src/server.js`
- **Description:** Import `upsertEmployeeSkills` and `employeeExists` from `./db`. Add a `POST /employees/:id/skills` handler that:
  1. Parses `req.params.id` as integer.
  2. Validates that `employeeExists(id)` is true; if not, redirects to `/skills?message=Employee+not+found` (error).
  3. Reads `req.body.skills`; if missing or blank after trim, redirects to `/skills?message=Skills+field+is+required` (error).
  4. Calls `upsertEmployeeSkills(id, skills.trim())`.
  5. Redirects to `/skills?message=Skills+updated+successfully`.
- **Depends on:** Task 1.2
- **Parallel:** Yes (can run with Task 4.1)

## Phase 5: Integration & Testing

### Task 5.1: Smoke test GET /skills and nav link
- **Description:** Start the server with `PORT=13001 node src/server.js`. Run:
  - `curl -s http://127.0.0.1:13001/skills | grep -i "sophia"` — confirms employees appear.
  - `curl -s http://127.0.0.1:13001/ | grep -i "Team Skills"` — confirms nav link exists on dashboard.
  - Confirm HTTP 200 for both endpoints.
- **Depends on:** Task 4.1, Task 2.1
- **Parallel:** No

### Task 5.2: Smoke test POST /employees/:id/skills (happy path)
- **Description:** POST valid skills to employee ID 1:
  ```bash
  curl -s -X POST http://127.0.0.1:13001/employees/1/skills \
    -d "skills=Leadership,Strategy,Communication" \
    -L | grep -i "Leadership"
  ```
  Confirm the redirect lands on `/skills` and the updated skills are visible.
- **Depends on:** Task 5.1
- **Parallel:** No

### Task 5.3: Test input validation [P]
- **Description:** Run two error-case requests:
  1. Empty skills: `curl -s -X POST http://127.0.0.1:13001/employees/1/skills -d "skills=" -L | grep -i "required"` — confirm error message.
  2. Non-existent employee: `curl -s -X POST http://127.0.0.1:13001/employees/9999/skills -d "skills=test" -L | grep -i "not found"` — confirm error message.
- **Depends on:** Task 5.1
- **Parallel:** Yes (can run with Task 5.2)

### Task 5.4: Test server-side filtering [P]
- **Description:** Verify query-param filtering:
  - `curl -s "http://127.0.0.1:13001/skills?name=Sophia"` — response contains Sophia Carter, does not contain Marcus.
  - `curl -s "http://127.0.0.1:13001/skills?title=Payroll+Specialist"` — response contains Daniel Kim only.
  - `curl -s "http://127.0.0.1:13001/skills?name=zzz"` — response contains empty-state message.
- **Depends on:** Task 5.1
- **Parallel:** Yes (can run with Task 5.2)

## Checkpoints

- [ ] After Phase 1: `node -e "require('./src/db.js'); console.log('DB OK')"` runs without error and `employee_skills` table exists in SQLite.
- [ ] After Phase 2–3: `renderSkillsPage` renders valid HTML with no thrown exceptions; nav link is present in dashboard HTML.
- [ ] After Phase 4: `GET /skills` returns 200; `POST /employees/1/skills` redirects to `/skills` with success message.
- [ ] After Phase 5: All smoke tests pass; filtering works correctly; validation rejects bad input.
