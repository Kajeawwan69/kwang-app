/* LIANGDUANG Community — MVP (โปรไฟล์ + โพสต์รูปภาพ + Like + Comment) */
(() => {
'use strict';

const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const RANK_SPECIES = [
  ['Dynastes hercules', 'เฮอร์คิวลิส'],
  ['Dynastes neptunus', 'เนปจูน'],
  ['Chalcosoma caucasus', 'คอเคซัส'],
  ['Chalcosoma atlas', 'แอตลาส'],
  ['Xylotrupes gideon', 'กว่างชน'],
  ['Eupatorus gracilicornis', 'กว่างห้าเขา'],
  ['Allomyrina dichotoma', 'คาบูโตะ'],
  ['Dorcus titanus palawanicus', 'ปาลาวัน'],
  ['Prosopocoilus giraffa', 'คีมยีราฟ'],
  ['Phalacrognathus muelleri', 'คีมสายรุ้ง'],
  ['Mecynorrhina torquata', 'ด้วงดอกไม้ยักษ์'],
];
const randomSpecies = () => RANK_SPECIES[Math.floor(Math.random() * RANK_SPECIES.length)];

const RANK_STAGES = {
  egg:   { icon: 'ph-egg-crack', label: 'ไข่ด้วง' },
  l1:    { icon: 'ph-bug', label: 'หนอน L1' },
  l2:    { icon: 'ph-bug', label: 'หนอน L2' },
  l3:    { icon: 'ph-bug', label: 'หนอน L3' },
  pupa:  { icon: 'ph-leaf', label: 'ดักแด้' },
  adult: { icon: 'ph-trophy', label: 'ตัวเต็มวัย' },
};
const rankInfo = stage => RANK_STAGES[stage] || RANK_STAGES.egg;

const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const timeAgo = iso => {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'เมื่อสักครู่';
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชม.ที่แล้ว`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
};

async function resizeImage(file, maxDim = 1600, quality = 0.82) {
  let source, width, height;
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' });
    width = source.width; height = source.height;
  } catch {
    source = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    });
    width = source.naturalWidth; height = source.naturalHeight;
  }
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = outW; canvas.height = outH;
  canvas.getContext('2d').drawImage(source, 0, 0, outW, outH);
  const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
  return blob || file;
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} หมดเวลา — เน็ตอาจช้าหรือหลุด ลองรีเฟรชใหม่`)), ms)),
  ]);
}

function toast(msg) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}

const state = {
  user: null,
  profile: null,
  posts: [],
  likeCounts: new Map(),   // postId -> number
  myLikes: new Set(),      // postIds liked by current user
  comments: new Map(),     // postId -> array of {body, created_at, profiles}
  composerFile: null,
  authMode: 'login',       // 'login' | 'signup'
};

/* ---------- auth ---------- */

async function ensureProfile(user) {
  const { data: existing } = await sb.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (existing) return;
  const meta = user.user_metadata || {};
  const base = (meta.full_name || meta.name || (user.email || 'user').split('@')[0])
    .toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20) || 'user';
  const [species, speciesTh] = randomSpecies();
  let username = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await sb.from('profiles').insert({
      id: user.id, username, display_name: meta.full_name || meta.name || username,
      avatar_url: meta.avatar_url || meta.picture || null,
      rank_species: species, rank_species_th: speciesTh,
    });
    if (!error) return;
    if (!String(error.message).includes('duplicate')) throw error;
    username = base + Math.floor(Math.random() * 10000);
  }
}

async function refreshSession() {
  const { data: { session } } = await sb.auth.getSession();
  state.user = session ? session.user : null;
  if (state.user) {
    let { data } = await sb.from('profile_ranks').select('*').eq('id', state.user.id).maybeSingle();
    if (!data) {
      await ensureProfile(state.user);
      ({ data } = await sb.from('profile_ranks').select('*').eq('id', state.user.id).maybeSingle());
    }
    state.profile = data || null;
  } else {
    state.profile = null;
  }
  renderAuthSlot();
  renderComposer();
  if (state.profile && !state.profile.page_name) openCompleteProfileModal();
}

sb.auth.onAuthStateChange(() => refreshSession());

async function handleLogin(email, password) {
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

async function handleSignup(email, password, username, pageName, lineId, facebookUrl) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.session) throw new Error('สมัครสำเร็จ แต่ยังไม่มี session — ถ้าโปรเจกต์เปิด "Confirm email" ไว้ ให้ไปปิดในหน้า Auth settings ก่อนทดสอบ');
  const [species, speciesTh] = randomSpecies();
  const { error: profErr } = await sb.from('profiles').insert({
    id: data.user.id, username, display_name: username,
    page_name: pageName, line_id: lineId || null, facebook_url: facebookUrl || null,
    rank_species: species, rank_species_th: speciesTh,
  });
  if (profErr) throw new Error(profErr.message.includes('duplicate') ? 'ชื่อผู้ใช้นี้มีคนใช้แล้ว' : profErr.message);
}

