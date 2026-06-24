// ── SVG Icons ───────────────────────────────────────────────────────────────
const IC = {
    chart:     `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="14" width="4" height="5" rx="0"/><rect x="15" y="8" width="4" height="11" rx="0"/></svg>`,
    calendar:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="0"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    brief16:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="0"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    brief18:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="0"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    plus:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    x:         `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    save:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
    folder:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    pen:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    clock:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    logout:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    loader:    `<svg class="loading-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
    heading1:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/></svg>`,
    heading2:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>`,
    heading3:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2c-1.2-.5-2.5 0-3 1"/></svg>`,
    paragraph: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/></svg>`,
    list:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    checkList: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="6" height="6" rx="0"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>`,
    separator: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/></svg>`
};

// ── Integrazione Supabase ────────────────────────────────────────────────────
// INSERISCI QUI I DATI DEL TUO PROGETTO SUPABASE
const SUPABASE_URL = 'https://gztmjoqtvwodfsydtzny.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6dG1qb3F0dndvZGZzeWR0em55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4Nzg2NzcsImV4cCI6MjA5NzQ1NDY3N30.kritne2-PDgCSwXXy0XzWxJ80i7egNYCm4tx7G3Bjws';

// Nota: la variabile del client si chiama "sb" e NON "supabase",
// perché la libreria del CDN usa già la globale "supabase" (window.supabase).
let sb = null;
if (window.supabase) {
    try {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch(e) { console.error("Errore creazione client Supabase:", e); }
}

let currentUser = null;

// Modello di base se l'utente è nuovo
const DEFAULT_STATE = {
    sprints: [],
    activeSprintId: null,
    projectDocs: {},
    gridLogs: {},
    projectColors: {},
    activeTab: 'kanban',
    activeWeekIndex: 0
};

// Palette progetti: ogni progetto riceve un colore stabile (hash del nome),
// sovrascrivibile dall'utente tramite il color picker -> S.projectColors[nome].
const PROJ_PALETTE = ['#FFD400','#0057FF','#CDC3BA'];
function projColor(name) {
    if (S.projectColors && S.projectColors[name]) return S.projectColors[name];
    let hash = 0;
    for (const ch of String(name)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return PROJ_PALETTE[hash % PROJ_PALETTE.length];
}
// Testo leggibile (nero/bianco) sopra uno sfondo colorato
function textOn(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (r * 299 + g * 587 + b * 114) / 1000 > 140 ? '#323232' : '#FAF7EB';
}

// Stato Reale App
let S = JSON.parse(JSON.stringify(DEFAULT_STATE));

// Sistema di salvataggio ritardato (Debouncing) per non intasare il database a ogni lettera digitata
let syncTimeout = null;
async function syncToSupabase() {
    if (!currentUser || !sb) return;
    const stateToSave = JSON.parse(JSON.stringify(S));
    const { error } = await sb.from('user_data').upsert({
        user_id: currentUser.id,
        app_state: stateToSave
    }, { onConflict: 'user_id' });
    if (error) console.error("Errore salvataggio:", error);
}

function triggerSync() {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(syncToSupabase, 1500); // Salva 1.5 secondi dopo l'ultima modifica
}

// ── Auth UI Logic ────────────────────────────────────────────────────────────
let isLoginMode = true;

const authScreen = document.getElementById('auth-screen');
const hdr = document.getElementById('hdr');
const mnt = document.getElementById('mnt');
const authForm = document.getElementById('auth-form');
const authToggleBtn = document.getElementById('auth-toggle-btn');
const authForgotBtn = document.getElementById('auth-forgot-btn');
const authTitle = document.getElementById('auth-title-text');
const authSub = document.getElementById('auth-sub-text');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authMsg = document.getElementById('auth-msg');
const fieldName = document.getElementById('field-name');
const fieldPassword2 = document.getElementById('field-password2');
const inpName = document.getElementById('auth-name');
const inpEmail = document.getElementById('auth-email');
const inpPassword = document.getElementById('auth-password');
const inpPassword2 = document.getElementById('auth-password2');

// Traduce in italiano i messaggi di errore più comuni di Supabase
function translateAuthError(msg) {
    const m = (msg || '').toLowerCase();
    if (m.includes('invalid login credentials')) return "Email o password non corretti.";
    if (m.includes('email not confirmed')) return "Devi confermare l'email prima di accedere. Controlla la tua casella di posta (anche lo spam).";
    if (m.includes('user already registered') || m.includes('already been registered')) return "Esiste già un account con questa email. Prova ad accedere.";
    if (m.includes('password should be at least')) return "La password deve contenere almeno 6 caratteri.";
    if (m.includes('unable to validate email') || m.includes('invalid format')) return "L'indirizzo email non è valido.";
    if (m.includes('rate limit') || m.includes('too many requests')) return "Troppi tentativi. Attendi qualche minuto e riprova.";
    if (m.includes('signups not allowed') || m.includes('signup is disabled')) return "Le registrazioni sono disabilitate nel progetto Supabase.";
    if (m.includes('failed to fetch') || m.includes('networkerror')) return "Impossibile contattare Supabase. Controlla l'URL del progetto e la connessione.";
    return msg || "Si è verificato un errore. Riprova.";
}

function setAuthMode(login) {
    isLoginMode = login;
    authTitle.textContent = login ? "Accedi al Workspace" : "Crea un Account";
    authSub.textContent = login ? "Inserisci i tuoi dati per continuare." : "Inizia a tracciare i tuoi progetti agili.";
    authSubmitBtn.textContent = login ? "Accedi" : "Registrati";
    authToggleBtn.textContent = login ? "Non hai un account? Registrati" : "Hai già un account? Accedi";
    fieldName.classList.toggle('hidden', login);
    fieldPassword2.classList.toggle('hidden', login);
    authForgotBtn.classList.toggle('hidden', !login);
    inpPassword.setAttribute('autocomplete', login ? 'current-password' : 'new-password');
    hideMsg();
}

authToggleBtn.addEventListener('click', () => setAuthMode(!isLoginMode));

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!sb) {
        showMsg("Supabase non è configurato. Inserisci URL e Key in app.js (righe ~22-23).", 'error');
        return;
    }

    const name = inpName.value.trim();
    const email = inpEmail.value.trim();
    const password = inpPassword.value;

    if (!isLoginMode) {
        if (password.length < 6) {
            showMsg("La password deve contenere almeno 6 caratteri.", 'error');
            return;
        }
        if (password !== inpPassword2.value) {
            showMsg("Le due password non coincidono.", 'error');
            return;
        }
    }

    setLoading(true);
    hideMsg();

    let result;
    if (isLoginMode) {
        result = await sb.auth.signInWithPassword({ email, password });
    } else {
        result = await sb.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        });
    }

    if (result.error) {
        showMsg(translateAuthError(result.error.message), 'error');
        setLoading(false);
        return;
    }

    if (!isLoginMode && result.data && !result.data.session) {
        setLoading(false);
        setAuthMode(true);
        showMsg("Registrazione completata! Controlla la tua email per attivare l'account, poi accedi.", 'success');
        return;
    }
    // Negli altri casi onAuthStateChange gestirà l'ingresso nell'app
});

authForgotBtn.addEventListener('click', async () => {
    if (!sb) {
        showMsg("Supabase non è configurato.", 'error');
        return;
    }
    const email = inpEmail.value.trim();
    if (!email) {
        showMsg("Inserisci la tua email qui sopra, poi clicca di nuovo su \"Password dimenticata?\".", 'error');
        inpEmail.focus();
        return;
    }
    setLoading(true);
    hideMsg();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href
    });
    setLoading(false);
    if (error) showMsg(translateAuthError(error.message), 'error');
    else showMsg("Ti abbiamo inviato un'email per reimpostare la password.", 'success');
});

function setLoading(on) {
    authSubmitBtn.disabled = on;
    authForgotBtn.disabled = on;
    if (on) {
        authSubmitBtn.innerHTML = `${IC.loader} Attendi...`;
    } else {
        authSubmitBtn.textContent = isLoginMode ? "Accedi" : "Registrati";
    }
}

function showMsg(msg, type) {
    authMsg.textContent = msg;
    authMsg.className = `auth-msg ${type}`;
    authMsg.style.display = 'block';
}

function hideMsg() {
    authMsg.style.display = 'none';
}

async function handleLogout() {
    if (!sb) return;
    await sb.auth.signOut();
}

// Inizializza stato autenticazione / Mostra a schermo qualsiasi errore non gestito
function showFatal(label, err) {
    console.error(label, err);
    const msg = (err && (err.message || err.reason && err.reason.message)) || String(err);
    hdr.classList.add('hidden');
    mnt.classList.remove('hidden');
    mnt.innerHTML = `<div class="empty"><p style="font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ink)">${label}</p>
        <p style="margin-top:.7rem;color:#b91c1c;word-break:break-word">${esc(msg)}</p>
        <button class="btn btn-primary" style="margin-top:1.4rem" onclick="window._resetApp()">Resetta sessione e ricarica</button></div>`;
    authScreen.style.display = 'none';
}
window._resetApp = function() {
    try { localStorage.clear(); } catch(e) {}
    if (sb) sb.auth.signOut().finally(() => location.reload());
    else location.reload();
};
window.addEventListener('error', e => showFatal('Errore JavaScript', e.error || e));
window.addEventListener('unhandledrejection', e => showFatal('Errore (promise non gestita)', e.reason || e));

// Carica i dati dell'utente e disegna l'app.
// IMPORTANTE: viene chiamata FUORI dalla callback di onAuthStateChange (con setTimeout),
// perché chiamare sb.from() DENTRO quella callback causa un deadlock.
async function loadUserDataAndRender() {
    try {
        const { data, error } = await sb.from('user_data').select('app_state').eq('user_id', currentUser.id).maybeSingle();
        if (error) console.error("Errore caricamento dati:", error);

        const saved = (data && data.app_state && typeof data.app_state === 'object') ? data.app_state : {};
        S = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), saved);
        if (!Array.isArray(S.sprints))    S.sprints = [];
        if (typeof S.projectDocs !== 'object' || S.projectDocs === null) S.projectDocs = {};
        if (typeof S.gridLogs    !== 'object' || S.gridLogs    === null) S.gridLogs = {};
        if (typeof S.projectColors !== 'object' || S.projectColors === null) S.projectColors = {};

        if (!data || !data.app_state || Object.keys(saved).length === 0) {
            syncToSupabase();
        }
        render();
    } catch (err) {
        showFatal('Errore di avvio', err);
    }
}

if (sb) {
    sb.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            currentUser = session.user;
            authScreen.style.display = 'none';
            hdr.classList.remove('hidden');
            mnt.classList.remove('hidden');
            setTimeout(loadUserDataAndRender, 0);
        } else {
            currentUser = null;
            authScreen.style.display = 'flex';
            hdr.classList.add('hidden');
            mnt.classList.add('hidden');
            inpPassword.value = '';
            inpPassword2.value = '';
            setLoading(false);
        }
    });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function sprint() { return S.sprints.find(s => s.id === S.activeSprintId); }
function todayStr() { return localDate(new Date()); }

function localDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function noon(str) { return new Date(str + 'T12:00:00'); }

function getWorkingDays(start, end) {
    let n = 0, cur = noon(start), e = noon(end);
    while (cur <= e) { const d = cur.getDay(); if (d && d !== 6) n++; cur.setDate(cur.getDate()+1); }
    return n;
}

function fmtDate(str) {
    return new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'short',year:'numeric'}).format(noon(str));
}

// 8 ore = 1 Story Point, arrotondato al mezzo punto
function fmtSP(n) { const r = Math.round(n*2)/2; return Number.isInteger(r) ? String(r) : r.toFixed(1); }

const HOURS = [
    "1° 09:00-10:00","2° 10:00-11:00","3° 11:00-12:00","4° 12:00-13:00",
    "5° 14:00-15:00","6° 15:00-16:00","7° 16:00-17:00","8° 17:00-18:00"
];

const DAY_NAMES = ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];

function getWeeks(startDate, endDate) {
    const s = noon(startDate), e = noon(endDate);
    const weeks = [];
    const dow = s.getDay() || 7;
    let mon = new Date(s); mon.setDate(s.getDate() - (dow-1));
    let wk = 1;
    while (mon <= e) {
        const days = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date(mon); d.setDate(mon.getDate()+i);
            days.push({ str: localDate(d), name: DAY_NAMES[d.getDay()] });
        }
        weeks.push({ label:`Settimana ${wk}`, days });
        mon.setDate(mon.getDate()+7); wk++;
    }
    return weeks;
}

function h(el, html) { el.innerHTML = html; }

// ── Main render ──────────────────────────────────────────────────────────────
function render() {
    renderHeader();
    renderMain();
}

function renderHeader() {
    const td = todayStr();
    const active = S.sprints.filter(s => s.endDate >= td);
    const past   = S.sprints.filter(s => s.endDate <  td);

    let opts = '';
    if (active.length) opts += `<optgroup label="Sprint Attivi">${active.map(s => `<option value="${s.id}" ${s.id===S.activeSprintId?'selected':''}>${esc(s.name)}</option>`).join('')}</optgroup>`;
    if (past.length)   opts += `<optgroup label="Sprint Passati">${past.map(s => `<option value="${s.id}" ${s.id===S.activeSprintId?'selected':''}>${esc(s.name)}</option>`).join('')}</optgroup>`;
    if (!S.sprints.length) opts = '<option value="">Nessun sprint</option>';

    h(hdr, `
        <div class="brand">
            <div class="brand-mark">${IC.chart}</div>
            <div>
                <div class="brand-title">Agile Workspace</div>
                <div class="brand-sub">Design · Code · Surf — Sprint Tracker</div>
            </div>
        </div>
        <div class="header-right">
            <select class="sprint-select" id="sel-sprint">${opts}</select>
            <button class="btn btn-dark" id="btn-new-sprint">${IC.plus} Nuovo Sprint</button>
            <button class="btn btn-logout" id="btn-logout" title="Esci dal profilo">${IC.logout}</button>
        </div>
    `);

    document.getElementById('sel-sprint').addEventListener('change', e => {
        S.activeSprintId = e.target.value;
        S.activeWeekIndex = 0;
        triggerSync();
        render();
    });
    document.getElementById('btn-new-sprint').addEventListener('click', () => openSprintModal());
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
}

function renderMain() {
    const sp = sprint();
    if (!sp) { h(mnt, `<div class="empty"><p>Nessuno sprint selezionato.</p><p style="margin-top:.6rem">Creane uno nuovo per iniziare a surfare.</p></div>`); return; }

    const wdays = getWorkingDays(sp.startDate, sp.endDate);
    const gl = S.gridLogs[S.activeSprintId] || {};
    const allProj = [...new Set([...(sp.projects||[])])];

    const projStats = allProj.map(proj => {
        const cH = Object.values(gl).filter(v => v===proj).length;
        return { proj, cH, sp: cH/8 };
    }).sort((a,b) => b.cH - a.cH);

    const loggedH = Object.values(gl).filter(Boolean).length;
    const totalSP = loggedH / 8;
    const capacityH = wdays * 8;
    const capacitySP = wdays;
    const pct = capacityH ? Math.min(100, Math.round(loggedH / capacityH * 100)) : 0;

    const weeks = getWeeks(sp.startDate, sp.endDate);

    h(mnt, `
        <section class="hero">
            <div class="hero-top">
                <div class="hero-titlewrap">
                    <div class="hero-name">${esc(sp.name)}</div>
                    <span class="hero-range">${IC.calendar} ${fmtDate(sp.startDate)} – ${fmtDate(sp.endDate)}</span>
                    <span class="hero-days">${IC.brief16} ${wdays} giorni lavorativi</span>
                </div>
                <button class="btn btn-dark btn-icon" id="btn-edit-sprint" title="Modifica sprint">${IC.pen}</button>
            </div>

            <div class="hero-grid">
                <div class="hero-total">
                    <div class="cap">Story Points · Sprint</div>
                    <div class="big-sp">${fmtSP(totalSP)}<small>/ ${capacitySP} SP</small></div>
                    <div class="hero-sub">${loggedH}h tracciate su ${capacityH}h di capacità</div>
                    <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
                    <div class="progress-legend"><span>Capacità utilizzata</span><span>${pct}%</span></div>
                </div>
                <div class="proj-sp">
                    <div class="cap">Story Points per progetto</div>
                    ${projStats.length ? projStats.map(p => `
                        <div class="psp-row">
                            <div class="psp-name"><span class="proj-dot" style="background:${projColor(p.proj)}"></span>${esc(p.proj)}</div>
                            <div class="psp-bar"><i style="width:${capacityH ? Math.min(100, Math.round(p.cH/capacityH*100)) : 0}%;background:${projColor(p.proj)}"></i></div>
                            <div class="psp-val"><b>${fmtSP(p.sp)} SP</b> <span>· ${p.cH}h</span></div>
                        </div>
                    `).join('') : '<div class="psp-empty">Nessun progetto assegnato a questo sprint</div>'}
                </div>
            </div>
        </section>

        <div class="card">
            <div class="tabs">
                <button class="tab-btn${S.activeTab==='calendar'?' active':''}" data-tab="calendar">Calendario Ore</button>
                <button class="tab-btn${S.activeTab==='kanban'?' active':''}"   data-tab="kanban">Workspace Progetti</button>
            </div>

            <div class="tab-stack">
                <div id="tab-cal" class="tab-pane${S.activeTab!=='calendar'?' is-hidden':''}">
                    ${renderCalendarInner(sp, weeks, gl, allProj)}
                </div>
                <div id="tab-kan" class="tab-pane${S.activeTab!=='kanban'?' is-hidden':''}">
                    ${renderWorkspace(sp, allProj)}
                </div>
            </div>
        </div>
    `);

    const editBtn = document.getElementById('btn-edit-sprint');
    if (editBtn) editBtn.addEventListener('click', () => openSprintModal(sp));

    mnt.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => {
        S.activeTab = b.dataset.tab;
        triggerSync();
        render();
    }));

    mnt.querySelectorAll('.week-btn').forEach(b => b.addEventListener('click', () => {
        S.activeWeekIndex = +b.dataset.w;
        triggerSync();
        render();
    }));

    mnt.querySelectorAll('.cell-select').forEach(sel => sel.addEventListener('change', e => {
        const {d, h: hIdx} = sel.dataset;
        const key = `${d}_${hIdx}`;
        if (!S.gridLogs[S.activeSprintId]) S.gridLogs[S.activeSprintId] = {};
        if (e.target.value === '') delete S.gridLogs[S.activeSprintId][key];
        else S.gridLogs[S.activeSprintId][key] = e.target.value;
        triggerSync();
        render();
    }));

    mnt.querySelectorAll('.proj-color').forEach(inp => inp.addEventListener('input', e => {
        S.projectColors[e.target.dataset.proj] = e.target.value;
        triggerSync();
        render();
    }));

    setupNotionEditors();
}

function setupNotionEditors() {
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('mousedown', e => e.preventDefault());
        btn.addEventListener('click', e => {
            const cmd = btn.dataset.cmd;
            const val = btn.dataset.val || null;
            document.execCommand(cmd, false, val);
            const editor = btn.closest('.workspace-group').querySelector('.notion-editor');
            if (editor) {
                S.projectDocs[editor.dataset.proj] = editor.innerHTML;
                triggerSync();
            }
        });
    });

    document.querySelectorAll('.notion-editor').forEach(ed => {
        ed.addEventListener('input', () => {
            S.projectDocs[ed.dataset.proj] = ed.innerHTML;
            triggerSync();
        });

        ed.addEventListener('change', e => {
            if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
                if (e.target.checked) e.target.setAttribute('checked', 'checked');
                else e.target.removeAttribute('checked');
                S.projectDocs[ed.dataset.proj] = ed.innerHTML;
                triggerSync();
            }
        });

        ed.addEventListener('keyup', e => {
            if (e.key === ' ') {
                const sel = window.getSelection();
                if (!sel.isCollapsed) return;

                const node = sel.anchorNode;
                if (node && node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;

                    if (text === '# ') { node.textContent = ''; document.execCommand('formatBlock', false, 'H1'); }
                    else if (text === '## ') { node.textContent = ''; document.execCommand('formatBlock', false, 'H2'); }
                    else if (text === '### ') { node.textContent = ''; document.execCommand('formatBlock', false, 'H3'); }
                    else if (text === '- ' || text === '* ') { node.textContent = ''; document.execCommand('insertUnorderedList', false, null); }
                    else if (text === '--- ') { node.textContent = ''; document.execCommand('insertHorizontalRule', false, null); }
                    else if (text === '[] ' || text === '[ ] ') {
                        node.textContent = '';
                        document.execCommand('insertHTML', false, '<input type="checkbox" class="notion-checkbox">&nbsp;');
                    }
                }
            }
        });
    });
}

function renderWorkspace(sp, allProj) {
    if (!allProj.length) return `<div class="empty"><p>Non ci sono progetti assegnati a questo sprint.</p></div>`;

    const listHtml = allProj.map(proj => {
        const content = S.projectDocs[proj] || '';
        const col = projColor(proj);
        return `
            <div class="workspace-group" style="border-left:3px solid ${col}">
                <div class="wg-header">
                    <h3 class="wg-title"><span style="color:${col};display:flex">${IC.folder}</span> ${esc(proj)}
                        <input type="color" class="proj-color" data-proj="${esc(proj)}" value="${col}" title="Colore progetto">
                    </h3>
                    <div class="editor-toolbar">
                        <button class="toolbar-btn" data-cmd="formatBlock" data-val="H1" title="Titolo Grande (H1)">${IC.heading1}</button>
                        <button class="toolbar-btn" data-cmd="formatBlock" data-val="H2" title="Titolo Medio (H2)">${IC.heading2}</button>
                        <button class="toolbar-btn" data-cmd="formatBlock" data-val="H3" title="Titolo Piccolo (H3)">${IC.heading3}</button>
                        <div class="toolbar-divider"></div>
                        <button class="toolbar-btn" data-cmd="formatBlock" data-val="P" title="Testo normale">${IC.paragraph}</button>
                        <button class="toolbar-btn" data-cmd="insertUnorderedList" title="Elenco puntato">${IC.list}</button>
                        <button class="toolbar-btn" data-cmd="insertHTML" data-val="<input type='checkbox' class='notion-checkbox'>&nbsp;" title="Checkbox interattiva">${IC.checkList}</button>
                        <div class="toolbar-divider"></div>
                        <button class="toolbar-btn" data-cmd="insertHorizontalRule" title="Linea di divisione">${IC.separator}</button>
                    </div>
                </div>

                <div class="notion-editor" contenteditable="true" data-proj="${esc(proj)}" data-placeholder="Inizia a scrivere qui per il progetto ${esc(proj)}...">
                    ${content}
                </div>
            </div>
        `;
    }).join('');

    return `<div class="workspace-grid">${listHtml}</div>`;
}

function renderCalendarInner(sp, weeks, gl, allProj) {
    const wk = weeks[S.activeWeekIndex];
    if (!wk) return '<div class="empty"><p>Nessuna settimana disponibile.</p></div>';

    const rows = HOURS.map((lbl, hi) => {
        const cells = wk.days.map(day => {
            const val = gl[`${day.str}_${hi}`] || '';
            const sat = day.name === 'Sabato';
            return `<td class="${sat?'sat':''}">
                <div class="cell-wrap">
                    <select class="cell-select" data-d="${day.str}" data-h="${hi}">
                        <option value=""></option>
                        ${allProj.map(p => `<option value="${esc(p)}"${val===p?' selected':''}>${esc(p)}</option>`).join('')}
                    </select>
                    ${val ? `<div class="cell-tag" style="background:${projColor(val)};color:${textOn(projColor(val))}">${esc(val)}</div>` : ''}
                </div>
            </td>`;
        }).join('');
        return `<tr><td>${lbl}</td>${cells}</tr>`;
    }).join('');

    return `
        <div class="sec-hdr">
            <h2 class="sec-title">Timesheet Progetti</h2>
            <div class="week-btns">
                ${weeks.map((w,i) => `<button class="week-btn${i===S.activeWeekIndex?' active':''}" data-w="${i}">${w.label}</button>`).join('')}
            </div>
        </div>
        <div class="table-wrap">
            <table>
                <thead><tr>
                    <th>Ore</th>
                    ${wk.days.map(d => `<th class="${d.name==='Sabato'?'sat':''}">${d.name}<br><span style="font-weight:400">${fmtDate(d.str)}</span></th>`).join('')}
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <div class="proj-badges">
            <span class="pb-label">Progetti assegnati:</span>
            ${allProj.length
                ? allProj.map(p => `<span class="pb-badge" style="border-color:${projColor(p)};color:${projColor(p)}">${esc(p)}</span>`).join('')
                : '<span class="psp-empty">Nessun progetto assegnato.</span>'}
        </div>
    `;
}

// ── Modals ───────────────────────────────────────────────────────────────────
function mkModal(id, title, bodyHtml) {
    const el = document.getElementById(id);
    h(el, `
        <div class="modal">
            <div class="modal-hdr">
                <span class="modal-title">${title}</span>
                <button class="modal-close" data-close="${id}">${IC.x}</button>
            </div>
            <div class="modal-body">${bodyHtml}</div>
        </div>
    `);
    el.classList.remove('hidden');

    el.querySelector('[data-close]').onclick = () => el.classList.add('hidden');
    el.onclick = e => { if (e.target === el) el.classList.add('hidden'); };

    return el;
}

function openSprintModal(editing) {
    const el = mkModal('overlay-sprint', editing ? 'Modifica Sprint' : 'Nuovo Sprint', `
        <form id="form-sprint">
            <div class="fg">
                <label>Nome Sprint</label>
                <input type="text" name="name" class="fi" required placeholder="es. Sprint Luglio" value="${editing ? esc(editing.name) : ''}">
            </div>
            <div class="frow fg">
                <div><label>Data Inizio</label><input type="date" name="startDate" class="fi" required value="${editing ? editing.startDate : ''}"></div>
                <div><label>Data Fine</label><input type="date" name="endDate" class="fi" required value="${editing ? editing.endDate : ''}"></div>
            </div>
            <div class="fg">
                <label>Progetti Assegnati</label>
                <input type="text" name="projects" class="fi" placeholder="es. RCA, MEM, TW" value="${editing ? esc((editing.projects||[]).join(', ')) : ''}">
                <p class="fhint">Sigle separate da virgola.</p>
            </div>
            <div class="ffooter">
                <button type="button" class="btn btn-ghost" data-close="overlay-sprint">Annulla</button>
                <button type="submit" class="btn btn-primary">${IC.save} ${editing ? 'Salva Modifiche' : 'Inserisci'}</button>
            </div>
        </form>
    `);
    el.querySelector('#form-sprint').onsubmit = e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const projects = (fd.get('projects')||'').split(',').map(p=>p.trim()).filter(Boolean);
        if (editing) {
            editing.name = fd.get('name');
            editing.startDate = fd.get('startDate');
            editing.endDate = fd.get('endDate');
            editing.projects = projects;
        } else {
            const newSprint = {
                id: `s-${Date.now()}`,
                name: fd.get('name'),
                startDate: fd.get('startDate'),
                endDate: fd.get('endDate'),
                projects
            };
            S.sprints.push(newSprint);
            S.activeSprintId = newSprint.id;
        }
        S.activeWeekIndex = 0;
        el.classList.add('hidden');
        triggerSync();
        render();
    };
}

function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Se non c'è il client Supabase, eseguiamo un render vuoto per mostrare l'errore o il loader
if(!sb) {
    render();
}
