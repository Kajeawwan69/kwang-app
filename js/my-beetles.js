/* ด้วงของฉัน — บันทึกด้วงรายตัว (เก็บข้อมูลในเครื่อง IndexedDB เท่านั้น ไม่ผ่าน Supabase) */
(() => {
'use strict';

const STAGES = [
  { id: 'egg',   label: 'ไข่',        cls: 'mb-stg-egg' },
  { id: 'l1',    label: 'หนอน L1',    cls: 'mb-stg-l1' },
  { id: 'l2',    label: 'หนอน L2',    cls: 'mb-stg-l2' },
  { id: 'l3',    label: 'หนอน L3',    cls: 'mb-stg-l3' },
  { id: 'pupa',  label: 'ดักแด้',     cls: 'mb-stg-pupa' },
  { id: 'adult', label: 'ตัวเต็มวัย', cls: 'mb-stg-adult' },
];
const stageOf = id => STAGES.find(s => s.id === id) || STAGES[0];
const STAGE_GROUPS = [
  { id: 'egg', label: 'ไข่', stages: ['egg'] },
  { id: 'larva', label: 'หนอน', stages: ['l1', 'l2', 'l3'] },
  { id: 'pupa', label: 'ดักแด้', stages: ['pupa'] },
  { id: 'adult', label: 'ตัวเต็มวัย', stages: ['adult'] },
];
const groupOfStage = id => STAGE_GROUPS.find(g => g.stages.includes(id)) || STAGE_GROUPS[0];

const SEX = {
  male:    { label: 'ผู้',     icon: 'ph-gender-male' },
  female:  { label: 'เมีย',    icon: 'ph-gender-female' },
  unknown: { label: 'ไม่ทราบ', icon: 'ph-question' },
};
const sexIcon = s => (SEX[s] || SEX.unknown).icon;
const sexLabel = s => (SEX[s] || SEX.unknown).label;

const SPECIES_LIST = [
  'Dynastes hercules (เฮอร์คิวลิส)', 'Dynastes neptunus (เนปจูน)',
  'Chalcosoma caucasus (คอเคซัส)', 'Chalcosoma atlas (แอตลาส)',
  'Xylotrupes gideon (กว่างชน)', 'Eupatorus gracilicornis (กว่างห้าเขา)',
  'Allomyrina dichotoma (คาบูโตะ)', 'Dorcus titanus palawanicus (ปาลาวัน)',
  'Dorcus alcides (อัลซิเดส)', 'Prosopocoilus giraffa (คีมยีราฟ)',
  'Phalacrognathus muelleri (คีมสายรุ้ง)', 'Mecynorrhina torquata (ด้วงดอกไม้ยักษ์)',
];
const ORIGIN_LIST = ['เพาะเอง', 'ซื้อมา', 'แลกเปลี่ยน', 'จับจากธรรมชาติ'];

const CARE_RULES = {
  egg:   [{ type: 'check',     label: 'ตรวจไข่ / เช็กความชื้น', icon: 'ph-magnifying-glass', days: 7 }],
  l1:    [{ type: 'substrate', label: 'เปลี่ยนดิน/อาหาร', icon: 'ph-bowl-food', days: 30 },
          { type: 'weigh',     label: 'ชั่งน้ำหนัก',      icon: 'ph-scales', days: 30 }],
  l2:    [{ type: 'substrate', label: 'เปลี่ยนดิน/อาหาร', icon: 'ph-bowl-food', days: 40 },
          { type: 'weigh',     label: 'ชั่งน้ำหนัก',      icon: 'ph-scales', days: 30 }],
  l3:    [{ type: 'substrate', label: 'เปลี่ยนดิน/อาหาร', icon: 'ph-bowl-food', days: 45 },
          { type: 'weigh',     label: 'ชั่งน้ำหนัก',      icon: 'ph-scales', days: 30 }],
  pupa:  [{ type: 'check',     label: 'ตรวจดักแด้ (อย่ารบกวน)', icon: 'ph-magnifying-glass', days: 14 }],
  adult: [{ type: 'jelly',     label: 'เปลี่ยนเยลลี่',    icon: 'ph-drop', days: 3 },
          { type: 'check',     label: 'เช็กสภาพกล่อง',    icon: 'ph-magnifying-glass', days: 14 }],
};
const LOG_META = {
  stage:     { icon: 'ph-butterfly',       label: 'เปลี่ยนระยะ' },
  weigh:     { icon: 'ph-scales',          label: 'ชั่งน้ำหนัก' },
  substrate: { icon: 'ph-bowl-food',       label: 'เปลี่ยนดิน/อาหาร' },
  jelly:     { icon: 'ph-drop',            label: 'เปลี่ยนเยลลี่' },
  check:     { icon: 'ph-magnifying-glass', label: 'ตรวจเช็ก' },
  note:      { icon: 'ph-note-pencil',     label: 'โน้ต' },
  created:   { icon: 'ph-sparkle',        label: 'เริ่มบันทึก' },
};
const FILTERS = [
  { id: 'all',   label: 'ทั้งหมด',    match: () => true },
  { id: 'larva', label: 'หนอน',       match: s => s === 'l1' || s === 'l2' || s === 'l3' },
  { id: 'pupa',  label: 'ดักแด้',     match: s => s === 'pupa' },
  { id: 'adult', label: 'ตัวเต็มวัย', match: s => s === 'adult' },
];

const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = iso => {
  if (!iso) return '-';
  try { return new Date(iso + (iso.length === 10 ? 'T00:00' : '')).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }); }
  catch { return iso; }
};
const daysSince = iso => Math.floor((Date.now() - new Date(iso + (iso.length === 10 ? 'T00:00' : '')).getTime()) / 864e5);
const beetleTitle = b => b.code || b.name || 'ไม่มีชื่อ';
const beetleSub = b => [b.name && b.code ? b.name : '', b.species || 'ไม่ระบุสายพันธุ์'].filter(Boolean).join(' · ');
const beetleMeas = b => [b.weight ? b.weight + ' g' : '', b.size ? b.size + ' mm' : ''].filter(Boolean).join(' · ');
const weightLabelFor = stage => stage === 'adult' ? 'น้ำหนัก (g)' : 'น้ำหนักหนอน (g)';
const weightHintFor = stage => stage === 'adult' ? '11.4' : '38.2';