async function handleCompleteProfile(userId, pageName, lineId, facebookUrl) {
  const update = { page_name: pageName, line_id: lineId || null, facebook_url: facebookUrl || null };
  if (!state.profile.rank_species) {
    const [species, speciesTh] = randomSpecies();
    update.rank_species = species;
    update.rank_species_th = speciesTh;
  }
  const { error } = await sb.from('profiles').update(update).eq('id', userId);
  if (error) throw error;
}

async function handleGoogleLogin() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw error;
}

async function handleLogout() {
  await sb.auth.signOut();
  toast('ออกจากระบบแล้ว');
}

/* ---------- feed ---------- */

async function loadFeed() {
  const feedEl = $('#feed');
  let posts, error;
  try {
    ({ data: posts, error } = await withTimeout(
      sb.from('posts')
        .select('id,caption,image_url,created_at,author_id,profiles!posts_author_id_fkey(username,display_name)')
        .order('created_at', { ascending: false })
        .limit(30),
      12000, 'โหลดฟีด'));
  } catch (err) { feedEl.innerHTML = `<div class="empty">${esc(err.message)}</div>`; return; }
  if (error) { feedEl.innerHTML = `<div class="empty">โหลดฟีดไม่สำเร็จ: ${esc(error.message)}</div>`; return; }
  state.posts = posts || [];
  if (!state.posts.length) {
    state.likeCounts = new Map(); state.myLikes = new Set(); state.comments = new Map();
    renderFeed();
    return;
  }
  const ids = state.posts.map(p => p.id);
  const [{ data: likes }, { data: comments }] = await Promise.all([
    sb.from('post_likes').select('post_id,user_id').in('post_id', ids),
    sb.from('post_comments').select('id,post_id,body,created_at,profiles(username,display_name)').in('post_id', ids).order('created_at', { ascending: true }),
  ]);
  state.likeCounts = new Map();
  state.myLikes = new Set();
  (likes || []).forEach(l => {
    state.likeCounts.set(l.post_id, (state.likeCounts.get(l.post_id) || 0) + 1);
    if (state.user && l.user_id === state.user.id) state.myLikes.add(l.post_id);
  });
  state.comments = new Map();
  (comments || []).forEach(c => {
    if (!state.comments.has(c.post_id)) state.comments.set(c.post_id, []);
    state.comments.get(c.post_id).push(c);
  });
  renderFeed();
}

function authorName(profiles) {
  return (profiles && (profiles.display_name || profiles.username)) || 'ผู้ใช้ไม่ทราบชื่อ';
}

function renderFeed() {
  const feedEl = $('#feed');
  if (!state.posts.length) { feedEl.innerHTML = '<div class="empty">ยังไม่มีโพสต์ — เป็นคนแรกที่แชร์ด้วงของคุณสิ!</div>'; return; }
  feedEl.innerHTML = state.posts.map(postCard).join('');
  state.posts.forEach(p => {
    $(`#like-${p.id}`).addEventListener('click', () => toggleLike(p.id));
    const form = $(`#cf-${p.id}`);
    if (form) form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      const body = input.value.trim();
      if (!body) return;
      submitComment(p.id, body);
      input.value = '';
    });
  });
}

function postCard(p) {
  const liked = state.myLikes.has(p.id);
  const likeCount = state.likeCounts.get(p.id) || 0;
  const comments = state.comments.get(p.id) || [];
  const name = authorName(p.profiles);
  const loggedIn = !!state.user;
  return `
  <article class="post">
    <div class="post-head">
      <div class="avatar">${esc(name.slice(0, 1).toUpperCase())}</div>
      <div><div class="name">${esc(name)}</div><div class="time">${timeAgo(p.created_at)}</div></div>
    </div>
    <img class="post-image" src="${esc(p.image_url)}" alt="" loading="lazy">
    ${p.caption ? `<p class="caption">${esc(p.caption)}</p>` : ''}
    <div class="actions">
      <button type="button" class="action ${liked ? 'liked' : ''}" id="like-${p.id}" ${loggedIn ? '' : 'disabled title="เข้าสู่ระบบก่อนเพื่อกดไลค์"'}>
        <i class="ph-fill ph-heart"></i>${likeCount || ''} ไลค์
      </button>
      <span class="action" style="cursor:default"><i class="ph-fill ph-chat-circle"></i>${comments.length || ''} คอมเมนต์</span>
    </div>
    <div class="comments">
      ${comments.map(c => `<div class="comment"><b>${esc(authorName(c.profiles))}</b> ${esc(c.body)}</div>`).join('')}
      ${loggedIn
        ? `<form class="comment-form" id="cf-${p.id}"><input type="text" maxlength="400" placeholder="เขียนคอมเมนต์..."><button type="submit">ส่ง</button></form>`
        : `<div class="comment" style="color:var(--text-3)">เข้าสู่ระบบเพื่อคอมเมนต์</div>`}
    </div>
  </article>`;
}

