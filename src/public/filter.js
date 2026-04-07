(function() {
  let filterInputs = {};
  let debounceTimer = null;

  function initializeFilters() {
    filterInputs = {
      name: document.getElementById('filterName'),
      title: document.getElementById('filterTitle'),
      minSalary: document.getElementById('filterMinSalary'),
      maxSalary: document.getElementById('filterMaxSalary')
    };

    const clearButton = document.getElementById('clearFilters');
    const clearLinks = document.querySelectorAll('#clearFiltersLink, .clear-filters-link');

    Object.values(filterInputs).forEach(input => {
      if (input) {
        input.addEventListener('input', () => applyFilters());
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', clearFilters);
    }

    clearLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        clearFilters();
      });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const hasFilters = urlParams.has('search') || urlParams.has('minSalary') || urlParams.has('maxSalary');
    
    if (hasFilters) {
      applyFilters();
    }
  }

  function applyFilters() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const filters = filterEmployees();
      updateDisplay(filters);
      updateSummaryStats(filters.visible);
      syncFiltersToUrl();
    }, 250);
  }

  function filterEmployees() {
    const nameFilter = filterInputs.name.value.toLowerCase().trim();
    const titleFilter = filterInputs.title.value.toLowerCase().trim();
    const minSalary = filterInputs.minSalary.value ? parseInt(filterInputs.minSalary.value, 10) : null;
    const maxSalary = filterInputs.maxSalary.value ? parseInt(filterInputs.maxSalary.value, 10) : null;

    const tableRows = document.querySelectorAll('#employeeTableBody tr[data-employee-id]');
    const cards = document.querySelectorAll('#employeeCardsGrid .employee-card[data-employee-id]');

    const visible = [];
    const hidden = [];

    tableRows.forEach(row => {
      const name = row.getAttribute('data-name') || '';
      const title = row.getAttribute('data-title') || '';
      const salary = parseInt(row.getAttribute('data-salary'), 10);

      let matches = true;

      if (nameFilter && !name.includes(nameFilter)) {
        matches = false;
      }

      if (titleFilter && !title.includes(titleFilter)) {
        matches = false;
      }

      if (minSalary !== null && salary < minSalary) {
        matches = false;
      }

      if (maxSalary !== null && salary > maxSalary) {
        matches = false;
      }

      if (matches) {
        visible.push({ row, salary });
      } else {
        hidden.push(row);
      }
    });

    return { visible, hidden, cards, nameFilter, titleFilter, minSalary, maxSalary };
  }

  function updateDisplay(filters) {
    filters.visible.forEach(item => {
      item.row.style.display = '';
    });

    filters.hidden.forEach(row => {
      row.style.display = 'none';
    });

    filters.cards.forEach(card => {
      const name = card.getAttribute('data-name') || '';
      const title = card.getAttribute('data-title') || '';
      const salary = parseInt(card.getAttribute('data-salary'), 10);

      let matches = true;

      if (filters.nameFilter && !name.includes(filters.nameFilter)) {
        matches = false;
      }

      if (filters.titleFilter && !title.includes(filters.titleFilter)) {
        matches = false;
      }

      if (filters.minSalary !== null && salary < filters.minSalary) {
        matches = false;
      }

      if (filters.maxSalary !== null && salary > filters.maxSalary) {
        matches = false;
      }

      card.style.display = matches ? '' : 'none';
    });

    const filterCount = document.querySelector('.filter-count');
    const totalEmployees = document.querySelectorAll('#employeeTableBody tr[data-employee-id]').length;
    
    if (filterCount) {
      filterCount.textContent = `Showing ${filters.visible.length} of ${totalEmployees} employees`;
    }

    const activeFilterCount = [
      filters.nameFilter,
      filters.titleFilter,
      filters.minSalary !== null,
      filters.maxSalary !== null
    ].filter(Boolean).length;

    const filterBadge = document.querySelector('.filter-badge');
    if (filterBadge) {
      if (activeFilterCount > 0) {
        filterBadge.textContent = `${activeFilterCount} active`;
        filterBadge.style.display = 'inline-block';
      } else {
        filterBadge.style.display = 'none';
      }
    }

    if (filters.visible.length === 0) {
      showEmptyState();
    } else {
      hideEmptyState();
    }
  }

  function updateSummaryStats(visibleEmployees) {
    const headcount = visibleEmployees.length;
    const totalPayroll = visibleEmployees.reduce((sum, item) => sum + item.salary, 0);
    const averageSalary = headcount > 0 ? totalPayroll / headcount : 0;

    const managerIds = new Set();
    visibleEmployees.forEach(item => {
      const managerId = item.row.querySelector('td:nth-child(4)')?.textContent.trim();
      if (managerId && managerId !== 'Unassigned') {
        managerIds.add(managerId);
      }
    });

    const visibleCards = Array.from(document.querySelectorAll('#employeeCardsGrid .employee-card[data-employee-id]'))
      .filter(card => card.style.display !== 'none');
    
    let managerCount = 0;
    visibleCards.forEach(card => {
      const form = card.querySelector('.employee-form');
      if (form) {
        const managerSelect = form.querySelector('select[name="managerId"]');
        if (managerSelect && managerSelect.value) {
          const managerId = parseInt(managerSelect.value, 10);
          const hasReports = visibleCards.some(c => {
            const f = c.querySelector('.employee-form');
            const s = f?.querySelector('select[name="managerId"]');
            return s && parseInt(s.value, 10) === managerId;
          });
          if (hasReports) {
            managerCount++;
          }
        }
      }
    });

    const individualContributors = headcount - managerCount;

    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
      statCards[0].querySelector('strong').textContent = headcount;
      statCards[1].querySelector('strong').textContent = formatCurrency(totalPayroll);
      statCards[2].querySelector('strong').textContent = formatCurrency(averageSalary);
      statCards[3].querySelector('strong').textContent = individualContributors;
    }

    const topbarBadge = document.querySelector('.topbar-badge');
    if (topbarBadge) {
      topbarBadge.textContent = `${headcount} active records`;
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function showEmptyState() {
    const tableEmpty = document.querySelector('.empty-state-table');
    const cardsEmpty = document.querySelector('.empty-state-cards');
    const tableWrap = document.querySelector('.table-wrap');
    const cardsGrid = document.getElementById('employeeCardsGrid');

    if (tableEmpty) tableEmpty.style.display = 'block';
    if (cardsEmpty) cardsEmpty.style.display = 'block';
    if (tableWrap) tableWrap.style.display = 'none';
    if (cardsGrid) cardsGrid.style.display = 'none';
  }

  function hideEmptyState() {
    const tableEmpty = document.querySelector('.empty-state-table');
    const cardsEmpty = document.querySelector('.empty-state-cards');
    const tableWrap = document.querySelector('.table-wrap');
    const cardsGrid = document.getElementById('employeeCardsGrid');

    if (tableEmpty) tableEmpty.style.display = 'none';
    if (cardsEmpty) cardsEmpty.style.display = 'none';
    if (tableWrap) tableWrap.style.display = 'block';
    if (cardsGrid) cardsGrid.style.display = 'grid';
  }

  function syncFiltersToUrl() {
    const params = new URLSearchParams();

    const nameFilter = filterInputs.name.value.trim();
    const titleFilter = filterInputs.title.value.trim();
    const minSalary = filterInputs.minSalary.value.trim();
    const maxSalary = filterInputs.maxSalary.value.trim();

    if (nameFilter) params.set('filterName', nameFilter);
    if (titleFilter) params.set('filterTitle', titleFilter);
    if (minSalary) params.set('minSalary', minSalary);
    if (maxSalary) params.set('maxSalary', maxSalary);

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }

  function clearFilters() {
    Object.values(filterInputs).forEach(input => {
      if (input) input.value = '';
    });

    window.history.replaceState({}, '', window.location.pathname);

    const tableRows = document.querySelectorAll('#employeeTableBody tr[data-employee-id]');
    const cards = document.querySelectorAll('#employeeCardsGrid .employee-card[data-employee-id]');

    tableRows.forEach(row => row.style.display = '');
    cards.forEach(card => card.style.display = '');

    hideEmptyState();

    const allEmployees = Array.from(tableRows).map(row => ({
      row,
      salary: parseInt(row.getAttribute('data-salary'), 10)
    }));

    updateSummaryStats(allEmployees);

    const filterCount = document.querySelector('.filter-count');
    if (filterCount) {
      filterCount.textContent = `Showing ${tableRows.length} of ${tableRows.length} employees`;
    }

    const filterBadge = document.querySelector('.filter-badge');
    if (filterBadge) {
      filterBadge.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFilters);
  } else {
    initializeFilters();
  }
})();
