/* KWANG (by ZOOTRONIA) — SPA logic */
(() => {
'use strict';

/* ---------- ค่าคงที่ ---------- */
const STAGES = [
  { id: 'egg',   label: 'ไข่',        cls: 'stg-egg' },
  { id: 'l1',    label: 'หนอน L1',    cls: 'stg-l1' },
  { id: 'l2',    label: 'หนอน L2',    cls: 'stg-l2' },
  { id: 'l3',    label: 'หนอน L3',    cls: 'stg-l3' },
  { id: 'pupa',  label: 'ดักแด้',     cls: 'stg-pupa' },
  { id: 'adult', label: 'ตัวเต็มวัย', cls: 'stg-adult' },
];
const stageOf = id => STAGES.find(s => s.id === id) || STAGES[0];

/* กลุ่มระยะสำหรับฟอร์ม — รวม L1–L3 เป็น "หนอน" กลุ่มเดียว ไม่ให้ตัวเลือกเกิน 4 ตัวในแถวเดียว */
const STAGE_GROUPS = [
  { id: 'egg', label: 'ไข่', stages: ['egg'] },
  { id: 'larva', label: 'หนอน', stages: ['l1', 'l2', 'l3'] },
  { id: 'pupa', label: 'ดักแด้', stages: ['pupa'] },
  { id: 'adult', label: 'ตัวเต็มวัย', stages: ['adult'] },
];
const groupOfStage = id => STAGE_GROUPS.find(g => g.stages.includes(id)) || STAGE_GROUPS[0];

const SEX = {
  male:    { label: 'ผู้',      icon: 'ph ph-gender-male' },
  female:  { label: 'เมีย',     icon: 'ph ph-gender-female' },
  unknown: { label: 'ไม่ทราบ',  icon: 'ph ph-question' },
};
const sexIcon = s => (SEX[s] || SEX.unknown).icon;
const sexLabel = s => (SEX[s] || SEX.unknown).label;

const SPECIES_LIST = [
  'Dynastes hercules (เฮอร์คิวลิส)',
  'Dynastes neptunus (เนปจูน)',
  'Chalcosoma caucasus (คอเคซัส)',
  'Chalcosoma atlas (แอตลาส)',
  'Xylotrupes gideon (กว่างชน)',
  'Eupatorus gracilicornis (กว่างห้าเขา)',
  'Allomyrina dichotoma (คาบูโตะ)',
  'Dorcus titanus palawanicus (ปาลาวัน)',
  'Dorcus alcides (อัลซิเดส)',
  'Prosopocoilus giraffa (คีมยีราฟ)',
  'Phalacrognathus muelleri (คีมสายรุ้ง)',
  'Mecynorrhina torquata (ด้วงดอกไม้ยักษ์)',
];
const speciesShort = sp => (sp || '').split('(')[0].trim();

const ORIGIN_LIST = ['เพาะเอง', 'ซื้อมา', 'แลกเปลี่ยน', 'จับจากธรรมชาติ'];

/* ---------- ร้านค้า + ตลาดประมูล (mock, in-memory เฉพาะเซสชันนี้) ---------- */
const SHOP_CATS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'Larva', label: 'ตัวอ่อน' },
  { key: 'Adult', label: 'ตัวเต็มวัย' },
  { key: 'Set', label: 'เซ็ต' },
  { key: 'Acc', label: 'อุปกรณ์' },
  { key: 'Food', label: 'อาหาร' },
];
const money = n => Number(n || 0).toLocaleString('en-US');
const stockBadge = stock => stock === 0 ? 'stock-out' : stock <= 5 ? 'stock-low' : 'stock-ok';
const stockText = stock => stock === 0 ? 'ของหมด' : 'คงเหลือ ' + stock;

let PRODUCTS = [
  { id: 'p1', name: 'หนอน L3 กว่างห้าเขา', price: 850, stock: 8, category: 'Larva' },
  { id: 'p2', name: 'หนอน L2 กว่างสามเขา', price: 600, stock: 12, category: 'Larva' },
  { id: 'p3', name: 'กว่างชนตัวผู้ 68 mm', price: 1200, stock: 3, category: 'Adult' },
  { id: 'p4', name: 'คีมยีราฟตัวผู้ 92 mm', price: 3200, stock: 0, category: 'Adult' },
  { id: 'p5', name: 'เซ็ตเริ่มต้นเลี้ยงกว่าง', price: 1450, stock: 5, category: 'Set' },
  { id: 'p6', name: 'กล่องเลี้ยง 4.5 ลิตร', price: 120, stock: 40, category: 'Acc' },
  { id: 'p7', name: 'ตราชั่งดิจิทัล 0.01 g', price: 690, stock: 6, category: 'Acc' },
  { id: 'p8', name: 'เยลลี่โปรตีน 16 g × 10', price: 150, stock: 60, category: 'Food' },
  { id: 'p9', name: 'ดินหมักไม้ก่อ 5 ลิตร', price: 180, stock: 24, category: 'Food' },
];
let ORDERS = [
  { no: 'TB-260915-01', customer: 'Champ CH', initial: 'C', state: 'รอจัดส่ง', time: '25 นาทีก่อน', total: 2550, items: [{ name: 'หนอน L3 กว่างห้าเขา', qty: 3, price: 850 }] },
  { no: 'TB-260915-02', customer: 'Mint Larva', initial: 'M', state: 'รอชำระเงิน', time: '2 ชม.ก่อน', total: 720, items: [{ name: 'ดินหมักไม้ก่อ 5 ลิตร', qty: 4, price: 180 }] },
  { no: 'TB-260914-03', customer: 'Aof Beetle', initial: 'A', state: 'ส่งแล้ว', time: 'เมื่อวาน', total: 1450, items: [{ name: 'เซ็ตเริ่มต้นเลี้ยงกว่าง', qty: 1, price: 1450 }] },
];
let cart = [];
let shopRole = 'admin';

let AUCTIONS = [
  { id: 'a1', title: 'กว่างห้าเขาตัวผู้ 84 mm สายเชียงใหม่', seller: 'Champ CH', bid: 4200, step: 100, bids: 14, top: 'Benz Exotic',
    endsAt: Date.now() + (3 * 3600 + 42 * 60) * 1000,
    history: [
      { name: 'Benz Exotic', amount: 4200, time: '4 นาทีก่อน' },
      { name: 'Aof Beetle', amount: 4100, time: '12 นาทีก่อน' },
      { name: 'Sunny Day', amount: 4000, time: '25 นาทีก่อน' },
      { name: 'Benz Exotic', amount: 3800, time: '48 นาทีก่อน' },
    ] },
  { id: 'a2', title: 'คีมยีราฟ F1 คู่พ่อแม่พันธุ์', seller: 'Note Beetle Farm', bid: 7800, step: 200, bids: 23, top: 'Aof Beetle',
    endsAt: Date.now() + 26 * 3600 * 1000,
    history: [
      { name: 'Aof Beetle', amount: 7800, time: '18 นาทีก่อน' },
      { name: 'Mint Larva', amount: 7600, time: '1 ชม.ก่อน' },
      { name: 'Champ CH', amount: 7200, time: '3 ชม.ก่อน' },
    ] },
  { id: 'a3', title: 'หนอน L3 เฮอร์คิวลิส 92 g', seller: 'Aof Beetle', bid: 2600, step: 100, bids: 9, top: 'Mint Larva',
    endsAt: Date.now() + 48 * 60 * 1000,
    history: [
      { name: 'Mint Larva', amount: 2600, time: '2 นาทีก่อน' },
      { name: 'Benz Exotic', amount: 2500, time: '20 นาทีก่อน' },
    ] },
  { id: 'a4', title: 'กว่างสามเขา ตัวผู้ 101 mm', seller: 'Mint Larva', bid: 5400, step: 100, bids: 31, top: 'Champ CH',
    endsAt: Date.now() - 60 * 1000,
    history: [
      { name: 'Champ CH', amount: 5400, time: 'เมื่อวาน' },
      { name: 'Aof Beetle', amount: 5300, time: 'เมื่อวาน' },
    ] },
];

function countdownText(ms) {
  if (ms <= 0) return 'ปิดประมูลแล้ว';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60), sec = s % 60;
  const p = n => String(n).padStart(2, '0');
  return (d > 0 ? d + ' วัน ' : '') + p(h) + ':' + p(m) + ':' + p(sec);
}

function openModal(bodyHtml) {
  closeModal();
  const bd = document.createElement('div');
  bd.className = 'modal-backdrop';
  bd.id = 'modal-backdrop';
  bd.innerHTML = `<div class="modal">${bodyHtml}</div>`;
  bd.addEventListener('click', e => { if (e.target === bd) closeModal(); });
  document.body.appendChild(bd);
  return bd.querySelector('.modal');
}
function closeModal() {
  const bd = document.getElementById('modal-backdrop');
  if (bd) bd.remove();
}

function toastAction(msg, actionLabel, onAction, ms = 6000) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.innerHTML = `<span>${esc(msg)}</span>${actionLabel ? `<button type="button" class="toast-action">${esc(actionLabel)}</button>` : ''}`;
  t.classList.add('show');
  clearTimeout(toast._t);
  const hide = () => t.classList.remove('show');
  toast._t = setTimeout(hide, ms);
  const btn = t.querySelector('.toast-action');
  if (btn) btn.addEventListener('click', () => { clearTimeout(toast._t); hide(); onAction(); }, { once: true });
}

/* แทน confirm() ของเบราว์เซอร์ — คืนค่า true/false ตามปุ่มที่กด */
function confirmModal({ title, message, confirmLabel = 'ยืนยัน', cancelLabel = 'ยกเลิก', danger = false, photo, name, sub, typedPhrase }) {
  return new Promise(resolve => {
    const meta = name ? `
      <div class="confirm-meta">
        ${photo ? `<div class="confirm-meta-thumb">${photo}</div>` : ''}
        <div class="confirm-meta-tx"><b>${esc(name)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>
      </div>` : '';
    const phraseField = typedPhrase ? `
      <div class="field" style="margin-top:10px">
        <label for="cm-phrase">พิมพ์ "${esc(typedPhrase)}" เพื่อยืนยัน</label>
        <input id="cm-phrase" autocomplete="off">
      </div>` : '';
    const modal = openModal(`
      <div class="confirm-head ${danger ? 'danger' : ''}"><i class="ph-fill ${danger ? 'ph-warning' : 'ph-question'}"></i><span>${esc(title)}</span></div>
      ${meta}
      <p class="confirm-msg">${esc(message)}</p>
      ${phraseField}
      <div class="confirm-actions">
        <button type="button" class="btn" id="cm-cancel">${esc(cancelLabel)}</button>
        <button type="button" class="btn ${danger ? 'danger solid' : 'primary'}" id="cm-ok" ${typedPhrase ? 'disabled' : ''}>${esc(confirmLabel)}</button>
      </div>`);
    const finish = ok => { closeModal(); resolve(ok); };
    modal.querySelector('#cm-cancel').addEventListener('click', () => finish(false));
    modal.querySelector('#cm-ok').addEventListener('click', () => finish(true));
    const phraseInput = modal.querySelector('#cm-phrase');
    if (phraseInput) {
      const okBtn = modal.querySelector('#cm-ok');
      phraseInput.addEventListener('input', () => { okBtn.disabled = phraseInput.value.trim() !== typedPhrase; });
      phraseInput.focus();
    }
    document.getElementById('modal-backdrop').addEventListener('click', e => { if (e.target.id === 'modal-backdrop') finish(false); });
  });
}