async function toggleLike(postId) {
  if (!state.user) return;
  const liked = state.myLikes.has(postId);
  if (liked) {
    await sb.from('post_likes').delete().eq('post_id', postId).eq('user_id', state.user.id);
    state.myLikes.delete(postId);
    state.likeCounts.set(postId, (state.likeCounts.get(postId) || 1) - 1);
  } else {
    await sb.from('post_likes').insert({ post_id: postId, user_id: state.user.id });
    state.myLikes.add(postId);
    state.likeCounts.set(postId, (state.likeCounts.get(postId) || 0) + 1);
  }
  renderFeed();
}

async function submitComment(postId, body) {
  const { data, error } = await sb.from('post_comments')
    .insert({ post_id: postId, author_id: state.user.id, body })
    .select('id,post_id,body,created_at,profiles(username,display_name)')
    .single();
  if (error) { toast('คอมเมนต์ไม่สำเร็จ'); return; }
  if (!state.comments.has(postId)) state.comments.set(postId, []);
  state.comments.get(postId).push(data);
  renderFeed();
}

/* ---------- composer ---------- */

function renderComposer() {
  const slot = $('#composer-slot');
  if (!state.user || !state.profile) {
    slot.innerHTML = `<div class="login-prompt">เข้าสู่ระบบเพื่อโพสต์รูปด้วงของคุณให้ชุมชนเห็น
      <div><button type="button" class="btn primary" id="prompt-login">เข้าสู่ระบบ / สมัครสมาชิก</button></div>
    </div>`;
    $('#prompt-login').addEventListener('click', () => openAuthModal('login'));
    return;
  }
  slot.innerHTML = `
  <form class="composer" id="composer-form">
    <textarea id="composer-caption" maxlength="500" placeholder="แชร์เรื่องด้วงของคุณ..."></textarea>
    <img class="preview" id="composer-preview" alt="">
    <div class="row">
      <label class="file-btn"><i class="ph-fill ph-image"></i>แนบรูป<input type="file" id="composer-file" accept="image/*"></label>
      <button type="submit" class="btn primary" id="composer-submit" style="margin-left:auto" disabled>โพสต์</button>
    </div>
  </form>`;
  const fileInput = $('#composer-file');
  const preview = $('#composer-preview');
  const submitBtn = $('#composer-submit');
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    state.composerFile = file || null;
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
      submitBtn.disabled = false;
    } else {
      preview.style.display = 'none';
      submitBtn.disabled = true;
    }
  });
  $('#composer-form').addEventListener('submit', handlePostSubmit);
}

