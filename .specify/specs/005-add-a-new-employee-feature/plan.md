# Implementation Plan: Employee Directory Search

> Spec: [spec.json](./spec.json)
> Status: Draft

## Technical Approach

Implement a purely client-side, real-time search filter for the employee directory table using vanilla JavaScript. The search input will be rendered server-side inside `render.js` alongside the existing HTML template, and a small new JavaScript module (`src/public/search.js`) will handle all filtering logic in the browser. No new server routes, no API changes, and no page reloads are required.

Key design choices:
- **Data attributes on `<tr>` elements** (`data-name`, `data-title`) carry the searchable text, keeping filtering logic decoupled from DOM structure.
- **Vanilla JS only** — the project has zero frontend dependencies and should stay that way.
- **Separate JS file** (`src/public/search.js`) rather than inline `<script>` to keep `render.js` readable and avoid mixing concerns.
- **Single empty-state row** pre-rendered in the table body, shown/hidden by the JS module.
- **Result count element** in the panel heading updated on every keystroke.

## Technology Stack

- **Framework:** Express 4 (existing)
- **Database:** SQLite via better-sqlite3 (no changes)
- **Libraries:** None — vanilla JS for client-side filtering
- **Patterns:** Server-side template rendering (existing), progressive enhancement (search degrades gracefully if JS is disabled), data-attribute-driven DOM filtering

## Architecture

### Components

1. **Search Input (`render.js`)** — A `<label>` + `<input type="search">` block injected above the employee directory table inside the "Roster" panel. Includes placeholder text "Search by name or title…", an `id="employee-search"` for accessibility, and a visible result count `<span id="search-result-count">`.
2. **Data Attributes (`render.js` → `renderEmployeeRows`)** — Each `<tr>` gains `data-name` and `data-title` attributes holding the lowercased values so the JS filter can operate without repeated `toLowerCase()` calls.
3. **Empty-State Row (`render.js`)** — A hidden `<tr id="search-empty-state">` row containing a single `<td colspan="5">` "No employees match your search" message, toggled visible when all rows are filtered out.
4. **Client-side Filter Module (`src/public/search.js`)** — Attaches an `input` event listener to `#employee-search`; on each event it iterates over all `<tr[data-name]>` rows, shows/hides based on case-insensitive match against `data-name` or `data-title`, updates result count, and manages empty-state visibility. Uses `requestAnimationFrame` for lightweight debouncing to avoid excessive repaints on rapid keystrokes.
5. **Styles (`src/public/styles.css`)** — New `.search-wrap` layout block, `.search-input-wrap` with an optional clear-button affordance, `.employee-count` counter style, and `.search-empty-state` row style.

### Data Model

No database changes. Employee `name` and `title` data already available in the server-rendered HTML; the filter reads them from DOM data attributes.

### API Contracts

No new endpoints. The existing `GET /` route and `/api/employees` JSON endpoint are unchanged.

## File Changes

### New Files

- `src/public/search.js` — Client-side filter module: event binding, row show/hide, empty-state toggle, result count update.

### Modified Files

- `src/render.js` — Three targeted changes:
  1. `renderEmployeeRows()`: add `data-name` and `data-title` attributes to every `<tr>`.
  2. `renderDashboard()`: inject the search `<label>` + `<input>` block and result count `<span>` above the directory table; add the empty-state `<tr>`; add `<script src="/static/search.js">` before `</body>`.
- `src/public/styles.css` — Add styles for `.search-wrap`, `.search-result-count`, and `.search-empty-state`.

## Integration Points

- **Static file serving:** `search.js` is served via the existing `app.use('/static', express.static(...))` middleware — no server changes needed.
- **Rendered HTML contract:** The JS module queries `tbody tr[data-name]` and `#employee-search`; `renderEmployeeRows` must emit these attributes, and `renderDashboard` must include the input and the empty-state row.
- **CRUD operations:** Add/edit/delete forms POST to `/employees`, `/employees/:id/update`, and `/employees/:id/delete` — all redirect back to `GET /` which re-renders the full page. The search state is intentionally not preserved across reloads (per spec).

## Testing Strategy

The project currently has no test infrastructure. A lightweight Jest setup will be introduced alongside the feature implementation.

**Setup (new devDependencies):**
- `jest` — test runner
- `supertest` — HTTP integration testing for Express routes

**Test file:** `tests/search.test.js`

- **Unit — rendered HTML contains search elements:**
  - Render `renderDashboard()` with mock employee data and assert that `#employee-search` input is present.
  - Assert each `<tr>` in the rendered body contains `data-name` and `data-title` attributes.
  - Assert the empty-state row `#search-empty-state` is present.
  - Assert `<script src="/static/search.js">` is present in the output.

- **Integration — GET / endpoint:**
  - `GET /` returns 200 and HTML body containing the search input.
  - Existing CRUD routes (`POST /employees`, `POST /employees/:id/update`, `POST /employees/:id/delete`) still redirect correctly (regression guard).

**Note:** Client-side JS filtering logic is not unit-tested here (no browser environment); manual acceptance testing against the running app covers the interactive behavior per the spec's acceptance criteria.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `renderDashboard` template string is large; insertion mistakes break the HTML | Make surgical, targeted string replacements in known locations; test rendered output in unit tests |
| `search.js` loaded before DOM is ready | Place `<script>` tag at end of `<body>` (DOMContentLoaded not required) |
| Special characters in employee names/titles break attribute values | All attribute values passed through the existing `escapeHtml()` helper |
| Employee cards (expandable `<details>`) below the table are NOT filtered (spec ambiguity Q1) | Filter only the summary table rows; leave edit cards unfiltered — consistent with the simplest interpretation and least risk to CRUD UX |
| No test infrastructure exists | Add Jest + supertest as devDependencies with a focused test file; keep scope narrow |

## Dependencies

- **New devDependencies:** `jest ^29`, `supertest ^7` (for testing only; zero new runtime dependencies)
- **Prerequisites:** Node.js environment already set up; `npm install` needed after adding devDependencies
