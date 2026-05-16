// ============================================================
// CONFIGURACIÓN — reemplaza estos valores con los tuyos de Supabase
// ============================================================
const SUPABASE_URL = 'https://TU_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
// ============================================================

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let state = {};        // { sticker_code: true }
let openCards = {};
let countryFilter = 'all';
let saveTimeout = null;

// ─── AUTH ────────────────────────────────────────────────────

async function loginUser() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  showLoading(true);
  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  showLoading(false);
  if (error) showError(error.message);
}

async function registerUser() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  if (!name) { showError('Escribe tu nombre'); return; }
  showLoading(true);
  const { data, error } = await sb.auth.signUp({
    email, password: pass,
    options: { data: { full_name: name } }
  });
  showLoading(false);
  if (error) { showError(error.message); return; }
  showError('✅ Revisa tu email para confirmar la cuenta, luego ingresa.');
}

async function logoutUser() {
  await sb.auth.signOut();
  currentUser = null;
  state = {};
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
}

sb.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    currentUser = session.user;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    setupUserUI();
    await loadState();
    updateAll();
    renderCountries();
  }
});

function setupUserUI() {
  const name  = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
  const email = currentUser.email;
  const initials = name.slice(0,2).toUpperCase();
  ['s-avatar','m-avatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = initials;
  });
  const sn = document.getElementById('s-name');
  const se = document.getElementById('s-email');
  if (sn) sn.textContent = name;
  if (se) se.textContent = email;
}

// ─── DATA SYNC ──────────────────────────────────────────────

async function loadState() {
  setSyncStatus('Cargando figuritas...');
  const { data, error } = await sb
    .from('stickers')
    .select('sticker_code, have')
    .eq('user_id', currentUser.id);
  if (error) { setSyncStatus('Error al cargar'); return; }
  state = {};
  (data || []).forEach(r => { if (r.have) state[r.sticker_code] = true; });
  setSyncStatus('✅ Sincronizado');
}

function scheduleSave(code) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveSticker(code), 600);
}

async function saveSticker(code) {
  if (!currentUser) return;
  const have = !!state[code];
  const { error } = await sb.from('stickers').upsert(
    { user_id: currentUser.id, sticker_code: code, have },
    { onConflict: 'user_id,sticker_code' }
  );
  if (error) setSyncStatus('❌ Error al guardar');
  else setSyncStatus('✅ Guardado');
}

function setSyncStatus(msg) {
  const el = document.getElementById('sync-status');
  if (el) el.textContent = msg;
}

// ─── STICKER TOGGLE ─────────────────────────────────────────

function toggleFig(code) {
  state[code] = !state[code];
  const el = document.getElementById('fig-' + code);
  if (el) {
    el.className = 'fig ' + (state[code] ? 'have' : 'need');
    el.querySelector('.fig-dot').textContent = state[code] ? '✓' : '○';
  }
  updateAll();
  scheduleSave(code);
}

// ─── STATISTICS ──────────────────────────────────────────────

function getAllStickers() {
  return [
    ...TEAMS.flatMap(t => t.stickers),
    ...ESPECIALES.flatMap(g => g.stickers),
    ...CRACKS.flatMap(g => g.stickers),
  ];
}

function getStats() {
  const all = getAllStickers();
  const obtenidas = all.filter(s => state[s]).length;
  return { obtenidas, faltantes: TOTAL - obtenidas };
}

function getGroupHave(group) {
  return group.stickers.filter(s => state[s]).length;
}

function updateAll() {
  const { obtenidas, faltantes } = getStats();
  const pct = Math.round(obtenidas / TOTAL * 100);
  setText('hero-pct', pct + '%');
  setText('hero-count', obtenidas + ' de ' + TOTAL + ' figuritas');
  setStyle('hero-fill', 'width', pct + '%');
  setText('s-obtenidas', obtenidas);
  setText('s-faltantes', faltantes);

  const espH  = ESPECIALES.reduce((a,g) => a + getGroupHave(g), 0);
  const crkH  = CRACKS.reduce((a,g) => a + getGroupHave(g), 0);
  const teamH = TEAMS.reduce((a,t) => a + getGroupHave(t), 0);
  setText('cat-escudos', Math.min(teamH, 48) + '/48');
  setText('cat-equipos', Math.min(teamH, 48) + '/48');
  setText('cat-esp',     espH + '/20');
  setText('cat-cracks',  crkH + '/24');

  updateCharts();
  calcCostos();
}

function updateCharts() {
  const ranked = [...TEAMS]
    .map(t => ({...t, have: getGroupHave(t), pct: Math.round(getGroupHave(t)/t.n*100)}))
    .sort((a,b) => b.pct - a.pct);
  const top5 = ranked.slice(0, 5);
  const bot5 = [...ranked].sort((a,b) => a.pct - b.pct).slice(0, 5);
  setHTML('top5', top5.map(rankRow('top')).join(''));
  setHTML('bot5', bot5.map(rankRow('bot')).join(''));
}

function rankRow(type) {
  return t => `<div class="rank-row">
    <span class="rank-flag">${t.flag}</span>
    <span class="rank-name">${t.name}</span>
    <div class="rank-bar-wrap"><div class="rank-bar-fill ${type}" style="width:${t.pct}%"></div></div>
    <span class="rank-pct ${type}">${t.pct}%</span>
  </div>`;
}

// ─── COUNTRIES RENDER ────────────────────────────────────────