/* แทน prompt() ของเบราว์เซอร์ — คืนค่าข้อความ หรือ null ถ้ายกเลิก */
function inputModal({ title, label, type = 'text', value = '', placeholder = '', confirmLabel = 'บันทึก', cancelLabel = 'ยกเลิก', min }) {
  return new Promise(resolve => {
    const isArea = type === 'textarea';
    const fieldHtml = isArea
      ? `<textarea id="im-field" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
      : `<input id="im-field" type="${esc(type)}" ${type === 'number' ? `step="0.1" inputmode="decimal" ${min !== undefined ? `min="${min}"` : ''}` : ''} value="${esc(value)}" placeholder="${esc(placeholder)}">`;
    const modal = openModal(`
      <div class="confirm-head"><i class="ph ph-note-pencil"></i><span>${esc(title)}</span></div>
      <div class="field" style="margin-top:10px">
        <label for="im-field">${esc(label)}</label>
        ${fieldHtml}
      </div>
      <div class="confirm-actions">
        <button type="button" class="btn" id="im-cancel">${esc(cancelLabel)}</button>
        <button type="button" class="btn primary" id="im-ok">${esc(confirmLabel)}</button>
      </div>`);
    const field = modal.querySelector('#im-field');
    field.focus();
    const finish = v => { closeModal(); resolve(v); };
    modal.querySelector('#im-cancel').addEventListener('click', () => finish(null));
    modal.querySelector('#im-ok').addEventListener('click', () => finish(field.value.trim()));
    field.addEventListener('keydown', e => { if (e.key === 'Enter' && !isArea) { e.preventDefault(); finish(field.value.trim()); } });
    document.getElementById('modal-backdrop').addEventListener('click', e => { if (e.target.id === 'modal-backdrop') finish(null); });
  });
}

/* งานดูแลตามระยะ: type ใช้ตรงกับชนิด log, days = รอบวัน */
const CARE_RULES = {
  egg:   [{ type: 'check',     label: 'ตรวจไข่ / เช็กความชื้น', ic: 'ph ph-magnifying-glass', days: 7 }],
  l1:    [{ type: 'substrate', label: 'เปลี่ยนดิน/อาหาร', ic: 'ph ph-bowl-food', days: 30 },
          { type: 'weigh',     label: 'ชั่งน้ำหนัก',      ic: 'ph ph-scales', days: 30 }],
  l2:    [{ type: 'substrate', label: 'เปลี่ยนดิน/อาหาร', ic: 'ph ph-bowl-food', days: 40 },
          { type: 'weigh',     label: 'ชั่งน้ำหนัก',      ic: 'ph ph-scales', days: 30 }],
  l3:    [{ type: 'substrate', label: 'เปลี่ยนดิน/อาหาร', ic: 'ph ph-bowl-food', days: 45 },
          { type: 'weigh',     label: 'ชั่งน้ำหนัก',      ic: 'ph ph-scales', days: 30 }],
  pupa:  [{ type: 'check',     label: 'ตรวจดักแด้ (อย่ารบกวน)', ic: 'ph ph-magnifying-glass', days: 14 }],
  adult: [{ type: 'jelly',     label: 'เปลี่ยนเยลลี่',    ic: 'ph ph-drop', days: 3 },
          { type: 'check',     label: 'เช็กสภาพกล่อง',    ic: 'ph ph-magnifying-glass', days: 14 }],
};
const LOG_META = {
  stage:     { ic: 'ph ph-butterfly',      label: 'เปลี่ยนระยะ' },
  weigh:     { ic: 'ph ph-scales',         label: 'ชั่งน้ำหนัก' },
  size:      { ic: 'ph ph-ruler',          label: 'วัดขนาด' },
  substrate: { ic: 'ph ph-bowl-food',      label: 'เปลี่ยนดิน/อาหาร' },
  jelly:     { ic: 'ph ph-drop',           label: 'เปลี่ยนเยลลี่' },
  check:     { ic: 'ph ph-magnifying-glass', label: 'ตรวจเช็ก' },
  note:      { ic: 'ph ph-note-pencil',    label: 'โน้ต' },
  created:   { ic: 'ph ph-sparkle',        label: 'เริ่มบันทึก' },
};

const IDEAL = { tMin: 24, tMax: 26, hMin: 55, hMax: 70 };

const FILTERS = [
  { id: 'all',   label: 'ทั้งหมด',     match: () => true },
  { id: 'larva', label: 'หนอน',        match: s => s === 'l1' || s === 'l2' || s === 'l3' },
  { id: 'pupa',  label: 'ดักแด้',      match: s => s === 'pupa' },
  { id: 'adult', label: 'ตัวเต็มวัย',  match: s => s === 'adult' },
];
const filterOf = id => FILTERS.find(f => f.id === id) || FILTERS[0];
const filterForStage = stageId => {
  if (stageId === 'l1' || stageId === 'l2' || stageId === 'l3') return 'larva';
  if (stageId === 'pupa') return 'pupa';
  if (stageId === 'adult') return 'adult';
  return 'all';
};

/* ---------- ตัวช่วย ---------- */
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

function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ป้ายระยะ + ไอคอนตัวย่อประจำตัว */
const stagePill = id => `<span class="pill ${stageOf(id).cls}">${esc(stageOf(id).label)}</span>`;
const beetleTitle = b => b.code || b.name || 'ไม่มีชื่อ';
const beetleSub = b => [b.name && b.code ? b.name : '', b.species || 'ไม่ระบุสายพันธุ์'].filter(Boolean).join(' · ');
const beetleMeas = b => [b.weight ? b.weight + ' g' : '', b.size ? b.size + ' mm' : ''].filter(Boolean).join(' · ');
const thumbInner = b => b.photo ? `<img src="${b.photo}" alt="">` : '<i class="ph-fill ph-bug"></i>';
const weightLabelFor = stage => stage === 'adult' ? 'น้ำหนัก (g)' : 'น้ำหนักหนอน (g)';
const weightHintFor = stage => stage === 'adult' ? '11.4' : '38.2';

async function addLog(beetleId, type, value, note, dateISO) {
  return ZDB.put('logs', {
    id: ZDB.uid(), beetleId, type,
    date: dateISO || todayISO(),
    value: value ?? null, note: note || '',
    createdAt: new Date().toISOString(),
  });
}

/* งานดูแลที่ถึงกำหนดของด้วงหนึ่งตัว (อิง log ล่าสุดของชนิดนั้น) */
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

/* แถวรายการด้วง (ใช้ทั้งมือถือและตาราง) */
function beetleRowHTML(b) {
  return `
    <div class="beetle-row" data-id="${b.id}" role="button" tabindex="0">
      <div class="thumb">${thumbInner(b)}</div>
      <div class="info">
        <div class="title"><b>${esc(beetleTitle(b))}</b><i class="sex-ic ${sexIcon(b.sex)}"></i></div>
        <small>${esc(beetleSub(b))}</small>
        ${beetleMeas(b) ? `<span class="meas">${esc(beetleMeas(b))}</span>` : ''}
      </div>
      <div class="meta">${stagePill(b.stage)}</div>
    </div>`;
}
function beetleTableRowHTML(b) {
  return `
    <div class="bt-row" data-id="${b.id}" role="button" tabindex="0">
      <div class="thumb">${thumbInner(b)}</div>
      <span>${esc(beetleTitle(b))}</span>
      <span class="c-sp">${esc(speciesShort(b.species) || '-')}</span>
      <span>${stagePill(b.stage)}</span>
      <span class="c-sex"><i class="${sexIcon(b.sex)}"></i>${esc(sexLabel(b.sex))}</span>
      <span class="c-meas">${esc(beetleMeas(b) || '-')}</span>
      <span class="c-container">${esc(b.container || '-')}</span>
    </div>`;
}
function bindRowNav(root) {
  root.querySelectorAll('[data-id]').forEach(el => {
    const go = () => location.hash = '#/beetle/' + el.dataset.id;
    el.addEventListener('click', go);
    el.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
}

/* ---------- Router ---------- */
const routes = {
  '': viewHome, 'beetles': viewBeetles, 'add': viewForm, 'world': viewWorld,
  'settings': viewSettings, 'beetle': viewDetail, 'edit': viewForm, 'shop': viewShop,
};

let worldTimer = null;

async function render() {
  if (worldTimer) { clearInterval(worldTimer); worldTimer = null; }
  const hash = location.hash.replace(/^#\/?/, '');
  const [name, arg] = hash.split('/');
  const fn = routes[name] || viewHome;
  document.querySelectorAll('#nav a, #shop-fab').forEach(a => {
    const n = a.dataset.nav;
    a.classList.toggle('active', n === (name || 'home') || (n === 'beetles' && name === 'beetle') || (n === 'add' && name === 'edit'));
  });
  const view = $('#view');
  view.innerHTML = '<div class="empty">กำลังโหลด…</div>';
  try { await fn(view, arg); }
  catch (e) { console.error(e); view.innerHTML = `<div class="empty"><span class="big">⚠️</span>เกิดข้อผิดพลาด: ${esc(e.message)}</div>`; }
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);

/* ================= ภาพรวม ================= */
async function viewHome(view) {
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

  const recent = [...beetles]
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 3);

  const spCount = {};
  beetles.forEach(b => { const k = b.species || 'ไม่ระบุสายพันธุ์'; spCount[k] = (spCount[k] || 0) + 1; });
  const spTop = Object.entries(spCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const stageSwatch = { egg: '#c3d2c6', l1: '#ffe08a', l2: 'var(--gold)', l3: 'var(--gold-600)', pupa: 'var(--green-400)', adult: 'var(--green)' };
  const stageBreakdown = STAGES.filter(s => stageCount[s.id] > 0);

  view.innerHTML = `
    <div class="page-head">
      <h1>ภาพรวมคอลเลกชัน</h1>
      <p class="sub">${beetles.length} ตัวในระบบ · อัปเดต ${fmtDate(todayISO())}</p>
    </div>

    <div class="statband">
      <button class="cell" data-go="#/beetles"><i class="ic ph ph-identification-card"></i><div class="txt"><div class="n">${beetles.length}</div><div class="l">ตัวทั้งหมด</div></div></button>
      <button class="cell" data-go="#/beetles"><i class="ic ph ph-dna"></i><div class="txt"><div class="n">${spSet.size}</div><div class="l">สายพันธุ์</div></div></button>
      <button class="cell" data-go="#/beetles/larva"><i class="ic ph ph-worm"></i><div class="txt"><div class="n">${larvae}</div><div class="l">หนอน</div></div></button>
      <button class="cell" data-go="#/beetles/adult"><i class="ic ph-fill ph-bug"></i><div class="txt"><div class="n">${stageCount.adult || 0}</div><div class="l">ตัวเต็มวัย</div></div></button>
    </div>

    <div class="card" style="margin-top:12px">
      <div class="env-head">
        <i class="ic ph ph-map-pin"></i>
        <span class="place" id="env-place">ตำแหน่งและสภาพอากาศ</span>
        <span class="time" id="env-time"></span>
      </div>
      <div id="wx-body"></div>
    </div>

    ${due.length === 0 ? '' : `
    <div class="due-card">
      <h2><i class="ph-fill ph-bell-ringing"></i>ต้องดูแลวันนี้ (${due.length})</h2>
      ${due.slice(0, 6).map(({ b, t }) => `
        <div class="due-item" data-id="${b.id}" role="button" tabindex="0">
          <i class="ic ${t.ic}"></i>
          <div class="who">
            ${t.label}${t.over > 0 ? ` <span class="due">· เกิน ${t.over} วัน</span>` : ''}
            <small>ล่าสุด ${fmtDate(t.lastDate)}</small>
          </div>
          <span class="code">${esc(beetleTitle(b))}</span>
        </div>`).join('')}
      ${due.length > 6 ? `<p class="wx-note" style="color:var(--gold-text)">…และอีก ${due.length - 6} งาน</p>` : ''}
    </div>`}

    <div class="mobile-only"><a class="btn primary block" href="#/add" style="margin-top:14px"><i class="ph ph-plus"></i>บันทึกด้วงตัวใหม่</a></div>

    <div class="list-head">
      <h2>บันทึกล่าสุด</h2>
      <a href="#/beetles">ดูทั้งหมด</a>
    </div>
    ${recent.length === 0
      ? `<div class="card empty"><span class="big">🐞</span>ยังไม่มีด้วงในระบบ — กดปุ่มด้านบนเพื่อบันทึกตัวแรก</div>`
      : recent.map(beetleRowHTML).join('')}

    <div class="grid-2 home-breakdown" style="margin-top:14px">
      <div class="card">
        <h2 style="color:var(--text-3)">จำนวนตามระยะ</h2>
        ${stageBreakdown.length === 0 ? '<p class="wx-note">ยังไม่มีข้อมูล</p>' : stageBreakdown.map(s => `
          <div class="breakdown-row"><span class="sw" style="background:${stageSwatch[s.id]}"></span><span class="lbl">${esc(s.label)}</span><span class="n">${stageCount[s.id]}</span></div>`).join('')}
      </div>
      <div class="card">
        <h2 style="color:var(--text-3)">สายพันธุ์ในคอลเลกชัน</h2>
        ${spTop.length === 0 ? '<p class="wx-note">ยังไม่มีข้อมูล</p>' : spTop.map(([name, n]) => `
          <div class="breakdown-row"><i class="ph-fill ph-bug"></i><span class="lbl" title="${esc(name)}">${esc(speciesShort(name) || name)}</span><span class="n">${n}</span></div>`).join('')}
      </div>
    </div>`;

  view.querySelectorAll('[data-go]').forEach(el =>
    el.addEventListener('click', () => location.hash = el.dataset.go));
  bindRowNav(view);

  loadWeather();
}

async function loadWeather() {
  const box = $('#wx-body');
  if (!box) return;
  const placeEl = $('#env-place'), timeEl = $('#env-time');

  const show = (t, h, place) => {
    const tOk = t >= IDEAL.tMin && t <= IDEAL.tMax;
    const hOk = h >= IDEAL.hMin && h <= IDEAL.hMax;
    if (placeEl) placeEl.textContent = place || 'ตำแหน่งของคุณ';
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    box.innerHTML = `
      <div class="env">
        <div class="env-tile"><div class="row"><i class="ph-fill ph-thermometer-simple temp"></i><span class="val num">${t.toFixed(1)}°</span></div>
          <div class="note">${tOk ? `อยู่ในช่วงเหมาะ ${IDEAL.tMin}–${IDEAL.tMax}°C` : t > IDEAL.tMax ? `สูงกว่าช่วงเหมาะ ${IDEAL.tMin}–${IDEAL.tMax}°C` : `ต่ำกว่าช่วงเหมาะ ${IDEAL.tMin}–${IDEAL.tMax}°C`}</div></div>
        <div class="env-tile"><div class="row"><i class="ph-fill ph-drop hum"></i><span class="val num">${Math.round(h)}%</span></div>
          <div class="note">${hOk ? `อยู่ในช่วงเหมาะ ${IDEAL.hMin}–${IDEAL.hMax}%` : h > IDEAL.hMax ? 'ชื้นเกิน เสี่ยงเชื้อราในกล่องดักแด้' : 'แห้งเกิน ควรพ่นน้ำเพิ่ม'}</div></div>
      </div>`;
  };

  const locate = () => {
    box.innerHTML = '<p class="wx-note">กำลังอ่านตำแหน่งจากเครื่องคุณ…</p>';
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
        try { localStorage.setItem('zt-wx', JSON.stringify({ t, h, place, at: Date.now() })); } catch {}
        const b2 = $('#wx-body'); if (b2) show(t, h, place);
      } catch {
        const b2 = $('#wx-body'); if (b2) b2.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span class="wx-note" style="flex:1;min-width:0;margin:0">ดึงข้อมูลอากาศไม่สำเร็จ ลองอีกครั้ง</span>
            <button class="btn small" id="wx-retry">อนุญาตตำแหน่ง</button>
          </div>`;
        const rb = $('#wx-retry'); if (rb) rb.addEventListener('click', locate);
      }
    }, () => {
      const b2 = $('#wx-body');
      if (b2) b2.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="wx-note" style="flex:1;min-width:0;margin:0">ยังไม่ได้อนุญาตให้เข้าถึงตำแหน่ง</span>
          <button class="btn small" id="wx-retry">อนุญาตตำแหน่ง</button>
        </div>`;
      const rb = $('#wx-retry'); if (rb) rb.addEventListener('click', locate);
    }, { timeout: 10000 });
  };

  const cached = (() => { try { return JSON.parse(localStorage.getItem('zt-wx') || 'null'); } catch { return null; } })();
  if (cached && Date.now() - cached.at < 30 * 60 * 1000) { show(cached.t, cached.h, cached.place); return; }
  if (cached) { locate(); return; }

  if (!navigator.geolocation) { box.innerHTML = '<p class="wx-note">อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง</p>'; return; }
  box.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span class="wx-note" style="flex:1;min-width:0;margin:0">ยังไม่ได้อนุญาตให้เข้าถึงตำแหน่ง</span>
      <button class="btn small" id="wx-retry">อนุญาตตำแหน่ง</button>
    </div>`;
  const rb = $('#wx-retry'); if (rb) rb.addEventListener('click', locate);
}

/* ================= ด้วงของฉัน ================= */
async function viewBeetles(view, stageArg) {
  const beetles = (await ZDB.all('beetles')).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  let filter = FILTERS.some(f => f.id === stageArg) ? stageArg : filterForStage(stageArg || 'all');
  let q = '';

  const draw = () => {
    const f = filterOf(filter);
    const list = beetles.filter(b =>
      f.match(b.stage) &&
      (!q || [b.name, b.code, b.species, b.bloodline, b.container].join(' ').toLowerCase().includes(q)));
    const empty = list.length === 0
      ? `<div class="empty"><span class="big">🐞</span>${beetles.length === 0 ? 'ยังไม่มีด้วงในระบบ — <a href="#/add">บันทึกตัวแรกเลย</a>' : 'ไม่พบด้วงตามเงื่อนไข'}</div>`
      : '';
    $('#blist').innerHTML = empty || list.map(beetleRowHTML).join('');
    $('#btable-body').innerHTML = empty || list.map(beetleTableRowHTML).join('');
    bindRowNav($('#blist'));
    bindRowNav($('#btable-body'));
    document.querySelectorAll('.filter-chips .chip').forEach(p => {
      const on = p.dataset.f === filter; p.classList.toggle('on', on); p.setAttribute('aria-pressed', String(on));
    });
  };

  view.innerHTML = `
    <div class="page-head"><h1>ด้วงของฉัน</h1><p class="sub">${beetles.length} รายการ${filter !== 'all' ? ' · ' + esc(filterOf(filter).label) : ''}</p></div>
    <div class="toolbar">
      <input type="search" id="bsearch" placeholder="🔎 ค้นหา ชื่อ / รหัส / สายพันธุ์ / สายเลือด…">
      <a class="btn primary" href="#/add"><i class="ph ph-plus"></i>บันทึกด้วง</a>
    </div>
    <div class="filter-chips chip-row">
      ${FILTERS.map(f => `<button type="button" class="chip" data-f="${f.id}" aria-pressed="false">${esc(f.label)}</button>`).join('')}
    </div>
    <div id="blist" class="mobile-only"></div>
    <div class="beetles-table">
      <div class="bt-row head"><span></span><span>รหัส / ชื่อ</span><span>สายพันธุ์</span><span>ระยะ</span><span>เพศ</span><span>การวัด</span><span>ภาชนะ</span></div>
      <div id="btable-body"></div>
    </div>
    <div class="desktop-only"><a class="btn primary block" href="#/add" style="margin-top:12px"><i class="ph ph-plus"></i>บันทึกด้วงตัวใหม่</a></div>`;

  $('#bsearch').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); draw(); });
  document.querySelectorAll('.filter-chips .chip').forEach(p => {
    p.addEventListener('click', () => { filter = p.dataset.f; draw(); });
  });
  draw();
}

