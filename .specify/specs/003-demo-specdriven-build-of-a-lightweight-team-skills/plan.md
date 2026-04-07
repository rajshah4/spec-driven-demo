# Implementation Plan: Team Skills Directory

> Spec: [spec.json](./spec.json)
> Status: Draft

## Technical Approach

Extend the existing Express + SQLite payroll app with a Team Skills Directory page by following the established patterns exactly: new prepared-statement functions in `db.js`, new server-side rendered HTML in `render.js`, new Express routes in `server.js`, and CSS additions to `styles.css`. Skills are stored in a new `employee_skills` table (one row per employee, comma-separated skills text). Search and title filtering are applied server-side via query parameters, consistent with the app's existing approach. The update form replaces all skills for an employee (simpler for demo scope).

## Technology Stack

- **Framework:** Express 4 (existing)
- **Database:** SQLite via `better-sqlite3` (existing)
- **Templating:** Server-side string templates (existing `render.js` pattern)
- **Patterns:** Prepared statements, `redirectWithMessage`, `escapeHtml`, query-param filters

## Architecture

### Components

1. **`employee_skills` table** – New SQLite table linking to `employees(id)` with a `skills TEXT` column (comma-separated). One row per employee, upserted on update.
2. **DB skill functions** – `listEmployeesWithSkills(nameFilter, titleFilter)`, `getEmployeeSkills(employeeId)`, `upsertEmployeeSkills(employeeId, skills)` added to `src/db.js`.
3. **`renderSkillsPage`** – New render function in `src/render.js` producing the `/skills` HTML page with search input, title dropdown, employee rows, and the update form.
4. **Nav link** – A "Team Skills" anchor added to the topbar in `renderDashboard` so the directory is discoverable from the main dashboard.
5. **Routes** – `GET /skills` and `POST /employees/:id/skills` added to `src/server.js`.
6. **CSS additions** – Skill tag, filter bar, and skills form styles appended to `src/public/styles.css`.

### Data Model

```sql
CREATE TABLE IF NOT EXISTS employee_skills (
  employee_id INTEGER PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
  skills      TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

`employee_id` is the primary key (one skills record per employee). `skills` stores a comma-separated string (e.g. `"SQLite, Express, Node.js"`). `ON DELETE CASCADE` keeps the table clean when an employee is removed.

### API Contracts

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/skills` | Skills directory page. Accepts `?name=` and `?title=` query params for filtering. Returns 200 HTML. |
| `POST` | `/employees/:id/skills` | Replace skill list for employee `:id`. Body field: `skills` (string). Redirects to `/skills` with success or error message on completion. |

## File Changes

### New Files

_(none — all changes extend existing files)_

### Modified Files

- `src/db.js` – Add `employee_skills` table DDL (in `db.exec`), three prepared statements, and three exported functions: `listEmployeesWithSkills`, `getEmployeeSkills`, `upsertEmployeeSkills`.
- `src/server.js` – Import new DB functions; add `GET /skills` route handler with query-param parsing; add `POST /employees/:id/skills` route handler with input validation; update `redirectWithMessage` target for skills updates to redirect to `/skills`.
- `src/render.js` – Add `renderSkillsPage({ employees, titles, message, nameFilter, titleFilter })` function; add a "Team Skills" nav link to the topbar in `renderDashboard`; export `renderSkillsPage`.
- `src/public/styles.css` – Add `.nav-link`, `.filter-bar`, `.skill-tag`, `.skills-cell`, and `.skills-form` styles.

## Integration Points

- **`src/db.js` ↔ `src/server.js`**: `listEmployeesWithSkills`, `getEmployeeSkills`, and `upsertEmployeeSkills` are imported alongside the existing employee DB functions.
- **`src/render.js` ↔ `src/server.js`**: `renderSkillsPage` is imported and called in the `GET /skills` handler, matching how `renderDashboard` is used today.
- **`renderDashboard` nav link**: A single anchor `<a href="/skills" class="nav-link">Team Skills →</a>` is added to the topbar section; no structural changes to the existing dashboard layout.
- **`employee_skills` FK**: References `employees(id)` with `ON DELETE CASCADE`. The existing `foreign_keys = ON` pragma already enforces this.
- **Redirect target for skill updates**: `POST /employees/:id/skills` redirects to `/skills?message=...` (rather than `/`) so the user returns to the skills page after submitting.

## Testing Strategy

- **Smoke test GET /skills**: Confirm the endpoint returns 200 and includes employee names from the seeded data.
- **Smoke test POST /employees/:id/skills**: Submit valid skills for employee ID 1; confirm redirect and that skills appear on `/skills`.
- **Validation – empty skills**: POST with empty `skills` field; confirm redirect includes an error message and no DB write occurs.
- **Validation – invalid ID**: POST to `/employees/9999/skills`; confirm redirect includes an error message.
- **Filter by name**: GET `/skills?name=Sophia`; confirm only matching employees appear.
- **Filter by title**: GET `/skills?title=Payroll+Specialist`; confirm only matching employees appear.
- **Persistence**: Verify skills survive a server restart (SQLite persistence check via `/api/employees` or direct DB query).
- **Dashboard link**: Confirm the topbar of `GET /` includes a link pointing to `/skills`.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Comma in skill names breaks comma-split display | Trim and filter empty segments; document that commas delimit skills in form placeholder text |
| XSS via skills input | All rendered values pass through existing `escapeHtml` utility |
| `employee_skills` table DDL runs after seeding check | Table creation is idempotent (`CREATE TABLE IF NOT EXISTS`); seeding guard in `db.js` only applies to the `employees` table |
| SQLite FK violation if employee deleted before skills | `ON DELETE CASCADE` handles cleanup automatically |
| `/skills?title=` filter with special characters | Use parameterized LIKE queries; Express URL-decodes query params automatically |

## Dependencies

- No new npm packages required.
- Relies on existing `better-sqlite3`, `express`, and `escapeHtml` utility already in the codebase.
- `foreign_keys = ON` pragma already set in `db.js`.