function renderGroup(groups, gridId, searchId) {
  const q = searchId ? (document.getElementById(searchId)||{value:''}).value.toLowerCase() : '';
  let list = [...groups];
  if (q) list = list.filter(t => t.name.toLowerCase().includes(q));
  if (countryFilter === 'incomplete') list = list.filter(t => getGroupHave(t) < t.n);
  if (countryFilter === 'done')       list = list.filter(t => getGroupHave(t) === t.n);
  const grid = document.getElementById(gridId);
  if (!grid) return;
  if (!list.length) { grid.innerHTML = '<div style="color:var(--text-muted);padding:20px;font-size:13px">Sin resultados</div>'; return; }
  grid.innerHTML = list.map(t => {
    const have = getGroupHave(t);
    const pct  = Math.round(have / t.n * 100);
    const isOpen = !!openCards[t.code];
    const complete = have === t.n;
    return `<div class="country-card${isOpen?' expanded':''}" id="cc-${t.code}">
      <div class="cc-header" onclick="toggleCard('${t.code}','${gridId}','${searchId}')">
        <span class="cc-flag">${t.flag}</span>
        <span class="cc-name">${t.name}</span>
        <span class="badge ${complete?'have':'miss'}">${complete ? '✓ Completo' : have+'/'+t.n+' — faltan '+(t.n-have)}</span>
      </div>
      <div class="cc-bar"><div class="cc-fill" style="width:${pct}%"></div></div>
      ${isOpen ? `<div class="stickers-wrap">
        <div class="stickers-label">Toca para marcar</div>
        <div class="stickers-grid">
          ${t.stickers.map(s => `<div class="fig ${state[s]?'have':'need'}" id="fig-${s}" onclick="toggleFig('${s}')">
            <div class="fig-code">${s}</div>
            <div class="fig-dot">${state[s]?'✓':'○'}</div>
          </div>`).join('')}
        </div>
      </div>` : ''}
    </div>`;
  }).join('');
}

function renderCountries()  { renderGroup(TEAMS,     'countries-grid', 'country-search'); }
function renderEspeciales() { renderGroup(ESPECIALES, 'esp-grid',       null); }
function renderCracks()     { renderGroup(CRACKS,     'cracks-grid',    null); }

function toggleCard(code, gridId, searchId) {
  openCards[code] = !openCards[code];
  renderGroup(
    gridId === 'countries-grid' ? TEAMS : gridId === 'esp-grid' ? ESPECIALES : CRACKS,
    gridId, searchId
  );
}

function setCountryFilter(f, el) {
  countryFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderCountries();
}

// ─── COSTOS ──────────────────────────────────────────────────

function calcCostos() {
  const precio = parseFloat(document.getElementById('precio-sobre')?.value) || 0;
  const fxs    = parseFloat(document.getElementById('figs-sobre')?.value)  || 5;
  const { obtenidas, faltantes } = getStats();
  const sobres  = Math.ceil(obtenidas / fxs);
  const sobres2 = Math.ceil(faltantes / fxs);
  setText('c-obtenidas', obtenidas);
  setText('c-sobres',    sobres);
  setText('c-total',    '$' + (sobres * precio).toLocaleString('es-CL'));
  setText('c-falt',      faltantes);
  setText('c-sobres2',   sobres2);
  setText('c-rest',     '$' + (sobres2 * precio).toLocaleString('es-CL'));
}

// ─── ESTADÍSTICAS ────────────────────────────────────────────

function renderEstadisticas() {
  const { obtenidas, faltantes } = getStats();
  const ranked = [...TEAMS]
    .map(t => ({...t, have: getGroupHave(t), pct: Math.round(getGroupHave(t)/t.n*100)}))
    .sort((a,b) => b.pct - a.pct);

  setHTML('est-content', `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px" class="est-grid">
      <div class="est-card">
        <div class="est-title">🏅 Ranking por completar</div>
        ${ranked.slice(0,10).map(t=>`<div class="pl-row">
          <span class="pl-flag">${t.flag}</span>
          <span class="pl-name">${t.name}</span>
          <div class="pl-bar-w"><div class="pl-fill" style="width:${t.pct}%"></div></div>
          <span class="pl-num">${t.pct}%</span>
        </div>`).join('')}
      </div>
      <div class="est-card">
        <div class="est-title">📊 Resumen general</div>
        ${[
          ['Total figuritas', TOTAL],
          ['Obtenidas', obtenidas],
          ['Faltantes', faltantes],
          ['Equipos con al menos 1', ranked.filter(t=>t.have>0).length],
          ['Equipos completos', ranked.filter(t=>t.have===t.n).length],
          ['% completado', Math.round(obtenidas/TOTAL*100)+'%'],
        ].map(([l,v])=>`<div class="cost-row"><div class="cost-label">${l}</div><div class="cost-value">${v}</div></div>`).join('')}
      </div>
    </div>
  `);
}

// ─── NAVIGATION ──────────────────────────────────────────────

function goPage(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  el.classList.add('active');
  closeSidebar();
  if (page === 'paises')       renderCountries();
  if (page === 'especiales')   renderEspeciales();
  if (page === 'cracks')       renderCracks();
  if (page === 'estadisticas') renderEstadisticas();
  if (page === 'costos')       calcCostos();
}

// ─── MOBILE SIDEBAR ──────────────────────────────────────────

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ─── LOGIN UI ────────────────────────────────────────────────

function showRegister() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  clearError();
}
function showLogin() {
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
  clearError();
}
function showError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.style.display = 'block';
}
function clearError() {
  const el = document.getElementById('login-error');
  el.style.display = 'none';
}
function showLoading(v) {
  document.getElementById('login-loading').style.display = v ? 'block' : 'none';
}

// ─── HELPERS ─────────────────────────────────────────────────

function setText(id, val)         { const e=document.getElementById(id); if(e) e.textContent=val; }
function setHTML(id, val)         { const e=document.getElementById(id); if(e) e.innerHTML=val; }
function setStyle(id, prop, val)  { const e=document.getElementById(id); if(e) e.style[prop]=val; }