/* ================= รายละเอียดรายตัว ================= */
async function viewDetail(view, id) {
  const b = await ZDB.get('beetles', id);
  if (!b) { view.innerHTML = '<div class="empty">ไม่พบด้วงตัวนี้</div>'; return; }
  const logs = (await ZDB.logsOf(id)).sort((a, c) => c.date.localeCompare(a.date) || (c.createdAt || '').localeCompare(a.createdAt || ''));
  const stIdx = STAGES.findIndex(s => s.id === b.stage);
  const nextSt = STAGES[stIdx + 1];

  view.innerHTML = `
    <div class="page-head"><h1>${esc(beetleTitle(b))}</h1><p class="sub">${esc(beetleSub(b))}</p></div>
    <div class="detail-body">
      <div class="detail-head">
        <div class="photo">${thumbInner(b)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          ${stagePill(b.stage)}
          <span class="pill outline-amber"><i class="${sexIcon(b.sex)}"></i> ${esc(sexLabel(b.sex))}</span>
          ${b.source ? `<span style="font-size:.78rem;color:var(--muted-2)">· ${esc(b.source)}</span>` : ''}
        </div>
      </div>

      <div>
        <div class="stat-tiles">
          <div class="tile"><small>${b.stage === 'adult' ? 'น้ำหนัก' : 'น้ำหนักล่าสุด'}</small><b>${b.weight ? b.weight + ' g' : '-'}</b></div>
          <div class="tile"><small>ขนาดลำตัว</small><b>${b.size ? b.size + ' mm' : '-'}</b></div>
          <div class="tile"><small>สายเลือด</small><b>${esc(b.bloodline || '-')}</b></div>
          <div class="tile"><small>ภาชนะ</small><b>${esc(b.container || '-')}</b></div>
        </div>
        ${b.code ? `<p class="wx-note">รหัส: ${esc(b.code)} · ได้มา ${fmtDate(b.acquiredDate)}</p>` : `<p class="wx-note">ได้มา ${fmtDate(b.acquiredDate)}</p>`}
        ${b.notes ? `<div class="card"><h2>📝 โน้ต</h2><p style="margin:0;white-space:pre-wrap;font-size:.85rem">${esc(b.notes)}</p></div>` : ''}

        <div class="quick-actions">
          <button class="btn primary" id="qa-weigh"><i class="ph ph-scales"></i>ชั่งน้ำหนัก</button>
          <button class="btn" id="qa-sub"><i class="ph ph-bowl-food"></i>เปลี่ยนดิน</button>
          <button class="btn" id="qa-jelly"><i class="ph ph-drop"></i>เยลลี่</button>
          ${nextSt ? `<button class="btn" id="qa-stage"><i class="ph ph-butterfly"></i>เลื่อนเป็น ${esc(nextSt.label)}</button>` : ''}
          <button class="btn" id="qa-note"><i class="ph ph-note-pencil"></i>เพิ่มโน้ต</button>
        </div>

        <div style="margin-bottom:9px;font-size:.85rem;color:var(--text-3)">🕘 ไทม์ไลน์การเลี้ยง</div>
        ${logs.length === 0 ? '<p class="wx-note">ยังไม่มีบันทึก</p>' : `<ul class="tl">
          ${logs.map(l => {
            const m = LOG_META[l.type] || LOG_META.note;
            let body = m.label;
            if (l.type === 'stage') body = `เปลี่ยนระยะเป็น <b>${esc(stageOf(l.value).label)}</b>`;
            else if (l.type === 'weigh' && l.value) body = `ชั่งน้ำหนักได้ <b>${l.value} g</b>`;
            else if (l.type === 'size' && l.value) body = `วัดขนาดได้ <b>${l.value} mm</b>`;
            return `<li>
              <i class="tl-ic ${m.ic}"></i>
              <div class="tl-mid"><div class="tl-body">${body}</div>${l.note ? `<div class="tl-note">${esc(l.note)}</div>` : ''}</div>
              <div class="tl-date">${fmtDate(l.date)}</div>
            </li>`;
          }).join('')}
        </ul>`}

        <div class="quick-actions" style="margin-top:16px">
          <a class="btn" href="#/edit/${b.id}"><i class="ph ph-pencil-simple"></i>แก้ไขข้อมูล</a>
          <button class="btn danger" id="qa-del"><i class="ph ph-trash"></i>ลบด้วงตัวนี้</button>
        </div>
      </div>
    </div>`;

  const refresh = () => viewDetail(view, id);
  $('#qa-weigh').addEventListener('click', async () => {
    const w = await inputModal({
      title: 'ชั่งน้ำหนัก', label: weightLabelFor(b.stage), type: 'number',
      value: b.weight || '', placeholder: weightHintFor(b.stage), min: 0,
    });
    if (w === null) return;
    const val = parseFloat(w);
    await addLog(id, 'weigh', isNaN(val) ? null : val, '');
    if (!isNaN(val)) { b.weight = val; b.updatedAt = new Date().toISOString(); await ZDB.put('beetles', b); }
    toast('บันทึกน้ำหนักแล้ว ✓'); refresh();
  });
  $('#qa-sub').addEventListener('click', async () => { await addLog(id, 'substrate'); toast('บันทึกเปลี่ยนดินแล้ว ✓'); refresh(); });
  $('#qa-jelly').addEventListener('click', async () => { await addLog(id, 'jelly'); toast('บันทึกเยลลี่แล้ว ✓'); refresh(); });
  $('#qa-note').addEventListener('click', async () => {
    const n = await inputModal({ title: 'เพิ่มโน้ต', label: 'โน้ต', type: 'textarea', placeholder: 'เช่น เขาสมมาตร กินเยลลี่ดี' });
    if (!n) return;
    await addLog(id, 'note', null, n); toast('บันทึกโน้ตแล้ว ✓'); refresh();
  });
  const qs = $('#qa-stage');
  if (qs) qs.addEventListener('click', async () => {
    const ok = await confirmModal({
      title: `เลื่อนระยะเป็น "${nextSt.label}"?`,
      message: `${beetleTitle(b)} จะเปลี่ยนจาก ${stageOf(b.stage).label} เป็น ${nextSt.label}`,
      confirmLabel: 'ยืนยันเลื่อนระยะ',
    });
    if (!ok) return;
    b.stage = nextSt.id; b.updatedAt = new Date().toISOString();
    await ZDB.put('beetles', b);
    await addLog(id, 'stage', nextSt.id, '');
    toast(`เลื่อนระยะเป็น ${nextSt.label} แล้ว 🎉`); refresh();
  });
  $('#qa-del').addEventListener('click', async () => {
    const ok = await confirmModal({
      title: 'ลบด้วงตัวนี้?',
      message: `การลบย้อนกลับไม่ได้ ระบบจะลบ "${beetleTitle(b)}" และประวัติทั้งหมด ${logs.length} รายการ`,
      name: beetleTitle(b), sub: beetleSub(b), photo: thumbInner(b),
      danger: true, confirmLabel: 'ลบด้วงตัวนี้',
    });
    if (!ok) return;
    const snapshotLogs = await ZDB.logsOf(id);
    await ZDB.delLogsOf(id);
    await ZDB.del('beetles', id);
    location.hash = '#/beetles';
    toastAction('ลบแล้ว', 'เลิกทำ', async () => {
      await ZDB.put('beetles', b);
      for (const l of snapshotLogs) await ZDB.put('logs', l);
      toast('กู้คืนแล้ว ✓');
      location.hash = '#/beetle/' + id;
    });
  });
}