async function handlePostSubmit(e) {
  e.preventDefault();
  const file = state.composerFile;
  if (!file) return;
  const caption = $('#composer-caption').value.trim();
  const submitBtn = $('#composer-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'กำลังโพสต์...';
  try {
    const resized = await resizeImage(file);
    const path = `${state.user.id}/${Date.now()}.jpg`;
    const { error: upErr } = await sb.storage.from('post-images').upload(path, resized, {
      contentType: 'image/jpeg', cacheControl: '31536000', upsert: false,
    });
    if (upErr) throw upErr;
    const { data: pub } = sb.storage.from('post-images').getPublicUrl(path);
    const { error: insErr } = await sb.from('posts').insert({
      author_id: state.user.id, caption: caption || null, image_url: pub.publicUrl,
    });
    if (insErr) throw insErr;
    state.composerFile = null;
    renderComposer();
    toast('โพสต์แล้ว!');
    loadFeed();
  } catch (err) {
    toast('โพสต์ไม่สำเร็จ: ' + err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'โพสต์';
  }
}

/* ---------- auth UI ---------- */

function renderAuthSlot() {
  const slot = $('#auth-slot');
  if (state.user && state.profile) {
    const rank = rankInfo(state.profile.rank_stage);
    const avatar = state.profile.avatar_url
      ? `<img src="${esc(state.profile.avatar_url)}" alt="">`
      : `<i class="ph-fill ph-user-circle"></i>`;
    slot.innerHTML = `
      <button type="button" class="user-chip" id="open-profile-btn">${avatar}${esc(state.profile.display_name || state.profile.username)}</button>
      <span class="rank-chip" title="${esc(state.profile.rank_species || '')}"><i class="ph-fill ${rank.icon}"></i>${rank.label}</span>`;
    $('#open-profile-btn').addEventListener('click', openProfileModal);
  } else {
    slot.innerHTML = `<button type="button" class="btn primary" id="login-btn">เข้าสู่ระบบ</button>`;
    $('#login-btn').addEventListener('click', () => openAuthModal('login'));
  }
}

function openAuthModal(mode) {
  state.authMode = mode;
  renderModal();
}
function closeModal() { $('#modal-slot').innerHTML = ''; }

async function handleAvatarUpload(file) {
  const resized = await resizeImage(file, 400, 0.85);
  const path = `${state.user.id}/avatar.jpg`;
  const { error: upErr } = await sb.storage.from('avatars').upload(path, resized, {
    contentType: 'image/jpeg', cacheControl: '3600', upsert: true,
  });
  if (upErr) throw upErr;
  const { data: pub } = sb.storage.from('avatars').getPublicUrl(path);
  const bustUrl = `${pub.publicUrl}?t=${Date.now()}`;
  const { error: updErr } = await sb.from('profiles').update({ avatar_url: bustUrl }).eq('id', state.user.id);
  if (updErr) throw updErr;
}

function openProfileModal() {
  const p = state.profile;
  const rank = rankInfo(p.rank_stage);
  const avatarImg = p.avatar_url ? `<img src="${esc(p.avatar_url)}" alt="">` : `<i class="ph-fill ph-user-circle"></i>`;
  $('#modal-slot').innerHTML = `
  <div class="modal-overlay" id="profile-overlay">
    <div class="modal">
      <button type="button" class="close" id="profile-close">&times;</button>
      <h3>โปรไฟล์ของฉัน</h3>
      <div class="profile-avatar-row">
        <label class="profile-avatar" id="avatar-preview-wrap">${avatarImg}<span class="edit-badge"><i class="ph-fill ph-camera"></i></span><input type="file" id="avatar-file" accept="image/*" style="display:none"></label>
        <div>
          <div style="font-weight:600">${esc(p.display_name || p.username)}</div>
          <span class="rank-chip" title="${esc(p.rank_species || '')}"><i class="ph-fill ${rank.icon}"></i>${rank.label} · ${p.points} แต้ม</span>
        </div>
      </div>
      <form id="profile-form">
        <label for="pf-pagename">ชื่อเพจ/ฟาร์ม *</label><input id="pf-pagename" required maxlength="40" value="${esc(p.page_name || '')}">
        <label for="pf-line">Line ID</label><input id="pf-line" maxlength="40" value="${esc(p.line_id || '')}">
        <label for="pf-facebook">ลิงก์ Facebook</label><input id="pf-facebook" type="url" maxlength="200" value="${esc(p.facebook_url || '')}">
        <div class="err" id="profile-err"></div>
        <div class="modal-actions"><button type="submit" class="btn primary" id="profile-submit" style="flex:1">บันทึก</button></div>
      </form>
      ${p.role === 'admin' ? `<button type="button" class="logout-link" id="admin-link" style="color:var(--leaf-deep)"><i class="ph-fill ph-shield-check"></i>แผงควบคุมผู้ดูแล</button>` : ''}
      <button type="button" class="logout-link" id="logout-btn"><i class="ph-fill ph-sign-out"></i>ออกจากระบบ</button>
    </div>
  </div>`;
  $('#profile-close').addEventListener('click', closeModal);
  $('#profile-overlay').addEventListener('click', e => { if (e.target.id === 'profile-overlay') closeModal(); });
  if (p.role === 'admin') $('#admin-link').addEventListener('click', openAdminModal);
  $('#logout-btn').addEventListener('click', () => { closeModal(); handleLogout(); });
  $('#avatar-file').addEventListener('change', async () => {
    const file = $('#avatar-file').files[0];
    if (!file) return;
    const errEl = $('#profile-err');
    errEl.textContent = '';
    try {
      await handleAvatarUpload(file);
      await refreshSession();
      openProfileModal();
    } catch (err) {
      errEl.textContent = 'อัปโหลดรูปไม่สำเร็จ: ' + err.message;
    }
  });
  $('#profile-form').addEventListener('submit', async e => {
    e.preventDefault();
    const errEl = $('#profile-err');
    const submitBtn = $('#profile-submit');
    const pageName = $('#pf-pagename').value.trim();
    if (!pageName) { errEl.textContent = 'กรอกชื่อเพจ/ฟาร์มก่อนครับ'; return; }
    submitBtn.disabled = true;
    try {
      await handleCompleteProfile(state.user.id, pageName, $('#pf-line').value.trim(), $('#pf-facebook').value.trim());
      closeModal();
      toast('บันทึกโปรไฟล์แล้ว');
      refreshSession();
    } catch (err) {
      errEl.textContent = err.message || 'บันทึกไม่สำเร็จ';
      submitBtn.disabled = false;
    }
  });
}

async function openAdminModal() {
  $('#modal-slot').innerHTML = `
  <div class="modal-overlay" id="admin-overlay">
    <div class="modal" style="max-width:720px">
      <button type="button" class="close" id="admin-close">&times;</button>
      <h3>แผงควบคุมผู้ดูแล</h3>
      <div id="admin-body"><div class="loading">กำลังโหลด...</div></div>
    </div>
  </div>`;
  $('#admin-close').addEventListener('click', closeModal);
  $('#admin-overlay').addEventListener('click', e => { if (e.target.id === 'admin-overlay') closeModal(); });
  await loadAdminData();
}

async function loadAdminData() {
  const body = $('#admin-body');
  const { data, error } = await sb.from('profile_ranks').select('*').order('created_at', { ascending: false });
  if (error) { body.innerHTML = `<div class="empty">โหลดไม่สำเร็จ: ${esc(error.message)}</div>`; return; }
  renderAdminBody(data || []);
}

function renderAdminBody(members) {
  const body = $('#admin-body');
  const counts = {};
  members.forEach(m => { counts[m.rank_stage] = (counts[m.rank_stage] || 0) + 1; });
  const summary = Object.keys(RANK_STAGES).map(stage =>
    `<span class="admin-count"><i class="ph-fill ${RANK_STAGES[stage].icon}"></i>${RANK_STAGES[stage].label}: ${counts[stage] || 0}</span>`
  ).join('');
  body.innerHTML = `
    <p class="sub">ทั้งหมด ${members.length} คน</p>
    <div class="admin-summary">${summary}</div>
    <table class="rank-table admin-table">
      <thead><tr><th>ชื่อ</th><th>เพจ</th><th>ยศ</th><th>แต้ม</th><th>สิทธิ์</th></tr></thead>
      <tbody>
        ${members.map(m => `
          <tr>
            <td><b>${esc(m.display_name || m.username)}</b></td>
            <td style="color:var(--text-3)">${esc(m.page_name || '-')}</td>
            <td>${rankInfo(m.rank_stage).label}</td>
            <td class="num">${m.points}</td>
            <td>
              <select class="role-select" data-id="${m.id}" ${m.id === state.user.id ? 'disabled title="แก้สิทธิ์ของตัวเองไม่ได้"' : ''}>
                <option value="member" ${m.role === 'member' ? 'selected' : ''}>สมาชิก</option>
                <option value="moderator" ${m.role === 'moderator' ? 'selected' : ''}>ผู้ดูแล</option>
                <option value="admin" ${m.role === 'admin' ? 'selected' : ''}>Admin ระบบ</option>
              </select>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  body.querySelectorAll('.role-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      const targetId = sel.dataset.id;
      const newRole = sel.value;
      sel.disabled = true;
      const { error } = await sb.rpc('set_user_role', { target_id: targetId, new_role: newRole });
      sel.disabled = false;
      if (error) { toast('เปลี่ยนสิทธิ์ไม่สำเร็จ: ' + error.message); return; }
      toast('เปลี่ยนสิทธิ์แล้ว');
    });
  });
}

