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

    // Coaches: Répartition par sport (bar)
    const coachesBySportCtx = document.getElementById('coachesBySportChart');
    if (coachesBySportCtx){
      new window.Chart(coachesBySportCtx, {
        type: 'bar',
        data: {
          labels: ['Athlétisme', 'Natation', 'Judo', 'Cyclisme', 'Gymnastique', 'Football'],
          datasets: [{
            label: 'Entraîneurs',
            data: [6, 5, 4, 3, 5, 5],
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

    // Coaches: Ancienneté moyenne (line)
    const coachExpCtx = document.getElementById('coachExperienceChart');
    if (coachExpCtx){
      new window.Chart(coachExpCtx, {
        type: 'line',
        data: {
          labels: ['2016', '2017', '2018', '2019', '2020', '2021'],
          datasets: [{
            label: 'Années',
            data: [5.2, 5.6, 5.9, 6.1, 6.4, 6.8],
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
  const coachSportFilter = document.getElementById('coachSportFilter');
  const coachCountryFilter = document.getElementById('coachCountryFilter');
  function filterCoaches(){
    if (!coachesTable) return;
    const query = (coachSearch?.value || '').toLowerCase().trim();
    const sport = coachSportFilter?.value || 'all';
    const country = coachCountryFilter?.value || 'all';
    let visible = 0;
    coachesTable.querySelectorAll('tbody:first-of-type tr').forEach((row) => {
      const text = row.textContent?.toLowerCase() || '';
      const rowSport = row.getAttribute('data-sport') || '';
      const rowCountry = row.getAttribute('data-country') || '';
      const matchesQuery = !query || text.includes(query);
      const matchesSport = sport === 'all' || sport === rowSport;
      const matchesCountry = country === 'all' || country === rowCountry;
      const show = matchesQuery && matchesSport && matchesCountry;
      row.toggleAttribute('hidden', !show);
      if (show) visible++;
    });
    noCoachResults?.toggleAttribute('hidden', visible !== 0);
  }
  coachSearch?.addEventListener('input', filterCoaches);
  coachSportFilter?.addEventListener('change', filterCoaches);
  coachCountryFilter?.addEventListener('change', filterCoaches);

  // Predictions page logic (CSV -> features -> model/baseline -> charts/table)
  async function readCSV(path){
    const res = await fetch(path);
    const text = await res.text();
    return text.split(/\r?\n/).filter(Boolean).map((line) => line.split(/;|,/));
  }

  function sum(arr){ return arr.reduce((a,b)=> a + (Number(b)||0), 0); }

  function groupByCountry(rows){
    // Expect header: edition;edition_id;year;country;country_noc;gold;silver;bronze;total;Flag
    const header = rows[0];
    const idx = {
      year: header.indexOf('year'),
      country: header.indexOf('country'),
      noc: header.indexOf('country_noc'),
      gold: header.indexOf('gold'),
      silver: header.indexOf('silver'),
      bronze: header.indexOf('bronze'),
      total: header.indexOf('total')
    };
    const data = {};
    for (let i = 1; i < rows.length; i++){
      const r = rows[i];
      const country = r[idx.country];
      const year = Number(r[idx.year]);
      const gold = Number(r[idx.gold]||0);
      const silver = Number(r[idx.silver]||0);
      const bronze = Number(r[idx.bronze]||0);
      const total = Number(r[idx.total]|| (gold+silver+bronze));
      if (!country || !year) continue;
      if (!data[country]) data[country] = [];
      data[country].push({ year, gold, silver, bronze, total });
    }
    // sort by year asc
    for (const c in data){ data[c].sort((a,b)=> a.year - b.year); }
    return data;
  }

  function computeRecentFeatures(countryToYears, lastK=3){
    const features = {};
    for (const [country, arr] of Object.entries(countryToYears)){
      const recent = arr.slice(-lastK);
      const g = sum(recent.map(x=>x.gold));
      const s = sum(recent.map(x=>x.silver));
      const b = sum(recent.map(x=>x.bronze));
      const t = sum(recent.map(x=>x.total));
      // momentum: delta total between last and first
      const momentum = recent.length >= 2 ? (recent[recent.length-1].total - recent[0].total) : 0;
      features[country] = { gold: g, silver: s, bronze: b, total: t, momentum };
    }
    return features;
  }

  function baselinePredict(features){
    // Simple linear weighting: w_total + small boost by momentum
    const result = [];
    const wTotal = 1.0, wMomentum = 0.4;
    for (const [country, f] of Object.entries(features)){
      const score = wTotal * f.total + wMomentum * Math.max(0, f.momentum);
      // distribute by historical proportions
      const denom = (f.gold + f.silver + f.bronze) || 1;
      const pGold = f.gold / denom, pSilver = f.silver / denom, pBronze = f.bronze / denom;
      const predictedTotal = Math.max(0, Math.round(score));
      const predGold = Math.round(predictedTotal * pGold);
      const predSilver = Math.round(predictedTotal * pSilver);
      const predBronze = Math.max(0, predictedTotal - predGold - predSilver);
      result.push({ country, gold: predGold, silver: predSilver, bronze: predBronze, total: predictedTotal });
    }
    result.sort((a,b)=> b.total - a.total);
    return result;
  }

  async function runONNX(features, modelFile){
    if (!(window.ort)) throw new Error('ONNX runtime indisponible');
    // Build consistent feature order
    const countries = Object.keys(features);
    const X = countries.map((c)=>{
      const f = features[c];
      return [f.gold, f.silver, f.bronze, f.total, f.momentum];
    });
    const flattened = new Float32Array(X.flat());
    const session = await window.ort.InferenceSession.create(modelFile);
    const inputName = session.inputNames[0];
    const dims = [countries.length, 5];
    const feeds = {};
    feeds[inputName] = new window.ort.Tensor('float32', flattened, dims);
    const output = await session.run(feeds);
    const firstOut = output[session.outputNames[0]].data;
    // Assume model outputs total medal prediction per row; fallback if multi-column
    const result = [];
    const cols = firstOut.length / countries.length;
    for (let i=0;i<countries.length;i++){
      const total = Math.max(0, Math.round(cols === 1 ? firstOut[i] : firstOut[i*cols]));
      const f = features[countries[i]];
      const denom = (f.gold + f.silver + f.bronze) || 1;
      const predGold = Math.round(total * (f.gold/denom));
      const predSilver = Math.round(total * (f.silver/denom));
      const predBronze = Math.max(0, total - predGold - predSilver);
      result.push({ country: countries[i], gold: predGold, silver: predSilver, bronze: predBronze, total });
    }
    result.sort((a,b)=> b.total - a.total);
    return result;
  }

  async function initPredictionsPage(){
    const page = document.getElementById('predictionsPage');
    if (!page) return; // not on predictions page

    const styles = getComputedStyle(root);
    const gold = styles.getPropertyValue('--gold').trim();
    const silver = styles.getPropertyValue('--silver').trim();
    const bronze = styles.getPropertyValue('--bronze').trim();

    const modelInput = document.getElementById('modelFile');
    const modelMeta = document.getElementById('modelMeta');
    const runBaselineBtn = document.getElementById('runBaseline');
    const predSearch = document.getElementById('predSearch');
    const tbody = document.getElementById('predictionsBody');
    const emptyRow = document.getElementById('noPredictionsRow');
    const chartCanvas = document.getElementById('predictedByCountryChart');
    const statCountries = document.getElementById('statCountries');
    const statEditions = document.getElementById('statEditions');

    let currentRows = [];
    let chart;

    function renderTable(rows){
      if (!tbody) return;
      tbody.innerHTML = '';
      const q = (predSearch?.value || '').toLowerCase().trim();
      let visible = 0;
      rows.forEach((r) => {
        if (q && !r.country.toLowerCase().includes(q)) return;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.country}</td><td>${r.gold}</td><td>${r.silver}</td><td>${r.bronze}</td><td>${r.total}</td>`;
        tbody.appendChild(tr);
        visible++;
      });
      emptyRow?.toggleAttribute('hidden', visible !== 0);
    }

    function renderChart(rows){
      if (!chartCanvas || !(window.Chart)) return;
      const top = rows.slice(0, 10);
      const labels = top.map(r=>r.country);
      const dataGold = top.map(r=>r.gold);
      const dataSilver = top.map(r=>r.silver);
      const dataBronze = top.map(r=>r.bronze);
      if (chart) chart.destroy();
      chart = new window.Chart(chartCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Or', data: dataGold, backgroundColor: gold, borderWidth: 0, borderRadius: 6 },
            { label: 'Argent', data: dataSilver, backgroundColor: silver, borderWidth: 0, borderRadius: 6 },
            { label: 'Bronze', data: dataBronze, backgroundColor: bronze, borderWidth: 0, borderRadius: 6 },
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true } }
        }
      });
    }

    async function loadData(){
      const hist = await readCSV('historique.csv');
      const grouped = groupByCountry(hist);
      const editions = new Set();
      for (const arr of Object.values(grouped)) arr.forEach(x=> editions.add(x.year));
      const feats = computeRecentFeatures(grouped, 3);
      statCountries && (statCountries.textContent = String(Object.keys(grouped).length));
      statEditions && (statEditions.textContent = String(editions.size));
      return feats;
    }

    function updateAll(rows){ currentRows = rows; renderTable(rows); renderChart(rows); }

    predSearch?.addEventListener('input', ()=> renderTable(currentRows));

    let loadedModelFile = null;
    modelInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file){
        loadedModelFile = file;
        if (modelMeta) modelMeta.textContent = `${file.name} (${Math.round(file.size/1024)} Ko)`;
      } else {
        loadedModelFile = null;
        if (modelMeta) modelMeta.textContent = 'Aucun modèle chargé.';
      }
    });

    const features = await loadData();
    // Default baseline on load for quick insight
    updateAll(baselinePredict(features));

    runBaselineBtn?.addEventListener('click', () => updateAll(baselinePredict(features)));

    // If a model is provided, try inference when file selected
    modelInput?.addEventListener('change', async () => {
      if (!loadedModelFile) return;
      try{
        const rows = await runONNX(features, loadedModelFile);
        updateAll(rows);
      } catch(err){
        console.warn('ONNX inference échouée, fallback baseline:', err);
        updateAll(baselinePredict(features));
      }
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initPredictionsPage);
  } else {
    initPredictionsPage();
  }

})();
