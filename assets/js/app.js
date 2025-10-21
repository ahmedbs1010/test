(function(){
  const root = document.documentElement;

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle){
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
    });
  }

  // Sidebar toggle (mobile)
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const backdrop = document.querySelector('.sidebar-backdrop');
  function closeSidebar(){
    sidebar?.classList.remove('is-open');
    backdrop?.classList.remove('is-visible');
  }
  sidebarToggle?.addEventListener('click', () => {
    const willOpen = !sidebar?.classList.contains('is-open');
    sidebar?.classList.toggle('is-open', willOpen);
    backdrop?.classList.toggle('is-visible', willOpen);
  });
  backdrop?.addEventListener('click', closeSidebar);
  document.querySelector('[data-close-sidebar]')?.addEventListener('click', closeSidebar);

  // User menu dropdown
  const userMenuButton = document.getElementById('userMenuButton');
  const userMenu = document.getElementById('userMenu');
  function closeUserMenu(){ userMenu?.setAttribute('aria-hidden', 'true'); userMenuButton?.setAttribute('aria-expanded','false'); }
  userMenuButton?.addEventListener('click', (e) => {
    const isOpen = userMenu?.getAttribute('aria-hidden') === 'false';
    userMenu?.setAttribute('aria-hidden', String(isOpen));
    userMenuButton?.setAttribute('aria-expanded', String(!isOpen));
    e.stopPropagation();
  });
  document.addEventListener('click', (e) => {
    if (!userMenu || !userMenuButton) return;
    if (!userMenu.contains(e.target) && e.target !== userMenuButton){
      closeUserMenu();
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeUserMenu(); closeSidebar(); } });

  // Charts
  function initCharts(){
    if (!(window.Chart)) return;

    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx){
      new window.Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: ['J1','J2','J3','J4','J5','J6','J7','J8','J9','J10','J11','J12'],
          datasets: [{
            label: 'Total Médailles',
            data: [2, 5, 9, 14, 21, 28, 36, 45, 56, 68, 79, 86],
            borderColor: getComputedStyle(root).getPropertyValue('--primary').trim(),
            backgroundColor: 'color-mix(in oklab, var(--primary), transparent 85%)',
            fill: true,
            tension: 0.35,
            pointRadius: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            x: {
              grid: { display: false },
            },
            y: {
              grid: { color: 'rgba(148,163,184,.15)' },
              ticks: { stepSize: 10 }
            }
          }
        }
      });
    }

    const trafficCtx = document.getElementById('trafficChart');
    if (trafficCtx){
      new window.Chart(trafficCtx, {
        type: 'doughnut',
        data: {
          labels: ['Or', 'Argent', 'Bronze'],
          datasets: [{
            data: [32, 29, 25],
            backgroundColor: [
              getComputedStyle(root).getPropertyValue('--medal-gold').trim(),
              getComputedStyle(root).getPropertyValue('--medal-silver').trim(),
              getComputedStyle(root).getPropertyValue('--medal-bronze').trim(),
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initCharts);
  } else {
    initCharts();
  }

  // Table filter + search
  // Overview page results table (Olympic themed)
  const statusFilter = document.getElementById('medalFilter');
  const tableSearch = document.getElementById('resultsSearch');
  const table = document.getElementById('resultsTable');
  const noResultsRow = document.getElementById('noResultsRow');

  function filterTable(){
    if (!table) return;
    const status = statusFilter?.value || 'all';
    const query = (tableSearch?.value || '').toLowerCase().trim();
    let visible = 0;

    table.querySelectorAll('tbody:first-of-type tr').forEach((row) => {
      const rowStatus = row.getAttribute('data-medal');
      const text = row.textContent?.toLowerCase() || '';
      const matchesStatus = status === 'all' || status === rowStatus;
      const matchesQuery = !query || text.includes(query);
      const show = matchesStatus && matchesQuery;
      row.toggleAttribute('hidden', !show);
      if (show) visible++;
    });
    noResultsRow?.toggleAttribute('hidden', visible !== 0);
  }

  statusFilter?.addEventListener('change', filterTable);
  tableSearch?.addEventListener('input', filterTable);

})();
