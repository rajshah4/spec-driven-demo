# Implementation Plan: Add Employee Search Feature

> Spec: [spec.json](./spec.json)
> Status: Draft

## Technical Approach

Implement a client-side search feature for the employee directory table. The search will filter table rows in real-time as the user types, matching against employee name and title fields. The implementation uses vanilla JavaScript to keep the solution lightweight and avoid adding new dependencies. The filtering is purely client-side since the spec explicitly states server-side search is out of scope.

The solution will:
1. Add a search input field to the Employee Directory section in the rendered HTML
2. Add inline JavaScript to handle real-time filtering
3. Add CSS styles for the search input and "no results" state
4. Ensure graceful degradation when JavaScript is disabled (table remains fully visible)

## Technology Stack

- **Framework:** Express.js (existing)
- **Database:** SQLite via better-sqlite3 (existing, no changes needed)
- **Libraries:** No new dependencies required
- **Patterns:** 
  - Progressive enhancement (works without JS)
  - Event delegation for efficient DOM handling
  - Debounced input handling not required (simple filtering is fast enough)

## Architecture

### Components

1. **Search Input Component** - A text input field rendered above the employee directory table with placeholder text and a clear button
2. **Filter Logic** - Client-side JavaScript that listens to input events and filters table rows based on case-insensitive partial matching against name and title columns
3. **No Results Message** - A hidden element that displays when no employees match the search query

### Data Model

No changes to the data model. The search operates entirely on the DOM using data already rendered by the server.

### API Contracts

No API changes. The spec explicitly marks server-side search as out of scope.

## File Changes

### New Files

None. All changes will be made to existing files.

### Modified Files

- `src/render.js` - Add search input HTML to the Employee Directory section, add inline JavaScript for filtering logic, add "no results" message element
- `src/public/styles.css` - Add styles for the search input field, clear button, and "no results" message

## Integration Points

The search feature integrates with the existing Employee Directory panel in `render.js`. It operates on the table rendered by `renderEmployeeRows()` but does not modify that function. The filtering is purely additive and non-invasive to existing functionality.

Key integration details:
- Search input is placed inside the `.panel-heading` div of the Employee Directory section
- Filter operates on `tbody tr` elements within the directory table
- Data attributes will be added to table rows for reliable filtering
- The employee cards section below remains unaffected (per spec)

## Testing Strategy

- **Manual Testing:**
  - Verify search input appears above the directory table
  - Type partial names and verify matching rows remain visible
  - Type job titles and verify matching rows remain visible  
  - Verify case-insensitive matching works (e.g., "marcus" matches "Marcus")
  - Verify clearing input shows all employees
  - Verify "no results" message appears when no matches
  - Test with JavaScript disabled to confirm graceful degradation
  - Verify employee cards section is not filtered

- **Browser Testing:**
  - Test in Chrome, Firefox, and Safari
  - Test responsive behavior on mobile viewport

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Performance with large employee lists | Client-side filtering is efficient for typical payroll sizes (<1000 employees). For larger datasets, implement virtual scrolling or server-side pagination in a future iteration. |
| Accessibility concerns | Ensure search input has proper label, ARIA attributes, and focus states. Screen reader users should be notified of filter results. |
| JavaScript disabled | Table remains fully visible and functional without JavaScript (progressive enhancement pattern). |

## Dependencies

No external dependencies need to be added. The implementation uses:
- Vanilla JavaScript (ES6+)
- Existing CSS custom properties
- Existing HTML structure from render.js

## Implementation Notes

### Search Input HTML Structure
```html
<div class="search-container">
  <input 
    type="search" 
    id="employee-search" 
    placeholder="Search by name or title..."
    aria-label="Search employees"
  />
</div>
```

### Filter Logic Pseudocode
```javascript
// On input event:
// 1. Get search query (trimmed, lowercased)
// 2. For each table row:
//    - Get name and title text content
//    - Check if either contains the query
//    - Toggle row visibility
// 3. Show/hide "no results" message based on visible row count
```

### Data Attributes for Filtering
Table rows will include `data-name` and `data-title` attributes with lowercased values for efficient filtering without repeated DOM text extraction.

## Open Questions Resolution

Based on the spec's open questions:
1. **Filter cards section?** - Spec says only directory table, so cards are excluded
2. **Minimum characters?** - Filter from first character for instant feedback
3. **Keyboard shortcuts?** - Nice-to-have, defer to future iteration unless time permits
