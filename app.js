/* ============================================================
   AGILE WORKSPACE — Sprint Tracker (vanilla JS)
   ============================================================ */
'use strict';

// ---- Supabase --------------------------------------------------------------
const SUPABASE_URL = 'https://gztmjoqtvwodfsydtzny.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6dG1qb3F0dndvZGZzeWR0em55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4Nzg2NzcsImV4cCI6MjA5NzQ1NDY3N30.kritne2-PDgCSwXXy0XzWxJ80i7egNYCm4tx7G3Bjws';
const sb = window.supabase && window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
let currentUser = null;

// ---- Project registry ------------------------------------------------------
const PROJECTS = {
  RCA: { name: 'RCA', color: '#0057FF', ink: '#FAF7EB', title: 'Restyle Cliente A',
    doc: '<h1>Kickoff &amp; obiettivi sprint</h1>' +
         '<p>Restyle completo della dashboard cliente. Consegna prevista entro fine sprint, review interna il 24/06.</p>' +
         '<h2>Note</h2><ul><li>Mantenere coerenza con il design system esistente.</li>' +
         '<li>Confermare con il cliente le sigle progetto entro lunedì.</li></ul>',
    checks: [
      { label: 'Wireframe schermata principale', done: true },
      { label: 'Definizione palette e tipografia', done: true },
      { label: 'Prototipo interattivo dashboard', done: false },
      { label: 'Handoff sviluppo', done: false },
    ] },
  MEM: { name: 'MEM', color: '#FFD400', ink: '#323232', title: 'Membership Platform',
    doc: '<h1>Piattaforma membership</h1>' +
         '<p>Implementazione del flusso di iscrizione e dell\'area riservata, con pagamenti ricorrenti.</p>' +
         '<h2>Note</h2><ul><li>Verificare la compliance GDPR sui dati di iscrizione.</li>' +
         '<li>Testare il gateway di pagamento in sandbox.</li></ul>',
    checks: [
      { label: 'Schema DB utenti', done: true },
      { label: 'Flusso di signup', done: false },
      { label: 'Integrazione pagamenti', done: false },
      { label: 'Email transazionali', done: false },
    ] },
  TW:  { name: 'TW',  color: '#CDC3BA', ink: '#323232', title: 'The Wave — Sito',
    doc: '<h1>Sito The Wave</h1>' +
         '<p>Aggiornamento della sezione portfolio e ottimizzazione delle performance delle pagine.</p>' +
         '<h2>Note</h2><ul><li>Lazy-load delle immagini del portfolio.</li>' +
         '<li>Rivedere il copy della homepage con il team.</li></ul>',
    checks: [
      { label: 'Audit performance', done: true },
      { label: 'Nuova sezione portfolio', done: false },
      { label: 'SEO on-page', done: false },
    ] },
  OPS: { name: 'OPS', color: '#323232', ink: '#FAF7EB', title: 'Operations Interne',
    doc: '<h1>Operations interne</h1>' +
         '<p>Automazione dei report settimanali e revisione dei processi di onboarding.</p>' +
         '<h2>Note</h2><ul><li>Rivedere lo script di export dei report.</li>' +
         '<li>Aggiornare la checklist di onboarding per i nuovi.</li></ul>',
    checks: [
      { label: 'Template report', done: true },
      { label: 'Automazione export', done: false },
      { label: 'Documentazione onboarding', done: false },
    ] },
};
const ORDER = ['RCA', 'MEM', 'TW', 'OPS'];
const CYCLE = ['', 'RCA', 'MEM', 'TW', 'OPS']; // '' = cella vuota

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const WEEK_STARTS = [2, 9, 16, 23];           // giorno iniziale di ogni settimana (giugno)
const HOURS = ['09–10','10–11','11–12','12–13','14–15','15–16','16–17','17–18'];
const CAPACITY = 160;                          // ore di capacità sprint

// ---- Stato -----------------------------------------------------------------
const state = {
  activeTab: 'calendar',
  activeWeek: 0,
  activeProject: 'RCA',
  grid: {},                                    // chiave `${w}-${day}-${hour}` -> codice progetto
};

