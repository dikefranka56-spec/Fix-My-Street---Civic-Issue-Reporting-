(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const STORAGE_KEY = 'fixmystreet-demo-reports-v1';
  const seedReports = [
    {id:'FM-1042',title:'Deep pothole near the bus stop',category:'Roads',location:'Wetheral Road',area:'Owerri Central',status:'In progress',date:'2 hours ago',description:'A deep pothole is forcing vehicles to swerve into the next lane, especially during busy periods.',lat:5.483, lng:7.035,icon:'⌁'},
    {id:'FM-1041',title:'Overflowing public waste bin',category:'Waste',location:'Douglas Road Market',area:'Owerri Central',status:'Submitted',date:'5 hours ago',description:'The bin is full and waste is spilling onto the pavement. The area is busy with pedestrians.',lat:5.485,lng:7.031,icon:'♻'},
    {id:'FM-1040',title:'Streetlight not working',category:'Lighting',location:'Ikenegbu Layout',area:'Ikenegbu',status:'Resolved',date:'Yesterday',description:'The streetlight at the junction was not working after dark. The light has been marked as restored.',lat:5.489,lng:7.022,icon:'☼'},
    {id:'FM-1039',title:'Damaged pavement creates hazard',category:'Roads',location:'School Road',area:'New Owerri',status:'In progress',date:'Yesterday',description:'Loose paving blocks create a trip hazard for people walking along the roadside.',lat:5.472,lng:7.047,icon:'⌁'},
    {id:'FM-1038',title:'Illegal dumping beside drainage',category:'Waste',location:'Aladinma Extension',area:'New Owerri',status:'Submitted',date:'2 days ago',description:'Household waste has been dumped beside an open drain and may block water flow.',lat:5.476,lng:7.058,icon:'♻'},
    {id:'FM-1037',title:'Open drain cover needs repair',category:'Other',location:'World Bank Junction',area:'New Owerri',status:'Resolved',date:'3 days ago',description:'A broken drain cover needed attention near the pedestrian crossing.',lat:5.467,lng:7.060,icon:'⚠'},
    {id:'FM-1036',title:'Streetlight out near footpath',category:'Lighting',location:'Egbu Road',area:'Owerri Central',status:'In progress',date:'4 days ago',description:'The lamp near the footpath is out, leaving the walking area poorly lit in the evening.',lat:5.495,lng:7.040,icon:'☼'},
    {id:'FM-1035',title:'Fallen branch blocking walkway',category:'Other',location:'Ikenegbu Extension',area:'Ikenegbu',status:'Resolved',date:'5 days ago',description:'A fallen branch was blocking part of the walkway. This is a sample resolved report.',lat:5.492,lng:7.015,icon:'⚠'}
  ];
  let reports = loadReports();
  let statusFilter = 'All';
  let categoryFilter = 'All';
  let expandedAll = false;
  let map;
  let markersLayer;
  let toastTimer;
  let photoData = '';

  function loadReports() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(stored) ? stored : [...seedReports];
    } catch { return [...seedReports]; }
  }
  function saveReports() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reports)); }
    catch { showToast('Browser storage is full. The report may not persist after refresh.'); }
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function statusClass(status) { return status.toLowerCase().replaceAll(' ', '-'); }
  function categoryClass(category) { return category.toLowerCase(); }
  function categoryIcon(category) { return ({Roads:'⌁',Waste:'♻',Lighting:'☼',Other:'⚠'})[category] || '⌖'; }
  function showToast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }
  function filteredReports() {
    const query = $('#search-input').value.trim().toLowerCase();
    return reports.filter(r => (statusFilter === 'All' || r.status === statusFilter) && (categoryFilter === 'All' || r.category === categoryFilter) && (!query || [r.title,r.location,r.category,r.description,r.id].some(v => String(v || '').toLowerCase().includes(query))));
  }
  function renderReports() {
    const items = filteredReports();
    const visible = expandedAll ? items : items.slice(0, 6);
    $('#report-list').innerHTML = visible.map(r => `<article class="report-item" data-id="${esc(r.id)}" tabindex="0" role="button" aria-expanded="false"><div class="report-icon ${categoryClass(r.category)}">${categoryIcon(r.category)}</div><div><div class="report-title">${esc(r.title)}</div><div class="report-meta"><span>${esc(r.location)}</span><span>·</span><span>${esc(r.date)}</span></div><div class="report-description">${esc(r.description)}<br><strong>${esc(r.id)}</strong>${r.photo ? `<br><a href="${r.photo}" target="_blank" rel="noopener">View attached photo</a>` : ''}</div></div><span class="report-status ${statusClass(r.status)}">${esc(r.status)}</span></article>`).join('');
    $('#empty-state').classList.toggle('hidden', items.length !== 0);
    $('#report-list').classList.toggle('hidden', items.length === 0);
    $('#results-count').textContent = `Showing ${items.length} report${items.length === 1 ? '' : 's'}`;
    $('#count-all').textContent = reports.length;
    $('#show-all').classList.toggle('hidden', items.length <= 6);
    $('#show-all').innerHTML = expandedAll ? 'Show fewer reports <span>↑</span>' : 'Show all reports <span>↓</span>';
    renderStats();
    renderMarkers();
  }
  function renderStats() {
    const total = reports.length;
    const progress = reports.filter(r => r.status === 'In progress').length;
    const resolved = reports.filter(r => r.status === 'Resolved').length;
    $('#stat-total').textContent = total + 120;
    $('#stat-progress').textContent = progress + 22;
    $('#stat-resolved').textContent = resolved + 74;
    $('#stat-rate').textContent = `${Math.round(((resolved + 74) / Math.max(total + 120, 1)) * 100)}%`;
  }
  function initMap() {
    const mapEl = $('#issue-map');
    if (!window.L) {
      mapEl.innerHTML = '<div style="padding:35px;color:#617568;font-size:12px">The interactive map needs an internet connection. You can still browse reports in the list.</div>';
      return;
    }
    map = L.map(mapEl, {scrollWheelZoom:false}).setView([5.482, 7.039], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    renderMarkers();
    setTimeout(() => map.invalidateSize(), 150);
  }
  function markerColour(category) { return ({Roads:'#e39a5a',Waste:'#7a9f71',Lighting:'#d6b64b',Other:'#7895be'})[category] || '#7895be'; }
  function renderMarkers() {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    filteredReports().forEach(r => {
      if (!Number.isFinite(Number(r.lat)) || !Number.isFinite(Number(r.lng))) return;
      const colour = markerColour(r.category);
      const icon = L.divIcon({className:'',html:`<div class="custom-pin" style="background:${colour}"><span></span></div>`,iconSize:[29,29],iconAnchor:[14,28],popupAnchor:[0,-27]});
      const marker = L.marker([Number(r.lat),Number(r.lng)],{icon}).bindPopup(`<div class="map-popup"><strong>${esc(r.title)}</strong><small>${esc(r.location)}</small><br><span>${esc(r.status)}</span></div>`);
      marker.addTo(markersLayer);
      marker.on('click', () => { const card = $(`.report-item[data-id="${CSS.escape(String(r.id))}"]`); if (card) { card.classList.add('expanded'); card.setAttribute('aria-expanded','true'); card.scrollIntoView({block:'nearest',behavior:'smooth'}); } });
    });
  }
  function setStatusFilter(value) {
    statusFilter = value;
    $$('.filter-chip').forEach(b => b.classList.toggle('selected', b.dataset.filter === value));
    expandedAll = false; renderReports();
  }
  function setCategoryFilter(value) {
    categoryFilter = value;
    $$('.category-chip').forEach(b => b.classList.toggle('selected', b.dataset.category === value));
    expandedAll = false; renderReports();
  }
  function resetFilters() {
    $('#search-input').value = ''; setStatusFilter('All'); setCategoryFilter('All'); expandedAll = false; renderReports();
  }
  function openDialog() { $('#report-dialog').showModal(); }
  function closeDialog() { $('#report-dialog').close(); }
  function resetForm() { $('#report-form').reset(); photoData = ''; $('#photo-name').textContent = ''; }

  $$('[data-open-report]').forEach(btn => btn.addEventListener('click', openDialog));
  $('.close-dialog').addEventListener('click', closeDialog);
  $('.cancel-report').addEventListener('click', closeDialog);
  $('#report-dialog').addEventListener('click', e => { if (e.target === $('#report-dialog')) closeDialog(); });
  $('#photo-input').addEventListener('change', e => {
    const file = e.target.files?.[0]; photoData = '';
    if (!file) { $('#photo-name').textContent = ''; return; }
    if (!file.type.startsWith('image/')) { showToast('Please choose an image file.'); e.target.value = ''; return; }
    if (file.size > 700000) { showToast('Please choose an image under 700 KB for this browser demo.'); e.target.value = ''; return; }
    const reader = new FileReader(); reader.onload = () => { photoData = String(reader.result || ''); $('#photo-name').textContent = `Selected: ${file.name}`; }; reader.readAsDataURL(file);
  });
  $('#report-form').addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const area = String(form.get('area') || 'Owerri Central');
    const coords = ({'Owerri Central':[5.483,7.035],'New Owerri':[5.472,7.052],'Ikenegbu':[5.489,7.022],'World':[5.482,7.039]})[area] || [5.482,7.039];
    const report = {id:`FM-${Math.floor(1000 + Math.random()*8999)}`,title:String(form.get('title')).trim(),category:String(form.get('category')),location:String(form.get('location')).trim(),area,status:'Submitted',date:'Just now',description:String(form.get('description')).trim(),lat:coords[0]+(Math.random()-.5)*.006,lng:coords[1]+(Math.random()-.5)*.006,icon:categoryIcon(String(form.get('category'))),photo:photoData};
    reports.unshift(report); saveReports(); resetFilters(); resetForm(); closeDialog(); showToast('Demo report added. It is saved in this browser only.');
    if (map && report.lat && report.lng) map.setView([report.lat,report.lng],15,{animate:true});
    $('#dashboard').scrollIntoView({behavior:'smooth',block:'start'});
  });
  $('#search-input').addEventListener('input', () => { expandedAll = false; renderReports(); });
  $$('.filter-chip').forEach(btn => btn.addEventListener('click', () => setStatusFilter(btn.dataset.filter)));
  $$('.category-chip').forEach(btn => btn.addEventListener('click', () => setCategoryFilter(btn.dataset.category)));
  $('#clear-filters').addEventListener('click', resetFilters);
  $('#reset-empty').addEventListener('click', resetFilters);
  $('#show-all').addEventListener('click', () => { expandedAll = !expandedAll; renderReports(); });
  $('#report-list').addEventListener('click', e => { const card = e.target.closest('.report-item'); if (!card) return; const open = card.classList.toggle('expanded'); card.setAttribute('aria-expanded',String(open)); });
  $('#report-list').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const card = e.target.closest('.report-item'); if (card) { e.preventDefault(); const open = card.classList.toggle('expanded'); card.setAttribute('aria-expanded',String(open)); } } });
  const menuToggle = $('.menu-toggle');
  menuToggle.addEventListener('click', () => { const nav = $('.nav-links'); const open = nav.classList.toggle('open'); menuToggle.setAttribute('aria-expanded',String(open)); menuToggle.textContent = open ? '×' : '☰'; });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => { $('.nav-links').classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); menuToggle.textContent='☰'; }));
  document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#search-input').focus(); $('#dashboard').scrollIntoView({behavior:'smooth'}); } });
  renderStats(); renderReports(); initMap();
})();
