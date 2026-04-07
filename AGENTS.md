# Repository Memory

## Workflow overview
- GitHub Actions workflow: `.github/workflows/openhands-agent.yml`
- Event router: `.github/openhands/runner.py`
- Step skills: `.agents/skills/{specify,plan,tasks,implement}/SKILL.md`

## Comment behavior
- The runner posts a fresh step-started acknowledgement comment for issue-opened and label-triggered steps in the format: OK, working on `{step_name}`. [Track my progress here]({conversation_url}).
- User-facing step names are `spec`, `plan`, `task`, and `implement`.
- Step completion details should be posted as new issue comments from the skill instructions; the workflow no longer relies on updating a previous tracking comment.

## Verification
- `python -m py_compile .github/openhands/runner.py`
- `npm install`
- `npm run validate:openspec`
- `PORT=13001 npm start`
- `curl http://127.0.0.1:13001/health`
- `curl http://127.0.0.1:13001/api/employees`

## OpenSpec migration notes
- Structured spec artifacts now live at `.specify/specs/<issue-slug>/spec.json`.
- OpenSpec schema file: `.specify/schema/spec.schema.json`.
- OpenSpec validation script: `scripts/validate-openspec.js`.
- Validation workflow: `.github/workflows/validate-openspec.yml`.
- Run local validation with `npm run validate:openspec`.
- Port `12001` may already be in use in this environment; use `13001` for isolated local demos.


## Payroll app example
- Express + SQLite payroll dashboard lives in `src/`.
- Entry point: `src/server.js`.
- Database module: `src/db.js`, storing local data in `data/payroll.sqlite`.
- Renderer and styling: `src/render.js` and `src/public/styles.css`.
- The database seeds 6 employee records on first run.

## Local demo run notes
- First `npm install` compiles `better-sqlite3` native bindings on macOS and can take ~20s.
- If startup checks fail immediately after install, ensure install has fully completed before launching `node src/server.js`.
- Verified local smoke test commands:
  - `PORT=12001 node src/server.js`
  - `curl http://127.0.0.1:12001/health` returns `{"status":"ok","employeeCount":6}` on fresh DB.
  - `curl http://127.0.0.1:12001/api/employees` returns seeded employees and payroll summary.
- Verified CRUD flow works via form endpoints:
  - `POST /employees` creates an employee and redirects with success message.
  - `POST /employees/:id/update` updates fields and redirects with success message.
  - `POST /employees/:id/delete` removes employee and redirects with success message.
- Runtime DB files are created under `data/` and are gitignored (`*.sqlite`, `*.sqlite-shm`, `*.sqlite-wal`).

