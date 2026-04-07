# Task Breakdown: Add Employee Search Feature and Salary Info

> Spec: [spec.json](./spec.json)
> Plan: [plan.md](./plan.md)
> Status: Ready for Implementation

## Prerequisites

- [x] Feature branch created: `feature/3-add-employee-search-feature-an`
- [x] Spec and plan approved
- [x] Existing application functionality verified

## Phase 1: Foundation & Markup

### Task 1.1: Add data attributes to employee table rows
- **File(s):** `src/render.js`
- **Description:** Add `data-employee-id`, `data-name`, `data-title`, and `data-salary` attributes to each `<tr>` in the employee directory table. These attributes enable client-side filtering without parsing text content.
- **Depends on:** None
- **Parallel:** No

### Task 1.2: Add data attributes to employee cards
- **File(s):** `src/render.js`
- **Description:** Add the same data attributes (`data-employee-id`, `data-name`, `data-title`, `data-salary`) to each employee card in the "Edit Employee Records" section for consistent filtering.
- **Depends on:** Task 1.1
- **Parallel:** No

### Task 1.3: Create filter panel HTML markup
- **File(s):** `src/render.js`
- **Description:** Add filter panel HTML above the employee directory section, including search inputs for name and title, number inputs for min/max salary, clear button, and result count display. Use semantic HTML with proper labels and input types.
- **Depends on:** None
- **Parallel:** Yes (can run with 1.1, 1.2)

### Task 1.4: Add empty state placeholders
- **File(s):** `src/render.js`
- **Description:** Insert empty state message containers in both the employee directory table and employee cards section. These will be shown/hidden by JavaScript when no employees match filters.
- **Depends on:** Task 1.3
- **Parallel:** No

### Task 1.5: Add script tag for filter.js
- **File(s):** `src/render.js`
- **Description:** Include `<script src="/static/filter.js"></script>` before the closing `</body>` tag in the HTML template.
- **Depends on:** Task 1.3
- **Parallel:** Yes (can run with 1.4)

### Task 1.6: Update renderDashboard to accept filters parameter
- **File(s):** `src/render.js`
- **Description:** Modify `renderDashboard()` function signature to accept an optional `filters` parameter object. Use this to pre-populate filter input values from URL query parameters.
- **Depends on:** Task 1.3
- **Parallel:** No

## Phase 2: Client-Side Filtering Logic

### Task 2.1: Create filter.js file and initialize function
- **File(s):** `src/public/filter.js`
- **Description:** Create new JavaScript file with `initializeFilters()` function that runs on DOM ready. Set up references to filter inputs and employee elements. Read initial filter state from URL query parameters.
- **Depends on:** Task 1.5
- **Parallel:** No

### Task 2.2: Implement debounced applyFilters function
- **File(s):** `src/public/filter.js`
- **Description:** Create `applyFilters()` function with debouncing (250ms delay) to prevent excessive re-rendering during typing. This function will be triggered by input events on filter controls.
- **Depends on:** Task 2.1
- **Parallel:** No

### Task 2.3: Implement filterEmployees logic
- **File(s):** `src/public/filter.js`
- **Description:** Create `filterEmployees()` function that evaluates each employee against current filter criteria. Use case-insensitive substring matching for name/title and numeric range comparison for salary (AND logic for multiple filters).
- **Depends on:** Task 2.2
- **Parallel:** No

### Task 2.4: Implement updateDisplay function
- **File(s):** `src/public/filter.js`
- **Description:** Create `updateDisplay()` function to show/hide table rows and employee cards based on filter results. Add/remove CSS classes or set display properties. Update result count display.
- **Depends on:** Task 2.3
- **Parallel:** No

### Task 2.5: Implement updateSummaryStats function
- **File(s):** `src/public/filter.js`
- **Description:** Create `updateSummaryStats()` function to recalculate headcount, total payroll, average salary, and individual contributor count from visible employees only. Update summary card values in the DOM. Handle divide-by-zero edge cases.
- **Depends on:** Task 2.4
- **Parallel:** No

### Task 2.6: Implement empty state management
- **File(s):** `src/public/filter.js`
- **Description:** Create `showEmptyState()` and `hideEmptyState()` functions to toggle empty state messages when filter results are empty. Ensure appropriate messages for both table and cards sections.
- **Depends on:** Task 2.4
- **Parallel:** Yes (can run with 2.5)