function openCompleteProfileModal() {
  $('#modal-slot').innerHTML = `
  <div class="modal-overlay" id="complete-profile-overlay">
    <div class="modal">
      <button type="button" class="close" id="complete-profile-close">&times;</button>
      <h3>เติมโปรไฟล์ให้ครบ</h3>
      <p class="sub">บอกชุมชนหน่อยว่าคุณคือใคร</p>
      <form id="complete-profile-form">
        <label for="cp-pagename">ชื่อเพจ/ฟาร์ม *</label><input id="cp-pagename" required maxlength="40">
        <label for="cp-line">Line ID (ไม่บังคับ)</label><input id="cp-line" maxlength="40">
        <label for="cp-facebook">ลิงก์ Facebook (ไม่บังคับ)</label><input id="cp-facebook" type="url" maxlength="200">
        <div class="err" id="complete-profile-err"></div>
        <div class="modal-actions"><button type="submit" class="btn primary" id="complete-profile-submit" style="flex:1">บันทึก</button></div>
      </form>
    </div>
  </div>`;
  $('#complete-profile-close').addEventListener('click', closeModal);
  $('#complete-profile-overlay').addEventListener('click', e => { if (e.target.id === 'complete-profile-overlay') closeModal(); });
  $('#complete-profile-form').addEventListener('submit', async e => {
    e.preventDefault();
    const errEl = $('#complete-profile-err');
    const submitBtn = $('#complete-profile-submit');
    const pageName = $('#cp-pagename').value.trim();
    if (!pageName) { errEl.textContent = 'กรอกชื่อเพจ/ฟาร์มก่อนครับ'; return; }
    submitBtn.disabled = true;
    try {
      await handleCompleteProfile(state.user.id, pageName, $('#cp-line').value.trim(), $('#cp-facebook').value.trim());
      closeModal();
      toast('บันทึกโปรไฟล์แล้ว');
      refreshSession();
    } catch (err) {
      errEl.textContent = err.message || 'บันทึกไม่สำเร็จ';
      submitBtn.disabled = false;
    }
  });
}

