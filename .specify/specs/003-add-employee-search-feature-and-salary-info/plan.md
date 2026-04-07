# Implementation Plan: Add Employee Search Feature and Salary Info

> Spec: [spec.json](./spec.json)
> Status: Draft

## Technical Approach

This feature adds client-side filtering capabilities to the existing payroll dashboard. Since the application currently uses server-side rendering with no client-side JavaScript, we'll implement a progressive enhancement approach that:

1. **Preserves existing functionality** - All CRUD operations continue to work exactly as they do now
2. **Adds client-side filtering** - New JavaScript will filter the DOM based on user input without requiring server changes
3. **Updates statistics dynamically** - Summary cards will reflect filtered results
4. **Maintains filter state** - Filters persist across form submissions using URL query parameters

The filtering will be implemented entirely in the browser by hiding/showing existing DOM elements and recalculating summary statistics from visible employees. This approach requires no backend API changes and aligns with the spec's requirement for client-side filtering.

## Technology Stack

- **Framework:** Express.js (existing - no changes)
- **Database:** SQLite with better-sqlite3 (existing - no changes)
- **Client-side:** Vanilla JavaScript (new)
- **Libraries:** None - using native browser APIs for filtering and debouncing
- **Patterns:** 
  - Progressive enhancement for graceful degradation
  - URL query parameters for state persistence
  - Event delegation for dynamic content
  - Debouncing for real-time search input

## Architecture

### Components

1. **Filter UI Component** (new)
   - Search inputs for name and title
   - Number inputs for min/max salary
   - Active filters indicator badge
   - Clear filters button
   - Result count display

2. **Client-side Filter Engine** (new)
   - Reads filter values from inputs and URL params
   - Applies case-insensitive substring matching for text fields
   - Applies numeric range filtering for salary
   - Hides/shows table rows and employee cards
   - Updates summary statistics based on visible employees
   - Manages URL query parameters for state persistence

3. **Server Enhancements** (modified)
   - Pass filter parameters from query string to render function
   - Pre-populate filter inputs with values from URL

### Data Model

No database schema changes required. The existing employee structure remains unchanged:

```javascript
{
  id: INTEGER,
  name: TEXT,
  title: TEXT,
  salary: INTEGER,
  homeAddress: TEXT,
  managerId: INTEGER,
  managerName: TEXT
}
```

### API Contracts

No new API endpoints required. The existing endpoints remain unchanged:

- `GET /` - Returns full employee list and summary (existing)
- `POST /employees` - Creates new employee (existing)
- `POST /employees/:id/update` - Updates employee (existing)
- `POST /employees/:id/delete` - Deletes employee (existing)

The server will accept optional query parameters for filter state restoration:
- `?search=` - Name/title search text
- `?minSalary=` - Minimum salary filter
- `?maxSalary=` - Maximum salary filter

## File Changes

### New Files

- `src/public/filter.js` - Client-side filtering logic
  - `initializeFilters()` - Sets up event listeners and restores state from URL
  - `applyFilters()` - Core filtering logic (debounced)
  - `filterEmployees()` - Determines which employees match current criteria
  - `updateDisplay()` - Shows/hides DOM elements based on filter results
  - `updateSummaryStats()` - Recalculates headcount, payroll, avg salary, ICs
  - `syncFiltersToUrl()` - Updates browser URL with current filter state
  - `clearFilters()` - Resets all filter inputs and URL params
  - `showEmptyState()` / `hideEmptyState()` - Manages empty results messaging

### Modified Files

- `src/render.js`
  - Add filter UI markup in `renderDashboard()`
  - Insert filter controls panel above "Employee directory" section
  - Add empty state placeholder in employee directory table
  - Add empty state placeholder in employee cards section
  - Add `data-employee-id`, `data-name`, `data-title`, `data-salary` attributes to table rows
  - Add similar data attributes to employee cards for filtering
  - Add active filter count badge next to panel headings
  - Include `<script src="/static/filter.js"></script>` before closing `</body>` tag
  - Accept `filters` parameter in `renderDashboard()` to pre-populate filter inputs from URL

- `src/server.js`
  - Extract filter query parameters in `GET /` route
  - Pass filters object to `renderDashboard()`
  - Preserve filter query parameters in redirect URLs after CRUD operations

- `src/public/styles.css`
  - `.filter-panel` - Container for filter controls
  - `.filter-grid` - Grid layout for filter inputs
  - `.filter-badge` - Active filter count indicator
  - `.empty-state` - Styling for "no results" message
  - `.filter-input` - Common styling for filter inputs
  - `.clear-filters-btn` - Styling for clear button

