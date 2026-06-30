/* ============================================================
   AGILE WORKSPACE — Sprint Tracker (vanilla JS)
   Sprint e progetti personalizzabili, salvati per-utente su Supabase.
   ============================================================ */
'use strict';

// ponytail: banner debug temporaneo per catturare l'errore reale sullo schermo — rimuovere una volta diagnosticato
function showErrBanner(msg) {
  let b = document.getElementById('errBanner');
  if (!b) {
    b = document.createElement('div'); b.id = 'errBanner';
    b.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#b00020;color:#fff;padding:10px 14px;border-radius:10px;font:12px/1.4 monospace;white-space:pre-wrap;box-shadow:0 8px 30px rgba(0,0,0,.4);max-height:50vh;overflow:auto;cursor:pointer';
    b.title = 'clicca per chiudere';
    b.addEventListener('click', () => b.remove());
    document.body.appendChild(b);
  }
  b.textContent = 'ERRORE (clicca per chiudere):\n' + msg;
}
window.addEventListener('error', (e) => showErrBanner((e.error && e.error.stack) || e.message));
window.addEventListener('unhandledrejection', (e) => showErrBanner('Promise non gestita: ' + ((e.reason && (e.reason.stack || e.reason.message)) || e.reason)));

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
  activeTab: 'summary',
  activeWeek: 0,
  activeProject: null,
  sprints: [],
  activeSprintId: null,
};
let editingSprint = null;   // sprint in modifica nella modale, null = nuovo
let pmDragging = null;      // riga progetto trascinata (drag & drop)