### Task 2.7: Implement URL state synchronization
- **File(s):** `src/public/filter.js`
- **Description:** Create `syncFiltersToUrl()` function using URLSearchParams to update browser URL with current filter values without page reload. This enables bookmarking and sharing filtered views.
- **Depends on:** Task 2.3
- **Parallel:** Yes (can run with 2.4, 2.5)

### Task 2.8: Implement clearFilters function
- **File(s):** `src/public/filter.js`
- **Description:** Create `clearFilters()` function that resets all filter inputs to empty values, removes URL query parameters, and displays all employees. Wire up to clear button click event.
- **Depends on:** Task 2.7
- **Parallel:** No

### Task 2.9: Wire up event listeners
- **File(s):** `src/public/filter.js`
- **Description:** In `initializeFilters()`, attach input event listeners to filter controls, clear button click handler, and call initial filter application on page load to restore state from URL.
- **Depends on:** Task 2.8
- **Parallel:** No

## Phase 3: Server Integration

### Task 3.1: Extract filter query parameters in GET route
- **File(s):** `src/server.js`
- **Description:** In the `GET /` route handler, extract `search`, `minSalary`, and `maxSalary` from `req.query`. Create a filters object to pass to render function.
- **Depends on:** Task 1.6
- **Parallel:** No

### Task 3.2: Pass filters to renderDashboard
- **File(s):** `src/server.js`
- **Description:** Update `renderDashboard()` call in `GET /` route to pass the filters object as a parameter. This enables pre-populating filter inputs on page load.
- **Depends on:** Task 3.1
- **Parallel:** No

### Task 3.3: Preserve filters in POST /employees redirect
- **File(s):** `src/server.js`
- **Description:** After creating a new employee, preserve filter query parameters in the redirect URL. Build query string from `req.query` and append to redirect path.
- **Depends on:** Task 3.1
- **Parallel:** Yes (can run with 3.2)

### Task 3.4: Preserve filters in POST /employees/:id/update redirect
- **File(s):** `src/server.js`
- **Description:** After updating an employee, preserve filter query parameters in the redirect URL using the same pattern as Task 3.3.
- **Depends on:** Task 3.1
- **Parallel:** Yes (can run with 3.2, 3.3)

### Task 3.5: Preserve filters in POST /employees/:id/delete redirect
- **File(s):** `src/server.js`
- **Description:** After deleting an employee, preserve filter query parameters in the redirect URL using the same pattern as Task 3.3 and 3.4.
- **Depends on:** Task 3.1
- **Parallel:** Yes (can run with 3.2, 3.3, 3.4)

## Phase 4: Styling

### Task 4.1: Style filter panel layout
- **File(s):** `src/public/styles.css`
- **Description:** Add CSS for `.filter-panel` container with padding, background, and border radius. Create `.filter-grid` for responsive grid layout of filter inputs (2x2 grid on desktop, stacked on mobile).
- **Depends on:** Task 1.3
- **Parallel:** No

### Task 4.2: Style filter inputs and controls
- **File(s):** `src/public/styles.css`
- **Description:** Add styles for `.filter-input` (text and number inputs), `.clear-filters-btn`, and ensure consistent spacing and typography matching existing form styles.
- **Depends on:** Task 4.1
- **Parallel:** No

### Task 4.3: Style active filter badge
- **File(s):** `src/public/styles.css`
- **Description:** Create `.filter-badge` styles for the active filter count indicator. Use accent color, circular badge design with centered count number.
- **Depends on:** Task 4.1
- **Parallel:** Yes (can run with 4.2)

### Task 4.4: Style empty state message
- **File(s):** `src/public/styles.css`
- **Description:** Add `.empty-state` styles for the "no results" message. Include padding, muted text color, centered alignment, and optional icon or illustration.
- **Depends on:** Task 4.1
- **Parallel:** Yes (can run with 4.2, 4.3)

### Task 4.5: Add responsive design adjustments
- **File(s):** `src/public/styles.css`
- **Description:** Add media queries to ensure filter panel works well on mobile viewports. Stack filter inputs vertically on small screens, adjust spacing and button sizes for touch targets.
- **Depends on:** Task 4.4
- **Parallel:** No

## Phase 5: Testing & Validation