/* ================= ฟอร์มบันทึก/แก้ไข ================= */
async function viewForm(view, id) {
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

  let showMore = !!(editing || b.weight || b.size || b.container || b.bloodline || b.notes || b.source);
  let stageGroup = groupOfStage(stage).id;

  const groupLabel = tx => `<div class="group-label"><span class="rule"></span><span>${tx}</span></div>`;
  const sexChip = v => `<button type="button" class="chip" data-sex="${v}" aria-pressed="false"><i class="${sexIcon(v)}"></i>${esc(sexLabel(v))}</button>`;
  const stageChip = s => `<button type="button" class="chip" data-stage="${s.id}" aria-pressed="false">${esc(s.label)}</button>`;
  const stageGroupChip = g => `<button type="button" class="chip" data-group="${g.id}" aria-pressed="false">${esc(g.label)}</button>`;
  const originChip = o => `<button type="button" class="chip" data-origin="${esc(o)}" aria-pressed="false">${esc(o)}</button>`;
  const moreLabel = () => showMore ? 'ซ่อนรายละเอียดเพิ่มเติม' : 'เพิ่มรายละเอียด (ขนาด • สายเลือด • ที่มา)';

  view.innerHTML = `
    <div class="page-head"><h1>${editing ? '✏️ แก้ไขข้อมูลด้วง' : 'บันทึกด้วงตัวใหม่'}</h1><p class="sub">กรอกเท่าที่รู้ แก้เพิ่มภายหลังได้</p></div>
    <form id="bform" class="form-grid" novalidate>
      <div>
        <div class="photo-pick" style="margin-bottom:14px">
          <div class="prev" id="photo-prev">${photo ? `<img src="${photo}" alt="">` : '<i class="ph ph-camera" style="font-size:1.6rem"></i>'}</div>
          <div class="prev-actions">
            <label for="f-photo" class="btn small">เลือกรูป / ถ่ายภาพ</label>
            <input type="file" id="f-photo" accept="image/*" style="display:none">
            ${photo ? '<button type="button" class="btn small" id="photo-del">ลบรูป</button>' : ''}
          </div>
        </div>

        <div class="form-group">
          ${groupLabel('ข้อมูลตัวสัตว์')}
          <div class="field"><label for="f-code">รหัส / ชื่อเรียก</label><input id="f-code" value="${esc(b.code)}" placeholder="เช่น GID-015"></div>
          <div class="field">
            <label for="f-species">สายพันธุ์</label>
            <input id="f-species" list="species-dl" value="${esc(b.species)}" placeholder="เช่น Dynastes hercules">
            <datalist id="species-dl">${SPECIES_LIST.map(s => `<option value="${esc(s)}">`).join('')}</datalist>
          </div>
          <div class="field"><label>เพศ</label><div class="chip-row" id="sex-picker">${['male', 'female', 'unknown'].map(sexChip).join('')}</div></div>
          <div class="field">
            <label>ระยะการเจริญเติบโต</label>
            <div class="chip-row" id="stage-group-picker">${STAGE_GROUPS.map(stageGroupChip).join('')}</div>
            <div class="chip-row" id="stage-sub-picker" style="margin-top:7px"></div>
          </div>
          <button type="button" class="btn small" id="toggle-more">${moreLabel()}</button>
        </div>

        <div class="group-divider adv-block" ${showMore ? '' : 'hidden'}></div>

        <div class="form-group adv-block" ${showMore ? '' : 'hidden'}>
          ${groupLabel('การวัด')}
          <div class="frow-2">
            <div class="field"><label for="f-weight" id="f-weight-label">${weightLabelFor(stage)}</label><input id="f-weight" type="number" step="0.1" min="0" inputmode="decimal" value="${b.weight ?? ''}" placeholder="${weightHintFor(stage)}"></div>
            <div class="field"><label for="f-size">ขนาดลำตัว (mm)</label><input id="f-size" type="number" step="0.1" min="0" inputmode="decimal" value="${b.size ?? ''}" placeholder="72"></div>
          </div>
        </div>
      </div>

      <div>
        <div class="field adv-block" style="margin-bottom:14px" ${showMore ? '' : 'hidden'}><label for="f-container">ภาชนะ / กล่องเลี้ยง</label><input id="f-container" value="${esc(b.container)}" placeholder="กล่อง 4.5 ลิตร · ชั้น B-02"></div>

        <div class="form-group adv-block" ${showMore ? '' : 'hidden'}>
          ${groupLabel('ที่มา')}
          <div class="field"><label>ได้มาจาก</label><div class="chip-row" id="origin-picker">${ORIGIN_LIST.map(originChip).join('')}</div></div>
          <div class="frow-2">
            <div class="field"><label for="f-date">วันที่ได้มา</label><input id="f-date" type="date" value="${esc(b.acquiredDate || todayISO())}"></div>
            <div class="field"><label for="f-blood">สายเลือด (Line)</label><input id="f-blood" value="${esc(b.bloodline)}" placeholder="TH-Kanchanaburi F2"></div>
          </div>
          <div class="field"><label for="f-notes">บันทึกเพิ่มเติม</label><textarea id="f-notes" placeholder="เขาสมมาตร กินเยลลี่ดี">${esc(b.notes)}</textarea></div>
        </div>

        <div style="display:flex;gap:10px">
          <button type="submit" class="btn primary" style="flex:1">บันทึกเข้าคอลเลกชัน</button>
          ${editing ? `<a class="btn" href="#/beetle/${editing.id}">ยกเลิก</a>` : ''}
        </div>
        ${!editing ? '<div style="font-size:.75rem;color:var(--muted-2);text-align:center;margin-top:8px">บันทึกแล้วจะเพิ่มรายการใหม่ใน My Beetles ทันที</div>' : ''}
      </div>
    </form>`;

  const drawSex = () => view.querySelectorAll('#sex-picker .chip').forEach(x => {
    const on = x.dataset.sex === sex; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on));
  });
  const drawStageGroup = () => view.querySelectorAll('#stage-group-picker .chip').forEach(x => {
    const on = x.dataset.group === stageGroup; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on));
  });
  const syncWeightField = () => {
    $('#f-weight-label').textContent = weightLabelFor(stage);
    $('#f-weight').placeholder = weightHintFor(stage);
  };
  const drawStageSub = () => {
    const g = STAGE_GROUPS.find(x => x.id === stageGroup);
    const sub = $('#stage-sub-picker');
    if (g.stages.length <= 1) { sub.innerHTML = ''; return; }
    sub.innerHTML = g.stages.map(sid => stageChip(stageOf(sid))).join('');
    sub.querySelectorAll('.chip').forEach(x => {
      const on = x.dataset.stage === stage; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on));
      x.addEventListener('click', () => { stage = x.dataset.stage; drawStageSub(); syncWeightField(); });
    });
  };
  const drawOrigin = () => view.querySelectorAll('#origin-picker .chip').forEach(x => {
    const on = x.dataset.origin === origin; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on));
  });
  drawSex(); drawStageGroup(); drawStageSub(); drawOrigin();

  view.querySelectorAll('#sex-picker .chip').forEach(x => x.addEventListener('click', () => { sex = x.dataset.sex; drawSex(); }));
  view.querySelectorAll('#stage-group-picker .chip').forEach(x => x.addEventListener('click', () => {
    stageGroup = x.dataset.group; drawStageGroup();
    const g = STAGE_GROUPS.find(gg => gg.id === stageGroup);
    stage = g.stages.includes(stage) ? stage : g.stages[0];
    drawStageSub(); syncWeightField();
  }));
  view.querySelectorAll('#origin-picker .chip').forEach(x => x.addEventListener('click', () => { origin = x.dataset.origin; drawOrigin(); }));
  $('#toggle-more').addEventListener('click', () => {
    showMore = !showMore;
    view.querySelectorAll('.adv-block').forEach(el => { el.hidden = !showMore; });
    $('#toggle-more').textContent = moreLabel();
  });

  $('#f-photo').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      const max = 640, sc = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      photo = cv.toDataURL('image/jpeg', 0.82);
      $('#photo-prev').innerHTML = `<img src="${photo}" alt="">`;
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
  });
  const pd = $('#photo-del');
  if (pd) pd.addEventListener('click', () => { photo = null; $('#photo-prev').innerHTML = '<i class="ph ph-camera" style="font-size:1.6rem"></i>'; });

  $('#bform').addEventListener('submit', async e => {
    e.preventDefault();
    const val = sel => $(sel).value.trim();
    const num = sel => { const v = parseFloat($(sel).value); return isNaN(v) ? null : v; };
    const rec = {
      id: editing ? editing.id : ZDB.uid(),
      code: val('#f-code'), name: editing ? editing.name : '', species: val('#f-species'),
      sex, stage,
      weight: num('#f-weight'), size: num('#f-size'),
      container: val('#f-container'), source: origin,
      bloodline: val('#f-blood'), acquiredDate: $('#f-date').value || todayISO(),
      notes: val('#f-notes'), photo,
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
    toast(editing ? 'บันทึกการแก้ไขแล้ว ✓' : 'เพิ่มเข้าคอลเลกชันแล้ว 🎉');
    location.hash = '#/beetle/' + rec.id;
  });
}