function pmDragAfter(container, y) {
  const rows = [...container.querySelectorAll('.pm-row:not(.dragging)')];
  let best = { offset: -Infinity, el: null };
  rows.forEach((child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > best.offset) best = { offset, el: child };
  });
  return best.el;
}

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
    for (let i = 0; i < 5; i++) {                        // Lun–Ven (no sabato)
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
// Capacità ore di un giorno: override in sp.capacity[data] se presente, altrimenti la giornata piena.
function dayCap(sp, dateStr) {
  const o = sp.capacity && sp.capacity[dateStr];
  return o == null ? HOURS.length : o;
}
function capacityHours(sp) {
  if (!sp || !validRange(sp.startDate, sp.endDate)) return 0;
  let h = 0, g = 0;
  const cur = noon(sp.startDate), e = noon(sp.endDate);
  while (cur <= e && g++ < 400) { const d = cur.getDay(); if (d !== 0 && d !== 6) h += dayCap(sp, ymd(cur)); cur.setDate(cur.getDate() + 1); }
  return h;
}
// Clic sull'intestazione giorno: cicla la capacità 8→6→4→2→0→8.
const CAP_STEPS = [HOURS.length, 6, 4, 2, 0];
function cycleDayCap(dateStr) {
  const sp = sprint();
  if (!sp) return;
  if (!sp.capacity) sp.capacity = {};
  const i = CAP_STEPS.indexOf(dayCap(sp, dateStr));
  const next = CAP_STEPS[(i < 0 ? 0 : i + 1) % CAP_STEPS.length];
  if (next === HOURS.length) delete sp.capacity[dateStr]; else sp.capacity[dateStr] = next;
  renderCalendar();
  renderMetrics();
  scheduleSave();
}
function fmtRange(s, e) {
  if (!validRange(s, e)) return 'Date non impostate';
  const f = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short' });
  const fy = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${f.format(noon(s))} – ${fy.format(noon(e))}`;
}

function isWeekday(dateStr) { const d = noon(dateStr).getDay(); return d !== 0 && d !== 6; }
function cleanGrid(grid) {                               // rimuove ore di sabato/domenica
  Object.keys(grid).forEach((k) => {
    const date = k.slice(0, k.lastIndexOf('-'));
    if (!isWeekday(date)) delete grid[k];
  });
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
}

// ---- Render: metriche live -------------------------------------------------
// Stato vuoto riusabile: icona + titolo + messaggio + eventuale CTA. ctaOnclick è codice fidato (interno).
function emptyState(icon, title, msg, ctaLabel, ctaOnclick) {
  return `<div class="empty">
    <div class="empty-ico" aria-hidden="true">${icon}</div>
    <div class="empty-title">${esc(title)}</div>
    ${msg ? `<div class="empty-msg mono">${esc(msg)}</div>` : ''}
    ${ctaLabel ? `<button type="button" class="btn-primary mono" onclick="${ctaOnclick}">${esc(ctaLabel)}</button>` : ''}
  </div>`;
}

function renderMetrics() {
  const sp = sprint();

  const spList = $('#spList');
  spList.innerHTML = '';
  const chips = $('#assignedChips');
  chips.innerHTML = '';

  if (!sp || !sp.order.length) {
    spList.innerHTML = sp
      ? emptyState('📁', 'Nessun progetto', 'Aggiungi progetti allo sprint dalla modifica.', 'Aggiungi progetti', 'openModal(true)')
      : emptyState('📁', 'Nessun progetto', 'Crea prima uno sprint.', '', '');
    return;
  }

  const counts = countByProject(sp);

  sp.order.forEach((code) => {
    const p = sp.projects[code];
    const hrs = counts[code];
    const doneSP = hrs / 8;
    const planned = p.sp || 0;
    const width = planned ? Math.min(100, doneSP / planned * 100) : 0;
    const row = document.createElement('div');
    row.className = 'sp-row';
    row.style.background = p.color;
    row.style.color = p.ink;
    row.innerHTML =
      `<div class="sp-name"><span class="sp-code">${esc(code)}</span><span class="sp-proj">${esc(p.name)}</span></div>` +
      `<div class="sp-stats mono">` +
        `<span>Assegnati<b>${fmtSP(planned)} SP</b></span>` +
        `<span>Lavorati<b>${fmtSP(doneSP)} SP</b></span>` +
      `</div>` +
      `<div class="sp-bar-track"><div class="sp-bar-fill" style="width:${width}%"></div></div>` +
      `<div class="sp-pct mono">${Math.round(width)}% completato</div>`;
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
    cal.innerHTML = sp
      ? emptyState('🗓️', 'Date sprint mancanti', 'Imposta inizio e fine dello sprint per vedere il timesheet.', 'Modifica sprint', 'openModal(true)')
      : emptyState('🚀', 'Nessuno sprint', 'Crea il tuo primo sprint per iniziare a tracciare le ore.', 'Crea sprint', 'openModal(false)');
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
    const cap = dayCap(sp, d.date);
    const col = document.createElement('div');
    col.className = 'cal-daycol';
    col.innerHTML = `<div class="cal-dayname">${d.dow}</div><div class="cal-daydate">${d.dd} ${d.mon}</div>` +
      `<div class="cal-daycap mono${cap < HOURS.length ? ' is-reduced' : ''}" title="Capacità del giorno · clic per cambiare">${cap}h</div>`;
    col.querySelector('.cal-daycap').addEventListener('click', () => cycleDayCap(d.date));
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
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.key = key;
      cell.title = sp.order.length ? 'Trascina per assegnare' : 'Aggiungi prima un progetto';
      cell.innerHTML = cellInner(sp, sp.grid[key] || '');
      cell.addEventListener('mousedown', (e) => startPaint(e, key, cell));
      cell.addEventListener('mouseenter', () => dragPaint(key, cell));
      row.appendChild(cell);
    });
    cal.appendChild(row);
  });
}

function cellInner(sp, code) {
  const p = code ? sp.projects[code] : null;
  return p
    ? `<div class="cell-code" style="background:${p.color};color:${p.ink}">${esc(p.name)}</div>`
    : '<div class="cell-empty"></div>';
}

// Drag-to-paint: il mousedown sulla prima cella cicla (come il vecchio click) e fissa il valore da "pennellare";
// trascinando, le celle attraversate prendono lo stesso valore. Aggiornamento in-place, un solo re-render al rilascio.
let paintVal = null, painting = false, paintDirty = false;
function startPaint(e, key, cell) {
  const sp = sprint();
  if (!sp || !sp.order.length) return;
  e.preventDefault();                                   // evita selezione testo durante il trascinamento
  const cycle = ['', ...sp.order];
  const idx = cycle.indexOf(sp.grid[key] || '');
  paintVal = cycle[(idx < 0 ? 0 : idx + 1) % cycle.length];
  painting = true; paintDirty = false;
  applyPaint(key, cell);
}
function dragPaint(key, cell) {
  if (painting) applyPaint(key, cell);
}
function applyPaint(key, cell) {
  const sp = sprint();
  if (!sp) return;
  const cur = sp.grid[key] || '';
  if (cur === paintVal) return;                         // nessun cambiamento → evita lavoro inutile
  if (paintVal) sp.grid[key] = paintVal; else delete sp.grid[key];
  cell.innerHTML = cellInner(sp, paintVal);
  paintDirty = true;
}
document.addEventListener('mouseup', () => {
  if (!painting) return;
  painting = false;
  if (paintDirty) { renderCalendar(); renderMetrics(); scheduleSave(); }
});

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
  $('#apHeading').textContent = p.sp ? `${p.name} — ${fmtSP(p.sp)} SP` : p.name;
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
const PANES = { summary: '#paneSummary', calendar: '#paneCalendar', workspace: '#paneWorkspace' };
function setTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab').forEach((t) =>
    t.classList.toggle('is-active', t.dataset.tab === tab));
  Object.entries(PANES).forEach(([k, sel]) => $(sel).classList.toggle('is-hidden', k !== tab));
  const active = $(PANES[tab] || PANES.calendar);
  active.classList.remove('pane-anim');
  void active.offsetWidth;
  active.classList.add('pane-anim');
}

// ---- Modal: nuovo / modifica sprint ----------------------------------------
function pmRow(code, proj) {
  const div = document.createElement('div');
  div.className = 'pm-row';
  div.dataset.orig = code || '';
  if (proj && proj.sharedId) div.dataset.sharedId = proj.sharedId;
  const color = proj ? proj.color : PALETTE[document.querySelectorAll('.pm-row').length % PALETTE.length];
  div.innerHTML =
    `<div class="pm-handle" draggable="true" title="Trascina per riordinare">⠿</div>` +
    `<input type="color" class="pm-color" value="${color}">` +
    `<input type="text" class="pm-code" maxlength="8" placeholder="Sigla" value="${code ? esc(code) : ''}">` +
    `<input type="number" class="pm-sp" min="0" step="0.5" placeholder="SP" value="${proj && proj.sp != null ? proj.sp : ''}">` +
    `<button type="button" class="pm-collab" title="Collaboratori"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span class="pm-collab-n"></span></button>` +
    `<button type="button" class="pm-del" title="Elimina progetto">&times;</button>`;
  div.querySelector('.pm-del').addEventListener('click', () => div.remove());
  div.querySelector('.pm-collab').addEventListener('click', () => openCollabModal(div));
  updateCollabBadge(div);
  const handle = div.querySelector('.pm-handle');
  handle.addEventListener('dragstart', (e) => {
    pmDragging = div; div.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });
  handle.addEventListener('dragend', () => { div.classList.remove('dragging'); pmDragging = null; });
  return div;
}

function flagAddProject() {                                // evidenzia in rosso "+ Aggiungi progetto"
  const b = $('#pmAdd');
  b.style.color = '#ff6b6b';
  b.style.borderColor = '#ff6b6b';
}
function clearAddProjectFlag() { const b = $('#pmAdd'); b.style.color = ''; b.style.borderColor = ''; }

// ---- Collaboratori (per progetto) -----------------------------------------
// Un progetto con collaboratori vive anche come riga in shared_projects (vedi supabase_collaborators.sql);
// il suo uuid è salvato in project.sharedId. ponytail: contenuto blob↔shared non ancora sincronizzato (prossimo step).
let collabRow = null;
let collabSearchTimer = null;

function updateCollabBadge(row) {
  const badge = row.querySelector('.pm-collab-n');
  if (badge) badge.textContent = (+row.dataset.collabCount > 0) ? row.dataset.collabCount : '';
}

async function ensureSharedProject(row) {                 // crea la riga shared_projects al primo invito
  if (row.dataset.sharedId) return row.dataset.sharedId;
  const code = row.querySelector('.pm-code').value.trim().toUpperCase();
  if (!code) return null;
  const color = row.querySelector('.pm-color').value;
  const sp = parseFloat(row.querySelector('.pm-sp').value) || 0;
  const { data, error } = await sb.from('shared_projects').insert({ name: code, sp, color }).select('id').single();
  if (error) { console.error('ensureSharedProject', error); return null; }
  row.dataset.sharedId = data.id;
  return data.id;
}

function openCollabModal(row) {
  collabRow = row;
  const code = row.querySelector('.pm-code').value.trim().toUpperCase();
  $('#collabTitle').textContent = code ? `Collaboratori · ${code}` : 'Collaboratori';
  $('#collabSearch').value = '';
  $('#collabResults').innerHTML = '';
  $('#collabMembers').innerHTML = '';
  $('#collabMsg').textContent = code ? '' : 'Inserisci prima la sigla del progetto.';
  $('#collabOverlay').classList.remove('is-hidden');
  if (row.dataset.sharedId) loadMembers();
  $('#collabSearch').focus();
}
function closeCollabModal() { $('#collabOverlay').classList.add('is-hidden'); collabRow = null; }

async function runCollabSearch() {
  const q = $('#collabSearch').value.trim();
  const box = $('#collabResults');
  if (q.length < 2) { box.innerHTML = ''; return; }
  const { data, error } = await sb.rpc('search_profiles', { p_query: q });
  if (error) { console.error('search_profiles', error); $('#collabMsg').textContent = 'Errore ricerca: ' + error.message; return; }
  box.innerHTML = '';
  (data || []).forEach((u) => {
    const item = document.createElement('div');
    item.className = 'collab-item';
    item.innerHTML = `<span class="ci-email">${esc(u.email)}</span>`;
    const btn = document.createElement('button');
    btn.className = 'collab-add'; btn.textContent = 'Aggiungi';
    btn.addEventListener('click', () => addCollaborator(u.email));
    item.appendChild(btn);
    box.appendChild(item);
  });
  if (!data || !data.length) box.innerHTML = '<div class="modal-hint">Nessun utente registrato con questa email.</div>';
}

async function addCollaborator(email) {
  if (!collabRow) return;
  const code = collabRow.querySelector('.pm-code').value.trim().toUpperCase();
  if (!code) { $('#collabMsg').textContent = 'Inserisci prima la sigla del progetto.'; return; }
  const id = await ensureSharedProject(collabRow);
  if (!id) { $('#collabMsg').textContent = 'Errore nella creazione del progetto condiviso.'; return; }
  const { data, error } = await sb.rpc('add_collaborator', { p_project_id: id, p_email: email });
  if (error) { $('#collabMsg').textContent = 'Errore: ' + error.message; return; }
  if (data === 'ok') { $('#collabMsg').textContent = ''; $('#collabSearch').value = ''; $('#collabResults').innerHTML = ''; loadMembers(); }
  else if (data === 'not_found') $('#collabMsg').textContent = 'Utente non registrato con questa email.';
  else if (data === 'self') $('#collabMsg').textContent = 'Sei già il proprietario del progetto.';
  else $('#collabMsg').textContent = 'Operazione non consentita.';
}

async function loadMembers() {
  if (!collabRow || !collabRow.dataset.sharedId) return;
  const { data, error } = await sb.rpc('list_collaborators', { p_project_id: collabRow.dataset.sharedId });
  if (error) { console.error('list_collaborators', error); return; }
  const box = $('#collabMembers'); box.innerHTML = '';
  (data || []).forEach((m) => {
    const item = document.createElement('div');
    item.className = 'collab-item';
    item.innerHTML = `<span class="ci-email">${esc(m.email)}</span>`;
    const btn = document.createElement('button');
    btn.className = 'collab-remove'; btn.textContent = 'Rimuovi';
    btn.addEventListener('click', () => removeCollaborator(m.user_id));
    item.appendChild(btn);
    box.appendChild(item);
  });
  if (!data || !data.length) box.innerHTML = '<div class="modal-hint">Ancora nessun collaboratore.</div>';
  collabRow.dataset.collabCount = (data || []).length;
  updateCollabBadge(collabRow);
}

async function removeCollaborator(userId) {
  if (!collabRow || !collabRow.dataset.sharedId) return;
  const { error } = await sb.rpc('remove_collaborator', { p_project_id: collabRow.dataset.sharedId, p_user_id: userId });
  if (error) { console.error('remove_collaborator', error); return; }
  loadMembers();
}

function openModal(editing) {
  clearAddProjectFlag();
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
    const sp = parseFloat(r.querySelector('.pm-sp').value) || 0;
    const color = r.querySelector('.pm-color').value;
    const orig = r.dataset.orig || '';
    const src = orig && old[orig] ? old[orig] : null;
    const sharedId = r.dataset.sharedId || (src ? src.sharedId : undefined);
    projects[code] = { name: code, sp, color, ink: inkFor(color), doc: src ? src.doc : '', checks: src ? src.checks : [], sharedId };
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
    if (!order.length) { flagAddProject(); return; }
    const grid = {};
    Object.entries(editingSprint.grid).forEach(([k, v]) => {
      const nv = rename[v] || v;
      if (projects[nv]) grid[k] = nv;
    });
    Object.assign(editingSprint, { name, startDate, endDate, projects, order, grid });
    if (!projects[state.activeProject]) state.activeProject = order[0] || null;
  } else {
    const { projects, order } = readProjectRows({});
    if (!order.length) { flagAddProject(); return; }
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

async function deleteSprint() {
  if (!editingSprint) return;
  if (!await confirmAction(`Eliminare lo sprint “${editingSprint.name}” e tutti i suoi dati?`, { okLabel: 'Elimina' })) return;
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
      name: c, sp: typeof p.sp === 'number' ? p.sp : 0, color, ink: p.ink || inkFor(color),
      doc: p.doc || '', checks: Array.isArray(p.checks) ? p.checks : [],
      sharedId: p.sharedId || undefined,
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
  cleanGrid(grid);
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
      cleanGrid(grid);
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

// Tema chiaro/scuro: classe su <body>, preferenza in localStorage. Applicato subito per evitare il flash.
function applyTheme(t) { document.body.classList.toggle('theme-light', t === 'light'); }
applyTheme(localStorage.getItem('theme') || 'dark');
function updateThemeBtns() {
  const light = document.body.classList.contains('theme-light');
  $('#btnThemeLight')?.classList.toggle('is-active', light);
  $('#btnThemeDark')?.classList.toggle('is-active', !light);
}
function toggleTheme() {
  const light = !document.body.classList.contains('theme-light');
  applyTheme(light ? 'light' : 'dark');
  localStorage.setItem('theme', light ? 'light' : 'dark');
}

// Notifica transitoria in basso. type: '' | 'error' | 'success'.
function toast(msg, type = '') {
  const box = $('#toasts');
  if (!box) return;
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' toast--' + type : '');
  t.textContent = msg;                                   // textContent: niente HTML injection
  box.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 250); }, 2600);
}

// Conferma stilizzata (sostituisce window.confirm). Ritorna una Promise<boolean>.
function confirmAction(msg, { okLabel = 'Conferma', cancelLabel = 'Annulla', danger = true } = {}) {
  return new Promise((resolve) => {
    const ov = document.createElement('div');
    ov.className = 'confirm-overlay';
    ov.innerHTML = `<div class="confirm-box" role="dialog" aria-modal="true">
      <div class="confirm-msg"></div>
      <div class="confirm-actions">
        <button type="button" class="confirm-cancel"></button>
        <button type="button" class="confirm-ok${danger ? ' is-danger' : ''}"></button>
      </div></div>`;
    ov.querySelector('.confirm-msg').textContent = msg;
    ov.querySelector('.confirm-cancel').textContent = cancelLabel;
    ov.querySelector('.confirm-ok').textContent = okLabel;
    const close = (v) => { document.removeEventListener('keydown', onKey); ov.remove(); resolve(v); };
    const onKey = (e) => { if (e.key === 'Escape') close(false); if (e.key === 'Enter') close(true); };
    ov.querySelector('.confirm-cancel').onclick = () => close(false);
    ov.querySelector('.confirm-ok').onclick = () => close(true);
    ov.addEventListener('click', (e) => { if (e.target === ov) close(false); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
    ov.querySelector('.confirm-ok').focus();
  });
}

// Indicatore di salvataggio in header: l'utente vede se i dati sono al sicuro o no.
function setSaveStatus(s) {
  const el = $('#saveStatus');
  if (!el) return;
  el.textContent = { saving: 'Salvataggio…', saved: 'Salvato', error: 'Non salvato' }[s] || '';
  el.classList.toggle('is-error', s === 'error');
}
let saveTimer = null;
async function saveNow() {
  if (!currentUser) return;
  clearTimeout(saveTimer); saveTimer = null;
  setSaveStatus('saving');
  const { error } = await sb.from('user_data').upsert({ user_id: currentUser.id, app_state: serializeState() }, { onConflict: 'user_id' });
  if (error) { console.error('save', error); setSaveStatus('error'); }   // errore visibile: rischio perdita dati
  else setSaveStatus('saved');
}
function scheduleSave() {
  if (!currentUser) return;
  setSaveStatus('saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 600);
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
  renderGamification();
}

// ---- Gamification ----------------------------------------------------------
// Tutto derivato dallo stato esistente (task completati, story points, sprint, progetti): nessun dato nuovo da salvare.
const BADGES = [
  { ico: '🚀', name: 'Primo progetto', desc: 'Crea 1 progetto',  test: (s) => s.projects >= 1 },
  { ico: '🗓️', name: 'Pianificatore',  desc: '3 sprint',          test: (s) => s.sprints >= 3 },
  { ico: '✅', name: 'Spedizioniere',   desc: '10 task completati', test: (s) => s.done >= 10 },
  { ico: '⭐', name: 'Mezzo cento',     desc: '50 story points',   test: (s) => s.sp >= 50 },
  { ico: '🏆', name: 'Centurione',      desc: '100 story points',  test: (s) => s.sp >= 100 },
  { ico: '🔥', name: 'Maratoneta',      desc: '50 task completati', test: (s) => s.done >= 50 },
  { ico: '📆', name: 'Costante',        desc: '5 giorni di fila',   test: (s) => s.streak >= 5 },
];

// Giorni feriali consecutivi con almeno un'ora loggata, contando a ritroso dall'ultimo giorno loggato.
// I weekend si saltano senza spezzare la serie.
function currentStreak() {
  const logged = new Set();
  state.sprints.forEach((s) => Object.keys(s.grid || {}).forEach((k) => logged.add(k.slice(0, 10))));
  if (!logged.size) return 0;
  const d = noon([...logged].sort().pop());
  let streak = 0, guard = 0;
  while (guard++ < 400) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) { d.setDate(d.getDate() - 1); continue; }
    if (logged.has(ymd(d))) { streak++; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}

function gameStats() {
  let projects = 0, done = 0, total = 0, sp = 0;
  state.sprints.forEach((s) => s.order.forEach((code) => {
    const p = s.projects[code]; if (!p) return;
    projects++; sp += p.sp || 0;
    (p.checks || []).forEach((c) => { total++; if (c.done) done++; });
  }));
  const sprints = state.sprints.length;
  const streak = currentStreak();
  const xp = done * 10 + Math.round(sp * 5) + sprints * 20 + projects * 15 + streak * 5;
  return { projects, done, total, sp, sprints, streak, xp, level: Math.floor(xp / 100) + 1, intoLevel: xp % 100 };
}

function renderGamification() {
  const el = $('#gameView');
  if (!el) return;
  const s = gameStats();
  const pct = s.intoLevel;                                  // 0..99 = % verso il prossimo livello (soglia 100 XP)
  const badges = BADGES.map((b) => {
    const earned = b.test(s);
    return `<div class="badge${earned ? '' : ' locked'}"><span class="badge-ico">${b.ico}</span>` +
      `<div><div class="badge-name">${esc(b.name)}</div><div class="badge-desc mono">${esc(b.desc)}</div></div></div>`;
  }).join('');
  const earnedCount = BADGES.filter((b) => b.test(s)).length;

  // Bento CSS Grid: posizione di ogni modulo via grid-area (vedi .bento-game in styles.css).
  el.innerHTML =
    `<div class="bento bento-game">
      <section class="game-hero" style="grid-area:hero">
        <div class="game-level-badge"><small>LIVELLO</small><b>${s.level}</b></div>
        <div class="game-hero-main">
          <div class="game-hero-title">Continua così! 🎯${s.streak >= 2 ? `<span class="game-streak mono">🔥 ${s.streak} giorni di fila</span>` : ''}</div>
          <div class="game-xp-lab mono">${s.xp} XP totali</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <div class="game-xp-next mono">${100 - pct} XP al livello ${s.level + 1}</div>
        </div>
      </section>
      <div class="game-stat" style="grid-area:s1"><div class="game-stat-num">${s.done}</div><div class="game-stat-lab mono">Task fatti</div></div>
      <div class="game-stat" style="grid-area:s2"><div class="game-stat-num">${fmtSP(s.sp)}</div><div class="game-stat-lab mono">Story points</div></div>
      <div class="game-stat" style="grid-area:s3"><div class="game-stat-num">${s.projects}</div><div class="game-stat-lab mono">Progetti</div></div>
      <div class="game-stat" style="grid-area:s4"><div class="game-stat-num">${String(s.sprints).padStart(2,'0')}</div><div class="game-stat-lab mono">Sprint</div></div>
      <section class="game-section" style="grid-area:obj">
        <div class="game-section-head mono"><span>Obiettivi</span><span>${earnedCount}/${BADGES.length}</span></div>
        <div class="badge-grid">${badges}</div>
      </section>
      <section class="game-section" style="grid-area:trk">
        <div class="game-section-head mono"><span>Tracking progetti</span></div>
        <div class="game-track-row mono" style="display:flex;flex-direction:column;justify-content:space-between;gap:12px;flex:1">
          <span style="color:var(--muted)">${s.done}/${s.total} task completati · ${fmtSP(s.sp)} SP su ${s.projects} progetti</span>
          <button type="button" class="btn-primary mono" data-view="track" style="align-self:flex-start">Apri tracking completo</button>
        </div>
      </section>
    </div>`;
  el.querySelector('[data-view="track"]').addEventListener('click', () => setView('track'));

  // Celebra solo i salti di livello avvenuti durante la sessione (al primo render fissa solo la baseline).
  if (lastLevel !== null && s.level > lastLevel) celebrateLevelUp(s.level);
  lastLevel = s.level;
}

let lastLevel = null;
function celebrateLevelUp(level) {
  toast(`Livello ${level} raggiunto! 🎉`, 'success');
  const badge = $('#gameView .game-level-badge');
  if (!badge) return;
  badge.classList.remove('level-pop');
  void badge.offsetWidth;                 // forza il restart dell'animazione
  badge.classList.add('level-pop');
}

let currentView = 'game';
function setView(view) {
  currentView = view;
  $('#gameView').classList.toggle('is-active', view === 'game');
  $('#trackView').classList.toggle('is-hidden', view === 'game');
  if (view === 'game') renderGamification();
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('is-active', b.dataset.view === view));
  // i controlli sprint hanno senso solo nel tracking
  $('#sprintSelect').style.display = view === 'game' ? 'none' : '';
  $('#btnNewSprint').style.display = view === 'game' ? 'none' : '';
}

// ---- Avatar ----------------------------------------------------------------
// L'avatar è un oggetto di configurazione react-nice-avatar (vedi modulo in index.html),
// salvato in user_metadata.avatar e renderizzato via window.AvatarKit.
function renderHeaderAvatar() {
  const el = $('#userAvatar');
  if (!window.AvatarKit) { el.hidden = true; return; }   // modulo non ancora pronto: lo mostra l'evento avatarkit:ready
  const m = (currentUser && currentUser.user_metadata) || {};
  // avatar salvato se presente, altrimenti config di default così l'avatar è sempre visibile
  const cfg = (m.avatar && typeof m.avatar === 'object') ? m.avatar : window.AvatarKit.config;
  window.AvatarKit.renderInto(el, cfg);
  window.AvatarKit.renderInto($('#profileAvatar'), cfg);
  const name = [m.first_name, m.last_name].filter(Boolean).join(' ') || m.full_name || m.name || '';
  el.title = name ? `${name} · profilo` : 'Profilo';
  $('#userName').textContent = name;
  $('#profFirst').textContent = m.first_name || '—';
  $('#profLast').textContent = m.last_name || '—';
  $('#profEmail').textContent = (currentUser && currentUser.email) || '—';
  el.hidden = false;
}
document.addEventListener('avatarkit:ready', renderHeaderAvatar);

// ---- Auth ------------------------------------------------------------------
function showAuth() {
  currentUser = null;
  $('#appShell').hidden = true;
  $('#authOverlay').classList.remove('is-hidden');
}
async function showApp(user) {
  currentUser = user;
  renderHeaderAvatar();
  $('#loadingOverlay').classList.remove('is-hidden');   // feedback durante il fetch dello stato
  try { await loadState(); } catch (e) { console.error('loadState', e); }
  renderAll();
  setView('game');   // all'atterraggio si parte dalla dashboard
  scheduleSave();   // persiste lo stato ripulito (es. ore weekend rimosse)
  $('#authOverlay').classList.add('is-hidden');
  $('#appShell').hidden = false;
  $('#loadingOverlay').classList.add('is-hidden');
}
let authMode = 'signin';
function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === 'signup';
  $('#authTitle').textContent      = signup ? 'Registrati' : 'Accedi';
  $('#btnAuthSubmit').textContent  = signup ? 'Registrati' : 'Accedi';
  $('#btnAuthSwitch').textContent  = signup ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati';
  $('#nameFields').hidden = !signup;
  $('#avatarPicker').hidden = !signup;
  $('#areaField').hidden = !signup;
  $('#authMsg').textContent = '';
}
async function handleAuth() {
  const email = $('#authEmail').value.trim();
  const password = $('#authPassword').value;
  const signup = authMode === 'signup';
  const firstName = $('#authFirstName').value.trim();
  const lastName = $('#authLastName').value.trim();
  const msg = $('#authMsg');
  msg.textContent = '';
  if (!email || !password) { msg.textContent = 'Inserisci email e password.'; return; }
  if (signup && (!firstName || !lastName)) { msg.textContent = 'Inserisci nome e cognome.'; return; }
  $('#btnAuthSubmit').disabled = true;
  try {
    const avatar = window.AvatarKit ? window.AvatarKit.config : null;
    const creds = signup
      ? { email, password, options: { data: { first_name: firstName, last_name: lastName, area: $('#authArea').value, avatar } } }
      : { email, password };
    const { data, error } = await sb.auth[signup ? 'signUp' : 'signInWithPassword'](creds);
    if (error) { msg.textContent = error.message; return; }
    if (!data.session) { msg.textContent = 'Controlla la mail per confermare la registrazione.'; return; }
    // se l'utente non ha ancora un avatar (vecchio account), salva quello scelto
    const u = data.session.user;
    if (avatar && (!u.user_metadata || !u.user_metadata.avatar)) {
      const { data: upd } = await sb.auth.updateUser({ data: { avatar } });
      if (upd && upd.user) data.session.user = upd.user;
    }
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

  // click sull'avatar: apre la modale profilo
  $('#userAvatar').addEventListener('click', () => { $('#profileOverlay').classList.remove('is-hidden'); updateThemeBtns(); });
  $('#profileClose').addEventListener('click', () => $('#profileOverlay').classList.add('is-hidden'));
  $('#profileOverlay').addEventListener('click', (e) => { if (e.target === $('#profileOverlay')) $('#profileOverlay').classList.add('is-hidden'); });
  // l'editor avatar (modale, anteprima, controlli) è gestito dal modulo in index.html via window.AvatarKit
  $('#btnEditAvatar').addEventListener('click', () => {
    if (!window.AvatarKit) return;
    const saved = (currentUser && currentUser.user_metadata && currentUser.user_metadata.avatar) || null;
    window.AvatarKit.open($('#profileAvatar'), saved);
  });
  document.addEventListener('avatar:confirm', async (e) => {
    if (!currentUser) return;          // in registrazione l'avatar viene salvato al submit
    // mostra subito il nuovo avatar (anche se il salvataggio remoto fallisse)
    currentUser = { ...currentUser, user_metadata: { ...(currentUser.user_metadata || {}), avatar: e.detail.config } };
    renderHeaderAvatar();
    try {
      const { error } = await sb.auth.updateUser({ data: { avatar: e.detail.config } });
      if (error) console.error('updateUser avatar:', error.message);
    } catch (err) { console.error('updateUser avatar:', err); }
  });
  $('#btnAuthSubmit').addEventListener('click', () => handleAuth());
  $('#btnAuthSwitch').addEventListener('click', () => setAuthMode(authMode === 'signup' ? 'signin' : 'signup'));
  $('#pwToggle').addEventListener('click', () => {
    const pw = $('#authPassword');
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    $('#pwToggle').classList.toggle('is-on', show);
    $('#pwToggle').title = $('#pwToggle').ariaLabel = show ? 'Nascondi password' : 'Mostra password';
  });
  $('#authPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuth(); });
  $('#btnLogout').addEventListener('click', async () => {
    if (!await confirmAction('Sei sicuro di voler uscire?', { okLabel: 'Esci', danger: false })) return;
    if (saveTimer) await saveNow();   // flush prima di azzerare currentUser, altrimenti il salvataggio in sospeso viene saltato
    await sb.auth.signOut(); setAuthMode('signin'); showAuth();
  });

  $('#btnTheme')?.addEventListener('click', toggleTheme);

  document.querySelectorAll('.tab').forEach((t) =>
    t.addEventListener('click', () => setTab(t.dataset.tab)));

  document.querySelectorAll('.nav-item').forEach((b) =>
    b.addEventListener('click', () => setView(b.dataset.view)));

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
  $('#btnToggleSidebar').addEventListener('click', () => document.querySelector('.app').classList.toggle('sidebar-collapsed'));
  $('#pmAdd').addEventListener('click', () => {
    const row = pmRow('', null);
    $('#pmList').appendChild(row);
    clearAddProjectFlag();
    row.querySelector('.pm-code').focus();
  });
  $('#pmList').addEventListener('dragover', (e) => {
    if (!pmDragging) return;
    e.preventDefault();
    const after = pmDragAfter($('#pmList'), e.clientY);
    if (after == null) $('#pmList').appendChild(pmDragging);
    else $('#pmList').insertBefore(pmDragging, after);
  });
  $('#btnSubmit').addEventListener('click', saveSprint);
  $('#btnDeleteSprint').addEventListener('click', deleteSprint);
  $('#btnCloseModal').addEventListener('click', closeModal);
  $('#btnCancel').addEventListener('click', closeModal);
  $('#overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#collabOverlay').classList.contains('is-hidden')) closeCollabModal();   // chiudi prima la modale collaboratori
    else closeModal();
  });

  $('#collabClose').addEventListener('click', closeCollabModal);
  $('#collabOverlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeCollabModal(); });
  $('#collabSearch').addEventListener('input', () => { clearTimeout(collabSearchTimer); collabSearchTimer = setTimeout(runCollabSearch, 250); });

  // flush del salvataggio debounced prima di chiudere/nascondere la pagina (evita perdita su reload/logout rapido)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && saveTimer) saveNow(); });
  window.addEventListener('pagehide', () => { if (saveTimer) saveNow(); });

  const { data } = await sb.auth.getSession();
  if (data.session) showApp(data.session.user); else showAuth();
});