function renderModal() {
  const isLogin = state.authMode === 'login';
  $('#modal-slot').innerHTML = `
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal">
      <button type="button" class="close" id="modal-close">&times;</button>
      <h3>${isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h3>
      <p class="sub">${isLogin ? 'เข้าสู่ระบบเพื่อโพสต์ ไลค์ และคอมเมนต์' : 'สร้างบัญชีเพื่อร่วมชุมชน LIANGDUANG'}</p>
      <button type="button" class="btn ghost google-btn" id="google-btn">
        <img src="https://www.google.com/favicon.ico" alt="" width="16" height="16">เข้าสู่ระบบด้วย Google
      </button>
      <div class="divider"><span>หรือใช้อีเมล</span></div>
      <form id="auth-form">
        ${isLogin ? '' : `
        <label for="f-username">ชื่อผู้ใช้ *</label><input id="f-username" required maxlength="24">
        <label for="f-pagename">ชื่อเพจ/ฟาร์ม *</label><input id="f-pagename" required maxlength="40">`}
        <label for="f-email">อีเมล</label><input id="f-email" type="email" required>
        <label for="f-password">รหัสผ่าน</label><input id="f-password" type="password" required minlength="6">
        ${isLogin ? '' : `
        <label for="f-line">Line ID (ไม่บังคับ)</label><input id="f-line" maxlength="40">
        <label for="f-facebook">ลิงก์ Facebook (ไม่บังคับ)</label><input id="f-facebook" type="url" maxlength="200">`}
        <div class="err" id="auth-err"></div>
        <div class="modal-actions">
          <button type="submit" class="btn primary" id="auth-submit">${isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</button>
        </div>
      </form>
      <div class="switch">
        ${isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีอยู่แล้ว?'}
        <button type="button" id="switch-mode">${isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</button>
      </div>
    </div>
  </div>`;
  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-overlay').addEventListener('click', e => { if (e.target.id === 'modal-overlay') closeModal(); });
  $('#switch-mode').addEventListener('click', () => openAuthModal(isLogin ? 'signup' : 'login'));
  $('#google-btn').addEventListener('click', async () => {
    try { await handleGoogleLogin(); }
    catch (err) { $('#auth-err').textContent = err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ'; }
  });
  $('#auth-form').addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = $('#auth-submit');
    const errEl = $('#auth-err');
    errEl.textContent = '';
    submitBtn.disabled = true;
    const email = $('#f-email').value.trim();
    const password = $('#f-password').value;
    try {
      if (isLogin) {
        await handleLogin(email, password);
      } else {
        const username = $('#f-username').value.trim();
        const pageName = $('#f-pagename').value.trim();
        const lineId = $('#f-line').value.trim();
        const facebookUrl = $('#f-facebook').value.trim();
        await handleSignup(email, password, username, pageName, lineId, facebookUrl);
      }
      closeModal();
      toast(isLogin ? 'เข้าสู่ระบบแล้ว' : 'สมัครสมาชิกสำเร็จ');
      loadFeed();
    } catch (err) {
      errEl.textContent = err.message || 'เกิดข้อผิดพลาด';
      submitBtn.disabled = false;
    }
  });
}

/* ---------- Beetle World stats ---------- */

let worldStats = [];
let worldLoaded = false;