/* ================= Beetle World ================= */
async function viewWorld(view) {
  const beetles = await ZDB.all('beetles');
  const larvae = beetles.filter(b => ['l1', 'l2', 'l3'].includes(b.stage) && b.weight)
    .sort((a, b) => b.weight - a.weight).slice(0, 5);
  const adults = beetles.filter(b => b.stage === 'adult' && b.size)
    .sort((a, b) => b.size - a.size).slice(0, 5);

  let tab = 'news';
  let auctionOpenId = null;
  let auctionFormOpen = false;

  const WORLD_TABS = [
    { id: 'news', label: 'ข่าวสาร' },
    { id: 'board', label: 'สถิติแข่ง' },
    { id: 'auction', label: 'ตลาดประมูล' },
  ];

  const rankRow = (b, i, valFn) => `
    <tr>
      <td><span class="rank-pos ${i === 0 ? 'gold' : i < 3 ? 'silver' : ''}">${i + 1}</span></td>
      <td><b>${esc(b.name || b.code || '-')}</b></td>
      <td style="color:var(--muted)">${esc(speciesShort(b.species) || '-')}</td>
      <td class="num">${valFn(b)}</td>
    </tr>`;
  const rankTable = (rows, valFn, unit, emptyMsg, best) => `
    ${best ? `<div class="trophy-band"><i class="ph-fill ph-trophy"></i><div><div class="tt">${best}</div><div class="tu">${unit}</div></div></div>` : ''}
    ${rows.length === 0
      ? `<p class="wx-note">${emptyMsg}</p>`
      : `<table class="rank-table">
          <thead><tr><th>อันดับ</th><th>ด้วง</th><th>สายพันธุ์</th><th style="text-align:right">ค่า</th></tr></thead>
          <tbody>${rows.map((b, i) => rankRow(b, i, valFn)).join('')}</tbody>
        </table>`}`;

  const renderNews = () => `
    <div class="narrow-page">
    <div class="notice"><i class="ph ph-wrench"></i> ระบบชุมชนออนไลน์จริงคือเฟส 2 — ด้านล่างเป็นตัวอย่างหน้าตา</div>
    <div class="feed-post">
      <div class="fp-head"><span class="avatar">CH</span><div class="fp-who"><b>Champ CH</b><small>@champbeetle · 2 ชม.</small></div><span class="fp-tag">เทคนิค</span></div>
      <div class="fp-body"><div class="title">กว่างห้าเขา L3 แตะ 42 g แล้ว</div>
        <p>อัดดินก้นกล่องให้แน่น 1/3 แล้วโรยหลวมด้านบน ช่วยให้สร้างโพรงดักแด้สวย</p>
        <div class="fp-actions"><span data-like="1"><i class="ph ph-heart"></i><span class="cnt">24</span></span><span><i class="ph ph-chat-circle"></i>6</span><span><i class="ph ph-share-network"></i>แชร์</span></div></div>
    </div>
    <div class="feed-post">
      <div class="fp-head"><span class="avatar">BZ</span><div class="fp-who"><b>Benz Exotic</b><small>@benzbeetle · เมื่อวาน</small></div><span class="fp-tag">ข่าวชุมชน</span></div>
      <div class="fp-body"><div class="title">ประกาศรับสมัครแข่ง Beetle Weight Cup รอบกันยายน</div>
        <p>เฮอร์คิวลิสตัวผู้ 168mm ออกจากดักแด้แล้ว สายเลือด PO×TY อาหารสูตรโปรตีนสูงเห็นผลชัด 🔥</p>
        <div class="fp-actions"><span data-like="2"><i class="ph ph-heart"></i><span class="cnt">41</span></span><span><i class="ph ph-chat-circle"></i>12</span><span><i class="ph ph-share-network"></i>แชร์</span></div></div>
    </div>
    <div class="feed-post">
      <div class="fp-head"><span class="avatar">NF</span><div class="fp-who"><b>Note Beetle Farm</b><small>@notefarm · 3 วันก่อน</small></div><span class="fp-tag">แชร์คอลเลกชัน</span></div>
      <div class="fp-body"><div class="title">วิธีลดเชื้อราในกล่องดักแด้ช่วงหน้าฝน</div>
        <p>ใครเลี้ยงคีมยีราฟหน้าฝนต้องระวังไรดิน แนะนำตากดินใหม่ก่อนใช้ 2–3 วัน</p>
        <div class="fp-actions"><span data-like="3"><i class="ph ph-heart"></i><span class="cnt">17</span></span><span><i class="ph ph-chat-circle"></i>4</span><span><i class="ph ph-share-network"></i>แชร์</span></div></div>
    </div>
    <button class="btn block" id="join-contest" style="margin-top:6px"><i class="ph ph-upload-simple"></i>ส่งผลเข้าแข่ง</button>
    </div>`;

  const renderBoard = () => `
    <div class="grid-2">
      <div class="card">
        <h2 style="color:var(--text-3)">หนอนน้ำหนักดีที่สุดของฉัน</h2>
        ${rankTable(larvae, b => b.weight + ' g', 'น้ำหนักหนอน L3 · สายกว่าง', 'ยังไม่มีหนอนที่บันทึกน้ำหนัก — ชั่งแล้วบันทึกเพื่อไต่อันดับ',
          larvae[0] ? `หนักที่สุด ${larvae[0].weight} g` : null)}
      </div>
      <div class="card">
        <h2 style="color:var(--text-3)">ตัวเต็มวัยใหญ่ที่สุดของฉัน</h2>
        ${rankTable(adults, b => b.size + ' mm', 'ความยาวรวมเขา · สายกว่าง', 'ยังไม่มีตัวเต็มวัยที่บันทึกขนาด',
          adults[0] ? `ใหญ่ที่สุด ${adults[0].size} mm` : null)}
      </div>
    </div>`;

  const auctionCard = a => {
    const remain = a.endsAt - Date.now();
    const closed = remain <= 0;
    return `
    <div class="auction-card" data-id="${a.id}" role="button" tabindex="0">
      <div class="thumb"><i class="ph-fill ph-bug"></i></div>
      <div class="row top"><div class="title">${esc(a.title)}</div>
        <span class="auction-countdown ${closed ? 'closed' : remain < 3600000 ? 'urgent' : ''}"><i class="ph ph-timer"></i>${countdownText(remain)}</span></div>
      <div class="wx-note" style="margin:0">ผู้ขาย ${esc(a.seller)}</div>
      <div class="row bottom">
        <div><div class="lbl">ราคาปัจจุบัน</div><div class="bid num">฿${money(a.bid)}</div><div class="wx-note" style="margin:0">${a.bids} ครั้ง · ผู้นำ ${esc(a.top)}</div></div>
        <span style="flex:1"></span>
        ${closed ? '<span class="wx-note" style="margin:0">ปิดประมูลแล้ว</span>' : `<button class="btn gold" data-bid="${a.id}"><i class="ph ph-gavel"></i>บิด ฿${money(a.bid + a.step)}</button>`}
      </div>
    </div>`;
  };

  const auctionDetail = a => {
    const remain = a.endsAt - Date.now();
    const closed = remain <= 0;
    return `
    <div class="card">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <button type="button" class="btn small" id="auction-back"><i class="ph ph-arrow-left"></i></button>
        <span style="flex:1;font-size:.82rem;color:var(--muted)">กลับตลาดประมูล</span>
        <span class="auction-countdown ${closed ? 'closed' : remain < 3600000 ? 'urgent' : ''}"><i class="ph ph-timer"></i>${countdownText(remain)}</span>
      </div>
      <div class="thumb-lg"><i class="ph-fill ph-bug"></i></div>
      <div style="margin:12px 0"><div style="font-size:1rem">${esc(a.title)}</div><div class="wx-note" style="margin:0">ผู้ขาย ${esc(a.seller)}</div></div>
      <div style="display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:14px">
        <div><div class="lbl">ราคาปัจจุบัน</div><div class="bid num" style="font-size:1.4rem">฿${money(a.bid)}</div><div class="wx-note" style="margin:0">บิดขั้นต่ำ ฿${money(a.step)} · ${a.bids} ครั้ง · ผู้นำ ${esc(a.top)}</div></div>
        <span style="flex:1"></span>
        ${closed ? '<span class="wx-note" style="margin:0">ปิดประมูลแล้ว</span>' : `<button type="button" class="btn gold" id="auction-bid"><i class="ph ph-gavel"></i>บิด ฿${money(a.bid + a.step)}</button>`}
      </div>
      <div class="group-label"><span class="rule gold"></span><span>ใครประมูลอยู่บ้าง</span></div>
      <div class="card" style="padding:0;margin-top:10px">
        ${a.history.map(h => `
          <div class="bid-history-row ${h.me ? 'me' : ''}">
            <span class="avatar">${esc(h.name.charAt(0))}</span>
            <div class="mid"><div style="font-size:.85rem">${esc(h.name)}</div><div class="wx-note" style="margin:0">${esc(h.time)}</div></div>
            ${h.name === a.top ? '<span class="pill outline-amber">ผู้นำ</span>' : ''}
            <span class="num" style="min-width:64px;text-align:right;color:var(--green-700)">฿${money(h.amount)}</span>
          </div>`).join('')}
      </div>
    </div>`;
  };

  const renderAuction = () => {
    if (auctionOpenId) {
      const a = AUCTIONS.find(x => x.id === auctionOpenId);
      if (a) return auctionDetail(a);
      auctionOpenId = null;
    }
    return `
      ${auctionFormOpen ? `
      <div class="card">
        <div style="font-size:.9rem;margin-bottom:10px">ลงสินค้าประมูล</div>
        <div class="field" style="margin-bottom:10px"><label>ชื่อสินค้า</label><input id="a-title" placeholder="เช่น กว่างห้าเขาตัวผู้ 84 mm"></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px">
          <div class="field"><label>ราคาเริ่มต้น (฿)</label><input id="a-start" placeholder="2000"></div>
          <div class="field"><label>บิดขั้นต่ำ (฿)</label><input id="a-step" placeholder="100"></div>
          <div class="field"><label>ระยะเวลา (ชม.)</label><input id="a-hours" placeholder="24"></div>
        </div>
        <div style="display:flex;gap:8px">
          <button type="button" class="btn primary" id="a-submit">เริ่มประมูล</button>
          <button type="button" class="btn" id="a-cancel">ยกเลิก</button>
        </div>
      </div>` : `<button type="button" class="btn primary block" id="a-open-form"><i class="ph ph-plus"></i>ลงสินค้าประมูล</button>`}
      <div class="auction-grid" style="margin-top:12px">${AUCTIONS.map(auctionCard).join('')}</div>`;
  };

  const bid = id => {
    const a = AUCTIONS.find(x => x.id === id);
    if (!a || a.endsAt <= Date.now()) return;
    a.bid += a.step; a.bids += 1; a.top = 'คุณ';
    a.history = [{ name: 'คุณ', amount: a.bid, time: 'เมื่อสักครู่', me: true }].concat(a.history);
    toast('บิดแล้ว รอผู้อื่นสู้ราคา');
    drawBody();
  };

  const bindNewsEvents = () => {
    view.querySelectorAll('[data-like]').forEach(el => {
      const icon = el.querySelector('i');
      const cnt = el.querySelector('.cnt');
      const base = parseInt(cnt.textContent, 10);
      el.addEventListener('click', () => {
        const on = el.classList.toggle('liked');
        icon.className = on ? 'ph-fill ph-heart' : 'ph ph-heart';
        cnt.textContent = base + (on ? 1 : 0);
      });
    });
    const jc = $('#join-contest');
    if (jc) jc.addEventListener('click', () => { jc.disabled = true; jc.innerHTML = '<i class="ph ph-check-circle"></i>ส่งผลเข้าแข่งแล้ว'; });
  };

  const bindAuctionEvents = () => {
    view.querySelectorAll('.auction-card').forEach(el => el.addEventListener('click', e => {
      if (e.target.closest('[data-bid]')) return;
      auctionOpenId = el.dataset.id; drawBody();
    }));
    view.querySelectorAll('[data-bid]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); bid(btn.dataset.bid); }));
    const back = $('#auction-back'); if (back) back.addEventListener('click', () => { auctionOpenId = null; drawBody(); });
    const bidBtn = $('#auction-bid'); if (bidBtn) bidBtn.addEventListener('click', () => bid(auctionOpenId));
    const openForm = $('#a-open-form'); if (openForm) openForm.addEventListener('click', () => { auctionFormOpen = true; drawBody(); });
    const cancel = $('#a-cancel'); if (cancel) cancel.addEventListener('click', () => { auctionFormOpen = false; drawBody(); });
    const submit = $('#a-submit'); if (submit) submit.addEventListener('click', () => {
      const title = $('#a-title').value.trim(), start = $('#a-start').value.trim();
      if (!title || !start) { toast('กรอกชื่อสินค้าและราคาเริ่มต้น'); return; }
      const hours = Number($('#a-hours').value) || 24;
      AUCTIONS = [{
        id: 'a' + Date.now(), title, seller: 'คุณ',
        bid: Number(start), step: Number($('#a-step').value) || 50, bids: 0, top: 'ยังไม่มีผู้บิด',
        endsAt: Date.now() + hours * 3600000, history: [],
      }].concat(AUCTIONS);
      auctionFormOpen = false;
      toast('ลงสินค้าประมูลแล้ว');
      drawBody();
    });
  };

  const drawTabs = () => view.querySelectorAll('#world-tabs .chip').forEach(c => {
    const on = c.dataset.tab === tab; c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on));
  });

  const drawBody = () => {
    $('#world-body').innerHTML = tab === 'news' ? renderNews() : tab === 'board' ? renderBoard() : renderAuction();
    if (tab === 'news') bindNewsEvents();
    if (tab === 'auction') bindAuctionEvents();
  };

  const startTicker = () => {
    if (worldTimer) clearInterval(worldTimer);
    worldTimer = setInterval(() => { if (tab === 'auction' && !auctionFormOpen) drawBody(); }, 1000);
  };
  const stopTicker = () => { if (worldTimer) { clearInterval(worldTimer); worldTimer = null; } };

  view.innerHTML = `
    <div class="page-head"><h1>Beetle World</h1>
      <p class="sub">ข่าวสารจากผู้เลี้ยง และสถิติที่ลงแข่งกัน</p></div>
    <div class="chip-row" id="world-tabs" style="margin-bottom:14px">
      ${WORLD_TABS.map(t => `<button type="button" class="chip" data-tab="${t.id}" aria-pressed="false">${t.label}</button>`).join('')}
    </div>
    <div id="world-body"></div>`;

  drawTabs();
  view.querySelectorAll('#world-tabs .chip').forEach(c => c.addEventListener('click', () => {
    tab = c.dataset.tab; auctionOpenId = null; auctionFormOpen = false;
    drawTabs(); drawBody();
    if (tab === 'auction') startTicker(); else stopTicker();
  }));

  drawBody();
  if (tab === 'auction') startTicker();
}

