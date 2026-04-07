const assert = require('assert');
const { renderDashboard } = require('../src/render');

// Run tests
console.log('Running Employee Search Tests...\n');

const tests = [
  'should include search input in rendered HTML',
  'should include data-name and data-title attributes on table rows',
  'should include no-results message element',
  'should include search filter JavaScript',
  'should preserve original case in data attributes',
  'should have table with id for JavaScript targeting'
];

const testData = {
  employees: [
    {
      id: 1,
      name: 'Alice Johnson',
      title: 'Software Engineer',
      salary: 95000,
      managerId: null,
      managerName: null,
      homeAddress: '123 Main St'
    },
    {
      id: 2,
      name: 'Bob Smith',
      title: 'Product Manager',
      salary: 110000,
      managerId: null,
      managerName: null,
      homeAddress: '456 Oak Ave'
    },
    {
      id: 3,
      name: 'alice cooper',
      title: 'software developer',
      salary: 85000,
      managerId: null,
      managerName: null,
      homeAddress: '789 Pine Rd'
    }
  ],
  summary: {
    headcount: 3,
    totalPayroll: 290000,
    averageSalary: 96667,
    managerCount: 0
  },
  message: null
};

let passed = 0;
let failed = 0;

// Test 1: Search input present
try {
  const html = renderDashboard(testData);
  assert(html.includes('id="employee-search"'), 'Search input should be present');
  assert(html.includes('placeholder="Search by name or title..."'), 'Search placeholder should be present');
  console.log('✓ Test 1: Search input is present');
  passed++;
} catch (error) {
  console.log('✗ Test 1 failed:', error.message);
  failed++;
}

// Test 2: Data attributes present
try {
  const html = renderDashboard(testData);
  assert(html.includes('data-name="Alice Johnson"'), 'Should include data-name for Alice Johnson');
  assert(html.includes('data-title="Software Engineer"'), 'Should include data-title for Software Engineer');
  assert(html.includes('data-name="Bob Smith"'), 'Should include data-name for Bob Smith');
  assert(html.includes('data-title="Product Manager"'), 'Should include data-title for Product Manager');
  console.log('✓ Test 2: Data attributes are present on table rows');
  passed++;
} catch (error) {
  console.log('✗ Test 2 failed:', error.message);
  failed++;
}

// Test 3: No results message
try {
  const html = renderDashboard(testData);
  assert(html.includes('id="no-results"'), 'No results message should be present');
  assert(html.includes('No employees match your search'), 'No results text should be present');
  console.log('✓ Test 3: No results message is present');
  passed++;
} catch (error) {
  console.log('✗ Test 3 failed:', error.message);
  failed++;
}

// Test 4: Search filter JavaScript
try {
  const html = renderDashboard(testData);
  assert(html.includes('getElementById(\'employee-search\')'), 'Search filter script should be present');
  assert(html.includes('Case-sensitive matching'), 'Case-sensitive comment should be present');
  assert(html.includes('name.includes(query)'), 'Should use includes for matching');
  console.log('✓ Test 4: Search filter JavaScript is present');
  passed++;
} catch (error) {
  console.log('✗ Test 4 failed:', error.message);
  failed++;
}

// Test 5: Case preservation
try {
  const html = renderDashboard(testData);
  assert(html.includes('data-name="Alice Johnson"'), 'Should preserve uppercase in Alice');
  assert(html.includes('data-name="alice cooper"'), 'Should preserve lowercase in alice');
  assert(html.includes('data-title="Software Engineer"'), 'Should preserve title case');
  assert(html.includes('data-title="software developer"'), 'Should preserve lowercase title');
  console.log('✓ Test 5: Original case is preserved in data attributes');
  passed++;
} catch (error) {
  console.log('✗ Test 5 failed:', error.message);
  failed++;
}

// Test 6: Table ID
try {
  const html = renderDashboard(testData);
  assert(html.includes('id="employee-table"'), 'Table should have id for JavaScript targeting');
  console.log('✓ Test 6: Table has id for JavaScript targeting');
  passed++;
} catch (error) {
  console.log('✗ Test 6 failed:', error.message);
  failed++;
}

console.log('\n' + '='.repeat(50));
console.log(`Tests completed: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

if (failed > 0) {
  process.exit(1);
}