async function loadWorldStats() {
  const board = $('#stats-board');
  let data, error;
  try {
    ({ data, error } = await withTimeout(
      sb.from('beetle_stats_ranked')
        .select('*')
        .order('species', { ascending: true })
        .order('rank_by_length', { ascending: true }),
      12000, 'โหลดสถิติ'));
  } catch (err) { board.innerHTML = `<div class="empty">${esc(err.message)}</div>`; return; }
  if (error) { board.innerHTML = `<div class="empty">โหลดสถิติไม่สำเร็จ: ${esc(error.message)}</div>`; return; }
  worldStats = data || [];
  worldLoaded = true;
  renderWorldBoard();
}

function renderWorldBoard() {
  const board = $('#stats-board');
  const q = $('#stats-search').value.trim().toLowerCase();
  const category = $('#stats-category-filter').value;
  const groups = new Map();
  worldStats
    .filter(s => !category || s.category === category)
    .forEach(s => {
      const key = s.species + '|' + (s.species_th || '');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(s);
    });
  let entries = [...groups.entries()];
  if (q) entries = entries.filter(([key]) => key.toLowerCase().includes(q));
  if (!entries.length) {
    const msg = category ? `ยังไม่มีสถิติในหมวด "${esc(category)}" — เป็นคนแรกที่ส่งสิ!` : 'ไม่พบสายพันธุ์ที่ค้นหา หรือยังไม่มีสถิติ — ส่งสถิติของคุณเป็นรายการแรกสิ!';
    board.innerHTML = `<div class="empty">${msg}</div>`;
    return;
  }
  const posClass = n => n === 1 ? 'gold' : n === 2 ? 'silver' : n === 3 ? 'bronze' : '';
  board.innerHTML = entries.map(([key, rows]) => {
    const [species, speciesTh] = key.split('|');
    const top = rows[0];
    const topValue = top.length_mm != null ? `${top.length_mm} mm` : top.weight_g != null ? `${top.weight_g} g` : '-';
    return `
    <div class="species-group">
      <h3>${esc(species)}</h3>
      ${speciesTh ? `<p class="th-name">${esc(speciesTh)}</p>` : ''}
      <div class="trophy-band">
        <i class="ph-fill ph-trophy"></i>
        <div><div class="tt">ใหญ่ที่สุด ${topValue}</div><div class="tu">โดย ${esc(top.breeder_name)}</div></div>
      </div>
      <table class="rank-table">
        <thead><tr><th>อันดับ</th><th>ผู้เพาะ</th><th>Gen.</th><th style="text-align:right">ความยาว/น้ำหนัก</th></tr></thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td><span class="rank-pos ${posClass(r.rank_by_length)}">${r.rank_by_length}</span></td>
              <td><b>${esc(r.breeder_name)}</b></td>
              <td style="color:var(--text-3)">${esc(r.generation || '-')}</td>
              <td class="num">${r.length_mm != null ? r.length_mm + 'mm' : ''}${r.weight_g != null ? ' / ' + r.weight_g + 'g' : ''}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  }).join('');
}

function renderStatsButton() {
  const slot = $('#stats-form-slot');
  slot.innerHTML = `<button type="button" class="btn primary" id="open-stats-modal"><i class="ph-fill ph-plus"></i>ส่งสถิติ</button>`;
  $('#open-stats-modal').addEventListener('click', openStatsModal);
}

function openStatsModal() {
  $('#modal-slot').innerHTML = `
  <div class="modal-overlay" id="stats-modal-overlay">
    <div class="modal" style="max-width:520px">
      <button type="button" class="close" id="stats-modal-close">&times;</button>
      <h3>ส่งสถิติของคุณ</h3>
      <p class="sub">แชร์สถิติด้วงของคุณเข้าสู่กระดาน Ranking</p>
      <form id="stats-form">
        <div class="grid">
          <div class="field"><label for="s-category">หมวดหมู่ *</label>
            <select id="s-category" required>
              <option value="">เลือกหมวด</option>
              <option value="ด้วงกว่าง">ด้วงกว่าง</option>
              <option value="คีม">คีม</option>
              <option value="ดอกไม้">ดอกไม้</option>
            </select>
          </div>
          <div class="field"><label for="s-species">สายพันธุ์ (ละติน) *</label><input id="s-species" required placeholder="เช่น Dorcus curvidens curvidens"></div>
          <div class="field"><label for="s-species-th">ชื่อไทย</label><input id="s-species-th" placeholder="เช่น ด้วงคีมเคอร์วิเดนส์"></div>
          <div class="field"><label for="s-breeder">ชื่อผู้เพาะ *</label><input id="s-breeder" required></div>
          <div class="field"><label for="s-length">ความยาว (mm) *</label><input id="s-length" type="number" step="0.1" required></div>
        </div>
        <button type="button" class="more-toggle" id="more-toggle">+ รายละเอียดเพิ่มเติม (ไม่บังคับ)</button>
        <div class="grid more-fields" id="more-fields">
          <div class="field"><label for="s-weight">น้ำหนักสูงสุด (g)</label><input id="s-weight" type="number" step="0.1"></div>
          <div class="field"><label for="s-gen">Gen.</label><input id="s-gen" placeholder="F1 / CBF1 ..."></div>
          <div class="field"><label for="s-duration">ระยะเวลาเลี้ยง (เดือน)</label><input id="s-duration" placeholder="เช่น 10 หรือ ~6"></div>
          <div class="field"><label for="s-temp">อุณหภูมิ</label><input id="s-temp" placeholder="เช่น 21-23"></div>
          <div class="field"><label for="s-container">ขนาดกระปุก</label><input id="s-container" placeholder="เช่น 1200 หรือ 450(L1-2),1400(L3)"></div>
          <div class="field"><label for="s-mat">วัสดุรอง (Mat)</label><input id="s-mat"></div>
          <div class="field"><label for="s-kinshi">เชื้อเห็ด (Kinshi)</label><input id="s-kinshi"></div>
          <div class="field"><label for="s-image">ลิงก์รูปภาพ</label><input id="s-image" type="url" placeholder="วางลิงก์รูป (ถ้ามี)"></div>
          <div class="field" style="grid-column:1/-1"><label for="s-remarks">หมายเหตุ</label><textarea id="s-remarks" rows="2"></textarea></div>
        </div>
        <div class="err" id="stats-err" style="color:#d13a4a;font-size:13px"></div>
        <div class="modal-actions"><button type="submit" class="btn primary" id="stats-submit" style="flex:1">ส่งสถิติ</button></div>
      </form>
    </div>
  </div>`;
  $('#stats-modal-close').addEventListener('click', closeModal);
  $('#stats-modal-overlay').addEventListener('click', e => { if (e.target.id === 'stats-modal-overlay') closeModal(); });
  $('#more-toggle').addEventListener('click', () => $('#more-fields').classList.toggle('open'));
  $('#stats-form').addEventListener('submit', handleStatSubmit);
}

async function handleStatSubmit(e) {
  e.preventDefault();
  const errEl = $('#stats-err');
  const submitBtn = $('#stats-submit');
  errEl.textContent = '';
  const row = {
    category: $('#s-category').value,
    species: $('#s-species').value.trim(),
    species_th: $('#s-species-th').value.trim() || null,
    breeder_name: $('#s-breeder').value.trim(),
    length_mm: $('#s-length').value ? Number($('#s-length').value) : null,
    weight_g: $('#s-weight').value ? Number($('#s-weight').value) : null,
    generation: $('#s-gen').value.trim() || null,
    duration_months: $('#s-duration').value.trim() || null,
    temperature: $('#s-temp').value.trim() || null,
    container: $('#s-container').value.trim() || null,
    mat: $('#s-mat').value.trim() || null,
    kinshi: $('#s-kinshi').value.trim() || null,
    image_url: $('#s-image').value.trim() || null,
    remarks: $('#s-remarks').value.trim() || null,
  };
  if (!row.category || !row.species || !row.breeder_name) { errEl.textContent = 'กรอกหมวดหมู่ สายพันธุ์ และชื่อผู้เพาะก่อนครับ'; return; }
  submitBtn.disabled = true;
  submitBtn.textContent = 'กำลังส่ง...';
  const { error } = await sb.from('beetle_stats').insert(row);
  submitBtn.disabled = false;
  submitBtn.textContent = 'ส่งสถิติ';
  if (error) { errEl.textContent = 'ส่งไม่สำเร็จ: ' + error.message; return; }
  closeModal();
  toast('ส่งสถิติแล้ว!');
  loadWorldStats();
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  ['ranking', 'feed', 'mybeetles', 'auction', 'care'].forEach(name => {
    $(`#pane-${name}`).style.display = tab === name ? '' : 'none';
  });
  if (tab === 'ranking' && !worldLoaded) {
    loadWorldStats();
  }
  if (tab === 'mybeetles') {
    const frame = $('#mybeetles-frame');
    if (frame.src === 'about:blank' || !frame.getAttribute('src')) frame.src = frame.dataset.src;
  }
}

/* ---------- boot ---------- */

(async function init() {
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  $('#stats-search').addEventListener('input', () => renderWorldBoard());
  $('#stats-category-filter').addEventListener('change', () => renderWorldBoard());
  await refreshSession();
  renderStatsButton();
  await Promise.all([loadFeed(), loadWorldStats()]);
})();

})();