// ---- Seed dati di esempio --------------------------------------------------
(function seed() {
  const pat = [
    ['RCA','RCA','RCA','TW','MEM',''],
    ['RCA','RCA','','TW','MEM',''],
    ['RCA','MEM','MEM','RCA','',''],
    ['MEM','MEM','','RCA','RCA','TW'],
    ['MEM','RCA','RCA','','OPS',''],
    ['RCA','','RCA','MEM','OPS',''],
    ['TW','RCA','OPS','MEM','',''],
    ['','OPS','','MEM','MEM',''],
  ];
  for (let w = 0; w < 4; w++) {
    const maxRow = w < 2 ? 8 : w === 2 ? 4 : 2;  // settimane più avanti = meno ore tracciate
    for (let hi = 0; hi < 8; hi++) {
      if (hi >= maxRow) continue;
      for (let di = 0; di < 6; di++) {
        const code = pat[hi][di];
        if (code) state.grid[`${w}-${di}-${hi}`] = code;
      }
    }
  }
})();

// ---- Helpers ---------------------------------------------------------------
const $ = (sel, root = document) => root.querySelector(sel);
const fmtSP = (n) => {
  const r = Math.round(n * 2) / 2;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};
function countByProject() {
  const counts = { RCA: 0, MEM: 0, TW: 0, OPS: 0 };
  Object.values(state.grid).forEach((c) => { if (counts[c] != null) counts[c]++; });
  return counts;
}

// ---- Render: metriche live (hero, tile, SP per progetto, chip) -------------
function renderMetrics() {
  const counts = countByProject();
  const logged = Object.keys(state.grid).length;        // 1 cella = 1 ora
  const pct = Math.round(logged / CAPACITY * 100);

  $('#spNum').textContent   = fmtSP(logged / 8);         // 8h = 1 SP
  $('#loggedH').textContent = logged;
  $('#statHours').textContent = logged;
  $('#capBar').style.width  = pct + '%';
  $('#capPct').textContent  = pct + '%';
  $('#statProjects').textContent = ORDER.filter((c) => counts[c] > 0).length;

  // SP per progetto
  const spList = $('#spList');
  spList.innerHTML = '';
  ORDER.forEach((code) => {
    const p = PROJECTS[code];
    const hrs = counts[code];
    const row = document.createElement('div');
    row.className = 'sp-row';
    row.innerHTML =
      `<div class="sp-name"><span class="sp-dot" style="background:${p.color}"></span>${p.name}</div>` +
      `<div class="sp-bar-track"><div class="sp-bar-fill" style="width:${hrs / CAPACITY * 100}%;background:${p.color}"></div></div>` +
      `<div class="sp-val"><b>${fmtSP(hrs / 8)} SP</b> <span class="dim">· ${hrs}h</span></div>`;
    spList.appendChild(row);
  });

  // chip "Progetti assegnati"
  const chips = $('#assignedChips');
  chips.innerHTML = '';
  ORDER.forEach((code) => {
    const p = PROJECTS[code];
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.style.background = p.color;
    chip.style.color = p.ink;
    chip.textContent = p.name;
    chips.appendChild(chip);
  });
}

// ---- Render: calendario ----------------------------------------------------
function renderCalendar() {
  const w = state.activeWeek;
  const start = WEEK_STARTS[w];
  $('#weekTitle').textContent = `Settimana ${w + 1}`;

  // bottoni settimana
  const wb = $('#weekBtns');
  wb.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const b = document.createElement('button');
    b.className = 'week-btn' + (i === w ? ' is-active' : '');
    b.textContent = `Sett ${i + 1}`;
    b.addEventListener('click', () => { state.activeWeek = i; renderCalendar(); });
    wb.appendChild(b);
  }

  const cal = $('#cal');
  cal.innerHTML = '';

  // riga intestazione giorni
  const head = document.createElement('div');
  head.className = 'cal-row';
  head.appendChild(document.createElement('div'));
  DAY_NAMES.forEach((nm, di) => {
    const d = document.createElement('div');
    d.className = 'cal-daycol';
    d.innerHTML = `<div class="cal-dayname">${nm}</div><div class="cal-daydate">${String(start + di).padStart(2, '0')} GIU</div>`;
    head.appendChild(d);
  });
  cal.appendChild(head);

  // righe ore
  HOURS.forEach((label, hi) => {
    const row = document.createElement('div');
    row.className = 'cal-row';
    const lab = document.createElement('div');
    lab.className = 'cal-rowlab';
    lab.textContent = label;
    row.appendChild(lab);

    for (let di = 0; di < 6; di++) {
      const key = `${w}-${di}-${hi}`;
      const code = state.grid[key] || '';
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.title = 'Clicca per assegnare';
      if (code) {
        const p = PROJECTS[code];
        cell.innerHTML = `<div class="cell-code" style="background:${p.color};color:${p.ink}">${p.name}</div>`;
      } else {
        cell.innerHTML = '<div class="cell-empty"></div>';
      }
      cell.addEventListener('click', () => cycleCell(key));
      row.appendChild(cell);
    }
    cal.appendChild(row);
  });
}