### Task 5.1: Test name search functionality
- **File(s):** Manual testing
- **Description:** Verify case-insensitive partial matching for name search. Test with various inputs, empty values, and special characters. Confirm table and cards both filter correctly.
- **Depends on:** Task 2.9, Task 4.5
- **Parallel:** No

### Task 5.2: Test title search functionality
- **File(s):** Manual testing
- **Description:** Verify case-insensitive partial matching for title search. Test with various inputs and confirm filtering works on both table and cards.
- **Depends on:** Task 5.1
- **Parallel:** Yes (can run with 5.1)

### Task 5.3: Test salary range filters
- **File(s):** Manual testing
- **Description:** Verify min and max salary filters work correctly (inclusive ranges). Test boundary conditions, invalid inputs, and combinations of min/max values.
- **Depends on:** Task 5.1
- **Parallel:** Yes (can run with 5.1, 5.2)

### Task 5.4: Test combined filters (AND logic)
- **File(s):** Manual testing
- **Description:** Apply multiple filters simultaneously and verify results satisfy all criteria. Test various combinations of name, title, and salary filters.
- **Depends on:** Task 5.3
- **Parallel:** No

### Task 5.5: Test clear filters button
- **File(s):** Manual testing
- **Description:** Verify clear button resets all filter inputs, removes URL parameters, and displays full employee list. Test from various filtered states.
- **Depends on:** Task 5.4
- **Parallel:** No

### Task 5.6: Test summary statistics updates
- **File(s):** Manual testing
- **Description:** Verify headcount, total payroll, average salary, and IC count update correctly based on filtered employees. Test with various filter combinations and confirm calculations are accurate.
- **Depends on:** Task 5.4
- **Parallel:** Yes (can run with 5.5)

### Task 5.7: Test empty state display
- **File(s):** Manual testing
- **Description:** Apply filters that match no employees and verify appropriate empty state messages appear in both table and cards sections. Confirm styling is correct.
- **Depends on:** Task 5.5
- **Parallel:** Yes (can run with 5.5, 5.6)

### Task 5.8: Test filter persistence across page reload
- **File(s):** Manual testing
- **Description:** Apply filters, verify URL updates, reload page, and confirm filters restore from URL parameters. Test with various filter combinations.
- **Depends on:** Task 5.5
- **Parallel:** No

### Task 5.9: Test CRUD operations with active filters
- **File(s):** Manual testing
- **Description:** With filters active, test creating, updating, and deleting employees. Verify filters persist after each operation, results update correctly, and new/modified employees are filtered appropriately.
- **Depends on:** Task 3.5, Task 5.8
- **Parallel:** No

### Task 5.10: Test debounce behavior
- **File(s):** Manual testing
- **Description:** Rapidly type in filter inputs and verify debouncing prevents excessive re-filtering. Confirm there's a slight delay before filters apply, improving performance.
- **Depends on:** Task 5.8
- **Parallel:** Yes (can run with 5.9)

### Task 5.11: Cross-browser compatibility check
- **File(s):** Manual testing
- **Description:** Test filtering functionality in Chrome, Firefox, Safari, and Edge (latest versions). Verify all features work correctly across browsers and responsive breakpoints.
- **Depends on:** Task 5.10
- **Parallel:** No

### Task 5.12: Accessibility audit
- **File(s):** Manual testing
- **Description:** Verify keyboard navigation works for all filter controls, labels are properly associated with inputs, result count updates are announced to screen readers (aria-live), and focus management is appropriate.
- **Depends on:** Task 5.11
- **Parallel:** No

## Checkpoints

- [ ] After Phase 1: Verify markup renders correctly with data attributes and filter panel visible
- [ ] After Phase 2: Verify client-side filtering works in isolation (before server integration)
- [ ] After Phase 3: Verify filter state persists across CRUD operations
- [ ] After Phase 4: Verify styling matches existing design system and works responsively
- [ ] After Phase 5: All acceptance criteria from spec.json verified

## Summary

- **Total Tasks:** 41 tasks across 5 phases
- **Estimated Effort:** 1.5-2 days (with parallel execution of independent tasks)
- **Key Dependencies:** Phase 1 (markup) must complete before Phase 2 (JavaScript) can begin. Phase 3 (server) and Phase 4 (styling) can proceed in parallel with late Phase 2 tasks.
- **Risk Areas:** Summary statistics calculation accuracy, filter state preservation across redirects, debounce implementation