/* เกณฑ์แต้มของระบบยศสมาชิก (ต้องตรงกับ sql/profile_rank.sql) ใช้แค่คำนวณหลอดพลัง ไม่ได้เก็บค่าเอง */
const RANK_ORDER = ['egg', 'l1', 'l2', 'l3', 'pupa', 'adult'];
const RANK_THRESHOLDS = { egg: 0, l1: 3, l2: 8, l3: 16, pupa: 31, adult: 51 };

const IDEAL = { tMin: 24, tMax: 26, hMin: 55, hMax: 70 };

function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}

async function addLog(beetleId, type, value, note, dateISO) {
  return ZDB.put('logs', {
    id: ZDB.uid(), beetleId, type,
    date: dateISO || todayISO(),
    value: value ?? null, note: note || '',
    createdAt: new Date().toISOString(),
  });
}

function dueTasks(beetle, logs) {
  const rules = CARE_RULES[beetle.stage] || [];
  const base = beetle.acquiredDate || (beetle.createdAt || '').slice(0, 10) || todayISO();
  return rules.map(r => {
    const last = logs.filter(l => l.type === r.type).sort((a, b) => b.date.localeCompare(a.date))[0];
    const lastDate = last ? last.date : base;
    const over = daysSince(lastDate) - r.days;
    return { ...r, lastDate, over };
  }).filter(t => t.over >= 0);
}

/* ---------- confirm dialog (shares #modal-slot with community.js) ---------- */
function confirmDialog({ title, message, confirmLabel = 'ยืนยัน', danger = false }) {
  return new Promise(resolve => {
    const slot = $('#modal-slot');
    slot.innerHTML = `
    <div class="modal-overlay" id="mb-confirm-overlay">
      <div class="modal">
        <button type="button" class="close" id="mb-confirm-close">&times;</button>
        <h3>${esc(title)}</h3>
        <p class="sub">${esc(message)}</p>
        <div class="modal-actions">
          <button type="button" class="btn ghost" id="mb-confirm-cancel" style="flex:1">ยกเลิก</button>
          <button type="button" class="btn ${danger ? '' : 'primary'}" id="mb-confirm-ok" style="flex:1${danger ? ';background:#d13a4a;color:#fff' : ''}">${esc(confirmLabel)}</button>
        </div>
      </div>
    </div>`;
    const close = ok => { slot.innerHTML = ''; resolve(ok); };
    $('#mb-confirm-close').addEventListener('click', () => close(false));
    $('#mb-confirm-overlay').addEventListener('click', e => { if (e.target.id === 'mb-confirm-overlay') close(false); });
    $('#mb-confirm-cancel').addEventListener('click', () => close(false));
    $('#mb-confirm-ok').addEventListener('click', () => close(true));
  });
}

