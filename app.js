/* ============================================================
   AGILE WORKSPACE — Sprint Tracker (vanilla JS)
   Sprint e progetti personalizzabili, salvati per-utente su Supabase.
   ============================================================ */
'use strict';

// ---- Supabase --------------------------------------------------------------
const SUPABASE_URL = 'https://gztmjoqtvwodfsydtzny.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6dG1qb3F0dndvZGZzeWR0em55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4Nzg2NzcsImV4cCI6MjA5NzQ1NDY3N30.kritne2-PDgCSwXXy0XzWxJ80i7egNYCm4tx7G3Bjws';
const sb = window.supabase && window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
let currentUser = null;

// ---- Costanti --------------------------------------------------------------
const HOURS = ['09–10','10–11','11–12','12–13','14–15','15–16','16–17','17–18'];
const DOW = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
const MONTHS = ['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC'];
const PALETTE = ['#0057FF', '#FFD400', '#CDC3BA', '#323232', '#1a66ff', '#00a98f', '#ff6b35'];
const LEGACY_STARTS = [2, 9, 16, 23];          // vecchio layout (giugno 2025) per migrazione dati

// ---- Stato (tutto per-utente) ----------------------------------------------
// sprint = { id, name, startDate, endDate, order:[code], projects:{code:{name,title,color,ink,doc,checks}}, grid:{ 'YYYY-MM-DD-h': code } }
const state = {
  activeTab: 'calendar',
  activeWeek: 0,
  activeProject: null,
  sprints: [],
  activeSprintId: null,
};
let editingSprint = null;   // sprint in modifica nella modale, null = nuovo