## Integration Points

### With Existing CRUD Operations

When a user creates, updates, or deletes an employee while filters are active:

1. The form submits normally (existing behavior)
2. Server redirects back to `/` with success message
3. Server preserves filter query parameters in redirect URL
4. Page reloads with filters applied
5. Client-side JavaScript reads URL params and re-applies filters
6. User sees updated data with filters still active

### With Existing Rendering

The filter UI will be inserted as a new panel above the "Employee directory" section. The layout uses the existing grid system and styling patterns:

```
[Stats Grid - existing, will update dynamically]
  
[Filter Panel - NEW]
  - Search by name
  - Search by title
  - Min salary
  - Max salary
  - Active filters badge
  - Clear button
  
[Employee Directory - existing, rows will be hidden/shown]

[Edit Employee Records - existing, cards will be hidden/shown]
```

## Testing Strategy

### Unit Tests

No automated tests required per project scope (focus on demonstration). Manual testing will verify:

- Name search (case-insensitive, partial match)
- Title search (case-insensitive, partial match)
- Min salary filter (inclusive)
- Max salary filter (inclusive)
- Combined filters (AND logic)
- Clear filters button
- Empty state display
- Filter persistence across page reloads
- Filter persistence after CRUD operations

### Integration Tests

Manual verification of:

- Creating employee while filters active
- Updating employee while filters active (re-evaluation of filter criteria)
- Deleting employee while filters active
- Summary stats update correctly for filtered set
- URL updates when filters change
- Filters restore from URL on page load
- Debounce behavior (no excessive re-filtering)

### Browser Compatibility

Target modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions). Uses:
- `URLSearchParams` for query parameter handling
- `querySelectorAll` for DOM selection
- `dataset` API for data attributes
- `Array.filter()` and `Array.reduce()` for calculations

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Performance degradation with large employee lists** | Filtering is O(n) but the dataset is small (demo scope). Debouncing prevents excessive re-renders. For production scale, consider server-side filtering or virtualization. |
| **Filter state lost on form submission** | Preserve query parameters in redirect URLs. Pass filters to render function to pre-populate inputs. |
| **Browser compatibility issues** | Use standard DOM APIs supported in all modern browsers. No polyfills needed for target audience. |
| **Summary stats calculation errors** | Calculate stats only from visible employees. Use same logic as server-side calculation (SUM, AVG, COUNT). Add defensive checks for divide-by-zero. |
| **Accessibility concerns** | Use semantic HTML (labels, inputs with proper types). Announce filter results count to screen readers via aria-live region. Ensure keyboard navigation works. |

## Dependencies

### External Dependencies

None - no new npm packages required.

### Internal Dependencies

- Existing Express routes must pass query params to render function
- Existing redirect logic must preserve query parameters
- CSS variable system for consistent styling

### Prerequisites

- All existing application functionality must remain unchanged
- Server must continue returning full employee list (filtering happens client-side)
- URL must support query parameters for filter state

## Implementation Sequence

1. **Add filter UI markup** in `render.js`
   - Create filter panel HTML structure
   - Add data attributes to table rows and cards
   - Add empty state placeholders
   - Include script tag for filter.js

2. **Implement client-side filtering** in `filter.js`
   - Initialize filters from URL on page load
   - Set up event listeners on filter inputs
   - Implement debounced filter application
   - Hide/show employees based on criteria
   - Update summary statistics
   - Manage URL state

3. **Update server to preserve filter state** in `server.js`
   - Extract query params in GET route
   - Pass to render function
   - Append to redirect URLs

4. **Style filter components** in `styles.css`
   - Filter panel layout
   - Input styling
   - Badge indicators
   - Empty state message

5. **Manual testing and refinement**
   - Verify all acceptance criteria
   - Test CRUD operations with active filters
   - Confirm summary stats accuracy
   - Check browser compatibility

## Open Questions Resolved

Based on spec recommendations:

- ✅ **Case sensitivity:** Case-insensitive (better UX)
- ✅ **Decimal values:** Integer only (matches DB schema)
- ✅ **Filter position:** Above employee directory table (clear, accessible)
- ✅ **Real-time vs submit:** Real-time with debouncing (better UX)
- ✅ **Summary stats scope:** Reflect filtered subset (consistency)
- ✅ **Partial matching:** Yes, substring matching for name and title