function cycleCell(key) {
  const cur = state.grid[key] || '';
  const next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
  if (next) state.grid[key] = next; else delete state.grid[key];
  renderCalendar();
  renderMetrics();
  scheduleSave();
}

// ---- Render: workspace -----------------------------------------------------
function renderWorkspace() {
  if (!PROJECTS[state.activeProject]) state.activeProject = ORDER[0];
  const p = PROJECTS[state.activeProject];
  $('#projectSelect').value = state.activeProject;
  $('#apHeading').textContent = `${p.name} — ${p.title}`;
  $('#apIcon').setAttribute('stroke', p.color);
  $('#wsCard').style.borderTopColor = p.color;

  // documento editabile per progetto
  $('#wsDoc').innerHTML = p.doc;

  // checklist per progetto
  const list = $('#checkList');
  list.innerHTML = '';
  p.checks.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'check' + (c.done ? ' is-done' : '');
    row.innerHTML =
      `<span class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="#FAF7EB" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>` +
      `<span class="check-label">${c.label}</span>`;
    row.addEventListener('click', () => {
      p.checks[i].done = !p.checks[i].done;
      renderWorkspace();
      scheduleSave();
    });
    list.appendChild(row);
  });
}

function fillProjectSelect() {
  const sel = $('#projectSelect');
  sel.innerHTML = '';
  ORDER.forEach((code) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = code;
    sel.appendChild(opt);
  });
}

// ---- Tabs ------------------------------------------------------------------
function setTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab').forEach((t) =>
    t.classList.toggle('is-active', t.dataset.tab === tab));
  const cal = $('#paneCalendar'), ws = $('#paneWorkspace');
  cal.classList.toggle('is-hidden', tab !== 'calendar');
  ws.classList.toggle('is-hidden', tab !== 'workspace');
  // replay fade
  const active = tab === 'calendar' ? cal : ws;
  active.classList.remove('pane-anim');
  void active.offsetWidth;          // reflow per riavviare l'animazione
  active.classList.add('pane-anim');
}

// ---- Modal -----------------------------------------------------------------
function openModal(edit) {
  $('#modalTitle').textContent = edit ? 'Modifica Sprint' : 'Nuovo Sprint';
  $('#btnSubmit').textContent  = edit ? 'Conferma' : 'Inserisci';
  $('#overlay').classList.remove('is-hidden');
}
function closeModal() { $('#overlay').classList.add('is-hidden'); }

// ---- Persistenza (Supabase) ------------------------------------------------
function serializeState() {
  const projects = {};
  ORDER.forEach((c) => { projects[c] = { doc: PROJECTS[c].doc, checks: PROJECTS[c].checks }; });
  return { grid: state.grid, activeProject: state.activeProject, projects };
}
function applyState(data) {
  if (!data) return;                                  // ignora schemi legacy/incompatibili
  if (data.grid && typeof data.grid === 'object') state.grid = data.grid;
  if (ORDER.includes(data.activeProject)) state.activeProject = data.activeProject;
  if (data.projects) ORDER.forEach((c) => {
    const p = data.projects[c];
    if (p) { if (p.doc != null) PROJECTS[c].doc = p.doc; if (p.checks) PROJECTS[c].checks = p.checks; }
  });
}

