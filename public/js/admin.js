/* ================= GENTLEMAN HOUSE — ADMIN PANEL ================= */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/ |,/g, ' ') + ' soʻm';
const dt = (d) => d ? new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
let token = null; try { token = JSON.parse(localStorage.getItem('gh_token')); } catch {}

const I = {
  dash: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>',
  orders: '<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>',
  prod: '<svg viewBox="0 0 24 24"><path d="M12 7a2 2 0 1 1 2-2c0 1-2 1.5-2 3"/><path d="M12 8 2 16a1 1 0 0 0 .6 2h18.8a1 1 0 0 0 .6-2z"/></svg>',
  cat: '<svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>',
  users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c1-3.5 3.8-5.5 7-5.5s6 2 7 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4.3 1.5 5 4"/></svg>',
  media: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  set: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  money: '<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/></svg>',
  today: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  box: '<svg viewBox="0 0 24 24"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg>',
  online: '<svg viewBox="0 0 24 24"><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/><path d="M1.5 9a15 15 0 0 1 21 0"/></svg>',
  bot: '<svg viewBox="0 0 24 24"><path d="M9.8 15.3 9.4 20c.6 0 .8-.3 1.1-.6l2.7-2.5 5.5 4c1 .6 1.7.3 2-.9l3.6-16.8c.3-1.5-.5-2.1-1.5-1.7L1.6 9.6c-1.4.6-1.4 1.4-.2 1.8l5.5 1.7L19.6 5c.6-.4 1.2-.2.7.2"/></svg>',
  site: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  out: '<svg viewBox="0 0 24 24"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
};