function inputDialog({ title, label, type = 'text', value = '', placeholder = '' }) {
  return new Promise(resolve => {
    const slot = $('#modal-slot');
    const isArea = type === 'textarea';
    slot.innerHTML = `
    <div class="modal-overlay" id="mb-input-overlay">
      <div class="modal">
        <button type="button" class="close" id="mb-input-close">&times;</button>
        <h3>${esc(title)}</h3>
        <form id="mb-input-form">
          <label for="mb-input-field">${esc(label)}</label>
          ${isArea
            ? `<textarea id="mb-input-field" rows="3" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
            : `<input id="mb-input-field" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}">`}
          <div class="modal-actions"><button type="submit" class="btn primary" style="flex:1">บันทึก</button></div>
        </form>
      </div>
    </div>`;
    const close = v => { slot.innerHTML = ''; resolve(v); };
    $('#mb-input-close').addEventListener('click', () => close(null));
    $('#mb-input-overlay').addEventListener('click', e => { if (e.target.id === 'mb-input-overlay') close(null); });
    $('#mb-input-form').addEventListener('submit', e => { e.preventDefault(); close($('#mb-input-field').value); });
  });
}

/* ---------- state + router ---------- */
const state = { detailId: null, editId: null };

function switchToMyBeetlesTab() {
  const tabBtn = document.querySelector('.tab[data-tab="mybeetles"]');
  if (tabBtn && !tabBtn.classList.contains('active')) tabBtn.click();
}

/* เรียกจาก Overview เพื่อข้ามไปแท็บ "ด้วงของฉัน" พร้อมเปิดรายการ/ตัวที่เลือก */
function goToBeetle(id) { switchToMyBeetlesTab(); go('detail', id); }
function goToList(filter) { switchToMyBeetlesTab(); go('list', filter); }
function goAdd() { switchToMyBeetlesTab(); go('form'); }

async function go(view, arg) {
  if (view === 'detail') state.detailId = arg;
  if (view === 'form') state.editId = arg || null;
  const root = view === 'overview' ? $('#overview-root') : $('#mybeetles-root');
  root.innerHTML = '<div class="loading">กำลังโหลด...</div>';
  try {
    if (view === 'overview') await renderOverview(root);
    else if (view === 'list') await renderList(root, arg);
    else if (view === 'detail') await renderDetail(root, state.detailId);
    else if (view === 'form') await renderForm(root, state.editId);
  } catch (err) {
    root.innerHTML = `<div class="empty">เกิดข้อผิดพลาด: ${esc(err.message)}</div>`;
  }
}

/* ---------- overview ---------- */
function loadWeather() {
  const box = $('#mb-wx-body');
  if (!box) return;

  const show = (t, h, place) => {
    const tOk = t >= IDEAL.tMin && t <= IDEAL.tMax;
    const hOk = h >= IDEAL.hMin && h <= IDEAL.hMax;
    const tNote = tOk ? `อยู่ในช่วงเหมาะ ${IDEAL.tMin}–${IDEAL.tMax}°C` : t > IDEAL.tMax ? `สูงกว่าช่วงเหมาะ ${IDEAL.tMin}–${IDEAL.tMax}°C` : `ต่ำกว่าช่วงเหมาะ ${IDEAL.tMin}–${IDEAL.tMax}°C`;
    const hNote = hOk ? `อยู่ในช่วงเหมาะ ${IDEAL.hMin}–${IDEAL.hMax}%` : h > IDEAL.hMax ? 'ชื้นเกิน เสี่ยงเชื้อราในกล่องดักแด้' : 'แห้งเกิน ควรพ่นน้ำเพิ่ม';
    box.innerHTML = `
      <span class="mb-wx-place" title="${esc(place || '')}"><i class="ph-fill ph-map-pin"></i>${esc(place || 'ตำแหน่งของคุณ')}</span>
      <span class="mb-wx-chip ${tOk ? 'ok' : 'warn'}" title="${esc(tNote)}"><i class="ph-fill ph-thermometer-simple"></i>${t.toFixed(1)}°</span>
      <span class="mb-wx-chip ${hOk ? 'ok' : 'warn'}" title="${esc(hNote)}"><i class="ph-fill ph-drop"></i>${Math.round(h)}%</span>`;
  };

  const retryPrompt = msg => {
    box.innerHTML = `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span class="mb-wx-note" style="flex:1;min-width:0;margin:0">${esc(msg)}</span>
      <button type="button" class="btn ghost" id="mb-wx-retry">อนุญาตตำแหน่ง</button>
    </div>`;
    const rb = $('#mb-wx-retry');
    if (rb) rb.addEventListener('click', locate);
  };

  function locate() {
    box.innerHTML = '<p class="mb-wx-note">กำลังอ่านตำแหน่งจากเครื่องคุณ…</p>';
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const { latitude: lat, longitude: lon } = pos.coords;
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`);
        const j = await r.json();
        const t = j.current.temperature_2m, h = j.current.relative_humidity_2m;
        let place = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        try {
          const gr = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=th`);
          const gj = await gr.json();
          const named = [gj.locality, gj.principalSubdivision].filter(Boolean).join(', ');
          if (named) place = named;
        } catch {}
        try { localStorage.setItem('mb-wx', JSON.stringify({ t, h, place, at: Date.now() })); } catch {}
        if ($('#mb-wx-body')) show(t, h, place);
      } catch {
        if ($('#mb-wx-body')) retryPrompt('ดึงข้อมูลอากาศไม่สำเร็จ ลองอีกครั้ง');
      }
    }, () => { if ($('#mb-wx-body')) retryPrompt('ยังไม่ได้อนุญาตให้เข้าถึงตำแหน่ง'); }, { timeout: 10000 });
  }

  const cached = (() => { try { return JSON.parse(localStorage.getItem('mb-wx') || 'null'); } catch { return null; } })();
  if (cached && Date.now() - cached.at < 30 * 60 * 1000) { show(cached.t, cached.h, cached.place); return; }
  if (cached) { locate(); return; }
  if (!navigator.geolocation) { box.innerHTML = '<p class="mb-wx-note">อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง</p>'; return; }
  retryPrompt('ยังไม่ได้อนุญาตให้เข้าถึงตำแหน่ง');
}

async function renderOverview(root) {
  const beetles = await ZDB.all('beetles');
  const allLogs = await ZDB.all('logs');
  const logsBy = {};
  allLogs.forEach(l => (logsBy[l.beetleId] = logsBy[l.beetleId] || []).push(l));

  const stageCount = {};
  STAGES.forEach(s => stageCount[s.id] = 0);
  beetles.forEach(b => stageCount[b.stage] = (stageCount[b.stage] || 0) + 1);
  const spSet = new Set(beetles.map(b => (b.species || '').trim()).filter(Boolean));
  const larvae = (stageCount.l1 || 0) + (stageCount.l2 || 0) + (stageCount.l3 || 0);

  const due = [];
  beetles.forEach(b => dueTasks(b, logsBy[b.id] || []).forEach(t => due.push({ b, t })));
  due.sort((a, b) => b.t.over - a.t.over);

  const recent = [...beetles].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 5);

  const stagePriority = ['adult', 'pupa', 'l3', 'l2', 'l1', 'egg'];
  const heroPhoto = beetles
    .filter(b => b.photo)
    .sort((a, b) => stagePriority.indexOf(a.stage) - stagePriority.indexOf(b.stage))[0];

  const profile = window.getCurrentProfile && window.getCurrentProfile();
  let profileInnerHTML = '';
  if (profile) {
    const stage = stageOf(profile.rank_stage || 'egg');
    const idx = RANK_ORDER.indexOf(profile.rank_stage || 'egg');
    const curMin = RANK_THRESHOLDS[profile.rank_stage || 'egg'] || 0;
    const nextStage = RANK_ORDER[idx + 1];
    const nextMin = nextStage ? RANK_THRESHOLDS[nextStage] : null;
    const points = profile.points || 0;
    const pct = nextMin ? Math.max(0, Math.min(100, Math.round((points - curMin) / (nextMin - curMin) * 100))) : 100;
    profileInnerHTML = `
      <div class="mb-profile-avatar">${profile.avatar_url ? `<img src="${esc(profile.avatar_url)}" alt="">` : '<i class="ph-fill ph-user-circle"></i>'}</div>
      <div class="mb-profile-info">
        <b>${esc(profile.display_name || profile.username)}</b>
        <div class="mb-profile-meta">
          <span class="mb-pill ${stage.cls}">${esc(stage.label)}</span>
          <span class="mb-lv">Lv.${points}</span>
        </div>
        <div class="mb-power-bar"><div class="mb-power-fill" style="width:${pct}%"></div></div>
      </div>`;
  }
  const profileHeadHTML = `
    <div class="mb-profile-head">
      ${profileInnerHTML}
      <div class="mb-profile-wx" id="mb-wx-body"><span class="mb-wx-note">กำลังโหลดสภาพอากาศ...</span></div>
    </div>`;

  root.innerHTML = `
    ${profileHeadHTML}
    <div class="mb-hero" ${heroPhoto ? `style="background-image:linear-gradient(90deg,#10160f 30%,rgba(16,22,15,.55)),url('${esc(heroPhoto.photo)}')"` : ''}>
      <i class="ph-fill ph-crown-simple"></i>
      <div><div class="mb-hero-n">${beetles.length} ตัว</div><div class="mb-hero-l">คอลเลกชันของคุณ</div></div>
    </div>
    <div class="mb-stat-tiles">
      <button type="button" class="mb-tile accent-leaf" data-go="all"><i class="ph-fill ph-identification-card"></i><div><b>${beetles.length}</b><span>ตัวทั้งหมด</span></div></button>
      <button type="button" class="mb-tile accent-copper" data-go="all"><i class="ph-fill ph-dna"></i><div><b>${spSet.size}</b><span>สายพันธุ์</span></div></button>
      <button type="button" class="mb-tile accent-gold" data-go="larva"><i class="ph-fill ph-bug"></i><div><b>${larvae}</b><span>หนอน</span></div></button>
      <button type="button" class="mb-tile accent-trophy" data-go="adult"><i class="ph-fill ph-trophy"></i><div><b>${stageCount.adult || 0}</b><span>ตัวเต็มวัย</span></div></button>
    </div>
    ${due.length === 0 ? '' : `
    <div class="mb-due">
      <h3><i class="ph-fill ph-bell-ringing"></i>ต้องดูแลวันนี้ (${due.length})</h3>
      ${due.slice(0, 8).map(({ b, t }) => `
        <div class="mb-due-item" data-id="${b.id}" role="button" tabindex="0">
          <i class="ph-fill ${t.icon}"></i>
          <div class="who">${t.label}${t.over > 0 ? ` <span class="over">· เกิน ${t.over} วัน</span>` : ''}<small>ล่าสุด ${fmtDate(t.lastDate)}</small></div>
          <span class="code">${esc(beetleTitle(b))}</span>
        </div>`).join('')}
    </div>`}
    <div class="mb-list-head"><h3>บันทึกล่าสุด</h3>${beetles.length ? `<button type="button" class="mb-link" id="mb-see-all">ดูทั้งหมด</button>` : ''}</div>
    ${recent.length === 0
      ? `<div class="mb-empty"><i class="ph-fill ph-bug"></i><p>ยังไม่มีด้วงในระบบ</p><button type="button" class="btn primary" id="mb-empty-add"><i class="ph-fill ph-plus"></i>บันทึกด้วงตัวแรก</button></div>`
      : `<div class="mb-cards">${recent.map(beetleCardHTML).join('')}</div>`}`;

  root.querySelectorAll('.mb-due-item, .mb-card').forEach(el =>
    el.addEventListener('click', () => goToBeetle(el.dataset.id)));
  const emptyAdd = $('#mb-empty-add');
  if (emptyAdd) emptyAdd.addEventListener('click', goAdd);
  loadWeather();
  root.querySelectorAll('.mb-tile[data-go]').forEach(el =>
    el.addEventListener('click', () => goToList(el.dataset.go)));
  const seeAll = $('#mb-see-all');
  if (seeAll) seeAll.addEventListener('click', () => goToList());
}

/* ---------- list ---------- */
function beetleCardHTML(b) {
  return `
    <div class="mb-card" data-id="${b.id}" role="button" tabindex="0">
      <div class="mb-card-photo">
        ${b.photo ? `<img src="${b.photo}" alt="">` : '<i class="ph-fill ph-bug"></i>'}
        <span class="mb-card-badge ${stageOf(b.stage).cls}">${esc(stageOf(b.stage).label)}</span>
        <i class="mb-card-sex ph-fill ${sexIcon(b.sex)}"></i>
      </div>
      <div class="mb-card-body">
        <b>${esc(beetleTitle(b))}</b>
        <small>${esc(beetleSub(b))}</small>
        ${beetleMeas(b) ? `<span class="mb-meas">${esc(beetleMeas(b))}</span>` : ''}
      </div>
    </div>`;
}

async function renderList(root, initialFilter) {
  const beetles = (await ZDB.all('beetles')).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  let filter = FILTERS.some(f => f.id === initialFilter) ? initialFilter : 'all', q = '';

  root.innerHTML = `
    <input type="search" class="stats-search" id="mb-search" placeholder="ค้นหา ชื่อ/รหัส/สายพันธุ์...">
    <div class="mb-chips" id="mb-filters">
      ${FILTERS.map(f => `<button type="button" class="mb-chip" data-f="${f.id}">${esc(f.label)}</button>`).join('')}
    </div>
    <div id="mb-list-body"></div>`;

  const draw = () => {
    const f = FILTERS.find(x => x.id === filter);
    const list = beetles.filter(b => f.match(b.stage) &&
      (!q || [b.name, b.code, b.species, b.bloodline, b.container].join(' ').toLowerCase().includes(q)));
    $('#mb-list-body').innerHTML = list.length === 0
      ? (beetles.length === 0
          ? `<div class="mb-empty"><i class="ph-fill ph-bug"></i><p>ยังไม่มีด้วงในระบบ</p><button type="button" class="btn primary" id="mb-empty-add"><i class="ph-fill ph-plus"></i>บันทึกด้วงตัวแรก</button></div>`
          : `<div class="mb-empty"><i class="ph-fill ph-magnifying-glass"></i><p>ไม่พบด้วงตามเงื่อนไข ลองเปลี่ยนตัวกรองดูครับ</p></div>`)
      : `<div class="mb-cards">${list.map(beetleCardHTML).join('')}</div>`;
    root.querySelectorAll('.mb-card').forEach(el => el.addEventListener('click', () => go('detail', el.dataset.id)));
    root.querySelectorAll('#mb-filters .mb-chip').forEach(c => c.classList.toggle('on', c.dataset.f === filter));
    const emptyAdd = $('#mb-empty-add');
    if (emptyAdd) emptyAdd.addEventListener('click', goAdd);
  };
  $('#mb-search').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); draw(); });
  root.querySelectorAll('#mb-filters .mb-chip').forEach(c => c.addEventListener('click', () => { filter = c.dataset.f; draw(); }));
  draw();
}

/* ---------- detail ---------- */
async function renderDetail(root, id) {
  const b = await ZDB.get('beetles', id);
  if (!b) { root.innerHTML = '<div class="empty">ไม่พบด้วงตัวนี้</div>'; return; }
  const logs = (await ZDB.logsOf(id)).sort((a, c) => c.date.localeCompare(a.date) || (c.createdAt || '').localeCompare(a.createdAt || ''));
  const stIdx = STAGES.findIndex(s => s.id === b.stage);
  const nextSt = STAGES[stIdx + 1];

  root.innerHTML = `
    <button type="button" class="mb-back" id="mb-back"><i class="ph-fill ph-arrow-left"></i>กลับ</button>
    <div class="mb-detail-head">
      <div class="mb-thumb big">${b.photo ? `<img src="${b.photo}" alt="">` : '<i class="ph-fill ph-bug"></i>'}</div>
      <div>
        <h2>${esc(beetleTitle(b))}</h2>
        <p class="mb-sub">${esc(beetleSub(b))}</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span class="mb-pill ${stageOf(b.stage).cls}">${esc(stageOf(b.stage).label)}</span>
          <span class="mb-pill mb-pill-outline"><i class="ph-fill ${sexIcon(b.sex)}"></i>${esc(sexLabel(b.sex))}</span>
        </div>
      </div>
    </div>
    <div class="mb-stat-tiles small">
      <div class="mb-tile"><span>${b.stage === 'adult' ? 'น้ำหนัก' : 'น้ำหนักล่าสุด'}</span><b>${b.weight ? b.weight + ' g' : '-'}</b></div>
      <div class="mb-tile"><span>ขนาดลำตัว</span><b>${b.size ? b.size + ' mm' : '-'}</b></div>
      <div class="mb-tile"><span>สายเลือด</span><b>${esc(b.bloodline || '-')}</b></div>
      <div class="mb-tile"><span>ภาชนะ</span><b>${esc(b.container || '-')}</b></div>
    </div>
    <p class="mb-note-line">${b.code ? `รหัส: ${esc(b.code)} · ` : ''}ได้มา ${fmtDate(b.acquiredDate)}</p>
    ${b.notes ? `<div class="mb-note-card"><b>📝 โน้ต</b><p>${esc(b.notes)}</p></div>` : ''}
    <div class="mb-qa">
      <button type="button" class="btn" id="qa-weigh"><i class="ph-fill ph-scales"></i>ชั่งน้ำหนัก</button>
      <button type="button" class="btn" id="qa-sub"><i class="ph-fill ph-bowl-food"></i>เปลี่ยนดิน</button>
      <button type="button" class="btn" id="qa-jelly"><i class="ph-fill ph-drop"></i>เยลลี่</button>
      ${nextSt ? `<button type="button" class="btn" id="qa-stage"><i class="ph-fill ph-butterfly"></i>เลื่อนเป็น ${esc(nextSt.label)}</button>` : ''}
      <button type="button" class="btn" id="qa-note"><i class="ph-fill ph-note-pencil"></i>เพิ่มโน้ต</button>
    </div>
    <h3 class="mb-tl-head">🕘 ไทม์ไลน์การเลี้ยง</h3>
    ${logs.length === 0 ? '<p class="mb-note-line">ยังไม่มีบันทึก</p>' : `<ul class="mb-tl">
      ${logs.map(l => {
        const m = LOG_META[l.type] || LOG_META.note;
        let body = m.label;
        if (l.type === 'stage') body = `เปลี่ยนระยะเป็น <b>${esc(stageOf(l.value).label)}</b>`;
        else if (l.type === 'weigh' && l.value) body = `ชั่งน้ำหนักได้ <b>${l.value} g</b>`;
        return `<li><i class="ph-fill ${m.icon}"></i><div class="mb-tl-mid"><div>${body}</div>${l.note ? `<small>${esc(l.note)}</small>` : ''}</div><div class="mb-tl-date">${fmtDate(l.date)}</div></li>`;
      }).join('')}
    </ul>`}
    <div class="mb-qa" style="margin-top:16px">
      <button type="button" class="btn" id="qa-edit"><i class="ph-fill ph-pencil-simple"></i>แก้ไขข้อมูล</button>
      <button type="button" class="btn danger" id="qa-del"><i class="ph-fill ph-trash"></i>ลบด้วงตัวนี้</button>
    </div>`;

  $('#mb-back').addEventListener('click', () => go('list'));
  const refresh = () => go('detail', id);
  $('#qa-weigh').addEventListener('click', async () => {
    const w = await inputDialog({ title: 'ชั่งน้ำหนัก', label: weightLabelFor(b.stage), type: 'number', value: b.weight || '', placeholder: weightHintFor(b.stage) });
    if (w === null) return;
    const val = parseFloat(w);
    await addLog(id, 'weigh', isNaN(val) ? null : val, '');
    if (!isNaN(val)) { b.weight = val; b.updatedAt = new Date().toISOString(); await ZDB.put('beetles', b); }
    toast('บันทึกน้ำหนักแล้ว'); refresh();
  });
  $('#qa-sub').addEventListener('click', async () => { await addLog(id, 'substrate'); toast('บันทึกเปลี่ยนดินแล้ว'); refresh(); });
  $('#qa-jelly').addEventListener('click', async () => { await addLog(id, 'jelly'); toast('บันทึกเยลลี่แล้ว'); refresh(); });
  $('#qa-note').addEventListener('click', async () => {
    const n = await inputDialog({ title: 'เพิ่มโน้ต', label: 'โน้ต', type: 'textarea', placeholder: 'เช่น เขาสมมาตร กินเยลลี่ดี' });
    if (!n) return;
    await addLog(id, 'note', null, n); toast('บันทึกโน้ตแล้ว'); refresh();
  });
  const qs = $('#qa-stage');
  if (qs) qs.addEventListener('click', async () => {
    const ok = await confirmDialog({ title: `เลื่อนระยะเป็น "${nextSt.label}"?`, message: `${beetleTitle(b)} จะเปลี่ยนจาก ${stageOf(b.stage).label} เป็น ${nextSt.label}`, confirmLabel: 'ยืนยันเลื่อนระยะ' });
    if (!ok) return;
    b.stage = nextSt.id; b.updatedAt = new Date().toISOString();
    await ZDB.put('beetles', b);
    await addLog(id, 'stage', nextSt.id, '');
    toast(`เลื่อนระยะเป็น ${nextSt.label} แล้ว`); refresh();
  });
  $('#qa-edit').addEventListener('click', () => go('form', id));
  $('#qa-del').addEventListener('click', async () => {
    const ok = await confirmDialog({ title: 'ลบด้วงตัวนี้?', message: `การลบย้อนกลับไม่ได้ ระบบจะลบ "${beetleTitle(b)}" และประวัติทั้งหมด ${logs.length} รายการ`, danger: true, confirmLabel: 'ลบด้วงตัวนี้' });
    if (!ok) return;
    await ZDB.delLogsOf(id);
    await ZDB.del('beetles', id);
    toast('ลบแล้ว'); go('overview');
  });
}

/* ---------- form ---------- */
async function renderForm(root, id) {
  const editing = id ? await ZDB.get('beetles', id) : null;
  const b = editing || {
    code: '', name: '', species: '', sex: 'unknown', stage: 'l1',
    weight: '', size: '', container: '', source: '', bloodline: '',
    acquiredDate: todayISO(), notes: '', photo: null,
  };
  let photo = b.photo;
  let sex = b.sex || 'unknown';
  let stage = b.stage || 'l1';
  let origin = b.source || '';
  let stageGroup = groupOfStage(stage).id;

  const sexChip = v => `<button type="button" class="mb-chip" data-sex="${v}"><i class="ph-fill ${sexIcon(v)}"></i>${esc(sexLabel(v))}</button>`;
  const stageChip = s => `<button type="button" class="mb-chip" data-stage="${s.id}">${esc(s.label)}</button>`;
  const groupChip = g => `<button type="button" class="mb-chip" data-group="${g.id}">${esc(g.label)}</button>`;
  const originChip = o => `<button type="button" class="mb-chip" data-origin="${esc(o)}">${esc(o)}</button>`;

  root.innerHTML = `
    <button type="button" class="mb-back" id="mb-back"><i class="ph-fill ph-arrow-left"></i>กลับ</button>
    <h2 class="mb-form-title">${editing ? 'แก้ไขข้อมูลด้วง' : 'บันทึกด้วงตัวใหม่'}</h2>
    <form id="mb-form">
      <div class="mb-photo-pick">
        <div class="mb-photo-prev" id="mb-photo-prev">${photo ? `<img src="${photo}" alt="">` : '<i class="ph-fill ph-camera"></i>'}</div>
        <label class="mb-chip" for="mb-f-photo">เลือกรูป</label>
        <input type="file" id="mb-f-photo" accept="image/*" style="display:none">
        ${photo ? `<button type="button" class="mb-chip" id="mb-photo-del">ลบรูป</button>` : ''}
      </div>
      <div class="field"><label for="mb-f-code">รหัส / ชื่อเรียก</label><input id="mb-f-code" value="${esc(b.code)}" placeholder="เช่น GID-015"></div>
      <div class="field">
        <label for="mb-f-species">สายพันธุ์</label>
        <input id="mb-f-species" list="mb-species-dl" value="${esc(b.species)}" placeholder="เช่น Dynastes hercules">
        <datalist id="mb-species-dl">${SPECIES_LIST.map(s => `<option value="${esc(s)}">`).join('')}</datalist>
      </div>
      <div class="field"><label>เพศ</label><div class="mb-chips" id="mb-sex-picker">${['male', 'female', 'unknown'].map(sexChip).join('')}</div></div>
      <div class="field">
        <label>ระยะการเจริญเติบโต</label>
        <div class="mb-chips" id="mb-group-picker">${STAGE_GROUPS.map(groupChip).join('')}</div>
        <div class="mb-chips" id="mb-stage-picker" style="margin-top:6px"></div>
      </div>
      <div class="grid">
        <div class="field"><label for="mb-f-weight" id="mb-f-weight-label">${weightLabelFor(stage)}</label><input id="mb-f-weight" type="number" step="0.1" min="0" value="${b.weight ?? ''}" placeholder="${weightHintFor(stage)}"></div>
        <div class="field"><label for="mb-f-size">ขนาดลำตัว (mm)</label><input id="mb-f-size" type="number" step="0.1" min="0" value="${b.size ?? ''}" placeholder="72"></div>
      </div>
      <div class="field"><label for="mb-f-container">ภาชนะ / กล่องเลี้ยง</label><input id="mb-f-container" value="${esc(b.container)}" placeholder="กล่อง 4.5 ลิตร"></div>
      <div class="field"><label>ได้มาจาก</label><div class="mb-chips" id="mb-origin-picker">${ORIGIN_LIST.map(originChip).join('')}</div></div>
      <div class="grid">
        <div class="field"><label for="mb-f-date">วันที่ได้มา</label><input id="mb-f-date" type="date" value="${esc(b.acquiredDate || todayISO())}"></div>
        <div class="field"><label for="mb-f-blood">สายเลือด (Line)</label><input id="mb-f-blood" value="${esc(b.bloodline)}" placeholder="TH-Kanchanaburi F2"></div>
      </div>
      <div class="field" style="grid-column:1/-1"><label for="mb-f-notes">บันทึกเพิ่มเติม</label><textarea id="mb-f-notes" rows="2">${esc(b.notes)}</textarea></div>
      <div class="modal-actions" style="margin-top:4px">
        <button type="submit" class="btn primary" style="flex:1">บันทึกเข้าคอลเลกชัน</button>
      </div>
    </form>`;

  const drawSex = () => root.querySelectorAll('#mb-sex-picker .mb-chip').forEach(x => x.classList.toggle('on', x.dataset.sex === sex));
  const drawGroup = () => root.querySelectorAll('#mb-group-picker .mb-chip').forEach(x => x.classList.toggle('on', x.dataset.group === stageGroup));
  const drawOrigin = () => root.querySelectorAll('#mb-origin-picker .mb-chip').forEach(x => x.classList.toggle('on', x.dataset.origin === origin));
  const syncWeightLabel = () => { $('#mb-f-weight-label').textContent = weightLabelFor(stage); $('#mb-f-weight').placeholder = weightHintFor(stage); };
  const drawStage = () => {
    const g = STAGE_GROUPS.find(x => x.id === stageGroup);
    const wrap = $('#mb-stage-picker');
    if (g.stages.length <= 1) { wrap.innerHTML = ''; return; }
    wrap.innerHTML = g.stages.map(sid => stageChip(stageOf(sid))).join('');
    wrap.querySelectorAll('.mb-chip').forEach(x => {
      x.classList.toggle('on', x.dataset.stage === stage);
      x.addEventListener('click', () => { stage = x.dataset.stage; drawStage(); syncWeightLabel(); });
    });
  };
  drawSex(); drawGroup(); drawStage(); drawOrigin();

  root.querySelectorAll('#mb-sex-picker .mb-chip').forEach(x => x.addEventListener('click', () => { sex = x.dataset.sex; drawSex(); }));
  root.querySelectorAll('#mb-group-picker .mb-chip').forEach(x => x.addEventListener('click', () => {
    stageGroup = x.dataset.group; drawGroup();
    const g = STAGE_GROUPS.find(gg => gg.id === stageGroup);
    stage = g.stages.includes(stage) ? stage : g.stages[0];
    drawStage(); syncWeightLabel();
  }));
  root.querySelectorAll('#mb-origin-picker .mb-chip').forEach(x => x.addEventListener('click', () => { origin = x.dataset.origin; drawOrigin(); }));

  $('#mb-f-photo').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      const max = 640, sc = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      photo = cv.toDataURL('image/jpeg', 0.82);
      $('#mb-photo-prev').innerHTML = `<img src="${photo}" alt="">`;
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
  });
  const pd = $('#mb-photo-del');
  if (pd) pd.addEventListener('click', () => { photo = null; $('#mb-photo-prev').innerHTML = '<i class="ph-fill ph-camera"></i>'; });

  $('#mb-back').addEventListener('click', () => go(editing ? 'detail' : 'overview', editing ? editing.id : null));
  $('#mb-form').addEventListener('submit', async e => {
    e.preventDefault();
    const val = sel => $(sel).value.trim();
    const num = sel => { const v = parseFloat($(sel).value); return isNaN(v) ? null : v; };
    const rec = {
      id: editing ? editing.id : ZDB.uid(),
      code: val('#mb-f-code'), name: editing ? editing.name : '', species: val('#mb-f-species'),
      sex, stage,
      weight: num('#mb-f-weight'), size: num('#mb-f-size'),
      container: val('#mb-f-container'), source: origin,
      bloodline: val('#mb-f-blood'), acquiredDate: $('#mb-f-date').value || todayISO(),
      notes: val('#mb-f-notes'), photo,
      createdAt: editing ? editing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!rec.code && !rec.name) { toast('กรอกรหัสหรือชื่ออย่างน้อย 1 ช่อง'); return; }
    await ZDB.put('beetles', rec);
    if (!editing) {
      await addLog(rec.id, 'created', null, '', rec.acquiredDate);
      await addLog(rec.id, 'stage', rec.stage, 'ระยะเริ่มต้น', rec.acquiredDate);
      if (rec.weight) await addLog(rec.id, 'weigh', rec.weight, '', rec.acquiredDate);
    } else if (editing.stage !== rec.stage) {
      await addLog(rec.id, 'stage', rec.stage, 'แก้ไขระยะ');
    }
    toast(editing ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มเข้าคอลเลกชันแล้ว');
    go('detail', rec.id);
  });
}

/* ---------- boot ---------- */
$('#mb-fab').addEventListener('click', goAdd);
window.addEventListener('profile-updated', () => {
  const overviewTab = document.querySelector('.tab[data-tab="overview"]');
  if (overviewTab && overviewTab.classList.contains('active')) go('overview');
});
go('overview');
go('list');

})();