/* ================= ร้านค้า ================= */
async function viewShop(view) {
  let cat = 'all';
  let cartCustomer = '';

  const cartCount = () => cart.reduce((a, i) => a + i.qty, 0);
  const updateCartBadge = () => {
    const b = $('#cart-badge');
    if (b) { b.textContent = cartCount(); b.hidden = cartCount() === 0; }
  };

  const draw = () => {
    const groups = (cat === 'all' ? SHOP_CATS.slice(1) : SHOP_CATS.filter(c => c.key === cat))
      .map(c => ({ label: c.label, items: PRODUCTS.filter(p => p.category === c.key) }))
      .filter(g => g.items.length);

    view.querySelectorAll('#shop-cats .chip').forEach(c => {
      const on = c.dataset.cat === cat; c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on));
    });

    $('#shop-body').innerHTML = `
      ${shopRole === 'admin' ? `
      <div class="statband" style="grid-template-columns:repeat(3,1fr)">
        <div class="cell"><i class="ic ph ph-tag"></i><div class="txt"><div class="n">${PRODUCTS.length}</div><div class="l">สินค้าในระบบ</div></div></div>
        <div class="cell"><i class="ic ph ph-warning"></i><div class="txt"><div class="n">${PRODUCTS.filter(p => p.stock === 0).length}</div><div class="l">ของหมด</div></div></div>
        <div class="cell"><i class="ic ph ph-coins"></i><div class="txt"><div class="n num">฿${money(ORDERS.reduce((a, o) => a + o.total, 0))}</div><div class="l">ยอดขายรวม</div></div></div>
      </div>
      <button type="button" class="btn primary block" id="shop-add" style="margin-top:12px"><i class="ph ph-plus"></i>เพิ่มสินค้าใหม่</button>` : ''}

      ${groups.length === 0 ? '<div class="empty"><span class="big">🛍️</span>ยังไม่มีสินค้าในหมวดนี้</div>' : groups.map(g => `
        <div style="margin-top:16px">
          <div class="shop-group-label"><span class="rule"></span><span>${esc(g.label)}</span></div>
          <div class="product-grid">
            ${g.items.map(p => `
              <div class="product-card" data-id="${p.id}" role="button" tabindex="0">
                <div class="thumb"><i class="ph-fill ph-bug"></i></div>
                <div class="name">${esc(p.name)}</div>
                <div class="row"><span class="price num">฿${money(p.price)}</span><span class="pill ${stockBadge(p.stock)}">${stockText(p.stock)}</span></div>
              </div>`).join('')}
          </div>
        </div>`).join('')}

      ${shopRole === 'admin' ? `
      <div class="list-head" style="margin-top:18px"><h2>ออเดอร์ล่าสุด</h2></div>
      <div class="card" style="padding:0">
        ${ORDERS.length === 0 ? '<p class="wx-note" style="padding:14px;margin:0">ยังไม่มีออเดอร์</p>' : ORDERS.map(o => `
          <div class="order-row">
            <span class="avatar">${esc(o.initial)}</span>
            <div class="mid"><b>${esc(o.customer)}</b><small>${esc(o.items.map(i => i.name + ' ×' + i.qty).join(', '))}</small></div>
            <div class="amt"><span class="num">฿${money(o.total)}</span><span class="pill outline-amber">${esc(o.state)}</span></div>
          </div>`).join('')}
      </div>` : ''}`;

    view.querySelectorAll('.product-card').forEach(el => el.addEventListener('click', () => openProduct(el.dataset.id)));
    const addBtn = $('#shop-add');
    if (addBtn) addBtn.addEventListener('click', openAddProduct);
  };

  const bindProduct = (modal, p) => {
    modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
    const ad = modal.querySelector('#m-apply-delta');
    if (ad) ad.addEventListener('click', () => {
      const d = parseInt($('#m-delta').value, 10);
      if (!d) { toast('ใส่จำนวนที่ต้องการเพิ่มหรือลด'); return; }
      p.stock = Math.max(0, p.stock + d);
      toast(d > 0 ? `เพิ่มสต็อก ${d} แล้ว` : `ลดสต็อก ${Math.abs(d)} แล้ว`);
      closeModal(); draw();
    });
    const ae = modal.querySelector('#m-apply-edit');
    if (ae) ae.addEventListener('click', () => {
      const name = $('#m-edit-name').value.trim(), price = $('#m-edit-price').value.trim();
      if (!name && !price) { toast('กรอกชื่อหรือราคาที่ต้องการแก้'); return; }
      if (name) p.name = name;
      if (price) p.price = Number(price) || p.price;
      toast('บันทึกการแก้ไขแล้ว');
      closeModal(); draw();
    });
    const ac = modal.querySelector('#m-add-cart');
    if (ac) ac.addEventListener('click', () => {
      const q = parseInt($('#m-qty').value, 10);
      if (!q || q < 1) { toast('กรุณาใส่จำนวนให้ถูกต้อง'); return; }
      if (q > p.stock) { toast(`สต็อกเหลือ ${p.stock} เท่านั้น`); return; }
      const hit = cart.find(i => i.id === p.id);
      if (hit) hit.qty += q; else cart.push({ id: p.id, name: p.name, price: p.price, qty: q });
      toast(`เพิ่ม ${p.name} × ${q} ในตะกร้า`);
      updateCartBadge();
      closeModal();
    });
  };

  const openProduct = id => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    const catLabel = (SHOP_CATS.find(c => c.key === p.category) || {}).label || p.category;
    const body = `
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="flex:1;min-width:0"><div style="font-size:.95rem">${esc(p.name)}</div><div class="wx-note" style="margin:0">${esc(catLabel)}</div></div>
        <button type="button" class="btn small" data-close><i class="ph ph-x"></i></button>
      </div>
      <div style="display:flex;align-items:baseline;gap:10px;margin:12px 0">
        <span class="num" style="font-size:1.4rem;color:var(--green-700)">฿${money(p.price)}</span>
        <span style="flex:1"></span>
        <span class="pill ${stockBadge(p.stock)}">คงเหลือ ${p.stock}</span>
      </div>
      ${shopRole === 'admin' ? `
      <div class="group-divider"></div>
      <div class="group-label"><span class="rule"></span><span>แก้ไขสต็อก</span></div>
      <div style="display:flex;gap:8px;align-items:flex-end;margin:10px 0">
        <div class="field" style="flex:1"><label>จำนวน (+ เพิ่ม / − ลด)</label><input id="m-delta" placeholder="เช่น 5 หรือ -3"></div>
        <button type="button" class="btn primary" id="m-apply-delta">ยืนยัน</button>
      </div>
      <div class="group-divider"></div>
      <div class="group-label"><span class="rule"></span><span>แก้ไขข้อมูลสินค้า</span></div>
      <div class="field" style="margin:10px 0"><label>ชื่อสินค้าใหม่</label><input id="m-edit-name" placeholder="เว้นว่างถ้าไม่แก้"></div>
      <div class="field" style="margin-bottom:10px"><label>ราคาใหม่ (฿)</label><input id="m-edit-price" placeholder="เว้นว่างถ้าไม่แก้"></div>
      <button type="button" class="btn block" id="m-apply-edit">บันทึกการแก้ไข</button>
      <div class="group-divider"></div>` : ''}
      <div class="group-label"><span class="rule gold"></span><span>เตรียมออเดอร์</span></div>
      ${p.stock > 0 ? `
      <div style="display:flex;gap:8px;align-items:flex-end;margin-top:10px">
        <div class="field" style="flex:1"><label>จำนวนที่ต้องการ</label><input id="m-qty" placeholder="1"></div>
        <button type="button" class="btn" id="m-add-cart" style="background:var(--gold);border-color:var(--gold);color:var(--ink)"><i class="ph ph-basket"></i>เพิ่มเข้าตะกร้า</button>
      </div>` : `<p style="color:var(--danger);font-size:.82rem;margin-top:8px">สินค้าหมด ยังสั่งไม่ได้</p>`}`;

    const modal = openModal(body);
    bindProduct(modal, p);
  };

  const openAddProduct = () => {
    const body = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span style="flex:1;font-size:.95rem">เพิ่มสินค้าใหม่</span>
        <button type="button" class="btn small" data-close><i class="ph ph-x"></i></button>
      </div>
      <div class="field" style="margin-bottom:12px"><label>ชื่อสินค้า</label><input id="m-new-name" placeholder="เช่น หนอน L3 กว่างห้าเขา"></div>
      <div class="frow-2" style="margin-bottom:12px">
        <div class="field"><label>ราคา (฿)</label><input id="m-new-price" placeholder="850"></div>
        <div class="field"><label>จำนวนคงเหลือ</label><input id="m-new-stock" placeholder="8"></div>
      </div>
      <div class="field" style="margin-bottom:14px"><label>หมวดสินค้า</label>
        <select id="m-new-cat">${SHOP_CATS.slice(1).map(c => `<option value="${c.key}">${esc(c.label)}</option>`).join('')}</select>
      </div>
      <button type="button" class="btn primary block" id="m-save-product">บันทึกสินค้า</button>`;
    const modal = openModal(body);
    modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
    modal.querySelector('#m-save-product').addEventListener('click', () => {
      const name = $('#m-new-name').value.trim(), price = $('#m-new-price').value.trim(), stock = $('#m-new-stock').value.trim();
      if (!name || !price || !stock) { toast('กรอกชื่อ ราคา และจำนวนให้ครบ'); return; }
      const category = $('#m-new-cat').value;
      PRODUCTS = [{ id: 'p' + Date.now(), name, price: Number(price), stock: Number(stock), category }].concat(PRODUCTS);
      toast('เพิ่มสินค้าเรียบร้อย');
      cat = category;
      closeModal(); draw();
    });
  };

  const cartModalBody = () => {
    const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span style="flex:1;font-size:.95rem">ตะกร้าออเดอร์</span>
        <button type="button" class="btn small" data-close><i class="ph ph-x"></i></button>
      </div>
      ${cart.length === 0 ? '<p class="wx-note">ยังไม่มีสินค้าในตะกร้า</p>' : `
      <div class="card" style="padding:0;margin-bottom:12px">
        ${cart.map(c => `
          <div class="cart-row" data-id="${c.id}">
            <div class="mid"><div style="font-size:.85rem">${esc(c.name)}</div><div class="wx-note num" style="margin:0">฿${money(c.price)} / หน่วย</div></div>
            <button type="button" class="btn small qbtn" data-dec><i class="ph ph-minus"></i></button>
            <span class="num" style="min-width:20px;text-align:center">${c.qty}</span>
            <button type="button" class="btn small qbtn" data-inc><i class="ph ph-plus"></i></button>
            <span class="num" style="min-width:60px;text-align:right;color:var(--green-700)">฿${money(c.price * c.qty)}</span>
          </div>`).join('')}
      </div>
      <div class="field" style="margin-bottom:12px"><label>ชื่อลูกค้า</label><input id="m-customer" value="${esc(cartCustomer)}" placeholder="เช่น Champ CH"></div>
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:12px">
        <span style="font-size:.82rem;color:var(--muted)">รวมทั้งหมด</span><span style="flex:1"></span>
        <span class="num" style="font-size:1.25rem;color:var(--green-700)">฿${money(total)}</span>
      </div>
      <button type="button" class="btn primary block" id="m-confirm" style="margin-bottom:8px">ยืนยันออเดอร์</button>
      <button type="button" class="btn block" id="m-clear-cart">ล้างตะกร้า</button>`}`;
  };

  const bindCart = modal => {
    modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
    modal.querySelectorAll('.cart-row').forEach(row => {
      const id = row.dataset.id;
      const dec = row.querySelector('[data-dec]'), inc = row.querySelector('[data-inc]');
      if (dec) dec.addEventListener('click', () => { bumpCart(id, -1); refreshCart(modal); });
      if (inc) inc.addEventListener('click', () => { bumpCart(id, 1); refreshCart(modal); });
    });
    const cust = modal.querySelector('#m-customer');
    if (cust) cust.addEventListener('input', e => { cartCustomer = e.target.value; });
    const cc = modal.querySelector('#m-clear-cart');
    if (cc) cc.addEventListener('click', () => { cart = []; refreshCart(modal); updateCartBadge(); });
    const cf = modal.querySelector('#m-confirm');
    if (cf) cf.addEventListener('click', () => {
      if (!cart.length) { toast('ไม่มีสินค้าในตะกร้า'); return; }
      if (!cartCustomer.trim()) { toast('กรุณาใส่ชื่อลูกค้า'); return; }
      const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
      const d = new Date();
      const no = 'TB-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + String(ORDERS.length + 1).padStart(2, '0');
      const bill = { no, customer: cartCustomer.trim(), items: cart.slice(), total, date: d.toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) };
      ORDERS = [{ ...bill, initial: bill.customer.charAt(0).toUpperCase(), state: 'รอชำระเงิน', time: 'เมื่อสักครู่' }].concat(ORDERS);
      PRODUCTS = PRODUCTS.map(p => { const hit = cart.find(i => i.id === p.id); return hit ? { ...p, stock: Math.max(0, p.stock - hit.qty) } : p; });
      cart = []; cartCustomer = '';
      updateCartBadge();
      openBill(bill);
    });
  };
  const bumpCart = (id, d) => { cart = cart.map(i => i.id === id ? { ...i, qty: i.qty + d } : i).filter(i => i.qty > 0); };
  const refreshCart = modal => { modal.innerHTML = cartModalBody(); bindCart(modal); };

  const openCart = () => {
    const modal = openModal(cartModalBody());
    bindCart(modal);
  };

  const openBill = bill => {
    const body = `
      <div class="trophy-band" style="margin-bottom:12px">
        <div style="flex:1"><div class="tu" style="letter-spacing:.1em">TWINBEETLE · ใบเสร็จ</div><div class="tt num" style="font-size:1.05rem;margin-top:3px">${esc(bill.no)}</div><div class="tu">${esc(bill.date)}</div></div>
      </div>
      <div style="font-size:.82rem;color:var(--muted);margin-bottom:10px">ลูกค้า: ${esc(bill.customer)}</div>
      <div class="card" style="padding:0;margin-bottom:12px">
        ${bill.items.map(i => `<div class="cart-row"><div class="mid" style="font-size:.85rem">${esc(i.name)}</div><span class="num" style="color:var(--muted)">× ${i.qty}</span><span class="num" style="min-width:60px;text-align:right;color:var(--green-700)">฿${money(i.price * i.qty)}</span></div>`).join('')}
      </div>
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:6px">
        <span style="font-size:.82rem;color:var(--muted)">รวมทั้งหมด</span><span style="flex:1"></span>
        <span class="num" style="font-size:1.3rem;color:var(--green-700)">฿${money(bill.total)}</span>
      </div>
      <div class="wx-note" style="margin-bottom:12px">ตัดสต็อกและบันทึกออเดอร์แล้ว</div>
      <button type="button" class="btn primary block" data-close>เสร็จสิ้น</button>`;
    const modal = openModal(body);
    modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { closeModal(); draw(); }));
  };

  view.innerHTML = `
    <div class="page-head"><h1>TwinBeetle Store</h1><p class="sub" id="shop-sub"></p></div>
    <div class="toolbar" style="align-items:stretch">
      <div class="chip-row" id="shop-role" style="flex:1 1 200px">
        <button type="button" class="chip" data-role="admin" aria-pressed="false"><i class="ph ph-clipboard-text"></i> ผู้ขาย</button>
        <button type="button" class="chip" data-role="customer" aria-pressed="false"><i class="ph ph-shopping-cart"></i> ลูกค้า</button>
      </div>
      <button type="button" class="btn ink" id="cart-btn" style="position:relative"><i class="ph-fill ph-basket"></i><span id="cart-badge" class="cart-badge" hidden>0</span></button>
    </div>
    <div class="chip-row" id="shop-cats" style="margin:12px 0">
      ${SHOP_CATS.map(c => `<button type="button" class="chip" data-cat="${c.key}" aria-pressed="false">${esc(c.label)}</button>`).join('')}
    </div>
    <div id="shop-body"></div>`;

  $('#shop-sub').textContent = shopRole === 'admin' ? 'จัดการสต็อกสินค้าและออเดอร์' : 'เลือกสินค้าและเปิดออเดอร์';
  view.querySelectorAll('#shop-role .chip').forEach(c => {
    const on = c.dataset.role === shopRole;
    c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on));
    c.addEventListener('click', () => { shopRole = c.dataset.role; render(); });
  });
  $('#cart-btn').addEventListener('click', openCart);
  view.querySelectorAll('#shop-cats .chip').forEach(c => c.addEventListener('click', () => { cat = c.dataset.cat; draw(); }));

  updateCartBadge();
  draw();
}

