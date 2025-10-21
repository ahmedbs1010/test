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
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
          datasets: [{
            label: 'Revenus',
            data: [12, 19, 13, 28, 32, 45, 42, 51, 49, 62, 58, 72],
            borderColor: getComputedStyle(root).getPropertyValue('--primary').trim(),
            backgroundColor: 'rgba(85,112,255,0.15)',
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
          labels: ['Direct', 'Référent', 'Social'],
          datasets: [{
            data: [55, 28, 17],
            backgroundColor: [
              getComputedStyle(root).getPropertyValue('--primary').trim(),
              getComputedStyle(root).getPropertyValue('--success').trim(),
              getComputedStyle(root).getPropertyValue('--warning').trim(),
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
  const statusFilter = document.getElementById('statusFilter');
  const tableSearch = document.getElementById('tableSearch');
  const table = document.getElementById('ordersTable');
  const noResultsRow = document.getElementById('noResultsRow');

  function filterTable(){
    if (!table) return;
    const status = statusFilter?.value || 'all';
    const query = (tableSearch?.value || '').toLowerCase().trim();
    let visible = 0;

    table.querySelectorAll('tbody:first-of-type tr').forEach((row) => {
      const rowStatus = row.getAttribute('data-status');
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
