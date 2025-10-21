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

    const styles = getComputedStyle(root);
    const primary = styles.getPropertyValue('--primary').trim();
    const success = styles.getPropertyValue('--success').trim();
    const warning = styles.getPropertyValue('--warning').trim();
    const gold = styles.getPropertyValue('--gold').trim();
    const silver = styles.getPropertyValue('--silver').trim();
    const bronze = styles.getPropertyValue('--bronze').trim();

    // Index: Médailles - tendance (line)
    const medalsTrendCtx = document.getElementById('medalsTrendChart');
    if (medalsTrendCtx){
      new window.Chart(medalsTrendCtx, {
        type: 'line',
        data: {
          labels: ['Juil 23', 'Juil 24', 'Juil 25', 'Juil 26', 'Juil 27', 'Juil 28', 'Juil 29', 'Juil 30', 'Juil 31', 'Août 01', 'Août 02', 'Août 03'],
          datasets: [{
            label: 'Total médailles',
            data: [2, 4, 7, 12, 18, 27, 35, 44, 57, 73, 92, 113],
            borderColor: primary,
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
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(148,163,184,.15)' } }
          }
        }
      });
    }

    // Index: Part des médailles (doughnut)
    const medalShareCtx = document.getElementById('medalShareChart');
    if (medalShareCtx){
      new window.Chart(medalShareCtx, {
        type: 'doughnut',
        data: {
          labels: ['Or', 'Argent', 'Bronze'],
          datasets: [{
            data: [38, 32, 43],
            backgroundColor: [gold, silver, bronze],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: { legend: { display: false } }
        }
      });
    }

    // Athlètes: Répartition par sport (bar)
    const athletesBySportCtx = document.getElementById('athletesBySportChart');
    if (athletesBySportCtx){
      new window.Chart(athletesBySportCtx, {
        type: 'bar',
        data: {
          labels: ['Athlétisme', 'Natation', 'Gym', 'Judo', 'Cyclisme', 'Aviron'],
          datasets: [{
            label: 'Athlètes',
            data: [2100, 1200, 980, 540, 860, 430],
            backgroundColor: primary,
            borderWidth: 0,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(148,163,184,.15)' } }
          }
        }
      });
    }

    // Athlètes: Top athlètes (horizontal bar)
    const topAthletesCtx = document.getElementById('topAthletesChart');
    if (topAthletesCtx){
      new window.Chart(topAthletesCtx, {
        type: 'bar',
        data: {
          labels: ['Caeleb Dressel', 'Elaine Thompson', 'Katie Ledecky', 'Karsten Warholm', 'Teddy Riner'],
          datasets: [{
            label: 'Médailles',
            data: [5, 3, 4, 2, 2],
            backgroundColor: [gold, gold, silver, bronze, bronze],
            borderWidth: 0,
            borderRadius: 6,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(148,163,184,.15)' } },
            y: { grid: { display: false } }
          }
        }
      });
    }

    // Médailles: Chronologie (line)
    const medalsTimelineCtx = document.getElementById('medalsTimelineChart');
    if (medalsTimelineCtx){
      new window.Chart(medalsTimelineCtx, {
        type: 'line',
        data: {
          labels: ['Juil 23', 'Juil 25', 'Juil 27', 'Juil 29', 'Juil 31', 'Août 02'],
          datasets: [{
            label: 'Médailles cumulées',
            data: [3, 11, 19, 31, 52, 75],
            borderColor: primary,
            backgroundColor: 'rgba(85,112,255,0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(148,163,184,.15)' } } }
        }
      });
    }

    // Médailles: Par pays (stacked bar)
    const medalsByCountryCtx = document.getElementById('medalsByCountryChart');
    if (medalsByCountryCtx){
      new window.Chart(medalsByCountryCtx, {
        type: 'bar',
        data: {
          labels: ['USA', 'CHN', 'JPN', 'GBR', 'ROC'],
          datasets: [
            { label: 'Or', data: [39, 38, 27, 22, 20], backgroundColor: gold, borderWidth: 0, borderRadius: 6 },
            { label: 'Argent', data: [41, 32, 14, 21, 28], backgroundColor: silver, borderWidth: 0, borderRadius: 6 },
            { label: 'Bronze', data: [33, 18, 17, 22, 23], backgroundColor: bronze, borderWidth: 0, borderRadius: 6 },
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, grid: { color: 'rgba(148,163,184,.15)' } }
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
  const table = document.getElementById('resultsTable');
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

  // Coaches page: simple search on coachesTable
  const coachSearch = document.getElementById('coachSearch');
  const coachesTable = document.getElementById('coachesTable');
  const noCoachResults = document.getElementById('noCoachResults');
  function filterCoaches(){
    if (!coachesTable) return;
    const query = (coachSearch?.value || '').toLowerCase().trim();
    let visible = 0;
    coachesTable.querySelectorAll('tbody:first-of-type tr').forEach((row) => {
      const text = row.textContent?.toLowerCase() || '';
      const show = !query || text.includes(query);
      row.toggleAttribute('hidden', !show);
      if (show) visible++;
    });
    noCoachResults?.toggleAttribute('hidden', visible !== 0);
  }
  coachSearch?.addEventListener('input', filterCoaches);

})();