// ---- Helpers ---------------------------------------------------------------
const $ = (sel, root = document) => root.querySelector(sel);
const fmtSP = (n) => {
  const r = Math.round(n * 2) / 2;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
function inkFor(hex) {
  const n = parseInt(String(hex).slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 140 ? '#323232' : '#FAF7EB';
}
function noon(s) { return new Date(s + 'T12:00:00'); }
function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function validRange(s, e) {
  if (!s || !e) return false;
  const a = noon(s), b = noon(e);
  return !isNaN(a) && !isNaN(b) && b >= a;
}
// settimane Lun→Sab che coprono l'intervallo dello sprint
function getWeeks(start, end) {
  if (!validRange(start, end)) return [];
  const s = noon(start), e = noon(end);
  const dow = s.getDay() || 7;                         // Lun=1 … Dom=7
  const mon = new Date(s); mon.setDate(s.getDate() - (dow - 1));
  const weeks = [];
  let guard = 0;
  while (mon <= e && guard++ < 60) {
    const days = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      days.push({ date: ymd(d), dow: DOW[d.getDay()], dd: String(d.getDate()).padStart(2, '0'), mon: MONTHS[d.getMonth()] });
    }
    weeks.push(days);
    mon.setDate(mon.getDate() + 7);
  }
  return weeks;
}
function workingDays(start, end) {
  if (!validRange(start, end)) return 0;
  let n = 0, g = 0;
  const cur = noon(start), e = noon(end);
  while (cur <= e && g++ < 400) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) n++;                       // Lun–Ven
    cur.setDate(cur.getDate() + 1);
  }
  return n;
}
function fmtRange(s, e) {
  if (!validRange(s, e)) return 'Date non impostate';
  const f = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short' });
  const fy = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${f.format(noon(s))} – ${fy.format(noon(e))}`;
}

function sprint() { return state.sprints.find((s) => s.id === state.activeSprintId) || null; }
function countByProject(sp) {
  const counts = {};
  sp.order.forEach((c) => { counts[c] = 0; });
  Object.values(sp.grid).forEach((c) => { if (counts[c] != null) counts[c]++; });
  return counts;
}

// ---- Render: barra sprint (select + hero + tile) ---------------------------
function renderSprintBar() {
  const sel = $('#sprintSelect');
  sel.innerHTML = '';
  if (!state.sprints.length) {
    const o = document.createElement('option');
    o.textContent = 'Nessuno sprint'; o.disabled = true;
    sel.appendChild(o);
  } else {
    state.sprints.forEach((s) => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      sel.appendChild(o);
    });
    sel.value = state.activeSprintId;
  }
  $('#statSprints').textContent = String(state.sprints.length).padStart(2, '0');

  const sp = sprint();
  if (!sp) {
    $('#heroName').textContent = 'Nessuno sprint';
    $('#heroRange').textContent = 'Crea uno sprint per iniziare';
    $('#statDays').textContent = '0';
    return;
  }
  const wd = workingDays(sp.startDate, sp.endDate);
  $('#heroName').textContent = sp.name;
  $('#heroRange').textContent = `${fmtRange(sp.startDate, sp.endDate)} · ${wd} gg lavorativi`;
  $('#statDays').textContent = wd;
}

// ---- Render: metriche live -------------------------------------------------
function renderMetrics() {
  const sp = sprint();
  const wd = sp ? workingDays(sp.startDate, sp.endDate) : 0;
  const capH = wd * 8;
  const logged = sp ? Object.keys(sp.grid).length : 0;   // 1 cella = 1 ora
  const pct = capH ? Math.min(100, Math.round(logged / capH * 100)) : 0;

  $('#spNum').textContent  = fmtSP(logged / 8);          // 8h = 1 SP
  $('#spTot').textContent  = `/ ${wd} SP`;
  $('#loggedH').textContent = logged;
  $('#capH').textContent   = capH;
  $('#capLab').textContent = `Ore / ${capH}`;
  $('#statHours').textContent = logged;
  $('#capBar').style.width = pct + '%';
  $('#capPct').textContent = pct + '%';

  const spList = $('#spList');
  spList.innerHTML = '';
  const chips = $('#assignedChips');
  chips.innerHTML = '';

  if (!sp || !sp.order.length) {
    $('#statProjects').textContent = '0';
    spList.innerHTML = '<div class="dim mono" style="font-size:12px">Nessun progetto. Aggiungilo da “Nuovo/Modifica Sprint”.</div>';
    return;
  }

  const counts = countByProject(sp);
  $('#statProjects').textContent = sp.order.filter((c) => counts[c] > 0).length;

  sp.order.forEach((code) => {
    const p = sp.projects[code];
    const hrs = counts[code];
    const row = document.createElement('div');
    row.className = 'sp-row';
    row.innerHTML =
      `<div class="sp-name"><span class="sp-dot" style="background:${p.color}"></span>${esc(p.name)}</div>` +
      `<div class="sp-bar-track"><div class="sp-bar-fill" style="width:${capH ? Math.min(100, hrs / capH * 100) : 0}%;background:${p.color}"></div></div>` +
      `<div class="sp-val"><b>${fmtSP(hrs / 8)} SP</b> <span class="dim">· ${hrs}h</span></div>`;
    spList.appendChild(row);
  });

  sp.order.forEach((code) => {
    const p = sp.projects[code];
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
  const sp = sprint();
  const cal = $('#cal');
  const wb = $('#weekBtns');
  wb.innerHTML = '';
  cal.innerHTML = '';

  const weeks = sp ? getWeeks(sp.startDate, sp.endDate) : [];
  if (!weeks.length) {
    $('#weekTitle').textContent = '—';
    cal.innerHTML = '<div class="dim mono" style="padding:30px 0;text-align:center">Nessuno sprint con date valide.</div>';
    return;
  }
  if (state.activeWeek >= weeks.length) state.activeWeek = 0;
  const w = state.activeWeek;
  $('#weekTitle').textContent = `Settimana ${w + 1}`;

  weeks.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'week-btn' + (i === w ? ' is-active' : '');
    b.textContent = `Sett ${i + 1}`;
    b.addEventListener('click', () => { state.activeWeek = i; renderCalendar(); });
    wb.appendChild(b);
  });

  const days = weeks[w];
  const head = document.createElement('div');
  head.className = 'cal-row';
  head.appendChild(document.createElement('div'));
  days.forEach((d) => {
    const col = document.createElement('div');
    col.className = 'cal-daycol';
    col.innerHTML = `<div class="cal-dayname">${d.dow}</div><div class="cal-daydate">${d.dd} ${d.mon}</div>`;
    head.appendChild(col);
  });
  cal.appendChild(head);

  HOURS.forEach((label, hi) => {
    const row = document.createElement('div');
    row.className = 'cal-row';
    const lab = document.createElement('div');
    lab.className = 'cal-rowlab';
    lab.textContent = label;
    row.appendChild(lab);

    days.forEach((day) => {
      const key = `${day.date}-${hi}`;
      const code = sp.grid[key] || '';
      const p = code ? sp.projects[code] : null;
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.title = sp.order.length ? 'Clicca per assegnare' : 'Aggiungi prima un progetto';
      cell.innerHTML = p
        ? `<div class="cell-code" style="background:${p.color};color:${p.ink}">${esc(p.name)}</div>`
        : '<div class="cell-empty"></div>';
      cell.addEventListener('click', () => cycleCell(key));
      row.appendChild(cell);
    });
    cal.appendChild(row);
  });
}

function cycleCell(key) {
  const sp = sprint();
  if (!sp || !sp.order.length) return;
  const cycle = ['', ...sp.order];
  const idx = cycle.indexOf(sp.grid[key] || '');
  const next = cycle[(idx < 0 ? 0 : idx + 1) % cycle.length];
  if (next) sp.grid[key] = next; else delete sp.grid[key];
  renderCalendar();
  renderMetrics();
  scheduleSave();
}

// ---- Render: workspace -----------------------------------------------------
function renderWorkspace() {
  fillProjectSelect();
  const sp = sprint();

  if (!sp || !sp.order.length) {
    $('#apHeading').textContent = 'Nessun progetto';
    $('#apIcon').setAttribute('stroke', '#9b9890');
    $('#wsCard').style.borderTopColor = '#45443f';
    $('#wsDoc').innerHTML = '';
    $('#checkList').innerHTML = '';
    return;
  }

  if (!sp.projects[state.activeProject]) state.activeProject = sp.order[0];
  const p = sp.projects[state.activeProject];
  $('#projectSelect').value = state.activeProject;
  $('#apHeading').textContent = p.title ? `${p.name} — ${p.title}` : p.name;
  $('#apIcon').setAttribute('stroke', p.color);
  $('#wsCard').style.borderTopColor = p.color;
  $('#wsDoc').innerHTML = p.doc;

  const list = $('#checkList');
  list.innerHTML = '';
  p.checks.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'check' + (c.done ? ' is-done' : '');
    row.innerHTML =
      `<span class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="#FAF7EB" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>` +
      `<span class="check-label">${esc(c.label)}</span>`;
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
  const sp = sprint();
  sel.innerHTML = '';
  if (!sp || !sp.order.length) {
    const o = document.createElement('option');
    o.textContent = 'Nessun progetto'; o.disabled = true;
    sel.appendChild(o);
    return;
  }
  sp.order.forEach((code) => {
    const opt = document.createElement('option');
    opt.value = code; opt.textContent = code;
    sel.appendChild(opt);
  });
  sel.value = state.activeProject || sp.order[0];
}

// ---- Tabs ------------------------------------------------------------------
function setTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab').forEach((t) =>
    t.classList.toggle('is-active', t.dataset.tab === tab));
  const cal = $('#paneCalendar'), ws = $('#paneWorkspace');
  cal.classList.toggle('is-hidden', tab !== 'calendar');
  ws.classList.toggle('is-hidden', tab !== 'workspace');
  const active = tab === 'calendar' ? cal : ws;
  active.classList.remove('pane-anim');
  void active.offsetWidth;
  active.classList.add('pane-anim');
}

// ---- Modal: nuovo / modifica sprint ----------------------------------------
function pmRow(code, proj) {
  const div = document.createElement('div');
  div.className = 'pm-row';
  div.dataset.orig = code || '';
  const color = proj ? proj.color : PALETTE[document.querySelectorAll('.pm-row').length % PALETTE.length];
  div.innerHTML =
    `<input type="color" class="pm-color" value="${color}">` +
    `<input type="text" class="pm-code" maxlength="8" placeholder="Sigla" value="${code ? esc(code) : ''}">` +
    `<input type="text" class="pm-title" placeholder="Nome progetto" value="${proj ? esc(proj.title) : ''}">` +
    `<button class="pm-del" title="Elimina progetto">&times;</button>`;
  div.querySelector('.pm-del').addEventListener('click', () => div.remove());
  return div;
}

function openModal(editing) {
  const sp = sprint();
  editingSprint = editing && sp ? sp : null;
  $('#modalTitle').textContent = editingSprint ? 'Modifica Sprint' : 'Nuovo Sprint';
  $('#btnSubmit').textContent = editingSprint ? 'Salva' : 'Inserisci';
  $('#btnDeleteSprint').style.display = editingSprint ? '' : 'none';

  $('#spName').value  = editingSprint ? editingSprint.name : '';
  $('#spStart').value = editingSprint ? editingSprint.startDate : '';
  $('#spEnd').value   = editingSprint ? editingSprint.endDate : '';

  const list = $('#pmList');
  list.innerHTML = '';
  if (editingSprint) editingSprint.order.forEach((c) => list.appendChild(pmRow(c, editingSprint.projects[c])));

  $('#overlay').classList.remove('is-hidden');
}
function closeModal() { $('#overlay').classList.add('is-hidden'); editingSprint = null; }

function readProjectRows(old) {
  const projects = {};
  const order = [];
  const rename = {};
  document.querySelectorAll('.pm-row').forEach((r) => {
    const code = r.querySelector('.pm-code').value.trim().toUpperCase();
    if (!code || projects[code]) return;
    const title = r.querySelector('.pm-title').value.trim();
    const color = r.querySelector('.pm-color').value;
    const orig = r.dataset.orig || '';
    const src = orig && old[orig] ? old[orig] : null;
    projects[code] = { name: code, title, color, ink: inkFor(color), doc: src ? src.doc : '', checks: src ? src.checks : [] };
    order.push(code);
    if (orig && orig !== code) rename[orig] = code;
  });
  return { projects, order, rename };
}

function saveSprint() {
  const name = $('#spName').value.trim() || 'Sprint';
  const startDate = $('#spStart').value;
  const endDate = $('#spEnd').value;

  if (editingSprint) {
    const { projects, order, rename } = readProjectRows(editingSprint.projects);
    const grid = {};
    Object.entries(editingSprint.grid).forEach(([k, v]) => {
      const nv = rename[v] || v;
      if (projects[nv]) grid[k] = nv;
    });
    Object.assign(editingSprint, { name, startDate, endDate, projects, order, grid });
    if (!projects[state.activeProject]) state.activeProject = order[0] || null;
  } else {
    const { projects, order } = readProjectRows({});
    const sp = { id: 's-' + Date.now(), name, startDate, endDate, projects, order, grid: {} };
    state.sprints.push(sp);
    state.activeSprintId = sp.id;
    state.activeWeek = 0;
    state.activeProject = order[0] || null;
  }

  closeModal();
  renderAll();
  scheduleSave();
}

function deleteSprint() {
  if (!editingSprint) return;
  if (!confirm(`Eliminare lo sprint “${editingSprint.name}” e tutti i suoi dati?`)) return;
  state.sprints = state.sprints.filter((s) => s.id !== editingSprint.id);
  state.activeSprintId = state.sprints.length ? state.sprints[0].id : null;
  state.activeWeek = 0;
  const sp = sprint();
  state.activeProject = sp && sp.order.length ? sp.order[0] : null;
  closeModal();
  renderAll();
  scheduleSave();
}

// ---- Persistenza (Supabase) ------------------------------------------------
function serializeState() {
  return { sprints: state.sprints, activeSprintId: state.activeSprintId, activeProject: state.activeProject };
}
function resetState() {
  state.sprints = [];
  state.activeSprintId = null;
  state.activeProject = null;
  state.activeWeek = 0;
}
function normalizeProjects(rawProjects, rawOrder) {
  const order = Array.isArray(rawOrder) ? rawOrder.filter((c) => rawProjects[c]) : Object.keys(rawProjects || {});
  const projects = {};
  order.forEach((c, i) => {
    const p = rawProjects[c] || {};
    const color = p.color || PALETTE[i % PALETTE.length];
    projects[c] = {
      name: c, title: p.title || '', color, ink: p.ink || inkFor(color),
      doc: p.doc || '', checks: Array.isArray(p.checks) ? p.checks : [],
    };
  });
  return { projects, order };
}
function migrateLegacy(d) {
  // formato vecchio: singolo sprint implicito con grid 'w-d-h' (giugno 2025)
  const grid = {};
  Object.entries(d.grid || {}).forEach(([k, v]) => {
    const m = /^(\d+)-(\d+)-(\d+)$/.exec(k);
    if (!m) return;
    const w = +m[1], di = +m[2], hi = +m[3];
    if (LEGACY_STARTS[w] == null) return;
    const date = `2025-06-${String(LEGACY_STARTS[w] + di).padStart(2, '0')}`;
    grid[`${date}-${hi}`] = v;
  });
  const { projects, order } = normalizeProjects(d.projects || {}, d.order);
  Object.keys(grid).forEach((k) => { if (!projects[grid[k]]) delete grid[k]; });
  return { id: 's-legacy', name: 'Sprint Giugno', startDate: '2025-06-02', endDate: '2025-06-27', projects, order, grid };
}
function applyState(d) {
  if (!d) return;

  let sprints;
  if (Array.isArray(d.sprints)) {
    sprints = d.sprints.map((s) => {
      const { projects, order } = normalizeProjects(s.projects || {}, s.order);
      const grid = (s.grid && typeof s.grid === 'object') ? s.grid : {};
      Object.keys(grid).forEach((k) => { if (!projects[grid[k]]) delete grid[k]; });
      return { id: s.id || ('s-' + Math.random().toString(36).slice(2)), name: s.name || 'Sprint',
               startDate: s.startDate || '', endDate: s.endDate || '', projects, order, grid };
    });
  } else if (d.projects || d.grid) {
    sprints = [migrateLegacy(d)];                       // dati vecchi → un singolo sprint
  } else {
    sprints = [];
  }

  state.sprints = sprints;
  state.activeSprintId = sprints.find((s) => s.id === d.activeSprintId) ? d.activeSprintId
                        : (sprints[0] ? sprints[0].id : null);
  const sp = sprint();
  state.activeProject = sp && sp.projects[d.activeProject] ? d.activeProject
                       : (sp && sp.order[0] ? sp.order[0] : null);
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
  resetState();
  const { data } = await sb.from('user_data').select('app_state').eq('user_id', currentUser.id).maybeSingle();
  applyState(data && data.app_state);
}

function renderAll() {
  renderSprintBar();
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
  try { await loadState(); } catch (e) { console.error('loadState', e); }
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

  $('#sprintSelect').addEventListener('change', (e) => {
    state.activeSprintId = e.target.value;
    state.activeWeek = 0;
    const sp = sprint();
    state.activeProject = sp && sp.order.length ? sp.order[0] : null;
    renderAll();
    scheduleSave();
  });

  $('#projectSelect').addEventListener('change', (e) => {
    state.activeProject = e.target.value;
    renderWorkspace();
    scheduleSave();
  });

  document.querySelectorAll('.ws-tool[data-cmd]').forEach((btn) =>
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      $('#wsDoc').focus();
      const { cmd, val } = btn.dataset;
      document.execCommand(cmd, false, cmd === 'formatBlock' ? `<${val}>` : null);
    }));

  $('#wsDoc').addEventListener('input', () => {
    const sp = sprint();
    const p = sp && sp.projects[state.activeProject];
    if (p) { p.doc = $('#wsDoc').innerHTML; scheduleSave(); }
  });

  $('#btnNewSprint').addEventListener('click', () => openModal(false));
  $('#btnEditSprint').addEventListener('click', () => openModal(true));
  $('#pmAdd').addEventListener('click', () => {
    const row = pmRow('', null);
    $('#pmList').appendChild(row);
    row.querySelector('.pm-code').focus();
  });
  $('#btnSubmit').addEventListener('click', saveSprint);
  $('#btnDeleteSprint').addEventListener('click', deleteSprint);
  $('#btnCloseModal').addEventListener('click', closeModal);
  $('#btnCancel').addEventListener('click', closeModal);
  $('#overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  const { data } = await sb.auth.getSession();
  if (data.session) showApp(data.session.user); else showAuth();
});