let saveTimer = null;
function scheduleSave() {
  if (!currentUser) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await sb.from('user_data').upsert({ user_id: currentUser.id, app_state: serializeState() });
  }, 600);
}
async function loadState() {
  const { data } = await sb.from('user_data').select('app_state').eq('user_id', currentUser.id).maybeSingle();
  applyState(data && data.app_state);
}

function renderAll() {
  fillProjectSelect();
  renderMetrics();
  renderCalendar();
  renderWorkspace();
}

// ---- Auth ------------------------------------------------------------------
function showAuth() {
  currentUser = null;
  $('#appShell').hidden = true;
  $('#authOverlay').classList.remove('is-hidden');
}
async function showApp(user) {
  currentUser = user;
  try { await loadState(); } catch (e) { console.error('loadState', e); }   // i dati non devono bloccare il login
  renderAll();
  $('#authOverlay').classList.add('is-hidden');
  $('#appShell').hidden = false;
}
let authMode = 'signin';
function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === 'signup';
  $('#authTitle').textContent      = signup ? 'Registrati' : 'Accedi';
  $('#btnAuthSubmit').textContent  = signup ? 'Registrati' : 'Accedi';
  $('#btnAuthSwitch').textContent  = signup ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati';
  $('#authMsg').textContent = '';
}
async function handleAuth() {
  const email = $('#authEmail').value.trim();
  const password = $('#authPassword').value;
  const msg = $('#authMsg');
  msg.textContent = '';
  if (!email || !password) { msg.textContent = 'Inserisci email e password.'; return; }
  $('#btnAuthSubmit').disabled = true;
  try {
    const fn = authMode === 'signup' ? 'signUp' : 'signInWithPassword';
    const { data, error } = await sb.auth[fn]({ email, password });
    if (error) { msg.textContent = error.message; return; }
    if (!data.session) { msg.textContent = 'Controlla la mail per confermare la registrazione.'; return; }
    await showApp(data.session.user);
  } catch (e) {
    msg.textContent = 'Errore: ' + (e && e.message ? e.message : e);
    console.error('handleAuth', e);
  } finally {
    $('#btnAuthSubmit').disabled = false;
  }
}

// ---- Bootstrap -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  if (!sb) { $('#authMsg').textContent = 'Errore: libreria Supabase non caricata.'; return; }

  $('#btnAuthSubmit').addEventListener('click', () => handleAuth());
  $('#btnAuthSwitch').addEventListener('click', () => setAuthMode(authMode === 'signup' ? 'signin' : 'signup'));
  $('#authPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuth(); });
  $('#btnLogout').addEventListener('click', async () => { await sb.auth.signOut(); setAuthMode('signin'); showAuth(); });

  document.querySelectorAll('.tab').forEach((t) =>
    t.addEventListener('click', () => setTab(t.dataset.tab)));

  $('#projectSelect').addEventListener('change', (e) => {
    state.activeProject = e.target.value;
    renderWorkspace();
    scheduleSave();
  });

  // toolbar di formattazione: execCommand è deprecato ma è il modo nativo,
  // ponytail: zero-dipendenze per rich-text in un demo; sostituire solo se serve di più.
  document.querySelectorAll('.ws-tool[data-cmd]').forEach((btn) =>
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();                 // mantieni la selezione nel documento
      $('#wsDoc').focus();
      const { cmd, val } = btn.dataset;
      document.execCommand(cmd, false, cmd === 'formatBlock' ? `<${val}>` : null);
    }));

  // salva le modifiche del documento sul progetto attivo
  $('#wsDoc').addEventListener('input', () => {
    PROJECTS[state.activeProject].doc = $('#wsDoc').innerHTML;
    scheduleSave();
  });

  // ponytail: lo sprint select aggiorna solo le etichette; un solo sprint ha dati reali.
  $('#sprintSelect').addEventListener('change', (e) => {
    $('.hero-name').textContent = e.target.value;
  });

  $('#btnNewSprint').addEventListener('click', () => openModal(false));
  $('#btnEditSprint').addEventListener('click', () => openModal(true));
  $('#btnCloseModal').addEventListener('click', closeModal);
  $('#btnCancel').addEventListener('click', closeModal);
  $('#btnSubmit').addEventListener('click', closeModal);
  $('#overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  const { data } = await sb.auth.getSession();
  if (data.session) showApp(data.session.user); else showAuth();
});