/* ================= ตั้งค่า ================= */
async function viewSettings(view) {
  const beetles = await ZDB.all('beetles');
  const logs = await ZDB.all('logs');
  view.innerHTML = `
    <div class="page-head"><h1>ตั้งค่า</h1></div>
    <div class="narrow-page">
    <div class="card">
      <h2 style="color:var(--text-3)">ข้อมูลของคุณ</h2>
      <p class="wx-note" style="margin-top:0">ข้อมูลเก็บอยู่ในเครื่องนี้เท่านั้น (${beetles.length} ตัว · ${logs.length} บันทึก) — สำรองไว้เป็นระยะเพื่อความปลอดภัย</p>
      <div class="set-row">
        <div class="tx"><b>สำรองข้อมูล (Export)</b><small>ดาวน์โหลดเป็นไฟล์ .json เก็บไว้ หรือคัดลอกไปวางที่อื่น</small></div>
        <button class="btn small" id="exp-dl">ดาวน์โหลด</button>
        <button class="btn small" id="exp-cp">คัดลอก</button>
      </div>
      <div class="set-row">
        <div class="tx"><b>กู้ข้อมูล (Import)</b><small>เลือกไฟล์ .json ที่เคยสำรองไว้ — ข้อมูลจะถูกรวมเข้ากับของเดิม</small></div>
        <label class="btn small" for="imp-file">เลือกไฟล์</label>
        <input type="file" id="imp-file" accept=".json,application/json" style="display:none">
      </div>
      <div class="set-row">
        <div class="tx"><b style="color:var(--danger)">ล้างข้อมูลทั้งหมด</b><small>ลบด้วงและประวัติทุกอย่างออกจากเครื่องนี้</small></div>
        <button class="btn small danger" id="wipe">ล้างข้อมูล</button>
      </div>
    </div>
    <div class="card">
      <h2 style="color:var(--text-3)">🪲 เกี่ยวกับ KWANG</h2>
      <p style="margin:0 0 4px;font-size:.9rem;font-weight:500">RAISE • RECORD • BREED • TRADE • CONNECT</p>
      <p style="margin:0 0 10px;font-size:.8rem;color:var(--muted-2);font-style:italic">Born from Thailand. Built for Beetle Keepers Worldwide.</p>
      <p style="margin:0;font-size:.85rem;color:var(--muted)">
        Global Beetle Community &amp; Marketplace โดย ZOOTRONIA — เวอร์ชัน 0.1 (เฟส 1: ใช้งานในเครื่อง/ออฟไลน์)<br>
        เฟส 2 ที่กำลังจะมา: บัญชีผู้ใช้ ซิงก์ข้ามอุปกรณ์ ฟีดชุมชน และตารางแข่งสถิติ<br>
        ติดตั้งเป็นแอป: เปิดเมนูเบราว์เซอร์ → "เพิ่มไปยังหน้าจอหลัก" (มือถือ) หรือไอคอนติดตั้งบนแถบที่อยู่ (คอมพิวเตอร์)
      </p>
    </div>
    </div>`;

  const dump = async () => JSON.stringify({
    app: 'zootronia', version: 1, exportedAt: new Date().toISOString(),
    beetles: await ZDB.all('beetles'), logs: await ZDB.all('logs'),
  });

  $('#exp-dl').addEventListener('click', async () => {
    const blob = new Blob([await dump()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `zootronia-backup-${todayISO()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast('กำลังดาวน์โหลดไฟล์สำรอง');
  });
  $('#exp-cp').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(await dump()); toast('คัดลอก JSON แล้ว ✓'); }
    catch { toast('คัดลอกไม่สำเร็จ'); }
  });
  $('#imp-file').addEventListener('change', async e => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      if (j.app !== 'zootronia' || !Array.isArray(j.beetles)) throw new Error('ไม่ใช่ไฟล์สำรองของ KWANG');
      for (const b of j.beetles) await ZDB.put('beetles', b);
      for (const l of (j.logs || [])) await ZDB.put('logs', l);
      toast(`กู้ข้อมูลแล้ว: ด้วง ${j.beetles.length} ตัว ✓`);
      render();
    } catch (err) { toast('กู้ข้อมูลไม่สำเร็จ: ' + err.message); }
  });
  $('#wipe').addEventListener('click', async () => {
    const ok = await confirmModal({
      title: 'ล้างข้อมูลทั้งหมด?',
      message: `ลบด้วงทั้งหมด ${beetles.length} ตัว และบันทึก ${logs.length} รายการออกจากเครื่องนี้ การลบย้อนกลับไม่ได้`,
      danger: true, confirmLabel: 'ล้างข้อมูลทั้งหมด', typedPhrase: 'ลบทั้งหมด',
    });
    if (!ok) return;
    await ZDB.clearAll();
    toast('ล้างข้อมูลแล้ว');
    render();
  });
}

/* ---------- เริ่มระบบ ---------- */
/* ปิด service worker ไว้ก่อนช่วงพัฒนา (แก้บ่อย ไม่อยากให้แคชค้าง) — เปิดใช้ตอนพร้อมส่งจริง
   แล้วดึงคอมเมนต์ 3 บรรทัดข้างล่างนี้กลับมาแทนบรรทัด unregister
   if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
     window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
   } */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
  if (window.caches) caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
}
render();
})();