/* ---------------------------- utils ---------------------------- */
async function api(url, { method = 'GET', body } = {}) {
  const headers = { Authorization: 'Bearer ' + token };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let r;
  try { r = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined }); }
  catch { throw new Error('Server bilan aloqa yoʻq'); }
  const data = await r.json().catch(() => ({}));
  if (r.status === 401) { location.href = '/kirish'; throw new Error('Kirish kerak'); }
  if (!r.ok) throw new Error(data.error || 'Xatolik');
  return data;
}
function toast(msg, type = 'ok', ms = 3000) {
  const t = document.createElement('div'); t.className = 'toast ' + type;
  t.innerHTML = `<i>${type === 'ok' ? '✓' : type === 'err' ? '!' : 'i'}</i><span>${h(msg)}</span>`;
  $('#toasts').appendChild(t); setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, ms);
}
function openModal(html, wide = true) { $('#modalBody').innerHTML = html; $('#modal .modal-box').className = 'modal-box' + (wide ? ' wide' : ''); $('#modal').classList.add('open'); }
function closeModal() { $('#modal').classList.remove('open'); }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', (e) => e.key === 'Escape' && closeModal());
function loading(b, on) { if (!b) return; if (on) { b.dataset.html = b.innerHTML; b.innerHTML = '<span class="spin"></span>'; b.disabled = true; } else { b.innerHTML = b.dataset.html; b.disabled = false; } }
function confirmBox(text) {
  return new Promise((res) => {
    openModal(`<h3>Tasdiqlang</h3><p class="muted" style="margin-bottom:22px">${h(text)}</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" id="cNo">Bekor</button><button class="btn btn-gold btn-sm" id="cYes" style="background:var(--red);color:#fff">Ha, davom etish</button></div>`, false);
    $('#cNo').onclick = () => { closeModal(); res(false); }; $('#cYes').onclick = () => { closeModal(); res(true); };
  });
}
function readFile(file, maxSide = 1800, q = 0.88) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      if (!file.type.startsWith('image/') || file.type === 'image/gif') return res(r.result);
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, maxSide / Math.max(img.width, img.height)); const w = Math.round(img.width * k), hh = Math.round(img.height * k);
        const c = document.createElement('canvas'); c.width = w; c.height = hh; const x = c.getContext('2d');
        if (file.type !== 'image/png') { x.fillStyle = '#fff'; x.fillRect(0, 0, w, hh); }
        x.drawImage(img, 0, 0, w, hh);
        res(file.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', q));
      };
      img.onerror = rej; img.src = r.result;
    };
    r.onerror = rej; r.readAsDataURL(file);
  });
}
function imageColor(url) {
  return new Promise((res) => {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 60; const x = c.getContext('2d');
      const w = img.width, hh = img.height; x.drawImage(img, w * 0.3, hh * 0.3, w * 0.4, hh * 0.4, 0, 0, 60, 60);
      const d = x.getImageData(0, 0, 60, 60).data; let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
      const hx = (v) => Math.round(v / n).toString(16).padStart(2, '0'); res('#' + hx(r) + hx(g) + hx(b));
    };
    img.onerror = () => res(null); img.src = url;
  });
}
function pickFiles({ multiple = false, accept = 'image/*' } = {}) {
  return new Promise((res) => {
    const f = $('#filePick'); f.value = ''; f.multiple = multiple; f.accept = accept;
    f.onchange = () => res([...f.files]); f.click();
  });
}
async function uploadFiles(files, btn) {
  const out = [];
  if (btn) loading(btn, true);
  try {
    for (const f of files) {
      if (f.size > 150 * 1024 * 1024) { toast(f.name + ' — juda katta (max 150MB)', 'err'); continue; }
      if (f.type.startsWith('video/')) toast('Video yuklanmoqda… biroz kuting', 'info', 4000);
      if (A.hosting === undefined) A.hosting = (await api('/api/settings').catch(() => ({}))).hosting || 'local';
      if (A.hosting === 'vercel' && (f.type.startsWith('video/') || f.size > 3 * 1024 * 1024 && !f.type.startsWith('image/'))) {
        // Vercel: katta fayl toʻgʻridan-toʻgʻri Google Drive'ga (yoki Blob'ga) yuklanadi — server orqali emas
        const gd = await api('/api/admin/gd-upload', { method: 'POST', body: { name: f.name, type: f.type, size: f.size } }).catch(() => null);
        if (gd?.url) {
          const up = await fetch(gd.url, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f });
          const j = await up.json().catch(() => ({}));
          if (!up.ok || !j.id) throw new Error('Google Drive’ga yuklab boʻlmadi (' + up.status + ')');
          out.push(await api('/api/admin/gd-upload/done', { method: 'POST', body: { name: gd.name, id: j.id, type: f.type, size: f.size, label: f.name } }));
          continue;
        }
        const t = await api('/api/admin/blob-token', { method: 'POST', body: { name: f.name } });
        const { put } = await import('https://esm.sh/@vercel/blob@1');
        const r = await put(t.pathname, f, { access: 'public', token: t.token, contentType: f.type });
        out.push(await api('/api/admin/media/register', { method: 'POST', body: { name: t.name, url: r.url, type: f.type, size: f.size, label: f.name } }));
        continue;
      }
      const data = await readFile(f);
      out.push(await api('/api/admin/upload', { method: 'POST', body: { data, name: f.name } }));
    }
  } catch (e) { toast(e.message, 'err'); }
  if (btn) loading(btn, false);
  return out;
}
function chime() {
  try { const ac = new AudioContext(); [660, 990, 1320].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; const t = ac.currentTime + i * 0.13; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.5); }); } catch {}
}
const STATUS = { pending: ['Kutilmoqda', 'st-pending'], confirmed: ['Tasdiqlangan', 'st-confirmed'], delivered: ['Yetkazilgan', 'st-delivered'], rejected: ['Rad etilgan', 'st-rejected'] };
const badge = (s) => `<span class="status ${STATUS[s]?.[1]}">${STATUS[s]?.[0] || s}</span>`;
const MODEL3D = [['suit', 'Kostyum (pidjak + shim)'], ['pants', 'Shim'], ['shirt', 'Koʻylak'], ['shoes', 'Oyoq kiyim'], ['belt', 'Remen / tasma'], ['coat', 'Palto / qishki']];
const SIZE_SETS = { clothes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'], shoes: ['38', '39', '40', '41', '42', '43', '44', '45', '46'], belt: ['90', '95', '100', '105', '110', '115', '120', '125'] };

/* ---------------------------- state ---------------------------- */
const A = { view: 'dash', cats: [], products: [], orders: [], settings: {}, stats: null, pendingSeen: null, orderFilter: 'all' };

/* ---------------------------- layout --------------------------- */
const NAV = [['dash', 'Boshqaruv paneli', I.dash], ['orders', 'Buyurtmalar', I.orders], ['products', 'Mahsulotlar', I.prod], ['cats', 'Kategoriyalar', I.cat], ['users', 'Foydalanuvchilar', I.users], ['media', 'Media', I.media], ['ai', 'AI yordamchi', '<span class="msi nav-ai">auto_awesome</span>'], ['settings', 'Sozlamalar', I.set]];
function shell() {
  $('#root').innerHTML = `<div class="a-wrap">
    <aside class="a-side" id="side">
      <a href="/" class="logo"><div class="logo-mark"><img src="/img/logo-96.png" alt="GH"></div><div class="logo-text" style="font-size:17px">Gentleman<small>ADMIN PANEL</small></div></a>
      <nav class="a-nav">${NAV.map(([k, t, ic]) => `<button data-v="${k}">${ic}<span>${t}</span>${k === 'orders' ? '<span class="cnt hidden" id="pendCnt">0</span>' : ''}</button>`).join('')}</nav>
      <div class="a-side-foot"><a href="/" target="_blank">${I.site} Saytni ochish</a><button id="logout">${I.out} Chiqish</button></div>
    </aside>
    <main class="a-main"><div class="a-top"><button class="icon-btn a-burger" id="burger">${I.menu}</button><h1 id="vTitle"></h1><div class="sp"></div><button class="a-alert hidden" id="issBtn" title="Tizim ogohlantirishlari"><span class="msi fill">notifications_active</span><b id="issCnt">0</b></button><button class="live" id="live" title="Kim onlayn?"><i></i><span>0 onlayn</span><span class="msi">expand_more</span></button></div><div id="view"></div></main>
  </div>`;
  $$('.a-nav button').forEach((b) => (b.onclick = () => { go(b.dataset.v); $('#side').classList.remove('open'); }));
  $('#burger').onclick = (e) => { e.stopPropagation(); $('#side').classList.toggle('open'); };
  document.addEventListener('click', (e) => { if (!e.target.closest('#side')) $('#side')?.classList.remove('open'); });
  $('#live').onclick = (e) => { e.stopPropagation(); onlinePanel(); };
  $('#issBtn').onclick = () => { go('dash'); setTimeout(() => $('#healthCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500); };
  if (!$('#siteBg')) { const b = document.createElement('div'); b.id = 'siteBg'; b.innerHTML = '<i class="o1"></i><i class="o2"></i><i class="o3"></i><div class="sb-grain"></div>'; document.body.prepend(b); }
  $('#logout').onclick = async () => { try { await api('/api/auth/logout', { method: 'POST' }); } catch {} localStorage.removeItem('gh_token'); location.href = '/kirish'; };
  $$('.a-top svg, .a-side svg').forEach((s) => s.setAttribute('stroke-linecap', 'round'));
}
function go(v) {
  A.view = v; const keep = !A.booted ? location.search : ''; A.booted = true; history.replaceState({}, '', '/admin' + (v === 'dash' ? '' : '/' + v) + keep);
  $$('.a-nav button').forEach((b) => b.classList.toggle('active', b.dataset.v === v));
  $('#vTitle').textContent = NAV.find((n) => n[0] === v)?.[1] || '';
  const el = $('#view'); el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'pageIn .5s var(--ease) both';
  V[v](el).catch((e) => toast(e.message, 'err'));
}

/* ============================ VIEWS ============================ */
const V = {};

V.dash = async (el) => {
  el.innerHTML = '<div class="stats">' + Array(6).fill('<div class="stat skel" style="height:140px"></div>').join('') + '</div>';
  const [s, allO] = await Promise.all([api('/api/admin/stats'), api('/api/admin/orders').catch(() => [])]); A.stats = s; updateLive(s); A.orders = allO;
  const alerts = allO.filter((o) => o.ai && o.ai.verdict !== 'ok' && o.status === 'pending');
  const aiChecked = allO.filter((o) => o.ai && o.ai.verdict !== 'error');
  const max = Math.max(1, ...s.days.map((d) => d.revenue));
  el.innerHTML = `
  ${alerts.length ? `<div class="ai-alert"><div class="ai-alert-h"><span class="msi fill">gpp_maybe</span><div><b>AI ogohlantirish: ${alerts.length} ta shubhali chek</b><small>Tasdiqlashdan oldin tekshirib chiqing</small></div></div>
    ${alerts.slice(0, 6).map((o) => `<button class="ai-alert-row" data-ao="${o.id}">${aiBadge(o.ai)}<b>#${o.number} • ${h(o.customer.name)}</b><span>${h(o.ai.summary || '')}</span><em>${fmt(o.total)}</em></button>`).join('')}</div>` : ''}
  <div class="stats">
    <div class="stat" style="--c:rgba(201,162,78,.25)"><div class="ic">${I.money}</div><span>Jami savdo</span><b>${fmt(s.revenue)}</b><small>Tasdiqlangan buyurtmalar</small></div>
    <div class="stat" style="--c:rgba(52,195,143,.2);animation-delay:.05s"><div class="ic">${I.today}</div><span>Bugungi savdo</span><b>${fmt(s.revenueToday)}</b><small>${new Date().toLocaleDateString('ru-RU')}</small></div>
    <div class="stat" style="--c:rgba(91,141,239,.2);animation-delay:.1s"><div class="ic">${I.box}</div><span>Sotilgan mahsulot</span><b>${s.itemsSold} dona</b><small>${s.products} ta mahsulot katalogda</small></div>
    <div class="stat" style="--c:rgba(234,179,8,.22);animation-delay:.15s"><div class="ic">${I.orders}</div><span>Buyurtmalar</span><b>${s.orders.total}</b><small><span style="color:#facc15">${s.orders.pending} kutilmoqda</span> • ${s.orders.confirmed + s.orders.delivered} tasdiqlangan</small></div>
    <div class="stat" style="--c:rgba(201,162,78,.2);animation-delay:.2s"><div class="ic">${I.users}</div><span>Roʻyxatdan oʻtganlar</span><b>${s.users.total} kishi</b><small>+${s.users.newWeek} shu hafta</small></div>
    <div class="stat" style="--c:rgba(52,195,143,.28);animation-delay:.25s"><div class="ic">${I.online}</div><span>Hozir onlayn</span><b id="onStatB"><span class="dot-on ${s.online.total ? 'on' : ''}"></span>${s.online.total} kishi</b><small id="onStatS">${s.online.users} aʼzo • ${s.online.guests} mehmon</small></div>
  </div>
  <div class="grid2">
    <div class="card"><div class="card-h"><h3>Soʻnggi 14 kunlik savdo</h3><a class="btn btn-dark btn-sm" href="/api/admin/export.csv" id="csv">Excel (CSV) yuklab olish</a></div>
      <div class="chart">${s.days.map((d, i) => `<div class="bar"><i style="height:${Math.max(1.5, (d.revenue / max) * 100)}%;animation-delay:${i * 0.04}s" data-v="${fmt(d.revenue)} • ${d.orders} ta"></i><span>${d.date.slice(8)}.${d.date.slice(5, 7)}</span></div>`).join('')}</div></div>
    <div class="card"><div class="card-h"><h3>Telegram bot</h3>${s.bot.running ? '<span class="status st-confirmed">Ishlayapti</span>' : '<span class="status st-rejected">Ulanmagan</span>'}</div>
      ${s.bot.running ? `<p style="margin-bottom:8px">Bot: <b class="gold">@${h(s.bot.username)}</b></p><p class="muted" style="font-size:13.5px">Admin chatlar: <b>${s.bot.admins}</b> ta. ${s.bot.admins ? 'Buyurtmalar Telegramga keladi ✓' : 'Botga <code>/admin parol</code> yozing!'}</p>` :
      `<p class="muted" style="font-size:13.5px;margin-bottom:14px">${s.bot.error ? 'Xato: ' + h(s.bot.error) : 'Bot tokeni kiritilmagan. Buyurtmalar hozircha faqat admin panelda koʻrinadi.'}</p>`}
      <button class="btn btn-gold btn-sm" style="margin-top:16px" id="toBot">${I.bot} Botni sozlash</button></div>
  </div>
  <div class="card health" id="healthCard"><div class="card-h"><h3><span class="msi fill" style="color:var(--gold);font-size:24px">monitor_heart</span> Tizim holati</h3><div style="display:flex;gap:10px;align-items:center"><span class="h-badge" id="healthBadge">…</span><button class="btn btn-gold btn-sm" id="hRun"><span class="msi">refresh</span> Hozir tekshirish</button></div></div><div id="healthBody"><div class="skel" style="height:120px"></div></div></div>
  <div class="card ai-dash"><div class="card-h"><h3><span class="msi fill" style="color:var(--gold);font-size:22px">auto_awesome</span> AI chek tekshiruvi hisoboti</h3>${A.settingsAi ? '' : ''}<button class="btn btn-dark btn-sm" id="toAi">Sozlash</button></div>
    <div class="ai-stats">${[['ok', 'Toʻgʻri'], ['warning', 'Shubhali'], ['fake', 'Soxta'], ['error', 'Xato']].map(([k, t]) => `<div class="${AIV[k][1]}"><span class="msi fill">${AIV[k][2]}</span><b>${allO.filter((o) => o.ai?.verdict === k).length}</b><small>${t}</small></div>`).join('')}<div><span class="msi">schedule</span><b>${allO.filter((o) => !o.ai).length}</b><small>Tekshirilmagan</small></div></div>
    <p class="muted" style="font-size:13px;margin-top:12px">${aiChecked.length ? `Jami ${aiChecked.length} ta chek AI tomonidan tekshirildi. Har bir yangi buyurtma cheki avtomatik tekshiriladi va natija shu yerga hamda Telegram botga keladi.` : (s.aiReady ? 'AI ulangan ✓ Yangi buyurtma kelishi bilan chek avtomatik tekshiriladi. Eski buyurtmalarni buyurtma ichidagi “AI bilan tekshirish” tugmasi orqali tekshirish mumkin.' : 'Google AI Studio’dan olingan Gemini API kalitini Sozlamalarga kiriting — har bir chek avtomatik tekshiriladi.')}</p></div>
  <div class="grid2">
    <div class="card"><div class="card-h"><h3>Soʻnggi savdolar</h3><button class="btn btn-dark btn-sm" data-go="orders">Barchasi</button></div>
      ${s.recent.length ? s.recent.map((r) => `<div class="list-row"><div class="t"><b>#${r.number} — ${h(r.name)}</b><span>${h(r.items.join(', '))}</span><br><span>${dt(r.at)}</span></div><em class="gold">${fmt(r.total)}</em></div>`).join('') : '<p class="muted">Hali tasdiqlangan savdo yoʻq</p>'}</div>
    <div class="card"><div class="card-h"><h3>Eng koʻp sotilganlar</h3></div>
      ${s.top.length ? s.top.map((t, i) => `<div class="list-row"><b style="width:22px;color:var(--gold)">${i + 1}</b><img src="${h(t.image)}" alt=""><div class="t"><b>${h(t.name)}</b><span>${t.qty} dona sotildi</span></div><em>${fmt(t.sum)}</em></div>`).join('') : '<p class="muted">Hali maʼlumot yoʻq</p>'}</div>
  </div>`;
  $('#csv').onclick = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/admin/export.csv', { headers: { Authorization: 'Bearer ' + token } }); const b = await r.blob();
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'gentleman-savdolar.csv'; a.click();
  };
  drawHealth(); clearInterval(A.hT); A.hT = setInterval(() => { if (A.view === 'dash' && $('#healthBody')) drawHealth(); else clearInterval(A.hT); }, 15000);
  $('#hRun').onclick = async (e) => { const b = e.currentTarget; loading(b, true); await drawHealth(true); loading(b, false); toast('Tekshiruv tugadi'); };
  $('#toAi').onclick = () => { go('settings'); setTimeout(() => $('#sec-ai')?.scrollIntoView({ behavior: 'smooth' }), 400); };
  $('#toBot').onclick = () => { go('settings'); setTimeout(() => $('#sec-bot')?.scrollIntoView({ behavior: 'smooth' }), 400); };
  $$('[data-go]').forEach((b) => (b.onclick = () => go(b.dataset.go)));
  $$('[data-ao]').forEach((b) => (b.onclick = () => orderDetail(allO.find((o) => o.id === b.dataset.ao))));
};

const AIV = { ok: ['Chek toʻgʻri', 'ai-ok', 'verified'], warning: ['Shubhali chek', 'ai-warn', 'warning'], fake: ['Soxta / mos emas', 'ai-bad', 'gpp_bad'], error: ['Tekshirilmadi', 'ai-err', 'error'] };
const aiBadge = (a) => a ? `<span class="ai-badge ${AIV[a.verdict]?.[1] || ''}" title="AI: ${h(a.summary || '')}"><span class="msi">${AIV[a.verdict]?.[2] || 'smart_toy'}</span>AI: ${AIV[a.verdict]?.[0] || a.verdict}</span>` : '';
function aiReport(o) {
  const a = o.ai;
  if (!a) return `<div class="ai-box ai-none"><div class="ai-h"><span class="msi">smart_toy</span><b>AI tekshiruv</b></div><p class="muted">Bu chek hali AI tomonidan tekshirilmagan.</p><button class="btn btn-dark btn-sm" id="aiRun"><span class="msi">auto_awesome</span> AI bilan tekshirish</button></div>`;
  const row = (t, ok, v) => `<div class="ai-row"><span class="msi ${ok === true ? 'g' : ok === false ? 'r' : 'y'}">${ok === true ? 'check_circle' : ok === false ? 'cancel' : 'help'}</span><span>${t}</span><b>${v ?? '—'}</b></div>`;
  return `<div class="ai-box ${AIV[a.verdict]?.[1] || ''}">
    <div class="ai-h"><span class="msi fill">${AIV[a.verdict]?.[2] || 'smart_toy'}</span><div><b>AI: ${AIV[a.verdict]?.[0] || a.verdict}</b><small>${a.confidence ? a.confidence + '% ishonch • ' : ''}${dt(a.checkedAt)}</small></div>${a.confidence ? `<div class="ai-meter"><i style="width:${a.confidence}%"></i></div>` : ''}</div>
    ${a.summary ? `<p class="ai-sum">${h(a.summary)}</p>` : ''}
    ${a.verdict !== 'error' ? `<div class="ai-rows">${row('Toʻlov cheki', a.isReceipt, a.isReceipt ? 'Ha' : 'Yoʻq')}${row('Muvaffaqiyatli', a.success, a.success ? 'Ha' : 'Yoʻq')}${row('Summa', a.amountOk, a.amount != null ? fmt(a.amount) : null)}${row('Karta', a.cardOk, a.cardLast4 ? '•••• ' + h(a.cardLast4) : null)}${row('Sana', a.dateOk, a.date ? h(a.date) : null)}${row('Tahrirlanmagan', !a.edited, a.edited ? 'Montaj belgisi' : 'Toza')}</div>` : ''}
    ${(a.issues || []).length ? `<ul class="ai-issues">${a.issues.map((x) => `<li>${h(x)}</li>`).join('')}</ul>` : ''}
    <button class="btn btn-dark btn-sm" id="aiRun"><span class="msi">refresh</span> Qayta tekshirish</button></div>`;
}

V.orders = async (el) => {
  el.innerHTML = '<div class="skel" style="height:300px"></div>';
  A.orders = await api('/api/admin/orders');
  const cnt = (s) => A.orders.filter((o) => s === 'all' || o.status === s).length;
  el.innerHTML = `<div class="toolbar"><div class="chips" style="margin:0">${[['all', 'Hammasi'], ['pending', 'Kutilmoqda'], ['confirmed', 'Tasdiqlangan'], ['delivered', 'Yetkazilgan'], ['rejected', 'Rad etilgan']].map(([k, t]) => `<button class="chip ${A.orderFilter === k ? 'active' : ''}" data-f="${k}">${t} (${cnt(k)})</button>`).join('')}</div>
    <div class="search-box"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input class="input" id="oq" placeholder="Raqam, ism yoki telefon..."></div></div><div id="olist"></div>`;
  const draw = () => {
    const q = $('#oq').value.toLowerCase();
    const l = A.orders.filter((o) => (A.orderFilter === 'all' || o.status === A.orderFilter) && (!q || `${o.number} ${o.customer.name} ${o.customer.phone} ${o.userEmail}`.toLowerCase().includes(q)));
    $('#olist').innerHTML = l.length ? l.map((o, i) => `<div class="o-card ${o.status}" data-o="${o.id}" style="animation-delay:${Math.min(i, 10) * 0.03}s">
      <div class="o-imgs">${o.items.slice(0, 3).map((it) => `<img src="${h(it.image)}" alt="">`).join('')}</div>
      <div class="t"><b>#${o.number} • ${h(o.customer.name)}</b><p>${h(o.customer.phone)} • ${o.items.map((i) => `${h(i.name)} (${h(i.size || '—')}) ×${i.qty}`).join(', ')}</p><p>${o.location.type === 'map' ? '📍 Xaritada belgilangan' : '✍️ ' + h(o.location.address).slice(0, 60)} • ${dt(o.createdAt)}</p></div>
      <div class="r"><b>${fmt(o.total)}</b>${badge(o.status)}${aiBadge(o.ai)}</div></div>`).join('') : `<div class="empty"><h3>Buyurtma topilmadi</h3></div>`;
    $$('[data-o]').forEach((c) => (c.onclick = () => orderDetail(A.orders.find((o) => o.id === c.dataset.o))));
  };
  $$('[data-f]').forEach((b) => (b.onclick = () => { A.orderFilter = b.dataset.f; $$('[data-f]').forEach((x) => x.classList.toggle('active', x === b)); draw(); }));
  $('#oq').oninput = draw; draw();
};
function orderDetail(o) {
  const L = o.location; const img = `/files/checks/${o.checkImage}?t=${token}`;
  openModal(`<h3>Buyurtma #${o.number} ${badge(o.status)}</h3>
  <div class="od-grid">
    <div>
      <div class="kv"><span>Mijoz</span><b>${h(o.customer.name)}</b><span>Telefon</span><a class="gold" href="tel:${h(o.customer.phone)}">${h(o.customer.phone)}</a>
      ${o.customer.phone2 ? `<span>Qoʻsh. tel</span><a class="gold" href="tel:${h(o.customer.phone2)}">${h(o.customer.phone2)}</a>` : ''}
      <span>Email</span><span style="color:var(--text)">${h(o.userEmail)}</span><span>Sana</span><span style="color:var(--text)">${dt(o.createdAt)}</span>
      <span>Manzil</span><span style="color:var(--text)">${L.type === 'map' ? '📍 Xaritada belgilangan' : '✍️ Qoʻlda yozilgan'}${L.address ? '<br>' + h(L.address) : ''}${L.lat != null ? `<br><a class="gold" target="_blank" href="https://maps.google.com/?q=${L.lat},${L.lng}">Google Maps’da ochish</a>` : ''}</span>
      ${o.note ? `<span>Izoh</span><span style="color:var(--text)">${h(o.note)}</span>` : ''}</div>
      ${L.lat != null ? `<iframe style="width:100%;height:200px;border:0;border-radius:14px;margin-bottom:16px" loading="lazy" src="https://maps.google.com/maps?q=${L.lat},${L.lng}&z=16&output=embed"></iframe>` : ''}
      ${o.items.map((i) => `<div class="list-row"><img src="${h(i.image)}" alt=""><div class="t"><b>${h(i.name)}</b><span>Razmer: <span class="gold" style="font-weight:800">${h(i.size || '—')}</span> • ${i.qty} dona • ${fmt(i.price)}</span></div><em>${fmt(i.sum)}</em></div>`).join('')}
      ${o.delivery != null ? `<div class="sum-row" style="margin-top:14px"><span>Mahsulotlar</span><span>${fmt(o.subtotal ?? o.total - o.delivery)}</span></div><div class="sum-row"><span>Yetkazib berish</span><span>${o.delivery ? fmt(o.delivery) : 'Bepul'}</span></div>` : ''}
      <div class="sum-row total" style="margin-top:${o.delivery != null ? 0 : 14}px"><span>Jami</span><b>${fmt(o.total)}</b></div>
      ${(o.history || []).length ? `<p class="muted" style="font-size:12px">${o.history.map((x) => `${STATUS[x.status]?.[0]} — ${dt(x.at)}${x.by ? ' (' + h(x.by) + ')' : ''}`).join('<br>')}</p>` : ''}
    </div>
    <div>${aiReport(o)}<div class="opt-label">Toʻlov cheki</div><a class="od-check" href="${img}" target="_blank"><img src="${img}" alt="chek"></a>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px">
        ${o.status === 'pending' ? `<button class="btn btn-gold" data-st="confirmed">✅ Chek toʻgʻri — Tasdiqlash</button><button class="btn btn-ghost" data-st="rejected" style="border-color:rgba(239,68,68,.6);color:#f87171">❌ Rad etish (soxta chek)</button>` : ''}
        ${o.status === 'confirmed' ? `<button class="btn btn-gold" data-st="delivered">🚚 Yetkazib berildi</button>` : ''}
        ${o.status !== 'pending' ? `<button class="btn btn-dark btn-sm" data-st="pending">Kutilmoqda holatiga qaytarish</button>` : ''}
        <button class="btn btn-dark btn-sm" id="delO" style="color:#f87171">Buyurtmani oʻchirish</button>
      </div><p class="muted" style="font-size:12px;margin-top:10px">Tasdiqlansa, mijozga 🔔 “Buyurtmangiz tasdiqlandi, tez orada yetib boradi” xabari boradi.</p></div>
  </div>`);
  $$('[data-st]').forEach((b) => (b.onclick = async () => {
    loading(b, true);
    try { await api('/api/admin/orders/' + o.id, { method: 'PATCH', body: { status: b.dataset.st } }); toast('Holat yangilandi: ' + STATUS[b.dataset.st][0]); closeModal(); refreshCounts(); if (A.view === 'orders') V.orders($('#view')); }
    catch (e) { toast(e.message, 'err'); loading(b, false); }
  }));
  if (o.ai && !o.ai.seen && o.ai.verdict !== 'ok') api('/api/admin/orders/' + o.id + '/ai-seen', { method: 'POST' }).catch(() => {});
  $('#aiRun').onclick = async (e) => {
    const b = e.currentTarget; loading(b, true);
    try { const r = await api('/api/admin/orders/' + o.id + '/ai-check', { method: 'POST' }); toast('AI: ' + (AIV[r.ai?.verdict]?.[0] || 'tayyor')); const i = (A.orders || []).findIndex((x) => x.id === o.id); if (i >= 0) A.orders[i] = r.order; closeModal(); setTimeout(() => orderDetail(r.order), 250); if (A.view === 'orders') V.orders($('#view')); }
    catch (err) { toast(err.message, 'err'); loading(b, false); }
  };
  $('#delO').onclick = async () => { if (await confirmBox(`#${o.number} buyurtmani butunlay oʻchirasizmi?`)) { await api('/api/admin/orders/' + o.id, { method: 'DELETE' }); toast('Oʻchirildi'); V.orders($('#view')); } };
}

V.products = async (el) => {
  el.innerHTML = '<div class="skel" style="height:300px"></div>';
  [A.products, A.cats] = await Promise.all([api('/api/admin/products'), api('/api/categories')]);
  let cf = 'all';
  el.innerHTML = `<div class="toolbar"><div class="chips" style="margin:0" id="pcf"></div><button class="btn btn-gold btn-sm" id="newP">${I.plus} Yangi mahsulot</button></div>
    <div class="search-box" style="max-width:none;margin-bottom:20px"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input class="input" id="pq" placeholder="Mahsulot qidirish..."></div><div class="prod-grid" id="plist"></div>`;
  $$('#newP svg').forEach((s) => (s.style.cssText = 'width:18px;stroke:currentColor;fill:none;stroke-width:2'));
  const draw = () => {
    $('#pcf').innerHTML = [['all', 'Hammasi'], ...A.cats.map((c) => [c.id, c.name])].map(([k, t]) => `<button class="chip ${cf === k ? 'active' : ''}" data-c="${k}">${h(t)} (${A.products.filter((p) => k === 'all' || p.categoryId === k).length})</button>`).join('');
    $$('#pcf [data-c]').forEach((b) => (b.onclick = () => { cf = b.dataset.c; draw(); }));
    const q = $('#pq').value.toLowerCase();
    const l = A.products.filter((p) => (cf === 'all' || p.categoryId === cf) && (!q || p.name.toLowerCase().includes(q)));
    $('#plist').innerHTML = l.length ? l.map((p, i) => `<div class="ap ${p.active === false ? 'off' : ''}" style="animation-delay:${Math.min(i, 12) * 0.03}s"><div class="im"><img src="${h(p.images?.[0] || '')}" alt="">${p.featured ? '<span class="tag hot">Top</span>' : ''}${p.active === false ? '<span class="tag" style="left:auto;right:10px">Yashirin</span>' : ''}</div>
      <div class="bd"><span class="p-cat" style="font-size:10px">${h(p.category?.name || '')}</span><b>${h(p.name)}</b><div class="price"><b class="gold" style="font-size:15px">${fmt(p.price)}</b>${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ''}</div>
      <div class="meta"><span>Omborda: ${p.stock}</span><span>Sotildi: ${p.sold || 0}</span></div>
      <div class="acts"><button data-e="${p.id}">Tahrirlash</button><button data-t="${p.id}">${p.active === false ? 'Koʻrsatish' : 'Yashirish'}</button><button class="del" data-d="${p.id}">Oʻchirish</button></div></div></div>`).join('') : '<div class="empty" style="grid-column:1/-1"><h3>Mahsulot yoʻq</h3></div>';
    $$('[data-e]').forEach((b) => (b.onclick = () => productForm(A.products.find((p) => p.id === b.dataset.e))));
    $$('[data-t]').forEach((b) => (b.onclick = async () => { const p = A.products.find((x) => x.id === b.dataset.t); const r = await api('/api/admin/products/' + p.id, { method: 'PUT', body: { active: p.active === false } }); Object.assign(p, r); draw(); toast(r.active ? 'Saytda koʻrsatildi' : 'Saytdan yashirildi'); }));
    $$('[data-d]').forEach((b) => (b.onclick = async () => { const p = A.products.find((x) => x.id === b.dataset.d); if (!(await confirmBox(`“${p.name}” mahsulotini oʻchirasizmi?`))) return; await api('/api/admin/products/' + p.id, { method: 'DELETE' }); A.products = A.products.filter((x) => x !== p); draw(); toast('Oʻchirildi'); }));
  };
  $('#pq').oninput = draw; $('#newP').onclick = () => productForm(null, cf !== 'all' ? cf : null); draw();
};
function productForm(p, catId) {
  const isNew = !p;
  p = p ? JSON.parse(JSON.stringify(p)) : { name: '', price: '', oldPrice: '', description: '', images: [], sizes: [], categoryId: catId || A.cats[0]?.id, color3d: '#1d2a44', model3d: '', stock: 20, featured: false, active: true, video: '' };
  const catOf = () => A.cats.find((c) => c.id === p.categoryId);
  openModal(`<h3>${isNew ? 'Yangi mahsulot' : 'Mahsulotni tahrirlash'}</h3><form id="pf">
    <div class="field"><label>Rasmlar (birinchisi asosiy) — telefon yoki kompyuterdan</label><div class="imgs-edit" id="imgs"></div></div>
    <div class="row"><div class="field"><label>Nomi *</label><input class="input" name="name" value="${h(p.name)}" required></div>
      <div class="field"><label>Kategoriya *</label><select class="input" name="categoryId" id="pcat">${A.cats.map((c) => `<option value="${c.id}" ${c.id === p.categoryId ? 'selected' : ''}>${h(c.name)}</option>`).join('')}</select></div></div>
    <div class="row"><div class="field"><label>Narxi (soʻm) *</label><input class="input" name="price" type="number" min="0" value="${h(p.price)}" required></div>
      <div class="field"><label>Chegirma</label><div class="disc-box"><label class="switch-row" style="margin:0"><input type="checkbox" id="discOn" ${p.oldPrice > p.price ? 'checked' : ''}><span class="sw"></span> Chegirma qilish</label>
        <div class="disc-pct" id="discWrap" style="${p.oldPrice > p.price ? '' : 'display:none'}"><input class="input" id="discPct" type="number" min="1" max="90" value="${p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : ''}" placeholder="10"><span>%</span></div></div>
        <small class="muted" id="discInfo" style="font-size:12px"></small></div></div>
    <div class="field"><label>Tavsif</label><textarea class="input" name="description">${h(p.description)}</textarea></div>
    <div class="field"><label>Razmerlar <span style="text-transform:none;letter-spacing:0;font-weight:500">(bosib tanlang)</span></label><div class="size-pick" id="sp"></div>
      <div style="display:flex;gap:8px;margin-top:8px"><input class="input" id="spAdd" placeholder="Boshqa razmer qoʻshish (masalan 48)" style="height:42px"><button type="button" class="btn btn-dark btn-sm" id="spBtn">Qoʻshish</button></div></div>
    <div class="field"><label>Mahsulot videosi (telefon yoki kompyuterdan, max 150MB)</label>
      <div class="vid-edit" id="vidBox"></div><input type="hidden" name="video" id="vid" value="${h(p.video || '')}"></div>
    <div class="row"><div class="field"><label>Ombordagi soni</label><input class="input" name="stock" type="number" min="0" value="${h(p.stock)}"></div><div></div></div>
    <div style="display:flex;gap:26px;flex-wrap:wrap;margin:6px 0 22px"><label class="switch-t"><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}><i></i> Top (bosh sahifada)</label><label class="switch-t"><input type="checkbox" name="active" ${p.active !== false ? 'checked' : ''}><i></i> Saytda koʻrinsin</label></div>
    <div style="display:flex;gap:10px;justify-content:flex-end"><button type="button" class="btn btn-ghost" data-close>Bekor</button><button class="btn btn-gold" id="pSave">Saqlash</button></div>
  </form>`);
  const drawImgs = () => {
    $('#imgs').innerHTML = p.images.map((src, i) => `<div class="ie"><img src="${h(src)}" alt="">${i ? `<button type="button" class="mv" data-mv="${i}" title="Asosiy qilish">★</button>` : ''}<button type="button" data-ri="${i}">✕</button></div>`).join('') +
      `<button type="button" class="add" id="addImg">＋<br>Rasm yuklash</button><button type="button" class="add" id="fromMedia">Mediadan<br>tanlash</button>`;
    $$('[data-ri]').forEach((b) => (b.onclick = () => { p.images.splice(+b.dataset.ri, 1); drawImgs(); }));
    $$('[data-mv]').forEach((b) => (b.onclick = () => { const [x] = p.images.splice(+b.dataset.mv, 1); p.images.unshift(x); drawImgs(); }));
    $('#addImg').onclick = async (e) => { const files = await pickFiles({ multiple: true }); const up = await uploadFiles(files, e.currentTarget); p.images.push(...up.map((u) => u.url)); drawImgs(); };
    $('#fromMedia').onclick = () => mediaPicker((url) => { p.images.push(url); drawImgs(); });
  };
  const drawSizes = () => {
    const st = catOf()?.sizeType || 'clothes';
    const okSz = (x) => (st === 'shoes' || st === 'belt' ? /^\d{2,3}(\.5)?$/.test(x) : st !== 'none'); p.sizes = p.sizes.filter(okSz);
    const all = [...new Set([...(SIZE_SETS[st] || []), ...p.sizes])];
    $('#sp').innerHTML = all.map((s) => `<button type="button" class="${p.sizes.includes(s) ? 'on' : ''}" data-sz="${h(s)}">${h(s)}</button>`).join('') + (st === 'none' ? '<span class="muted" style="font-size:13px">Bu kategoriya razmersiz</span>' : '');
    $$('#sp [data-sz]').forEach((b) => (b.onclick = () => { const s = b.dataset.sz; p.sizes = p.sizes.includes(s) ? p.sizes.filter((x) => x !== s) : [...p.sizes, s]; const order = all; p.sizes.sort((a, b2) => order.indexOf(a) - order.indexOf(b2)); drawSizes(); }));
  };
  $('#spBtn').onclick = () => { const v = $('#spAdd').value.trim().toUpperCase(); const st = catOf()?.sizeType; if ((st === 'shoes' || st === 'belt') && !/^\d{2,3}(\.5)?$/.test(v)) return toast('Oyoq kiyim va remen uchun faqat raqamli razmer (masalan 42)', 'err'); if (v && !p.sizes.includes(v)) { p.sizes.push(v); $('#spAdd').value = ''; drawSizes(); } };
  $('#pcat').onchange = (e) => {
    const before = catOf()?.sizeType; p.categoryId = e.target.value; const after = catOf()?.sizeType;
    if (before !== after) p.sizes = after === 'none' ? [] : [...(SIZE_SETS[after] || [])].slice(1, -1);
    drawSizes();
  };
  const drawVid = () => {
    const v = $('#vid').value;
    $('#vidBox').innerHTML = (v ? `<div class="ve"><video src="${h(v)}" controls preload="metadata"></video><button type="button" id="vDel">✕ Videoni olib tashlash</button></div>` : '') +
      `<button type="button" class="add" id="vUp" style="width:auto;padding:0 22px;height:${v ? '46px' : '116px'}">＋ ${v ? 'Boshqa video yuklash' : 'Video yuklash (MP4)'}</button>`;
    const discUpd = () => { const on = $('#discOn').checked; $('#discWrap').style.display = on ? '' : 'none'; const pr = +$('[name=price]').value || 0, pc = +$('#discPct').value || 0;
      $('#discInfo').innerHTML = on && pc && pr ? `Saytda: <b class="gold">${fmt(pr)}</b> <s>${fmt(Math.round(pr * 100 / (100 - Math.min(90, pc))))}</s> • −${Math.min(90, pc)}%` : 'Chegirma yoʻq — saytda faqat narx koʻrinadi'; };
    $('#discOn').onchange = () => { if ($('#discOn').checked && !$('#discPct').value) $('#discPct').value = 10; discUpd(); }; $('#discPct').oninput = discUpd; $('[name=price]').oninput = discUpd; discUpd();
    $('#vUp').onclick = async (e) => { const f = await pickFiles({ accept: 'video/mp4,video/webm,video/quicktime' }); if (!f.length) return; const up = await uploadFiles(f, e.currentTarget); if (up[0]) { $('#vid').value = up[0].url; drawVid(); toast('Video yuklandi'); } };
    if ($('#vDel')) $('#vDel').onclick = () => { $('#vid').value = ''; drawVid(); };
  };
  drawVid();
  if (isNew && !p.sizes.length) p.sizes = [...(SIZE_SETS[catOf()?.sizeType] || [])].slice(1, -1);
  drawImgs(); drawSizes();
  $('#pf').onsubmit = async (e) => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
    if (!p.images.length) return toast('Kamida bitta rasm yuklang', 'err');
    const pct = $('#discOn').checked ? Math.min(90, Math.max(0, +$('#discPct').value || 0)) : 0;
    const body = { ...f, images: p.images, sizes: p.sizes, featured: !!f.featured, active: !!f.active, price: +f.price, oldPrice: pct ? Math.round((+f.price * 100) / (100 - pct)) : 0, stock: +f.stock };
    const b = $('#pSave'); loading(b, true);
    try {
      const r = await api('/api/admin/products' + (isNew ? '' : '/' + p.id), { method: isNew ? 'POST' : 'PUT', body });
      toast(isNew ? 'Mahsulot qoʻshildi' : 'Saqlandi'); closeModal(); V.products($('#view'));
    } catch (err) { toast(err.message, 'err'); loading(b, false); }
  };
}

V.cats = async (el) => {
  A.cats = await api('/api/categories');
  const prods = await api('/api/admin/products');
  el.innerHTML = `<div class="help">Kategoriyalar nomini, rasmini va tartibini oʻzgartiring. Masalan: <b>Kostyumlar, Shimlar, Koʻylaklar, Oyoq kiyimlar, Remenlar, Qishki kiyimlar</b>. “Razmer turi” — kiyim (S, M, L…), oyoq kiyim (39–45) yoki remen (95–120).</div>
    <div style="display:flex;justify-content:flex-end;margin-bottom:16px"><button class="btn btn-gold btn-sm" id="newC">＋ Yangi kategoriya</button></div>
    ${A.cats.map((c) => `<div class="cat-row"><img src="${h(c.image)}" alt=""><div><b style="font-family:var(--serif);font-size:24px">${h(c.name)}</b><p class="muted" style="font-size:13px">${h(c.subtitle || '')} • /katalog/${h(c.slug)} • ${prods.filter((p) => p.categoryId === c.id).length} ta mahsulot • tartib: ${c.order}</p></div>
      <div style="display:flex;gap:8px"><button class="btn btn-dark btn-sm" data-ce="${c.id}">Tahrirlash</button><button class="btn btn-dark btn-sm" data-cd="${c.id}" style="color:#f87171">Oʻchirish</button></div></div>`).join('')}`;
  $('#newC').onclick = () => catForm(null);
  $$('[data-ce]').forEach((b) => (b.onclick = () => catForm(A.cats.find((c) => c.id === b.dataset.ce))));
  $$('[data-cd]').forEach((b) => (b.onclick = async () => {
    const c = A.cats.find((x) => x.id === b.dataset.cd);
    if (!(await confirmBox(`“${c.name}” kategoriyasini oʻchirasizmi?`))) return;
    try { await api('/api/admin/categories/' + c.id, { method: 'DELETE' }); toast('Oʻchirildi'); V.cats(el); } catch (e) { toast(e.message, 'err'); }
  }));
};
function catForm(c) {
  const isNew = !c; c = c ? { ...c } : { name: '', subtitle: '', image: '', model3d: 'suit', sizeType: 'clothes', order: A.cats.length + 1, slug: '' };
  openModal(`<h3>${isNew ? 'Yangi kategoriya' : 'Kategoriyani tahrirlash'}</h3><form id="cf">
    <div class="field"><label>Rasm</label><div class="imgs-edit" id="cimg"></div></div>
    <div class="row"><div class="field"><label>Nomi *</label><input class="input" name="name" value="${h(c.name)}" required></div><div class="field"><label>Qisqa tavsif</label><input class="input" name="subtitle" value="${h(c.subtitle)}"></div></div>
    <div class="row"><div class="field"><label>URL (slug)</label><input class="input" name="slug" value="${h(c.slug)}" placeholder="avtomatik"></div><div class="field"><label>Tartib raqami</label><input class="input" type="number" name="order" value="${h(c.order)}"></div></div>
    <div class="field"><label>Sahifa fon rasmi (kategoriya ochilganda tepada chiqadi)</label><div class="imgs-edit" id="ccov"></div></div>
    <input type="hidden" name="model3d" value="${h(c.model3d || 'suit')}">
    <div class="row"><div></div>
      <div class="field"><label>Razmer turi</label><select class="input" name="sizeType">${[['clothes', 'Kiyim (S, M, L, XL...)'], ['shoes', 'Oyoq kiyim (39–45)'], ['belt', 'Remen (95–120)'], ['none', 'Razmersiz']].map(([k, t]) => `<option value="${k}" ${c.sizeType === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div></div>
    <div style="display:flex;gap:10px;justify-content:flex-end"><button type="button" class="btn btn-ghost" data-close>Bekor</button><button class="btn btn-gold" id="cSave">Saqlash</button></div></form>`);
  const draw = () => {
    $('#cimg').innerHTML = (c.image ? `<div class="ie" style="width:140px"><img src="${h(c.image)}"></div>` : '') + `<button type="button" class="add" id="cUp">＋<br>Yuklash</button><button type="button" class="add" id="cMed">Mediadan</button>`;
    $('#cUp').onclick = async (e) => { const f = await pickFiles(); const u = await uploadFiles(f, e.currentTarget); if (u[0]) { c.image = u[0].url; draw(); } };
    $('#cMed').onclick = () => mediaPicker((url) => { c.image = url; draw(); });
    $('#ccov').innerHTML = (c.cover ? `<div class="ie" style="width:220px;height:110px"><img src="${h(c.cover)}"><button type="button" id="cvX">✕</button></div>` : '') + `<button type="button" class="add" id="cvUp" style="height:110px">＋<br>Yuklash</button><button type="button" class="add" id="cvMed" style="height:110px">Mediadan</button>`;
    $('#cvUp').onclick = async (e) => { const f = await pickFiles(); const u = await uploadFiles(f, e.currentTarget); if (u[0]) { c.cover = u[0].url; draw(); } };
    $('#cvMed').onclick = () => mediaPicker((url) => { c.cover = url; draw(); });
    if ($('#cvX')) $('#cvX').onclick = () => { c.cover = ''; draw(); };
  };
  draw();
  $('#cf').onsubmit = async (e) => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); const b = $('#cSave'); loading(b, true);
    try { await api('/api/admin/categories' + (isNew ? '' : '/' + c.id), { method: isNew ? 'POST' : 'PUT', body: { ...f, image: c.image, cover: c.cover || '', order: +f.order } }); toast('Saqlandi'); closeModal(); V.cats($('#view')); }
    catch (err) { toast(err.message, 'err'); loading(b, false); }
  };
}

V.users = async (el) => {
  const users = await api('/api/admin/users');
  const on = users.filter((u) => u.online).length;
  el.innerHTML = `<div class="stats"><div class="stat"><div class="ic">${I.users}</div><span>Jami roʻyxatdan oʻtgan</span><b>${users.length} kishi</b></div><div class="stat"><div class="ic">${I.online}</div><span>Hozir onlayn (aʼzolar)</span><b><span class="dot-on on"></span>${on} kishi</b></div><div class="stat"><div class="ic">${I.money}</div><span>Xarid qilganlar</span><b>${users.filter((u) => u.spent > 0).length} kishi</b></div></div>
  <div class="card"><div class="card-h"><h3>Foydalanuvchilar</h3><div style="display:flex;gap:10px;flex-wrap:wrap"><input class="input" id="uq" placeholder="Qidirish..." style="height:42px;width:220px"><button class="btn btn-gold btn-sm" id="notifyAll">${I.bell} Hammaga xabar</button></div></div>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Foydalanuvchi</th><th>Telefon</th><th>Kirish</th><th>Buyurtma</th><th>Xarid</th><th>Roʻyxatdan</th><th>Oxirgi faollik</th><th></th></tr></thead><tbody id="ub"></tbody></table></div></div>`;
  $$('#notifyAll svg').forEach((s) => (s.style.cssText = 'width:17px;stroke:currentColor;fill:none;stroke-width:1.8'));
  const draw = () => {
    const q = $('#uq').value.toLowerCase();
    $('#ub').innerHTML = users.filter((u) => !q || (u.name + u.email + u.phone).toLowerCase().includes(q)).map((u) => `<tr style="${u.blocked ? 'opacity:.5' : ''}">
      <td><span class="dot-on ${u.online ? 'on' : ''}"></span><b>${h(u.name)}</b><br><span class="muted" style="font-size:12.5px;margin-left:15px">${h(u.email)}</span></td>
      <td>${h(u.phone || '—')}</td><td>${u.google ? 'Google' : 'Email'}</td><td>${u.orders}</td><td class="gold">${fmt(u.spent)}</td><td>${dt(u.createdAt)}</td><td>${u.online ? '<span style="color:var(--green)">Onlayn</span>' : dt(u.lastSeen)}</td>
      <td style="white-space:nowrap"><button class="btn btn-dark btn-sm" data-n="${u.id}" style="height:34px">Xabar</button> <button class="btn btn-dark btn-sm" data-b="${u.id}" style="height:34px">${u.blocked ? 'Blokdan chiqarish' : 'Bloklash'}</button> <button class="btn btn-dark btn-sm" data-ud="${u.id}" style="height:34px;color:#f87171">Oʻchirish</button></td></tr>`).join('') || '<tr><td colspan="8" class="muted" style="text-align:center;padding:40px">Hali foydalanuvchi yoʻq</td></tr>';
    $$('[data-b]').forEach((b) => (b.onclick = async () => { const u = users.find((x) => x.id === b.dataset.b); await api('/api/admin/users/' + u.id, { method: 'PATCH', body: { blocked: !u.blocked } }); u.blocked = !u.blocked; draw(); toast(u.blocked ? 'Bloklandi' : 'Blokdan chiqarildi'); }));
    $$('[data-n]').forEach((b) => (b.onclick = () => notifyForm(users.find((x) => x.id === b.dataset.n))));
    $$('[data-ud]').forEach((b) => (b.onclick = async () => { const u = users.find((x) => x.id === b.dataset.ud); if (!(await confirmBox(`${u.name} (${u.email}) hisobini oʻchirasizmi?`))) return; await api('/api/admin/users/' + u.id, { method: 'DELETE' }); users.splice(users.indexOf(u), 1); draw(); toast('Oʻchirildi'); }));
  };
  $('#uq').oninput = draw; $('#notifyAll').onclick = () => notifyForm(null); draw();
};
function notifyForm(u) {
  openModal(`<h3>${u ? h(u.name) + 'ga xabar' : 'Barcha foydalanuvchilarga xabar'}</h3><p class="muted" style="margin-bottom:16px">Xabar saytdagi 🔔 qoʻngʻiroqchada koʻrinadi.</p>
    <form id="nf"><div class="field"><label>Sarlavha</label><input class="input" name="title" required placeholder="Masalan: Yangi kolleksiya! 🎉"></div><div class="field"><label>Matn</label><textarea class="input" name="text" placeholder="Xabar matni"></textarea></div>
    <button class="btn btn-gold btn-block">Yuborish</button></form>`, false);
  $('#nf').onsubmit = async (e) => { e.preventDefault(); try { const r = await api('/api/admin/notify', { method: 'POST', body: { ...Object.fromEntries(new FormData(e.target)), userId: u?.id } }); toast(`${r.sent} kishiga yuborildi`); closeModal(); } catch (err) { toast(err.message, 'err'); } };
}

V.media = async (el) => {
  const list = await api('/api/admin/media');
  el.innerHTML = `<div class="help">Bu yerga rasm va videolarni yuklang (telefon yoki kompyuterdan). Ularni mahsulot, kategoriya va bosh sahifa rasmlarida ishlatish mumkin.</div>
  <div style="display:flex;justify-content:flex-end;margin-bottom:16px"><button class="btn btn-gold btn-sm" id="mUp">＋ Rasm / video yuklash</button></div>
  <div class="media-grid">${list.map((m) => `<div class="mi">${m.type?.startsWith('video') ? `<video src="${h(m.url)}" muted></video>` : `<img src="${h(m.url)}" loading="lazy">`}<div class="mb"><button data-cp="${h(m.url)}">URL nusxa</button><button data-md="${m.id}" style="color:#f87171">Oʻchirish</button></div></div>`).join('') || '<p class="muted">Hali media yoʻq</p>'}</div>`;
  $('#mUp').onclick = async (e) => { const f = await pickFiles({ multiple: true, accept: 'image/*,video/mp4,video/webm' }); const u = await uploadFiles(f, e.currentTarget); if (u.length) { toast(u.length + ' ta fayl yuklandi'); V.media(el); } };
  $$('[data-cp]').forEach((b) => (b.onclick = () => navigator.clipboard?.writeText(location.origin + b.dataset.cp).then(() => toast('URL nusxalandi'))));
  $$('[data-md]').forEach((b) => (b.onclick = async () => { if (await confirmBox('Faylni oʻchirasizmi? (Ishlatilayotgan joyda rasm yoʻqoladi)')) { await api('/api/admin/media/' + b.dataset.md, { method: 'DELETE' }); V.media(el); } }));
};
async function mediaPicker(cb) {
  const list = (await api('/api/admin/media')).filter((m) => m.type?.startsWith('image'));
  const back = $('#modalBody').innerHTML; // not restoring; picker opens on top as separate
  const ov = document.createElement('div'); ov.className = 'modal open'; ov.style.zIndex = 500;
  ov.innerHTML = `<div class="modal-box wide"><h3>Mediadan tanlash</h3><div class="media-grid">${list.map((m) => `<div class="mi pick" data-u="${h(m.url)}"><img src="${h(m.url)}"></div>`).join('') || '<p class="muted">Media boʻsh. Avval “Media” boʻlimiga yuklang.</p>'}</div><div style="text-align:right;margin-top:16px"><button class="btn btn-ghost btn-sm" id="mpX">Yopish</button></div></div>`;
  document.body.appendChild(ov);
  ov.onclick = (e) => { const it = e.target.closest('[data-u]'); if (it) { cb(it.dataset.u); ov.remove(); } else if (e.target === ov || e.target.id === 'mpX') ov.remove(); };
  void back;
}


V.ai = async (el) => {
  const hist = JSON.parse(localStorage.getItem('gh_admin_ai') || '[]').slice(-40);
  const fm = (t) => h(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|\n)#{1,3} (.+)/g, '$1<b class="gold">$2</b>').replace(/(^|\n)[-•*] (.+)/g, '$1<span class="ai-li">$2</span>').replace(/\n/g, '<br>');
  const CH = [['insights', 'Bu hafta savdo qanday?'], ['local_fire_department', 'Eng koʻp sotilgan mahsulot qaysi?'], ['campaign', 'Instagram uchun reklama post yozib ber'], ['edit_note', 'Kostyum uchun chiroyli tavsif yoz'], ['sell', 'Narxlar boʻyicha maslahat ber'], ['gpp_maybe', 'Shubhali cheklar bormi?']];
  el.innerHTML = `<div class="aia">
    <div class="aia-head"><div class="aia-orb"><span class="msi fill">auto_awesome</span></div><div><h2>AI yordamchi</h2><p class="muted">Savdo tahlili, reklama matni, mahsulot tavsifi, mijozlarga javob — hammasini soʻrang. Doʻkon statistikasi va buyurtmalarni biladi.</p></div><button class="btn btn-dark btn-sm" id="aiaNew"><span class="msi">restart_alt</span> Yangi suhbat</button></div>
    <div class="aia-body" id="aiaBody"></div>
    <div class="aia-chips" id="aiaChips"></div>
    <form class="aic-form aia-form" id="aiaForm"><textarea id="aiaIn" rows="1" placeholder="Masalan: oxirgi 14 kunda qaysi kun eng koʻp sotildi?"></textarea><button class="aic-send"><span class="msi fill">send</span></button></form></div>`;
  const body = $('#aiaBody'), inp = $('#aiaIn');
  const add = (m, anim = true) => { const d = document.createElement('div'); d.className = 'aic-m ' + (m.role === 'model' ? 'bot' : 'me') + (anim ? ' in' : ''); d.innerHTML = `<div class="aic-bub">${fm(m.text)}</div>${m.role === 'model' ? '<button class="aia-copy" title="Nusxa olish"><span class="msi">content_copy</span></button>' : ''}`;
    const c = d.querySelector('.aia-copy'); if (c) c.onclick = () => { navigator.clipboard?.writeText(m.text); toast('Nusxa olindi'); };
    body.appendChild(d); body.scrollTop = body.scrollHeight; return d; };
  const draw = () => { body.innerHTML = hist.length ? '' : `<div class="aic-hello"><div class="aic-hello-ic"><span class="msi fill">auto_awesome</span></div><b>Salom, admin! 👋</b><p>Men doʻkoningiz maʼlumotlarini koʻrib turibman. Pastdagi savollardan birini tanlang yoki oʻzingiz yozing.</p></div>`; hist.forEach((m) => add(m, false));
    $('#aiaChips').innerHTML = hist.length ? '' : CH.map(([i, t]) => `<button type="button" data-q="${h(t)}"><span class="msi">${i}</span>${h(t)}</button>`).join(''); $$('#aiaChips button').forEach((b) => (b.onclick = () => send(b.dataset.q))); };
  let busy = false;
  const send = async (q) => {
    q = (q || '').trim(); if (!q || busy) return; busy = true;
    if (!hist.length) { body.innerHTML = ''; $('#aiaChips').innerHTML = ''; }
    hist.push({ role: 'user', text: q }); add(hist.at(-1)); inp.value = ''; inp.style.height = '';
    const ty = document.createElement('div'); ty.className = 'aic-m bot in'; ty.innerHTML = '<div class="aic-bub aic-typing"><i></i><i></i><i></i></div>'; body.appendChild(ty); body.scrollTop = body.scrollHeight;
    try { const r = await api('/api/admin/ai/chat', { method: 'POST', body: { messages: hist.slice(-16) } }); ty.remove(); hist.push({ role: 'model', text: r.text }); add(hist.at(-1)); }
    catch (e) { ty.remove(); add({ role: 'model', text: '⚠️ ' + e.message }).classList.add('err'); hist.pop(); }
    localStorage.setItem('gh_admin_ai', JSON.stringify(hist.slice(-40))); busy = false; inp.focus();
  };
  $('#aiaForm').onsubmit = (e) => { e.preventDefault(); send(inp.value); };
  inp.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(inp.value); } };
  inp.oninput = () => { inp.style.height = ''; inp.style.height = Math.min(160, inp.scrollHeight) + 'px'; };
  $('#aiaNew').onclick = () => { hist.length = 0; localStorage.removeItem('gh_admin_ai'); draw(); };
  draw();
};

V.settings = async (el) => {
  const s = A.settings = await api('/api/admin/settings');
  const f = (k, label, ph = '', type = 'text') => `<div class="field"><label>${label}</label><input class="input" name="${k}" type="${type}" value="${h(s[k] ?? '')}" placeholder="${h(ph)}"></div>`;
  const ta = (k, label) => `<div class="field"><label>${label}</label><textarea class="input" name="${k}">${h(s[k] ?? '')}</textarea></div>`;
  const stats = await api('/api/admin/stats').catch(() => null);
  el.innerHTML = `<form id="sf">
  <div class="card set-sec"><div class="card-h"><h3>Sayt matnlari va bosh sahifa</h3></div>
    <div class="row">${f('siteName', 'Sayt nomi')}${f('tagline', 'Shior (tagline)')}</div>
    ${f('heroTitle', 'Bosh sahifa sarlavhasi')}${ta('heroSubtitle', 'Bosh sahifa matni')}
    <div class="field"><label>Bosh sahifa fon rasmlari (slayd, har 6 soniyada almashadi) — 1–8 ta</label><div class="imgs-edit" id="heroBgs"></div><small class="muted" style="font-size:12px">Fon rasmi boʻlmasa, pastdagi “Bosh sahifa rasmi” koʻrsatiladi. Yaxshisi keng (gorizontal) rasmlar.</small></div>
    <div class="field"><label>Bosh sahifa rasmi</label><div class="imgs-edit" id="heroImg"></div><input type="hidden" name="heroImage" value="${h(s.heroImage)}"></div>
    ${f('marquee', 'Yuguruvchi qator matni')}
    <div class="row">${f('aboutTitle', '“Biz haqimizda” sarlavha')}${f('deliveryNote', 'Yetkazib berish haqida')}</div>${ta('aboutText', '“Biz haqimizda” matni')}
  </div>
  <div class="card set-sec"><div class="card-h"><h3>Aloqa, manzil, lokatsiya</h3></div>
    <div class="field"><label>Telefon raqamlar</label><div class="phones-edit" id="phones"></div><button type="button" class="btn btn-dark btn-sm" id="addPh">＋ Raqam qoʻshish</button></div>
    <div class="row">${f('address', 'Manzil (matn)')}${f('workHours', 'Ish vaqti')}</div>
    <div class="row">${f('lat', 'Lokatsiya: kenglik (lat)', '41.3111', 'number" step="any')}${f('lng', 'Lokatsiya: uzunlik (lng)', '69.2406', 'number" step="any')}</div>
    <div class="help">Lokatsiyani olish: Google Maps’da doʻkoningizni bosing → pastda chiqqan <b>41.31…, 69.24…</b> raqamlarini yuqoriga yozing. <a class="gold" target="_blank" id="mapTest">Hozirgi lokatsiyani tekshirish →</a></div>
  </div>
  <div class="card set-sec"><div class="card-h"><h3>Ijtimoiy tarmoqlar</h3></div>
    ${f('instagram', 'Instagram havola', 'https://www.instagram.com/...')}
    <div class="row">${f('telegramSupport', 'Yordam uchun Telegram', 'https://t.me/...')}${f('adminTelegram', 'Admin Telegrami', '@username')}</div>
  </div>
  <div class="card set-sec"><div class="card-h"><h3>Toʻlov kartasi</h3></div>
    <div class="row">${f('cardNumber', 'Karta raqami', '8600 1234 5678 9012')}${f('cardHolder', 'Karta egasi (F.I.Sh)')}</div>${f('cardBank', 'Karta turi / bank', 'Uzcard / Humo / Visa')}
  </div>
  <div class="card set-sec" id="sec-delivery"><div class="card-h"><h3><span class="msi" style="color:var(--gold)">local_shipping</span> Yetkazib berish narxi</h3><span class="status ${+s.deliveryPrice ? 'st-confirmed' : 'st-pending'}">${+s.deliveryPrice ? fmt(s.deliveryPrice) : 'Bepul'}</span></div>
    <div class="row">${f('deliveryPrice', 'Yetkazib berish narxi (soʻm)', 'masalan 30000', 'number" min="0" step="1000')}${f('deliveryFreeFrom', 'Shu summadan oshsa bepul (soʻm, 0 = hech qachon)', 'masalan 1000000', 'number" min="0" step="1000')}</div>
    <div class="help">Narx savatda va buyurtma sahifasida mijozga koʻrinadi va umumiy summaga qoʻshiladi. <b>0</b> yozsangiz — “Bepul” deb chiqadi.</div>
  </div>
  <div class="card set-sec" id="sec-ai"><div class="card-h"><h3><span class="msi fill" style="color:var(--gold)">auto_awesome</span> AI chek tekshiruvi (Google Gemini)</h3>${s.geminiApiKey ? '<span class="status st-confirmed">Ulangan</span>' : '<span class="status st-pending">Kalit kiritilmagan</span>'}</div>
    <div class="help"><b>1.</b> <a class="gold" target="_blank" href="https://aistudio.google.com/app/apikey">Google AI Studio → API keys</a> sahifasiga kiring → <b>Create API key</b>.<br>
    <b>2.</b> Kalitni (<code>AIza...</code>) pastga qoʻying → <b>Saqlash</b> → <b>Tekshirish</b>.<br>
    <b>3.</b> Endi har bir yangi buyurtmadagi chek avtomatik tekshiriladi: summa, karta raqami, sana, soxta/montaj belgilari. Shubhali bo‘lsa — Boshqaruv panelida <b>qizil ogohlantirish</b> chiqadi va Telegram botga hisobot keladi.</div>
    <div class="row">${f('geminiApiKey', 'Gemini API kalit', 'AIza...', 'password')}<div class="field"><label>Model</label><select class="input" name="geminiModel">${['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-pro-latest'].map((m) => `<option ${((s.geminiModel || 'gemini-3.8-flash') === m) ? 'selected' : ''}>${m}</option>`).join('')}</select></div></div>
    <label class="switch-row"><input type="checkbox" name="aiCheck" ${s.aiCheck === false ? '' : 'checked'}><span class="sw"></span> Yangi buyurtmalarda chekni avtomatik tekshirish</label>
    <label class="switch-row" style="margin-top:10px"><input type="checkbox" name="aiChat" ${s.aiChat === false ? '' : 'checked'}><span class="sw"></span> Saytda mijozlar uchun “AI maslahatchi” chatini koʻrsatish</label>
    <button type="button" class="btn btn-dark btn-sm" id="aiTest" style="margin-top:12px"><span class="msi">bolt</span> Kalitni tekshirish</button>
  </div>
  <div class="card set-sec" id="sec-bot"><div class="card-h"><h3>Telegram bot (buyurtmalar va cheklar)</h3>${stats?.bot.running ? `<span class="status st-confirmed">@${h(stats.bot.username)} ishlayapti</span>` : '<span class="status st-rejected">Ulanmagan</span>'}</div>
    <div class="help"><b>1.</b> Telegramda <a class="gold" href="https://t.me/BotFather" target="_blank">@BotFather</a> ga kiring → <code>/newbot</code> → botga nom bering → u bergan <b>tokenni</b> pastga qoʻying va saqlang.<br>
    <b>2.</b> Oʻz botingizga kirib <code>/admin ADMIN_PAROLINGIZ</code> deb yozing (admin panel parolingiz bilan). Shunda shu Telegram akkaunt admin boʻladi.<br>
    <b>3.</b> Endi har bir buyurtma botga keladi: mahsulot rasmlari, razmer, telefon, lokatsiya (xaritada) va chek rasmi. <b>✅ Tasdiqlash</b> bosilsa — mijozga saytda “Buyurtmangiz tasdiqlandi” xabari boradi.<br>
    Bir nechta odamni admin qilish mumkin — har biri botga <code>/admin parol</code> yozadi.</div>
    ${f('botToken', 'Bot token', '123456789:AA...')}
    <div class="field"><label>Admin chat ID lar (avtomatik qoʻshiladi)</label><input class="input" name="adminChatIds" value="${h((s.adminChatIds || []).join(', '))}" placeholder="Botga /admin parol yozing"></div>
    <button type="button" class="btn btn-dark btn-sm" id="botTest">${I.bot} Test xabar yuborish</button>
  </div>
  <div class="card set-sec" id="sec-mon"><div class="card-h"><h3><span class="msi fill" style="color:var(--gold)">shield</span> Monitoring bot (texnik nosozliklar va tashriflar)</h3>${s.monitorBotToken ? '<span class="status st-confirmed">Ulangan</span>' : '<span class="status st-pending">Ulanmagan</span>'}</div>
    <div class="help">Bu <b>ikkinchi bot</b>ga faqat texnik maʼlumotlar keladi: 🚨 xatolar va nosozliklar (AI tushuntirishi bilan), 👤 saytga kim kirgani va <b>qaysi telefon/kompyuterdan</b>, 🔐 roʻyxatdan oʻtish va kirishlar. Asosiy botga esa faqat <b>savdo</b> (buyurtmalar, cheklar) keladi.<br>
    Ulanish: Telegramda monitoring botingizni oching → <b>Start</b> bosing (yoki <code>/admin parol</code> yozing). Buyruqlar: <code>/onlayn</code>, <code>/holat</code>.</div>
    ${f('monitorBotToken', 'Monitoring bot token', '123456789:AA...', 'password')}
    <label class="switch-row"><input type="checkbox" name="monitorVisits" ${s.monitorVisits === false ? '' : 'checked'}><span class="sw"></span> Har bir yangi tashrif haqida xabar yuborish (kim, qaysi qurilmadan)</label>
    <button type="button" class="btn btn-dark btn-sm" id="monTest" style="margin-top:12px"><span class="msi">send</span> Test xabar yuborish</button>
  </div>
  <div class="card set-sec" id="sec-google"><div class="card-h"><h3>Google: kirish va Drive (400GB) zaxira</h3>${s.gdrive?.connected ? `<span class="status st-confirmed">Drive ulangan: ${h(s.gdrive.email)}</span>` : '<span class="status st-pending">Drive ulanmagan</span>'}</div>
    <div class="help"><b>1.</b> <a class="gold" target="_blank" href="https://console.cloud.google.com/apis/credentials">Google Cloud Console</a> → <b>OAuth client ID → Web application</b>.<br>
    <b>Authorized JavaScript origins:</b> <code>${h(location.origin)}</code><br>
    <b>Authorized redirect URIs:</b> <code>${h(location.origin)}/api/gdrive/callback</code><br>
    <b>2.</b> <b>Google Drive API</b> ni yoqing (APIs &amp; Services → Library). <b>3.</b> Client ID va Client Secret ni shu yerga qoʻying → Saqlash → “Google Drive’ga ulash”.</div>
    ${f('googleClientId', 'Google Client ID (saytga Google orqali kirish uchun ham)', 'xxxxx.apps.googleusercontent.com')}
    ${f('googleClientSecret', 'Google Client Secret (Drive zaxira uchun)', 'GOCSPX-...', 'password')}
    <div class="row">${f('gdriveDeviceClientId', 'Drive “kod orqali” Client ID (TV turi)', 'xxxxx.apps.googleusercontent.com')}${f('gdriveDeviceSecret', 'Drive “kod orqali” Secret', 'GOCSPX-...', 'password')}</div>
    <div id="gdCode"></div>
    <div class="help" style="margin-top:6px">${s.gdrive?.connected ? `✓ Baza, rasmlar, videolar va cheklar Google Drive’dagi <b>GentlemanHouse</b> papkasiga saqlanmoqda. Oxirgi zaxira: <b>${s.gdrive.lastBackup ? dt(s.gdrive.lastBackup) : '—'}</b> • fayllar: <b>${s.gdrive.files}</b>${s.gdrive.error ? `<br><span style="color:#f87171">Xato: ${h(s.gdrive.error)}</span>` : ''}` : 'Ulangach: har bir buyurtma, chek va yuklangan rasm avtomatik Drive’ga saqlanadi + har 30 daqiqada baza zaxirasi + har kuni alohida nusxa.'}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">${s.gdrive?.connected ? `<button type="button" class="btn btn-gold btn-sm" id="gdSync">Hozir zaxiralash</button>${s.gdrive.folderId ? `<a class="btn btn-dark btn-sm" target="_blank" href="https://drive.google.com/drive/folders/${h(s.gdrive.folderId)}">Drive’da ochish</a>` : ''}<button type="button" class="btn btn-dark btn-sm" id="gdOff" style="color:#f87171">Uzish</button>` : `<button type="button" class="btn btn-gold btn-sm" id="gdOn">Google Drive’ga ulash</button><button type="button" class="btn btn-dark btn-sm" id="gdDev">Kod orqali ulash</button>`}</div>
  </div>
  <div class="save-bar"><button class="btn btn-gold" id="sSave">Barcha sozlamalarni saqlash</button></div>
  </form>
  <div class="card set-sec" style="margin-top:22px"><div class="card-h"><h3>Admin login va parol</h3></div>
    <form id="credf"><div class="row"><div class="field"><label>Yangi login</label><input class="input" name="login" required placeholder="admin1122"></div><div class="field"><label>Yangi parol</label><input class="input" name="newPassword" type="password" placeholder="Oʻzgartirmasangiz boʻsh"></div></div>
    <div class="field"><label>Joriy parol *</label><input class="input" name="oldPassword" type="password" required></div><button class="btn btn-dark btn-sm">Login/parolni yangilash</button></form>
  </div>`;
  const phones = [...(s.phones || [])];
  const drawPh = () => {
    $('#phones').innerHTML = phones.map((p, i) => `<div class="pe"><input class="input" data-ph="${i}" value="${h(p)}" placeholder="+998 90 123 45 67"><button type="button" class="btn btn-dark btn-sm" data-rp="${i}" style="height:52px">✕</button></div>`).join('');
    $$('[data-ph]').forEach((i) => (i.oninput = () => (phones[+i.dataset.ph] = i.value)));
    $$('[data-rp]').forEach((b) => (b.onclick = () => { phones.splice(+b.dataset.rp, 1); drawPh(); }));
  };
  $('#addPh').onclick = () => { phones.push(''); drawPh(); }; drawPh();
  const hi = $('[name=heroImage]');
  const drawHero = () => {
    $('#heroImg').innerHTML = (hi.value ? `<div class="ie" style="width:200px;height:120px"><img src="${h(hi.value)}"></div>` : '') + `<button type="button" class="add" id="hUp" style="height:120px">＋<br>Yuklash</button><button type="button" class="add" id="hMed" style="height:120px">Mediadan</button>`;
    $('#hUp').onclick = async (e) => { const f = await pickFiles(); const u = await uploadFiles(f, e.currentTarget); if (u[0]) { hi.value = u[0].url; drawHero(); } };
    $('#hMed').onclick = () => mediaPicker((url) => { hi.value = url; drawHero(); });
  };
  drawHero();
  const bgs = [...(s.heroBgs || [])];
  const drawBgs = () => {
    $('#heroBgs').innerHTML = bgs.map((u, i) => `<div class="ie" style="width:200px;height:120px"><img src="${h(u)}"><button type="button" class="x" data-rb="${i}">✕</button>${i ? `<button type="button" class="mv" data-lb="${i}" title="Oldinga">◀</button>` : ''}</div>`).join('') + (bgs.length < 8 ? `<button type="button" class="add" id="bUp" style="height:120px">＋<br>Yuklash</button><button type="button" class="add" id="bMed" style="height:120px">Mediadan</button>` : '');
    $$('[data-rb]').forEach((b) => (b.onclick = () => { bgs.splice(+b.dataset.rb, 1); drawBgs(); }));
    $$('[data-lb]').forEach((b) => (b.onclick = () => { const i = +b.dataset.lb; [bgs[i - 1], bgs[i]] = [bgs[i], bgs[i - 1]]; drawBgs(); }));
    if ($('#bUp')) $('#bUp').onclick = async (e) => { const f = await pickFiles({ multiple: true }); const u = await uploadFiles(f, e.currentTarget); u.forEach((x) => bgs.length < 8 && bgs.push(x.url)); drawBgs(); };
    if ($('#bMed')) $('#bMed').onclick = () => mediaPicker((url) => { if (bgs.length < 8) bgs.push(url); drawBgs(); });
  };
  drawBgs();
  $('#mapTest').onclick = () => window.open(`https://maps.google.com/?q=${$('[name=lat]').value},${$('[name=lng]').value}`);
  $('#sf').onsubmit = async (e) => {
    e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target)); const b = $('#sSave'); loading(b, true);
    fd.phones = phones.map((p) => p.trim()).filter(Boolean);
    fd.heroBgs = bgs;
    fd.adminChatIds = String(fd.adminChatIds || '').split(/[,\s]+/).filter(Boolean);
    fd.aiCheck = $('[name=aiCheck]').checked; fd.monitorVisits = $('[name=monitorVisits]').checked; fd.aiChat = $('[name=aiChat]').checked;
    try { await api('/api/admin/settings', { method: 'PUT', body: fd }); toast('Sozlamalar saqlandi ✓'); setTimeout(() => V.settings(el), 1500); }
    catch (err) { toast(err.message, 'err'); }
    loading(b, false);
  };
  const gq = new URLSearchParams(location.search).get('gdrive');
  if (gq) { gq === 'ok' ? toast('Google Drive ulandi! Zaxira boshlandi ✓') : toast('Google Drive: ' + gq, 'err', 6000); history.replaceState({}, '', '/admin/settings'); setTimeout(() => $('#sec-google')?.scrollIntoView({ behavior: 'smooth' }), 300); }
  if ($('#gdOn')) $('#gdOn').onclick = async (e) => { const b = e.currentTarget; loading(b, true); try { const r = await api('/api/admin/gdrive/auth-url'); location.href = r.url; } catch (err) { toast(err.message, 'err', 5000); loading(b, false); } };
  if ($('#gdDev')) $('#gdDev').onclick = async (e) => {
    const b = e.currentTarget; loading(b, true);
    try {
      const r = await api('/api/admin/gdrive/device-start', { method: 'POST' });
      $('#gdCode').innerHTML = `<div class="help" style="text-align:center"><b>1.</b> <a class="gold" target="_blank" href="${h(r.url)}">${h(r.url)}</a> sahifasini oching<br><b>2.</b> Shu kodni kiriting:<div style="font-size:34px;font-weight:800;letter-spacing:.2em;color:var(--gold2);margin:10px 0">${h(r.user_code)}</div><span id="gdWait">⏳ Tasdiqlash kutilmoqda…</span></div>`;
      loading(b, false);
      const t = setInterval(async () => {
        const st = await api('/api/admin/gdrive/device-status').catch(() => null); if (!st) return;
        if (st.status === 'ok') { clearInterval(t); toast('Google Drive ulandi! Zaxira boshlandi ✓'); V.settings(el); }
        else if (st.status !== 'pending') { clearInterval(t); const w = $('#gdWait'); if (w) w.textContent = '❌ ' + st.status; }
      }, 3000);
    } catch (err) { toast(err.message, 'err', 6000); loading(b, false); }
  };
  if ($('#gdSync')) $('#gdSync').onclick = async (e) => { const b = e.currentTarget; loading(b, true); try { await api('/api/admin/gdrive/sync', { method: 'POST' }); toast('Google Drive’ga saqlandi ✓'); V.settings(el); } catch (err) { toast(err.message, 'err', 6000); loading(b, false); } };
  if ($('#gdOff')) $('#gdOff').onclick = async () => { if (await confirmBox('Google Drive zaxirasini uzasizmi? (Drive’dagi fayllar oʻchmaydi)')) { await api('/api/admin/gdrive/disconnect', { method: 'POST' }); V.settings(el); } };
  $('#aiTest').onclick = async (e) => { const b = e.currentTarget; loading(b, true); try { const r = await api('/api/admin/ai/test', { method: 'POST', body: { key: $('[name=geminiApiKey]').value.trim(), model: $('[name=geminiModel]').value } }); toast('Gemini ishlayapti ✓ — model: ' + r.model, 'ok', 5000); } catch (err) { toast(err.message, 'err', 7000); } loading(b, false); };
  $('#monTest').onclick = async (e) => { const b = e.currentTarget; loading(b, true); try { const r = await api('/api/admin/monbot/test', { method: 'POST' }); toast(`Test xabar yuborildi (@${r.username}) ✓`); } catch (err) { toast(err.message, 'err', 8000); } loading(b, false); };
  $('#botTest').onclick = async (e) => { const b = e.currentTarget; loading(b, true); try { await api('/api/admin/bot/test', { method: 'POST' }); toast('Test xabar Telegramga yuborildi'); } catch (err) { toast(err.message, 'err', 5000); } loading(b, false); };
  $('#credf').onsubmit = async (e) => { e.preventDefault(); try { await api('/api/admin/credentials', { method: 'PUT', body: Object.fromEntries(new FormData(e.target)) }); toast('Login/parol yangilandi'); e.target.reset(); } catch (err) { toast(err.message, 'err'); } };
};

/* ------------------------ live counters ------------------------ */
function updateLive(s) {
  const l = $('#live span'); if (l) l.textContent = `${s.online.total} onlayn`;
  $('#live')?.classList.toggle('zero', !s.online.total);
  if ($('#onStatB')) { $('#onStatB').innerHTML = `<span class="dot-on ${s.online.total ? 'on' : ''}"></span>${s.online.total} kishi`; $('#onStatS').textContent = `${s.online.users} aʼzo • ${s.online.guests} mehmon`; }
  const ib = $('#issBtn'); if (ib) { ib.classList.toggle('hidden', !s.issues); $('#issCnt').textContent = s.issues || 0; }
  if (A.issSeen != null && s.issues > A.issSeen) { chime(); toast('⚠️ Tizimda yangi muammo aniqlandi — Boshqaruv panelida koʻring', 'err', 7000); if (A.view === 'dash') drawHealth(); }
  A.issSeen = s.issues || 0;
  const c = $('#pendCnt'); if (c) { c.textContent = s.orders.pending; c.classList.toggle('hidden', !s.orders.pending); }
  if (A.pendingSeen !== null && s.orders.total > A.pendingSeen) {
    chime(); toast('🛍 Yangi buyurtma keldi! Chekni tekshiring.', 'info', 6000);
    if (A.view === 'orders') V.orders($('#view')); if (A.view === 'dash') V.dash($('#view'));
  }
  A.pendingSeen = s.orders.total;
  document.title = (s.orders.pending ? `(${s.orders.pending}) ` : '') + 'Admin panel — Gentleman House';
}
async function refreshCounts() { try { updateLive(await api('/api/admin/stats')); } catch {} }


/* ------------------------ onlayn panel ------------------------ */
async function onlinePanel() {
  let pn = $('#onPanel');
  if (pn) { pn.remove(); clearInterval(A.onT); return; }
  pn = document.createElement('div'); pn.id = 'onPanel'; pn.className = 'on-panel';
  pn.innerHTML = '<div class="on-h"><b><i class="on-dot"></i> Hozir saytda</b><button class="on-x"><span class="msi">close</span></button></div><div class="on-sum" id="onSum"></div><div class="on-list" id="onList"><div class="skel" style="height:60px"></div></div><p class="on-note">Har 5 soniyada yangilanadi. Saytni yopgan yoki 35 soniya faol boʻlmagan odam roʻyxatdan chiqadi.</p>';
  document.body.appendChild(pn); pn.onclick = (e) => e.stopPropagation(); pn.querySelector('.on-x').onclick = () => { pn.remove(); clearInterval(A.onT); };
  const PG = (p) => p === '/' ? 'Bosh sahifa' : p.startsWith('/katalog') ? 'Katalog' + (p.split('/')[2] ? ' • ' + p.split('/')[2] : '') : p.startsWith('/mahsulot') ? 'Mahsulot koʻrmoqda' : p.startsWith('/buyurtma') ? '🛒 Buyurtma bermoqda' : p.startsWith('/profil') ? 'Shaxsiy kabinet' : p.startsWith('/aloqa') ? 'Aloqa' : p;
  const load = async () => {
    try {
      const d = await api('/api/admin/online'); if (!document.body.contains(pn)) return;
      $('#onSum').innerHTML = `<div><b>${d.total}</b><span>Jami</span></div><div><b>${d.users}</b><span>Aʼzolar</span></div><div><b>${d.guests}</b><span>Mehmonlar</span></div>`;
      $('#onList').innerHTML = d.list.length ? d.list.map((x, i) => `<div class="on-row" style="animation-delay:${i * 0.03}s"><div class="on-av ${x.user ? 'u' : ''}">${x.user ? h(x.name[0] || '?').toUpperCase() : '<span class="msi">person</span>'}<i></i></div><div class="t"><b>${h(x.name)}</b><span>${h(PG(x.path))}</span>${x.model ? `<span class="on-dev">${h(x.model)}</span>` : ''}</div><div class="r"><span class="msi">${x.device === 'mobile' ? 'smartphone' : 'computer'}</span><small>${Math.max(1, Math.round((Date.now() - x.since) / 60000))} daq</small></div></div>`).join('') : '<div class="on-empty"><span class="msi">bedtime</span>Hozir saytda hech kim yoʻq</div>';
    } catch (e) { $('#onList').innerHTML = `<p class="muted">${h(e.message)}</p>`; }
  };
  load(); clearInterval(A.onT); A.onT = setInterval(load, 5000);
}
document.addEventListener('click', () => { if ($('#onPanel')) { $('#onPanel').remove(); clearInterval(A.onT); } });

/* ------------------------ tizim holati (AI monitoring) ------------------------ */
async function drawHealth(run = false) {
  const box = $('#healthBody'); if (!box) return;
  let d; try { d = await api('/api/admin/health' + (run ? '/run' : ''), run ? { method: 'POST' } : undefined); } catch (e) { box.innerHTML = `<p class="muted">${h(e.message)}</p>`; return; }
  if (!document.body.contains(box)) return;
  const st = (ok) => ok === true ? ['ok', 'check_circle'] : ok === false ? ['bad', 'error'] : ['off', 'remove_circle_outline'];
  const open = d.issues.filter((x) => !x.resolved);
  const bad = d.checks.filter((c) => c.ok === false).length;
  $('#healthBadge').className = 'h-badge ' + (bad || open.length ? 'bad' : 'ok');
  $('#healthBadge').innerHTML = bad || open.length ? `<span class="msi fill">warning</span> ${open.length || bad} ta muammo` : '<span class="msi fill">verified</span> Hammasi joyida';
  box.innerHTML = `<div class="h-checks">${d.checks.length ? d.checks.map((c, i) => { const [cl, ic] = st(c.ok); return `<div class="h-chk ${cl}" style="animation-delay:${i * 0.05}s"><span class="msi fill">${ic}</span><div><b>${h(c.name)}</b><small>${h(c.msg || '')}</small></div></div>`; }).join('') : '<p class="muted">Birinchi tekshiruv bir necha soniyada boshlanadi…</p>'}</div>
    <p class="muted" style="font-size:12px;margin:10px 0 16px">Oxirgi tekshiruv: ${d.lastCheck ? dt(d.lastCheck) : '—'} • har 5 daqiqada avtomatik</p>
    ${open.length ? `<div class="h-iss-h"><b>Ochiq muammolar</b><button class="btn btn-dark btn-sm" id="issClear">Hal boʻlganlarni tozalash</button></div>${open.map((x) => `<div class="h-iss ${x.level}"><div class="h-iss-t"><span class="msi fill">${x.level === 'warn' ? 'warning' : 'report'}</span><div><b>${h(x.msg)}</b><small>${dt(x.at)}${x.count > 1 ? ` • ${x.count} marta takrorlandi` : ''}</small></div><button class="btn btn-dark btn-sm" data-res="${x.id}">Hal boʻldi</button></div>${x.ai ? `<div class="h-ai"><span class="msi fill">auto_awesome</span><p>${h(x.ai)}</p></div>` : ''}${x.detail ? `<details><summary>Texnik tafsilot</summary><pre>${h(x.detail)}</pre></details>` : ''}</div>`).join('')}` : '<div class="h-calm"><span class="msi fill">shield</span> Ochiq muammo yoʻq. AI tizimni kuzatib turibdi — xato chiqsa shu yerda va Telegram botda xabar beradi.</div>'}`;
  $$('[data-res]').forEach((b) => (b.onclick = async () => { await api('/api/admin/issues/' + b.dataset.res + '/resolve', { method: 'POST' }); drawHealth(); refreshCounts(); }));
  if ($('#issClear')) $('#issClear').onclick = async () => { await api('/api/admin/issues/clear', { method: 'POST' }); drawHealth(); };
}

/* ----------------------------- boot ---------------------------- */
(async () => {
  if (!token) { location.href = '/kirish'; return; }
  try { const me = await api('/api/me'); if (me.role !== 'admin') { location.href = '/kirish'; return; } }
  catch { location.href = '/kirish'; return; }
  shell();
  const v = location.pathname.split('/')[2];
  go(V[v] ? v : 'dash');
  refreshCounts(); setInterval(refreshCounts, 8000);
  const beat = () => fetch('/api/heartbeat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"vid":"admin"}' }).catch(() => {});
  void beat;
})();
})();
