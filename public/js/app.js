/* =================== GENTLEMAN HOUSE — sayt =================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/ |,/g, ' ') + ' soʻm';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(() => { let n = 0; const send = (d) => { if (n++ > 5) return; try { fetch('/api/client-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, page: location.pathname }), keepalive: true }); } catch {} };
  addEventListener('error', (e) => { if (e.message) send({ msg: e.message, src: e.filename, line: e.lineno, stack: e.error?.stack }); });
  addEventListener('unhandledrejection', (e) => { const r = e.reason; if (r && !/Internet|fetch|Failed to fetch|aborted/i.test(r.message || r)) send({ msg: 'Promise: ' + (r.message || String(r)), stack: r.stack }); }); })();
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

const S = {
  settings: {}, cats: [], products: null, user: null, role: null,
  token: store.get('gh_token', null), cart: store.get('gh_cart', []), notifs: [],
  vid: store.get('gh_vid', null) || (() => { const v = Math.random().toString(36).slice(2) + Date.now().toString(36); store.set('gh_vid', v); return v; })(),
};

/* ----------------------------- icons ----------------------------- */
const I = {
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>',
  play: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7l6-3.5z" fill="currentColor"/></svg>',
  cube: '<svg viewBox="0 0 24 24"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m13 7 4 4"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  truck: '<svg viewBox="0 0 24 24"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/></svg>',
  ruler: '<svg viewBox="0 0 24 24"><path d="M3 17 17 3l4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
  hanger: '<svg viewBox="0 0 24 24"><path d="M12 7a2 2 0 1 1 2-2c0 1-2 1.5-2 3"/><path d="M12 8 2 16a1 1 0 0 0 .6 2h18.8a1 1 0 0 0 .6-2z"/></svg>',
  logout: '<svg viewBox="0 0 24 24"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/></svg>',
  crown: '<svg viewBox="0 0 24 24"><path d="m3 7 4 4 5-6 5 6 4-4-2 12H5z"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  ig: '<svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM21.9 7.2c-.1-1.6-.4-3-1.6-4.2S17.7 1.4 16.1 1.4C14.4 1.3 9.6 1.3 7.9 1.4 6.3 1.4 4.9 1.8 3.7 3S2.1 5.6 2 7.2c-.1 1.7-.1 6.5 0 8.2.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.7.1 6.5.1 8.2 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.2-1.7.2-6.5.1-8.2zm-2.2 10.1a3.3 3.3 0 0 1-1.9 1.9c-1.3.5-4.4.4-5.8.4s-4.5.1-5.8-.4a3.3 3.3 0 0 1-1.9-1.9c-.5-1.3-.4-4.4-.4-5.8s-.1-4.5.4-5.8A3.3 3.3 0 0 1 6.2 3.8C7.5 3.3 10.6 3.4 12 3.4s4.5-.1 5.8.4a3.3 3.3 0 0 1 1.9 1.9c.5 1.3.4 4.4.4 5.8s.1 4.5-.4 5.8z"/></svg>',
  tg: '<svg viewBox="0 0 24 24"><path d="M21.9 4.6 18.7 19.7c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.2-8.3c.4-.4-.1-.6-.6-.2L6.2 13.4 1.3 11.9c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.6z"/></svg>',
  google: '<svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>',
};

/* ------------------------------ api ------------------------------ */
async function api(url, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (S.token) headers.Authorization = 'Bearer ' + S.token;
  let r;
  try { r = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined }); }
  catch { throw new Error('Internet aloqasini tekshiring'); }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && S.token && !url.includes('/auth/')) { setSession(null); }
    throw new Error(data.error || 'Xatolik yuz berdi');
  }
  return data;
}
function setSession(token, role = null, user = null) {
  S.token = token; S.role = role; S.user = user;
  token ? store.set('gh_token', token) : store.del('gh_token');
  renderUserArea();
}

/* ----------------------------- toast ----------------------------- */
function toast(msg, type = 'ok', ms = 3200) {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = `<i>${type === 'ok' ? '✓' : type === 'err' ? '!' : 'i'}</i><span>${h(msg)}</span>`;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, ms);
}

/* ----------------------------- modal ----------------------------- */
function openModal(html, cls = '') {
  const m = $('#modal'); $('#modalBody').innerHTML = html;
  m.querySelector('.modal-box').className = 'modal-box ' + cls;
  m.classList.add('open'); document.body.classList.add('lock');
  return m;
}
function closeModal() { $('#modal').classList.remove('open'); if (!$('#drawer').classList.contains('open') && !$('.tryon.open')) document.body.classList.remove('lock'); }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

/* ------------------------------ cart ----------------------------- */
const cartCount = () => S.cart.reduce((s, i) => s + i.qty, 0);
const cartTotal = () => S.cart.reduce((s, i) => s + i.price * i.qty, 0);
const delivFee = (sub = cartTotal()) => { const st = S.settings || {}; const pr = +st.deliveryPrice || 0, fr = +st.deliveryFreeFrom || 0; return fr > 0 && sub >= fr ? 0 : pr; };
const grandTotal = () => cartTotal() + delivFee();
const delivRow = () => { const d = delivFee(), fr = +S.settings?.deliveryFreeFrom || 0; return `<div class="sum-row"><span>Yetkazib berish</span>${d ? `<span>${fmt(d)}</span>` : '<span class="gold">Bepul</span>'}</div>${d && fr ? `<div class="free-hint"><span class="msi">local_shipping</span> Yana <b>${fmt(fr - cartTotal())}</b> lik xarid qilsangiz — yetkazib berish bepul</div>` : ''}`; };
function saveCart() { store.set('gh_cart', S.cart); updateCartBadge(); renderDrawer(); if ($('#cpBody')) { renderDrawer($('#cpBody'), $('#cpFoot')); const c = cartCount(); if ($('#cpCnt')) $('#cpCnt').textContent = c ? c + ' dona' : ''; } }
function updateCartBadge(bump) {
  const b = $('#cartBadge'); const n = cartCount();
  b.textContent = n; b.classList.toggle('show', n > 0);
  if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
}
function addToCart(p, size, qty = 1, fromEl) {
  if (p.sizes?.length && !size) { quickSize(p); return false; }
  const ex = S.cart.find((i) => i.productId === p.id && i.size === (size || ''));
  if (ex) ex.qty = Math.min(20, ex.qty + qty);
  else S.cart.push({ productId: p.id, name: p.name, price: p.price, image: p.images?.[0] || '', size: size || '', qty, cat: p.category?.name || '' });
  saveCart();
  if (fromEl) flyToCart(fromEl, p.images?.[0]); else updateCartBadge(true);
  toast(`${p.name}${size ? ' (' + size + ')' : ''} savatga qoʻshildi`);
  return true;
}
function flyToCart(el, img) {
  const r = el.getBoundingClientRect(); const t = $('#cartBtn').getBoundingClientRect();
  const f = document.createElement('img'); f.src = img; f.className = 'fly';
  f.style.left = r.left + r.width / 2 - 35 + 'px'; f.style.top = r.top + r.height / 2 - 43 + 'px';
  document.body.appendChild(f);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    f.style.left = t.left + 4 + 'px'; f.style.top = t.top + 4 + 'px'; f.style.width = '30px'; f.style.height = '34px'; f.style.opacity = '.3';
  }));
  setTimeout(() => { f.remove(); updateCartBadge(true); }, 900);
}
function openDrawer() { renderDrawer(); $('#drawer').classList.add('open'); $('#drawerBg').classList.add('open'); document.body.classList.add('lock'); }
function closeDrawer() { $('#drawer').classList.remove('open'); $('#drawerBg').classList.remove('open'); if (!$('#modal').classList.contains('open')) document.body.classList.remove('lock'); }
$('#cartBtn').onclick = () => go('/savat'); $('#drawerClose').onclick = closeDrawer; $('#drawerBg').onclick = closeDrawer;
function renderDrawer(body = $('#drawerBody'), foot = $('#drawerFoot')) {
  const bgs = S.settings?.heroBgs || [];
  const hb = $('#dhBg'); if (hb) hb.style.backgroundImage = (S.cart[0]?.image || bgs[0]) ? `url('${(bgs[0] || S.cart[0].image)}')` : '';
  const cnt = cartCount(); if ($('#dhCnt')) $('#dhCnt').textContent = cnt ? `${cnt} dona` : '';
  if (!S.cart.length) {
    const cs = (S.cats || []).slice(0, 6);
    body.innerHTML = `<div class="d-empty"><div class="de-ic"><span class="msi">shopping_bag</span><i></i></div><h3>Savatingiz hozircha boʻsh</h3><p>Kolleksiyamizdan oʻzingizga mos uslubni tanlang</p>
      <div class="de-cats">${cs.map((c, k) => `<a href="/katalog/${c.slug}" data-link class="de-cat" style="animation-delay:${k * 0.06}s"><img src="${h(c.cover || c.image)}" alt=""><span>${h(c.name)}</span></a>`).join('')}</div></div>`;
    foot.innerHTML = `<a href="/katalog" data-link class="btn btn-gold btn-block d-cta">Xaridni boshlash ${I.arrow}</a>`;
    return;
  }
  body.innerHTML = S.cart.map((i, n) => `
    <div class="c-item" style="animation-delay:${n * 0.06}s">
      <a href="/mahsulot/${h(i.productId || i.id || '')}" data-link class="ci-img"><img src="${h(i.image)}" alt=""></a>
      <div class="ci-mid"><h4>${h(i.name)}</h4>
        <div class="ci-tags">${i.size ? `<span class="ci-size"><span class="msi">straighten</span>${h(i.size)}</span>` : ''}<span class="ci-unit">${fmt(i.price)} / dona</span></div>
        <div class="qty"><button data-q="-1" data-i="${n}" aria-label="Kamaytirish">−</button><span>${i.qty}</span><button data-q="1" data-i="${n}" aria-label="Koʻpaytirish">+</button></div></div>
      <div class="right"><button class="rm" data-rm="${n}" title="Oʻchirish" aria-label="Oʻchirish"><span class="msi">close</span></button><b>${fmt(i.price * i.qty)}</b></div>
    </div>`).join('') + `
    <div class="d-perks">${[['verified', 'Sifat kafolati', 'Tekshirilgan mato'], ['local_shipping', 'Tez yetkazish', S.settings?.deliveryNote ? 'Manzilingizgacha' : '1–2 kun ichida'], ['lock', 'Xavfsiz toʻlov', 'Chek bilan tasdiq']].map(([ic, t, sub], k) => `<div class="dp-card" style="animation-delay:${k * 0.08}s"><span class="dp-ic"><span class="msi">${ic}</span></span><b>${t}</b><small>${sub}</small></div>`).join('')}</div>
    <div class="d-recs" id="dRecs"></div>`;
  const fr = +S.settings?.deliveryFreeFrom || 0, sub = cartTotal();
  foot.innerHTML = `
    ${fr ? `<div class="d-prog"><div class="dp-t">${sub >= fr ? '<span class="msi fill">celebration</span> Yetkazib berish <b>bepul!</b>' : `<span class="msi">local_shipping</span> Bepul yetkazishgacha <b>${fmt(fr - sub)}</b> qoldi`}</div><div class="dp-bar"><i style="width:${Math.min(100, (sub / fr) * 100)}%"></i></div></div>` : ''}
    <div class="sum-row"><span>Mahsulotlar (${cnt} dona)</span><span>${fmt(sub)}</span></div>
    ${delivRow().replace(/<div class="free-hint">[\s\S]*?<\/div>/, '')}
    <div class="sum-row total"><span>Jami</span><b>${fmt(grandTotal())}</b></div>
    <a href="/buyurtma" data-link class="btn btn-gold btn-block d-cta">Buyurtma berish ${I.arrow}</a>
    <div class="d-safe"><span class="msi">shield_lock</span> Toʻlov karta orqali • chek tekshiriladi</div>`;
  body.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => {
    const it = S.cart[+b.dataset.i]; it.qty = Math.max(1, Math.min(20, it.qty + +b.dataset.q)); saveCart();
  }));
  body.querySelectorAll('[data-rm]').forEach((b) => (b.onclick = () => { const row = b.closest('.c-item'); row.classList.add('out'); setTimeout(() => { S.cart.splice(+b.dataset.rm, 1); saveCart(); }, 320); }));
  allProducts().then((list) => {
    const inCart = new Set(S.cart.map((x) => x.productId || x.id));
    const recs = list.filter((p) => !inCart.has(p.id)).slice(0, 6);
    const el = body.querySelector('#dRecs'); if (!el) return;
    if (!recs.length) { const cs = (S.cats || []).slice(0, 6); if (!cs.length) return; el.innerHTML = `<h5><span class="msi">auto_awesome</span> Kolleksiyalarimiz</h5><div class="dr-row">${cs.map((c, k) => `<a href="/katalog/${c.slug}" data-link class="dr-card dr-col" style="animation-delay:${k * 0.07}s"><img src="${h(c.cover || c.image)}" alt=""><div class="dc-txt"><b>${h(c.name)}</b><span>Koʻrish <span class="msi">arrow_forward</span></span></div></a>`).join('')}</div>`; return; }
    el.innerHTML = `<h5><span class="msi">auto_awesome</span> Bunga ham qarang</h5><div class="dr-row">${recs.map((p, k) => `<a href="/mahsulot/${p.id}" data-link class="dr-card dr-col" style="animation-delay:${k * 0.07}s"><img src="${h(p.images?.[0] || '')}" alt=""><div class="dc-txt"><b>${h(p.name)}</b><span>${fmt(p.price)} <span class="msi">arrow_forward</span></span></div></a>`).join('')}</div>`;
  }).catch(() => {});
}

/* ---------------------- size picker & tables --------------------- */
const SIZE_TABLES = {
  clothes: { head: ['Razmer', 'Koʻkrak (sm)', 'Bel (sm)', 'Boʻy (sm)'], rows: [['S', '88–92', '76–80', '165–172'], ['M', '96–100', '82–86', '170–178'], ['L', '104–108', '88–92', '175–182'], ['XL', '112–116', '96–100', '178–186'], ['XXL', '120–124', '104–108', '180–190']] },
  shoes: { head: ['Razmer (EU)', 'Oyoq uzunligi (sm)'], rows: [['39', '25.0'], ['40', '25.7'], ['41', '26.3'], ['42', '27.0'], ['43', '27.7'], ['44', '28.3'], ['45', '29.0']] },
  belt: { head: ['Remen razmeri', 'Bel aylanasi (sm)', 'Shim razmeri'], rows: [['95', '80–85', 'S'], ['100', '85–90', 'M'], ['105', '90–95', 'L'], ['110', '95–100', 'XL'], ['115', '100–105', 'XXL'], ['120', '105–110', '3XL']] },
};
function sizeTable(type) {
  const t = SIZE_TABLES[type] || SIZE_TABLES.clothes;
  openModal(`<h3>Razmerlar jadvali</h3><p class="muted" style="margin-bottom:16px">Oʻlchamni toʻgʻri tanlash uchun jadvaldan foydalaning.</p>
    <table class="size-table"><tr>${t.head.map((x) => `<th>${x}</th>`).join('')}</tr>${t.rows.map((r) => `<tr>${r.map((c, i) => `<td>${i ? c : `<b>${c}</b>`}</td>`).join('')}</tr>`).join('')}</table>`);
}
function quickSize(p) {
  openModal(`<div style="display:flex;gap:18px;align-items:center;margin-bottom:20px"><img src="${h(p.images?.[0])}" style="width:80px;height:98px;border-radius:12px;object-fit:cover"><div><div class="p-cat">${h(p.category?.name)}</div><h3 style="margin:0;font-size:26px">${h(p.name)}</h3><b class="gold">${fmt(p.price)}</b></div></div>
    <div class="opt-label">Razmerni tanlang <button id="qsTable">Razmerlar jadvali</button></div>
    <div class="sizes">${p.sizes.map((s) => `<button class="size" data-s="${h(s)}">${h(s)}</button>`).join('')}</div>
    <button class="btn btn-gold btn-block" id="qsAdd">${I.bag} Savatga qoʻshish</button>`);
  let sel = null;
  $$('#modalBody .size').forEach((b) => (b.onclick = () => { $$('#modalBody .size').forEach((x) => x.classList.remove('active')); b.classList.add('active'); sel = b.dataset.s; }));
  $('#qsTable').onclick = () => sizeTable(p.category?.sizeType);
  $('#qsAdd').onclick = () => {
    if (!sel) { $$('#modalBody .size').forEach((x) => { x.classList.remove('shake'); void x.offsetWidth; x.classList.add('shake'); }); return toast('Iltimos, razmer tanlang', 'err'); }
    closeModal(); addToCart(p, sel, 1, $('#cartBtn'));
  };
}

/* --------------------------- video pleyer --------------------------- */
async function allProducts() { if (!S.products) S.products = await api('/api/products'); return S.products; }
function playVideo(p) {
  if (!p?.video) return toast('Bu mahsulot uchun video hali yuklanmagan', 'info');
  const old = document.querySelector('.vplayer'); if (old) old.remove();
  const el = document.createElement('div'); el.className = 'vplayer';
  el.innerHTML = `<div class="vp-box">
    <button class="icon-btn vp-x" title="Yopish"><span class="msi">close</span></button>
    <div class="vp-media"><video src="${h(p.video)}" poster="${h(p.images?.[0] || '')}" controls autoplay playsinline preload="auto"></video><div class="vp-load"><span class="spin"></span></div></div>
    <div class="vp-info"><div><div class="p-cat">${h(p.category?.name || '')}</div><b>${h(p.name)}</b><span class="gold">${fmt(p.price)}</span></div>
      <div class="vp-acts"><a href="/mahsulot/${p.id}" data-link class="btn btn-gold btn-sm">${I.bag} Sotib olish</a></div></div></div>`;
  document.body.appendChild(el); document.body.classList.add('lock');
  requestAnimationFrame(() => el.classList.add('open'));
  const v = el.querySelector('video');
  v.addEventListener('canplay', () => el.querySelector('.vp-load')?.remove(), { once: true });
  v.addEventListener('error', () => { const l = el.querySelector('.vp-load'); if (l) l.innerHTML = '<p class="muted">Videoni ochib boʻlmadi</p>'; });
  const close = () => { v.pause(); el.classList.remove('open'); setTimeout(() => el.remove(), 400); if (!$('#drawer').classList.contains('open')) document.body.classList.remove('lock'); document.removeEventListener('keydown', esc); };
  const esc = (e) => e.key === 'Escape' && close();
  document.addEventListener('keydown', esc);
  el.querySelector('.vp-x').onclick = close;
  el.onclick = (e) => { if (e.target === el || e.target.closest('a[data-link]')) close(); };
}

/* ------------------------- product card -------------------------- */
function productCard(p, i = 0) {
  const sale = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return `<article class="p-card reveal" style="transition-delay:${(i % 4) * 0.08}s">
    <a href="/mahsulot/${p.id}" data-link class="p-media">
      <img src="${h(p.images?.[0] || '')}" alt="${h(p.name)}" loading="lazy">
      ${p.images?.[1] ? `<img class="alt" src="${h(p.images[1])}" alt="" loading="lazy">` : ''}
      ${p.video ? '<span class="vid-badge"><span class="msi fill">play_arrow</span> Video</span>' : ''}
      <div class="p-tags">${sale ? `<span class="tag sale">−${sale}%</span>` : ''}${p.featured ? '<span class="tag hot">Top</span>' : ''}</div>
      <div class="p-actions"><button class="btn btn-gold" data-add="${p.id}">${I.bag} Savatga</button></div>
    </a>
    <div class="p-body"><div class="p-cat">${h(p.category?.name || '')}</div><a href="/mahsulot/${p.id}" data-link class="p-name">${h(p.name)}</a>
      <div class="price"><b>${fmt(p.price)}</b>${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ''}</div>
      ${p.sizes?.length ? `<div class="p-sizes">${p.sizes.slice(0, 6).map((s) => `<span>${h(s)}</span>`).join('')}</div>` : ''}
    </div></article>`;
}
function bindCards(root, list) {
  root.querySelectorAll('[data-add]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); const p = list.find((x) => x.id === b.dataset.add); if (p) addToCart(p, p.sizes?.length ? null : '', 1, b); }));
  root.querySelectorAll('[data-vid]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); const p = list.find((x) => x.id === b.dataset.vid); if (p) playVideo(p); }));
}
const skeletons = (n) => Array.from({ length: n }, () => `<div><div class="skel" style="aspect-ratio:9/11"></div><div class="skel" style="height:16px;width:60%;margin-top:14px"></div><div class="skel" style="height:22px;width:85%;margin-top:8px"></div></div>`).join('');

/* ============================ PAGES ============================== */
const pages = {};

pages.home = async (app) => {
  const s = S.settings;
  const title = (s.heroTitle || 'Haqiqiy janoblar uchun').split(' ');
  const half = Math.ceil(title.length / 2);
  app.innerHTML = `
  <section class="hero">
    ${(s.heroBgs || []).length ? `<div class="hero-photos" id="heroPh">${s.heroBgs.map((u, i) => `<div class="hp ${i ? '' : 'on'}" style="background-image:url('${h(u)}')"></div>`).join('')}<div class="hp-shade"></div>${s.heroBgs.length > 1 ? `<div class="hp-dots">${s.heroBgs.map((_, i) => `<button class="${i ? '' : 'on'}" data-hp="${i}" aria-label="${i + 1}"></button>`).join('')}</div>` : ''}</div>` : `<div class="hero-bg"><img src="${h(s.heroImage)}" alt=""></div>`}<canvas id="particles"></canvas>
    <div class="container"><div class="hero-content">
      <div class="eyebrow fade-up">${h(s.tagline || 'Premium menswear')}</div>
      <h1><span class="line"><span>${h(title.slice(0, half).join(' '))}</span></span><span class="line"><span><em>${h(title.slice(half).join(' '))}</em></span></span></h1>
      <p class="lead fade-up d1">${h(s.heroSubtitle)}</p>
      <div class="hero-cta fade-up d2"><a href="/katalog" data-link class="btn btn-gold">Kolleksiyani koʻrish ${I.arrow}</a><a href="/aloqa" data-link class="btn btn-ghost"><span class="msi">support_agent</span> Bogʻlanish</a></div>
      <div class="hero-stats fade-up d3"><div><b data-count="${S.cats.length}">0</b><span>Kategoriya</span></div><div><b data-count="100">0</b><span>% sifat kafolati</span></div><div><b data-count="24">0</b><span>soatda yetkazish</span></div></div>
    </div></div>
  </section>
  <div class="marquee"><div class="marquee-track">${Array(4).fill(`<span>${h(s.marquee || '')}</span>`).join('')}</div></div>
  <section class="sec"><div class="container">
    <div class="sec-head reveal"><div><div class="eyebrow">Kategoriyalar</div><h2>Uslubingizni <em>tanlang</em></h2></div><p>Har bir kategoriya — ehtiyotkorlik bilan tanlangan premium mahsulotlar toʻplami.</p></div>
    <div class="cat-grid">${S.cats.map((c) => `<a href="/katalog/${c.slug}" data-link class="cat-card reveal"><img src="${h(c.cover || c.image)}" alt="${h(c.name)}" loading="lazy"><div class="cat-info"><div><div class="count" data-cc="${c.id}"></div><h3>${h(c.name)}</h3><p>${h(c.subtitle || '')}</p></div><div class="cat-arrow">${I.arrow}</div></div></a>`).join('')}</div>
  </div></section>
  <section class="sec" style="padding-top:0"><div class="container">
    <div class="sec-head reveal"><div><div class="eyebrow">Tanlangan</div><h2>Eng <em>mashhur</em> mahsulotlar</h2></div><a href="/katalog" data-link class="btn btn-ghost btn-sm">Barchasi ${I.arrow}</a></div>
    <div class="p-grid" id="featured">${skeletons(4)}</div>
  </div></section>
  <section class="sec" style="padding-top:0"><div class="container"><div class="feat">
    <div class="reveal">${I.shield}<b>Sifat kafolati</b><span>Faqat tekshirilgan, sifatli mato va charm mahsulotlar.</span></div>
    <div class="reveal" style="transition-delay:.1s">${I.truck}<b>Tez yetkazish</b><span>${h(s.deliveryNote || 'Tez yetkazib berish')}</span></div>
    <div class="reveal" style="transition-delay:.2s">${I.ruler}<b>Barcha razmerlar</b><span>S dan XXL gacha, oyoq kiyim 39–45.</span></div>
    <div class="reveal" style="transition-delay:.3s">${I.crown}<b>Premium xizmat</b><span>Telegram orqali 24/7 yordam va maslahat.</span></div>
  </div></div></section>
  <section class="sec" style="padding-top:0"><div class="container"><div class="banner3d reveal" style="grid-template-columns:1fr auto">
    <div><div class="eyebrow">${h(s.aboutTitle || 'Biz haqimizda')}</div><h2 style="font-size:clamp(30px,3.5vw,48px)">${h(s.siteName)}</h2><p style="max-width:640px">${h(s.aboutText)}</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap"><a href="${h(s.instagram)}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm"><span style="width:18px;display:inline-flex;fill:currentColor">${I.ig}</span> Instagram</a><a href="${h(s.telegramSupport)}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm"><span style="width:18px;display:inline-flex;fill:currentColor">${I.tg}</span> Telegram</a></div></div>
  </div></div></section>`;
  heroParticles(); countUp(); heroSlides();
  try {
    const list = await allProducts();
    S.cats.forEach((c) => { const n = list.filter((p) => p.categoryId === c.id).length; const el = $(`[data-cc="${c.id}"]`); if (el) el.textContent = n + ' ta mahsulot'; });
    let f = list.filter((p) => p.featured); if (f.length < 4) f = list;
    const box = $('#featured'); if (!box) return;
    box.innerHTML = f.slice(0, 8).map(productCard).join(''); bindCards(box, list); observe();
  } catch (e) { toast(e.message, 'err'); }
};

pages.catalog = async (app, slug) => {
  const cat = slug ? S.cats.find((c) => c.slug === slug) : null;
  if (slug && !cat) return pages.notFound(app);
  setPageBg(cat?.cover || (cat?.image && !/\/img\/seed\//.test(cat.image) && cat.image) || (S.settings.heroBgs || [])[0]);
  app.innerHTML = `
  <div class="page-hero has-bg on-full"><div class="container"><div class="crumbs"><a href="/" data-link>Bosh sahifa</a> / Katalog${cat ? ' / ' + h(cat.name) : ''}</div><h1>${cat ? h(cat.name) : 'Katalog'}</h1>${cat?.subtitle ? `<p class="muted" style="margin-top:10px">${h(cat.subtitle)}</p>` : ''}</div></div>
  <div class="container">
    <div class="chips"><a href="/katalog" data-link class="chip ${!cat ? 'active' : ''}">Barchasi</a>${S.cats.map((c) => `<a href="/katalog/${c.slug}" data-link class="chip ${cat?.id === c.id ? 'active' : ''}">${h(c.name)}</a>`).join('')}</div>
    <div class="toolbar"><div class="search-box">${I.search}<input class="input" id="q" placeholder="Mahsulot qidirish..."></div>
      <select class="input" id="sort" style="width:auto;border-radius:40px"><option value="new">Eng yangilar</option><option value="cheap">Arzonroq</option><option value="exp">Qimmatroq</option><option value="pop">Mashhur</option></select></div>
    <div class="p-grid" id="grid">${skeletons(8)}</div><div style="height:100px"></div>
  </div>`;
  let list;
  try { list = await allProducts(); } catch (e) { return toast(e.message, 'err'); }
  const base = cat ? list.filter((p) => p.categoryId === cat.id) : list;
  const draw = () => {
    const q = $('#q').value.toLowerCase().trim(); const s = $('#sort').value;
    let l = base.filter((p) => !q || (p.name + ' ' + p.description).toLowerCase().includes(q));
    l = [...l].sort((a, b) => s === 'cheap' ? a.price - b.price : s === 'exp' ? b.price - a.price : s === 'pop' ? (b.sold || 0) - (a.sold || 0) || b.featured - a.featured : String(b.createdAt).localeCompare(String(a.createdAt)));
    const g = $('#grid');
    g.innerHTML = l.length ? l.map(productCard).join('') : `<div class="empty" style="grid-column:1/-1">${I.search}<h3>Hech narsa topilmadi</h3><p>Boshqa soʻz bilan qidirib koʻring</p></div>`;
    bindCards(g, list); observe();
  };
  $('#q').oninput = draw; $('#sort').onchange = draw; draw();
};

pages.product = async (app, id) => {
  app.innerHTML = `<div class="pd"><div class="container"><div class="pd-grid"><div class="skel" style="aspect-ratio:9/11"></div><div><div class="skel" style="height:40px;width:70%"></div><div class="skel" style="height:120px;margin-top:20px"></div></div></div></div></div>`;
  let p;
  try { p = await api('/api/products/' + id); } catch { return pages.notFound(app); }
  document.title = p.name + ' — ' + S.settings.siteName;
  const sale = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const media = [...(p.images || []).map((src) => ({ t: 'img', src })), ...(p.video ? [{ t: 'video', src: p.video }] : [])];
  app.innerHTML = `<div class="pd"><div class="container">
    <div class="crumbs" style="margin-bottom:26px"><a href="/" data-link>Bosh sahifa</a> / <a href="/katalog/${p.category?.slug}" data-link>${h(p.category?.name)}</a> / ${h(p.name)}</div>
    <div class="pd-grid">
      <div class="gallery">
        <div class="thumbs">${media.map((m, i) => `<button class="${i ? '' : 'active'}" data-i="${i}">${m.t === 'img' ? `<img src="${h(m.src)}" alt="">` : `<div style="display:grid;place-items:center;height:100%;background:#000;color:var(--gold)">▶</div>`}</button>`).join('')}</div>
        <div class="main-img reveal-img" id="mainImg"><img src="${h(media[0]?.src || '')}" alt="${h(p.name)}"></div>
      </div>
      <div class="pd-info">
        <div class="eyebrow">${h(p.category?.name)}</div>
        <h1>${h(p.name)}</h1>
        <div class="pd-price"><b>${fmt(p.price)}</b>${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ''}${sale ? `<span class="tag sale">−${sale}%</span>` : ''}</div>
        <p class="pd-desc">${h(p.description)}</p>
        ${p.sizes?.length ? `<div class="opt-label"><span>Razmer: <b id="selSize" class="gold" style="letter-spacing:.05em">tanlanmagan</b></span><button id="tblBtn"><span class="msi">straighten</span> Razmerlar jadvali</button></div>
        <div class="sizes" id="sizes">${p.sizes.map((s) => `<button class="size" data-s="${h(s)}">${h(s)}</button>`).join('')}</div>` : ''}
        ${p.video ? `<button class="btn-3d-big" id="btnVid"><div class="cube"><span class="msi fill" style="font-size:30px;color:#000">play_arrow</span></div><div><b>Mahsulot videosini koʻrish</b><span>Mato, rang va bichimni haqiqiy videoda koʻring</span></div></button>` : ''}
        <div class="buy-row"><div class="qty"><button id="qm">−</button><span id="qv">1</span><button id="qp">+</button></div><button class="btn btn-gold" id="addBtn">${I.bag} Savatga qoʻshish</button></div>
        <button class="btn btn-ghost btn-block" id="buyNow">Hoziroq sotib olish</button>
        <p class="muted" style="font-size:13px;margin-top:14px">${p.stock > 0 ? `✓ Omborda mavjud${p.stock < 6 ? ` — faqat ${p.stock} ta qoldi!` : ''}` : '<span style="color:var(--red)">Hozircha tugagan — buyurtma bilan olib kelinadi</span>'}</p>
        <div class="perks"><div class="perk">${I.truck}<b>Yetkazib berish</b><span>${h(S.settings.deliveryNote || '')}</span></div><div class="perk">${I.shield}<b>Kafolat</b><span>Sifatli material</span></div><div class="perk">${I.refresh}<b>Almashtirish</b><span>Razmer mos kelmasa</span></div></div>
      </div>
    </div>
    <div class="sec-head reveal" style="margin-top:100px"><div><div class="eyebrow">Sizga yoqishi mumkin</div><h2>Oʻxshash <em>mahsulotlar</em></h2></div></div>
    <div class="p-grid" id="related">${skeletons(4)}</div>
  </div></div>`;
  let size = null, qty = 1;
  const main = $('#mainImg');
  $$('.thumbs button').forEach((b) => (b.onclick = () => {
    $$('.thumbs button').forEach((x) => x.classList.remove('active')); b.classList.add('active');
    const m = media[+b.dataset.i];
    main.innerHTML = m.t === 'img' ? `<img src="${h(m.src)}" alt="" style="animation:pageIn .5s">` : `<video src="${h(m.src)}" autoplay muted loop playsinline controls></video>`;
  }));
  $$('#sizes .size').forEach((b) => (b.onclick = () => { $$('#sizes .size').forEach((x) => x.classList.remove('active')); b.classList.add('active'); size = b.dataset.s; $('#selSize').textContent = size; }));
  if ($('#tblBtn')) $('#tblBtn').onclick = () => sizeTable(p.category?.sizeType);
  $('#qm').onclick = () => { qty = Math.max(1, qty - 1); $('#qv').textContent = qty; };
  $('#qp').onclick = () => { qty = Math.min(20, qty + 1); $('#qv').textContent = qty; };
  const need = () => { if (p.sizes?.length && !size) { $$('#sizes .size').forEach((x) => { x.classList.remove('shake'); void x.offsetWidth; x.classList.add('shake'); }); toast('Iltimos, razmer tanlang', 'err'); return false; } return true; };
  $('#addBtn').onclick = (e) => need() && addToCart(p, size || '', qty, e.currentTarget);
  $('#buyNow').onclick = () => { if (need()) { addToCart(p, size || '', qty); go('/buyurtma'); } };
  if ($('#btnVid')) $('#btnVid').onclick = () => playVideo(p);
  observe();
  allProducts().then((list) => {
    const rel = list.filter((x) => x.categoryId === p.categoryId && x.id !== p.id).concat(list.filter((x) => x.categoryId !== p.categoryId)).slice(0, 4);
    const g = $('#related'); if (!g) return; g.innerHTML = rel.map(productCard).join(''); bindCards(g, list); observe();
  });
};

pages.videos = async (app) => {
  app.innerHTML = `<div class="page-hero"><div class="container"><div class="crumbs"><a href="/" data-link>Bosh sahifa</a> / Videolar</div><h1>Mahsulot <em class="gold" style="font-style:italic">videolari</em></h1><p class="muted" style="margin-top:12px;max-width:560px">Mahsulotlarni haqiqiy videoda koʻring. Videoni ochish uchun ustiga bosing.</p></div></div>
  <div class="container" style="padding:50px 0 100px"><div class="p-grid" id="grid">${skeletons(8)}</div></div>`;
  const list = await allProducts(); const vids = list.filter((p) => p.video);
  const g = $('#grid'); if (!g) return;
  g.innerHTML = vids.length ? vids.map((p, i) => `<article class="v-card reveal" style="transition-delay:${(i % 4) * 0.08}s" data-v="${p.id}"><div class="p-media"><img src="${h(p.images?.[0] || '')}" alt="" loading="lazy"><span class="v-play"><span class="msi fill">play_arrow</span></span></div>
    <div class="p-body"><div class="p-cat">${h(p.category?.name || '')}</div><div class="p-name">${h(p.name)}</div><div class="price"><b>${fmt(p.price)}</b></div></div></article>`).join('')
    : `<div class="empty" style="grid-column:1/-1"><span class="msi" style="font-size:64px;color:var(--gold)">videocam_off</span><h3>Hozircha video yoʻq</h3><p>Tez orada mahsulot videolari qoʻshiladi</p></div>`;
  $$('.v-card').forEach((c) => (c.onclick = () => playVideo(vids.find((p) => p.id === c.dataset.v))));
  observe();
};

pages.login = async (app) => {
  if (S.role === 'admin') { location.href = '/admin'; return; }
  if (S.user) return go('/profil', true);
  app.innerHTML = authLayout(`
    <div class="eyebrow">Xush kelibsiz</div><h1>Kirish</h1><p>Hisobingizga kiring va xaridni davom ettiring</p>
    <form id="f"><div class="field"><label>Email yoki login</label><input class="input" name="email" autocomplete="username" placeholder="email@gmail.com" required></div>
    <div class="field"><label>Parol</label><div class="pw-wrap"><input class="input" name="password" type="password" autocomplete="current-password" placeholder="••••••" required><button type="button" data-eye>${I.eye}</button></div></div>
    <button class="btn btn-gold btn-block" style="margin-top:8px">Kirish ${I.arrow}</button></form>
    <div class="or">yoki</div><div id="gWrap"></div>
    <div class="switch">Hisobingiz yoʻqmi? <a href="/royxatdan-otish" data-link>Roʻyxatdan oʻting</a></div>`);
  bindEye(); setupGoogle();
  $('#f').onsubmit = async (e) => {
    e.preventDefault(); const b = e.target.querySelector('button.btn'); loading(b, true);
    try {
      const r = await api('/api/auth/login', { method: 'POST', body: { ...Object.fromEntries(new FormData(e.target)), dev: S.dev } });
      setSession(r.token, r.role, r.user || null);
      if (r.role === 'admin') { toast('Admin panelga xush kelibsiz!'); setTimeout(() => (location.href = '/admin'), 500); return; }
      toast(`Xush kelibsiz, ${r.user.name}!`); afterLogin();
    } catch (err) { toast(err.message, 'err'); loading(b, false); }
  };
};
pages.register = async (app) => {
  if (S.user) return go('/profil', true);
  app.innerHTML = authLayout(`
    <div class="eyebrow">Yangi hisob</div><h1>Roʻyxatdan oʻtish</h1><p>Bir daqiqada hisob yarating va buyurtma bering</p>
    <form id="f"><div class="field"><label>Ism-familiya</label><input class="input" name="name" placeholder="Ismingiz" required></div>
    <div class="field"><label>Email</label><input class="input" name="email" type="email" autocomplete="email" placeholder="email@gmail.com" required></div>
    <div class="field"><label>Telefon (ixtiyoriy)</label><input class="input" name="phone" type="tel" placeholder="+998 90 123 45 67"></div>
    <div class="field"><label>Parol</label><div class="pw-wrap"><input class="input" name="password" type="password" minlength="6" autocomplete="new-password" placeholder="Kamida 6 ta belgi" required><button type="button" data-eye>${I.eye}</button></div></div>
    <button class="btn btn-gold btn-block" style="margin-top:8px">Roʻyxatdan oʻtish ${I.arrow}</button></form>
    <div class="or">yoki</div><div id="gWrap"></div>
    <div class="switch">Hisobingiz bormi? <a href="/kirish" data-link>Kirish</a></div>`);
  bindEye(); setupGoogle();
  $('#f').onsubmit = async (e) => {
    e.preventDefault(); const b = e.target.querySelector('button.btn'); loading(b, true);
    try {
      const r = await api('/api/auth/register', { method: 'POST', body: { ...Object.fromEntries(new FormData(e.target)), dev: S.dev } });
      setSession(r.token, r.role, r.user); toast('Roʻyxatdan oʻtdingiz! Xush kelibsiz 🎩'); afterLogin();
    } catch (err) { toast(err.message, 'err'); loading(b, false); }
  };
};
function authLayout(inner) {
  return `<div class="auth"><div class="auth-art"><img src="${h(S.settings.heroImage)}" alt=""><div class="q"><div class="eyebrow">${h(S.settings.siteName)}</div><h2>Uslub — bu soʻzsiz <em class="gold">oʻzingizni</em> taqdim etish.</h2></div></div>
  <div class="auth-form"><div class="auth-card">${inner}</div></div></div>`;
}
function bindEye() { $$('[data-eye]').forEach((b) => (b.onclick = () => { const i = b.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; })); }
function afterLogin() {
  const next = new URLSearchParams(location.search).get('next');
  startNotifs(); go(next && next.startsWith('/') ? next : '/profil');
}
function loading(b, on) { if (!b) return; if (on) { b.dataset.html = b.innerHTML; b.innerHTML = '<span class="spin"></span>'; b.disabled = true; } else { b.innerHTML = b.dataset.html || b.innerHTML; b.disabled = false; } }
let gsiLoaded = null;
function setupGoogle() {
  const w = $('#gWrap'); if (!w) return;
  const cid = S.settings.googleClientId;
  if (!cid) {
    w.innerHTML = `<button class="g-btn" id="gFake">${I.google} Google orqali kirish</button>`;
    $('#gFake').onclick = () => toast('Google orqali kirish hali sozlanmagan (admin: Sozlamalar → Google Client ID)', 'info', 4500);
    return;
  }
  w.innerHTML = '<div id="gsi"><div class="skel" style="height:44px;width:300px;border-radius:40px"></div></div>';
  gsiLoaded = gsiLoaded || new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  gsiLoaded.then(() => {
    google.accounts.id.initialize({
      client_id: cid,
      callback: async (resp) => {
        try { const r = await api('/api/auth/google', { method: 'POST', body: { credential: resp.credential, dev: S.dev } }); setSession(r.token, r.role, r.user); toast(`Xush kelibsiz, ${r.user.name}!`); afterLogin(); }
        catch (e) { toast(e.message, 'err'); }
      },
    });
    const box = $('#gsi'); if (!box) return; box.innerHTML = '';
    google.accounts.id.renderButton(box, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'continue_with', width: Math.min(400, box.offsetWidth || 340), locale: 'uz' });
  }).catch(() => { w.innerHTML = '<p class="muted" style="text-align:center">Google xizmatini yuklab boʻlmadi</p>'; });
}

pages.checkout = async (app) => {
  if (!S.user) { toast('Buyurtma berish uchun avval tizimga kiring', 'info'); return go('/kirish?next=/buyurtma', true); }
  if (!S.cart.length) {
    app.innerHTML = `<div class="nf"><div><div class="empty">${I.bag}<h3>Savatingiz boʻsh</h3><p>Buyurtma berish uchun avval mahsulot tanlang</p></div><a href="/katalog" data-link class="btn btn-gold">Katalogga oʻtish ${I.arrow}</a></div></div>`; return;
  }
  const s = S.settings;
  app.innerHTML = `<div class="page-hero" style="padding-bottom:30px"><div class="container"><div class="crumbs"><a href="/" data-link>Bosh sahifa</a> / Buyurtma</div><h1>Buyurtma berish</h1></div></div>
  <div class="container" style="padding:40px 0 100px"><form class="co-grid" id="coForm" novalidate>
    <div>
      <div class="panel reveal"><div class="panel-title"><span class="n">1</span><h3>Qabul qiluvchi</h3></div>
        <div class="row"><div class="field"><label>Ism-familiya *</label><input class="input" name="name" value="${h(S.user.name)}" required></div>
        <div class="field"><label>Telefon raqam *</label><input class="input" name="phone" type="tel" value="${h(S.user.phone || '+998 ')}" placeholder="+998 90 123 45 67" required></div></div>
        <div class="field"><label>Qoʻshimcha telefon</label><input class="input" name="phone2" type="tel" placeholder="+998 ..."></div>
      </div>
      <div class="panel reveal"><div class="panel-title"><span class="n">2</span><h3>Yetkazib berish manzili</h3></div>
        <div class="seg" id="seg"><i></i><button type="button" class="active" data-m="map">${I.pin} Xaritada belgilash</button><button type="button" data-m="manual">${I.edit} Qoʻlda kiritish</button></div>
        <div id="locManual" class="hidden"><div class="field"><label>Toʻliq manzil *</label><textarea class="input" id="manAddr" placeholder="Masalan: Toshkent, Chilonzor tumani, Bunyodkor koʻchasi 12-uy"></textarea>
          <small class="geo-status" id="geoStatus"><span class="msi">travel_explore</span> Manzilni yozing — u xaritada avtomatik koʻrsatiladi</small></div></div>
        <div id="map"><div class="skel" style="height:100%"></div></div>
        <div class="map-tools"><button type="button" class="btn btn-dark btn-sm" id="geoBtn"><span class="msi">my_location</span> Mening joylashuvim</button><small id="mapHint">Xaritani bosib, uyingiz joylashuvini belgilang</small></div>
        <div id="locInfo"></div>
        <div class="field" id="extraWrap" style="margin-top:14px"><label>Uy, xonadon, moʻljal (ixtiyoriy)</label><input class="input" id="mapAddr" placeholder="Masalan: 12-uy, 45-xonadon, moʻljal: maktab"></div>
      </div>
      <div class="panel reveal"><div class="panel-title"><span class="n">3</span><h3>Toʻlov</h3></div>
        <p class="muted" style="margin-bottom:18px">Quyidagi kartaga <b class="gold">${fmt(grandTotal())}</b> oʻtkazing va toʻlov chekini (skrinshot) yuklang.</p>
        <div class="pay-card" id="payCard"><div class="top"><div class="chip-i"></div><span class="bank">${h(s.cardBank || '')}</span></div>
          <div class="num" id="cardNum">${h(s.cardNumber)}</div>
          <div class="holder"><div><small>Karta egasi</small>${h(s.cardHolder)}</div><div style="text-align:right"><small>Summa</small>${fmt(grandTotal())}</div></div></div>
        <div class="copy-row"><button type="button" class="btn btn-dark btn-sm" id="copyCard">${I.copy} Karta raqamini nusxalash</button><button type="button" class="btn btn-dark btn-sm" id="copySum">${I.copy} Summani nusxalash</button></div>
        <div class="warning"><div class="ic">!</div><div><b>⚠ OGOHLANTIRISH!</b><p>Cheksiz mahsulot berilmaydi! Yolgʻon (soxta) chekka ham buyurtma berilmaydi! Har bir chek admin tomonidan tekshiriladi va faqat tasdiqlangan toʻlovdan keyin mahsulot yuboriladi.</p></div></div>
        <label class="field" style="margin-bottom:6px"><span style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Toʻlov cheki (skrinshot) *</span></label>
        <div class="drop" id="drop">${I.upload}<b>Chek skrinshotini yuklang</b><span>Bosing yoki rasmni shu yerga tashlang (JPG, PNG)</span></div>
        <input type="file" id="checkFile" accept="image/*" hidden>
        <div class="field" style="margin-top:18px"><label>Izoh (ixtiyoriy)</label><textarea class="input" name="note" style="min-height:80px" placeholder="Qoʻshimcha maʼlumot..."></textarea></div>
      </div>
    </div>
    <div class="summary"><div class="panel reveal"><div class="panel-title"><h3>Buyurtmangiz</h3></div>
      ${S.cart.map((i) => `<div class="s-item"><img src="${h(i.image)}" alt=""><div><b>${h(i.name)}</b><span>${i.size ? 'Razmer: ' + h(i.size) + ' • ' : ''}${i.qty} dona</span></div><em>${fmt(i.price * i.qty)}</em></div>`).join('')}
      <div style="margin-top:18px"><div class="sum-row"><span>Mahsulotlar</span><span>${fmt(cartTotal())}</span></div>${delivRow()}
      <div class="sum-row total"><span>Jami toʻlov</span><b>${fmt(grandTotal())}</b></div></div>
      <button class="btn btn-gold btn-block" id="submitBtn">Buyurtmani tasdiqlash ${I.arrow}</button>
      <p class="muted" style="font-size:12px;margin-top:12px;text-align:center">Buyurtma admin tomonidan tekshirilgach, sizga bildirishnoma keladi 🔔</p>
    </div></div>
  </form></div>`;
  observe();
  let mode = 'map', point = null, check = null, map = null, marker = null, setPoint = () => {};
  // segment
  $$('#seg button').forEach((b) => (b.onclick = () => {
    mode = b.dataset.m; $$('#seg button').forEach((x) => x.classList.toggle('active', x === b));
    $('#seg').classList.toggle('right', mode === 'manual');
    $('#locManual').classList.toggle('hidden', mode === 'map'); $('#extraWrap').classList.toggle('hidden', mode !== 'map');
    $('#mapHint').textContent = mode === 'map' ? 'Xaritani bosib, uyingiz joylashuvini belgilang' : 'Yozgan manzilingiz xaritada koʻrsatiladi. Notoʻgʻri boʻlsa — pinni suring yoki xaritani bosing';
    if (mode === 'manual') { point = null; userMoved = false; if (marker) { map.removeLayer(marker); marker = null; } $('#locInfo').innerHTML = ''; geocode(); }
    if (map) setTimeout(() => map.invalidateSize(), 50);
  }));
  // map
  try {
    const L = await loadLeaflet();
    if (!$('#map')) return;
    $('#map').innerHTML = '';
    map = L.map('map', { zoomControl: true, attributionControl: true }).setView([s.lat || 41.3111, s.lng || 69.2406], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
    const icon = L.divIcon({ className: '', html: '<div class="gh-pin"></div>', iconSize: [40, 40], iconAnchor: [20, 40] });
    setPoint = async (lat, lng, found) => {
      point = { lat: +lat.toFixed(6), lng: +lng.toFixed(6), address: found || '' };
      if (marker) marker.setLatLng([lat, lng]); else marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map).on('dragend', (e) => { userMoved = true; const p = e.target.getLatLng(); setPoint(p.lat, p.lng); });
      $('#locInfo').innerHTML = `<div class="loc-ok"><span class="msi">where_to_vote</span> ${mode === 'map' ? 'Joylashuv belgilandi' : 'Xaritada koʻrsatildi'}: ${point.lat}, ${point.lng} <span id="addrTxt">${found ? '— ' + h(found) : ''}</span></div>`;
      if (found) return;
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&accept-language=uz&lat=${lat}&lon=${lng}`);
        const j = await r.json(); if (j.display_name && point) { point.address = j.display_name.split(',').slice(0, 4).join(','); const t = $('#addrTxt'); if (t) t.textContent = '— ' + point.address; }
      } catch {}
    };
    map.on('click', (e) => { userMoved = true; setPoint(e.latlng.lat, e.latlng.lng); });
    $('#geoBtn').onclick = () => {
      if (!navigator.geolocation) return geoHelp();
      const b = $('#geoBtn'); loading(b, true);
      navigator.geolocation.getCurrentPosition((pos) => { loading(b, false); userMoved = true; map.setView([pos.coords.latitude, pos.coords.longitude], 17); setPoint(pos.coords.latitude, pos.coords.longitude); },
        (err) => { loading(b, false); geoHelp(err && err.code); }, { enableHighAccuracy: true, timeout: 12000 });
    };
  } catch { $('#map').innerHTML = '<div class="empty">Xaritani yuklab boʻlmadi. “Qoʻlda kiritish”dan foydalaning.</div>'; }
  // qoʻlda yozilgan manzilni xaritada koʻrsatish
  let geoT = null, geoSeq = 0;
  // manzilni tozalash: "shaxar", "tumani", "ko'chasi" kabi soʻzlar qidiruvga xalaqit beradi
  const cleanQ = (q) => q.replace(/[ʻʼ'‘’`]/g, "'").replace(/\b(sh\.|shaxar\w*|shahar\w*|shaxri|shahri|gorod|г\.|город)\b/gi, ' ')
    .replace(/\b(viloyat\w*|tuman\w*|mahalla\w*|mfy|ko'cha\w*|kocha\w*|uy|xonadon\w*|kv\.?|d\.)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  let userMoved = false;
  async function geocode(srcId = mode === 'map' ? 'mapAddr' : 'manAddr') {
    const q = $('#' + srcId)?.value.trim(); const st = srcId === 'manAddr' ? $('#geoStatus') : $('#mapHint');
    const idle = srcId === 'manAddr' ? '<span class="msi">travel_explore</span> Manzilni yozing — u xaritada avtomatik koʻrsatiladi' : 'Xaritani bosib, uyingiz joylashuvini belgilang';
    if (!q || q.length < 3 || !map) { if (st) st.innerHTML = idle; return null; }
    const my = ++geoSeq; if (st) st.innerHTML = '<span class="msi spin-i">progress_activity</span> Xaritadan qidirilmoqda…';
    const parts = q.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
    const tries = [...new Set([cleanQ(q), q, ...parts.map((_, i) => cleanQ(parts.slice(i).join(', '))), ...parts.map(cleanQ).reverse()].filter((x) => x && x.length > 2))];
    for (const t of tries) {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=uz&accept-language=uz&q=${encodeURIComponent(t)}`);
        const list = await r.json(); if (my !== geoSeq) return null;
        // eng muhim natija: shahar/tuman markazi koʻchadan ustun
        const rank = (x) => (Number(x.importance) || 0) + (/^(city|town|village)$/.test(x.type) || x.class === 'place' ? 0.3 : 0) + (x.class === 'boundary' ? 0.15 : 0);
        const best = [...list].sort((a2, b2) => rank(b2) - rank(a2))[0];
        if (best) {
          const la = +best.lat, lo = +best.lon, exact = t === q || t === cleanQ(q);
          const zoom = /city|town|administrative|state|county|village/.test(best.type + ' ' + best.class) ? 13 : exact ? 17 : 15;
          map.flyTo([la, lo], zoom, { duration: 1.1 }); setPoint(la, lo, best.display_name.split(',').slice(0, 3).join(','));
          if (st) st.innerHTML = `<span class="msi ok" style="color:var(--green)">check_circle</span> Xaritada belgilandi${exact ? '' : ' (taxminiy)'} — aniq joy uchun pinni suring yoki xaritani bosing`;
          return { lat: la, lng: lo };
        }
      } catch { break; }
    }
    if (my === geoSeq && st) st.innerHTML = '<span class="msi warn" style="color:#eab308">help</span> Xaritadan topilmadi — xaritani bosib joyni oʻzingiz belgilang';
    return null;
  }
  $('#manAddr').oninput = () => { clearTimeout(geoT); geoT = setTimeout(() => geocode('manAddr'), 800); };
  // xarita rejimida ham: manzil yozilsa (va pin hali qoʻlda qoʻyilmagan boʻlsa) — avtomatik belgilanadi
  $('#mapAddr').oninput = () => { if (userMoved) return; clearTimeout(geoT); geoT = setTimeout(() => geocode('mapAddr'), 800); };
  // copy
  const copy = (t) => navigator.clipboard?.writeText(t).then(() => toast('Nusxalandi: ' + t)).catch(() => toast(t, 'info'));
  $('#copyCard').onclick = () => copy(String(s.cardNumber).replace(/\s/g, ''));
  $('#copySum').onclick = () => copy(String(Math.round(grandTotal())));
  const card = $('#payCard');
  card.onmousemove = (e) => { const r = card.getBoundingClientRect(); card.style.transform = `perspective(800px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 14}deg) rotateX(${-((e.clientY - r.top) / r.height - 0.5) * 14}deg)`; };
  card.onmouseleave = () => (card.style.transform = '');
  // check upload
  const drop = $('#drop'), file = $('#checkFile');
  drop.onclick = () => file.click();
  drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files[0]) useFile(e.dataTransfer.files[0]); };
  file.onchange = () => file.files[0] && useFile(file.files[0]);
  async function useFile(f) {
    if (!f.type.startsWith('image/')) return toast('Faqat rasm yuklang (skrinshot)', 'err');
    try { check = await compressImage(f, 1700, 0.88); drop.classList.add('has'); drop.innerHTML = `<img src="${check}" alt="chek"><span class="chg">✓ Chek yuklandi • almashtirish uchun bosing</span>`; }
    catch { toast('Rasmni oʻqib boʻlmadi', 'err'); }
  }
  // submit
  $('#coForm').onsubmit = async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    if (!fd.name?.trim()) return toast('Ism-familiyani kiriting', 'err');
    if (!/^[+\d][\d\s()-]{6,}$/.test(fd.phone?.trim() || '')) return toast('Telefon raqamni toʻgʻri kiriting', 'err');
    let location;
    if (mode === 'map') {
      if (!point && $('#mapAddr').value.trim().length > 2) await geocode('mapAddr');
      if (!point) { $('#map').scrollIntoView({ behavior: 'smooth', block: 'center' }); return toast('Xaritani bosib joyni belgilang yoki pastga manzilni yozing', 'err'); }
      const extra = $('#mapAddr').value.trim();
      location = { type: 'map', lat: point.lat, lng: point.lng, address: [extra, point.address].filter(Boolean).join(' | ') };
    } else {
      const a = $('#manAddr').value.trim(); if (a.length < 5) return toast('Manzilni toʻliq kiriting', 'err');
      if (!point) await geocode('manAddr');
      location = { type: 'manual', address: a, ...(point ? { lat: point.lat, lng: point.lng } : {}) };
    }
    if (!check) { drop.scrollIntoView({ behavior: 'smooth', block: 'center' }); drop.classList.remove('shake'); void drop.offsetWidth; drop.classList.add('shake'); return toast('Toʻlov chekini yuklang! Cheksiz buyurtma qabul qilinmaydi.', 'err', 4500); }
    const b = $('#submitBtn'); loading(b, true);
    try {
      const r = await api('/api/orders', { method: 'POST', body: { items: S.cart.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })), name: fd.name, phone: fd.phone, phone2: fd.phone2, note: fd.note, location, check } });
      S.cart = []; saveCart(); S.products = null;
      successView(app, r.order); loadNotifs();
    } catch (err) { toast(err.message, 'err', 4500); loading(b, false); }
  };
};
function successView(app, o) {
  window.scrollTo(0, 0);
  app.innerHTML = `<div class="success"><div><svg class="check-anim" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"/><path d="M38 62l15 15 30-32"/></svg>
    <div class="eyebrow" style="justify-content:center">Buyurtma #${o.number}</div><h1>Rahmat! Buyurtmangiz <em class="gold">qabul qilindi</em></h1>
    <p>Toʻlov chekingiz admin tomonidan tekshirilmoqda. Tasdiqlangach, 🔔 qoʻngʻiroqcha orqali xabar olasiz va buyurtmangiz tez orada yetib boradi.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a href="/profil" data-link class="btn btn-gold">Buyurtmalarim ${I.arrow}</a><a href="/katalog" data-link class="btn btn-ghost">Xaridni davom ettirish</a></div></div></div>`;
  confetti();
}

pages.profile = async (app) => {
  if (!S.user) return go('/kirish?next=/profil', true);
  const u = S.user;
  app.innerHTML = `<div class="page-hero"><div class="container" style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
    ${u.avatar ? `<img src="${h(u.avatar)}" class="avatar" style="width:84px;height:84px" referrerpolicy="no-referrer">` : `<div class="avatar" style="width:84px;height:84px;font-size:32px">${h(u.name[0] || '?').toUpperCase()}</div>`}
    <div><div class="crumbs">Shaxsiy kabinet</div><h1 style="font-size:clamp(36px,5vw,64px)">${h(u.name)}</h1><p class="muted">${h(u.email)}</p></div>
    <button class="btn btn-ghost btn-sm" style="margin-left:auto" id="logoutBtn"><span class="msi">logout</span> Chiqish</button></div></div>
  <div class="container" style="padding:40px 0 100px">
    <div class="tabs"><button class="active" data-t="orders">Buyurtmalarim</button><button data-t="notifs">Bildirishnomalar</button><button data-t="settings">Sozlamalar</button></div>
    <div id="tabBody"></div></div>`;
  $('#logoutBtn').onclick = logout;
  const tabs = {
    async orders(b) {
      b.innerHTML = '<div class="skel" style="height:160px"></div>';
      const list = await api('/api/my/orders');
      if (!list.length) { b.innerHTML = `<div class="empty">${I.bag}<h3>Hali buyurtma yoʻq</h3><p>Birinchi xaridingizni hoziroq qiling</p><a href="/katalog" data-link class="btn btn-gold" style="margin-top:20px">Katalog</a></div>`; return; }
      const stepIdx = { pending: 0, confirmed: 1, delivered: 2, rejected: -1 };
      b.innerHTML = list.map((o, n) => `<div class="order-card" style="animation-delay:${n * 0.06}s">
        <div class="oh"><div><b>#${o.number}</b> <span class="muted" style="font-size:13px;margin-left:8px">${new Date(o.createdAt).toLocaleString('ru-RU')}</span></div><span class="status st-${o.status}">${statusText(o.status)}</span></div>
        ${o.items.map((i) => `<div class="s-item"><img src="${h(i.image)}" alt=""><div><b>${h(i.name)}</b><span>${i.size ? 'Razmer: ' + h(i.size) + ' • ' : ''}${i.qty} dona</span></div><em>${fmt(i.sum)}</em></div>`).join('')}
        ${o.status === 'rejected' ? `<p style="color:#f87171;margin-top:14px;font-size:14px">Toʻlov cheki tasdiqlanmadi. Savollar uchun: <a href="${h(S.settings.telegramSupport)}" target="_blank" class="gold">Telegram yordam</a></p>` :
        `<div class="timeline">${['Kutilmoqda', 'Tasdiqlandi', 'Yetkazildi'].map((t, i) => `<div class="${i <= stepIdx[o.status] ? 'done' : ''}">${t}</div>`).join('')}</div>`}
        <div class="sum-row total" style="margin:16px 0 0"><span>Jami</span><b>${fmt(o.total)}</b></div></div>`).join('');
    },
    async notifs(b) {
      await loadNotifs();
      b.innerHTML = S.notifs.length ? S.notifs.map((n) => `<div class="notif ${n.read ? '' : 'unread'}" style="border:1px solid var(--line);border-radius:16px;margin-bottom:10px"><span class="dot"></span><div><b>${h(n.title)}</b><p>${h(n.text)}</p><time>${timeAgo(n.createdAt)}</time></div></div>`).join('') : `<div class="empty"><h3>Bildirishnoma yoʻq</h3></div>`;
      markRead();
    },
    async settings(b) {
      b.innerHTML = `<form id="pf" class="panel" style="max-width:560px"><div class="field"><label>Ism-familiya</label><input class="input" name="name" value="${h(u.name)}"></div>
        <div class="field"><label>Telefon</label><input class="input" name="phone" value="${h(u.phone)}" placeholder="+998"></div>
        ${u.google ? '' : `<div class="field"><label>Eski parol</label><input class="input" type="password" name="oldPassword"></div><div class="field"><label>Yangi parol</label><input class="input" type="password" name="newPassword" placeholder="Oʻzgartirmasangiz boʻsh qoldiring"></div>`}
        <button class="btn btn-gold">Saqlash</button></form>`;
      $('#pf').onsubmit = async (e) => {
        e.preventDefault(); const btn = e.target.querySelector('.btn'); loading(btn, true);
        try { const r = await api('/api/me', { method: 'PUT', body: Object.fromEntries(new FormData(e.target)) }); S.user = r.user; renderUserArea(); toast('Saqlandi'); }
        catch (err) { toast(err.message, 'err'); }
        loading(btn, false);
      };
    },
  };
  const show = (t) => { $$('.tabs button').forEach((x) => x.classList.toggle('active', x.dataset.t === t)); tabs[t]($('#tabBody')).catch((e) => toast(e.message, 'err')); };
  $$('.tabs button').forEach((b) => (b.onclick = () => show(b.dataset.t)));
  show(new URLSearchParams(location.search).get('tab') || 'orders');
};
const statusText = (s) => ({ pending: 'Tekshirilmoqda', confirmed: 'Tasdiqlandi', rejected: 'Rad etildi', delivered: 'Yetkazildi' }[s] || s);

pages.cart = async (app) => {
  const c = cartCount();
  app.innerHTML = `<div class="page-hero has-bg cp-hero">${phBg((S.settings.heroBgs || [])[0])}<div class="container"><div class="crumbs"><a href="/" data-link>Bosh sahifa</a> / Savat</div>
    <h1><span class="msi fill cp-ic">shopping_bag</span> Savat <em id="cpCnt">${c ? c + ' dona' : ''}</em></h1><p class="muted">Tanlagan mahsulotlaringiz — buyurtma berishdan oldin tekshirib oling</p></div></div>
  <div class="container cart-page"><div class="cp-grid"><div class="cp-items" id="cpBody"></div><aside class="cp-sum"><div class="cp-sum-in" id="cpFoot"></div></aside></div></div>`;
  renderDrawer($('#cpBody'), $('#cpFoot'));
  observe();
};

pages.contact = async (app) => {
  const s = S.settings;
  app.innerHTML = `<div class="page-hero has-bg">${phBg((S.settings.heroBgs || [])[1] || (S.settings.heroBgs || [])[0])}<div class="container"><div class="crumbs"><a href="/" data-link>Bosh sahifa</a> / Aloqa</div><h1>Biz bilan <em class="gold" style="font-style:italic">bogʻlaning</em></h1></div></div>
  <div class="container" style="padding:50px 0 100px">
    <div class="contact-grid">
      ${[
        ...(s.phones || []).map((p) => ({ href: 'tel:' + p.replace(/[^\d+]/g, ''), ic: 'call', t: 'Telefon', v: p, a: 'Qoʻngʻiroq qilish', c: 'gold' })),
        { href: s.telegramSupport, ic: 'send', t: 'Yordam • Telegram', v: '@' + (s.telegramSupport || '').split('/').pop(), a: 'Yozish', c: 'tg', ext: 1 },
        { href: 'https://t.me/' + (s.adminTelegram || '').replace('@', ''), ic: 'workspace_premium', t: 'Admin • Telegram', v: s.adminTelegram, a: 'Yozish', c: 'tg', ext: 1 },
        { href: s.instagram, ic: 'photo_camera', t: 'Instagram', v: '@' + (s.instagram || '').replace(/\/$/, '').split('/').pop(), a: 'Sahifani ochish', c: 'ig', ext: 1 },
        { href: `https://maps.google.com/?q=${s.lat},${s.lng}`, ic: 'location_on', t: 'Manzil', v: s.address, a: 'Xaritada koʻrish', c: 'gold', ext: 1 },
        { ic: 'schedule', t: 'Ish vaqti', v: s.workHours, a: 'Har kuni ochiqmiz', c: 'gold' },
      ].map((x, i) => `<${x.href ? 'a' : 'div'} ${x.href ? `href="${h(x.href)}"${x.ext ? ' target="_blank" rel="noopener"' : ''}` : ''} class="c-card cc-${x.c} reveal" style="transition-delay:${i * 0.06}s">
        <div class="cc-top"><div class="ic"><span class="msi">${x.ic}</span></div>${x.href ? '<span class="cc-go msi">arrow_outward</span>' : ''}</div>
        <h4>${h(x.t)}</h4><div class="v">${h(x.v || '—')}</div><div class="cc-act">${h(x.a)}</div></${x.href ? 'a' : 'div'}>`).join('')}
    </div>
    <div class="map-embed reveal"><iframe src="https://maps.google.com/maps?q=${s.lat},${s.lng}&z=15&output=embed" width="100%" height="100%" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
    <div style="text-align:center;margin-top:20px"><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://maps.google.com/?q=${s.lat},${s.lng}">${I.pin} Google Maps’da ochish</a></div>
  </div>`;
  $$('.c-card').forEach((c) => (c.onpointermove = (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }));
  observe();
};

pages.notFound = (app) => {
  document.title = '404 — Sahifa topilmadi';
  app.innerHTML = `<div class="nf"><div><div class="big">404</div><h2>Sahifa topilmadi</h2><p>Iltimos, toʻgʻri sahifaga oʻting. Siz qidirgan sahifa mavjud emas yoki koʻchirilgan.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a href="/" data-link class="btn btn-gold">Bosh sahifaga qaytish ${I.arrow}</a><a href="/katalog" data-link class="btn btn-ghost">Katalog</a></div></div></div>`;
};

/* ============================ ROUTER ============================= */
const ROUTES = [
  [/^\/$/, pages.home], [/^\/katalog\/?$/, pages.catalog], [/^\/katalog\/([\w-]+)\/?$/, pages.catalog], [/^\/mahsulot\/([\w-]+)\/?$/, pages.product],
  [/^\/savat\/?$/, pages.cart], [/^\/buyurtma\/?$/, pages.checkout], [/^\/kirish\/?$/, pages.login],
  [/^\/royxatdan-otish\/?$/, pages.register], [/^\/profil\/?$/, pages.profile], [/^\/(videolar|kiyib-korish)\/?$/, () => go('/katalog', true)], [/^\/aloqa\/?$/, pages.contact],
];
let firstRender = true;
async function render() {
  const app = $('#app'); const path = location.pathname;
  const bar = $('#topbar'); bar.style.opacity = 1; bar.style.width = '30%';
  if (!firstRender) { app.classList.remove('enter'); app.classList.add('leave'); await sleep(260); }
  closeDrawer(); closeModal(); $('#mNav').classList.remove('open');
  if (!/^\/katalog/.test(location.pathname)) setPageBg(null);
  window.__ghBeat?.();
  $$('#mNav .mn-item').forEach((x) => x.classList.toggle('active', x.getAttribute('href') === location.pathname));
  window.scrollTo(0, 0);
  document.title = S.settings.siteName ? `${S.settings.siteName} — ${S.settings.tagline || ''}` : 'Gentleman House';
  let found = false;
  for (const [re, fn] of ROUTES) { const m = re.exec(path); if (m) { found = true; app.classList.remove('leave'); app.classList.add('enter'); const pr = fn(app, m[1]); bar.style.width = '70%'; await pr?.catch?.((e) => toast(e.message, 'err')); break; } }
  if (!found) { app.classList.remove('leave'); app.classList.add('enter'); pages.notFound(app); }
  bar.style.width = '100%'; setTimeout(() => { bar.style.opacity = 0; setTimeout(() => (bar.style.width = 0), 400); }, 200);
  $$('nav.main a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === path || (a.getAttribute('href') !== '/' && path.startsWith(a.getAttribute('href')))));
  observe(); firstRender = false;
}
function go(url, replace = false) { replace ? history.replaceState({}, '', url) : history.pushState({}, '', url); render(); }
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const href = a.getAttribute('href');
  if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/admin') || href.startsWith('/uploads')) return;
  e.preventDefault(); if (href !== location.pathname + location.search) go(href); else { closeDrawer(); $('#mNav').classList.remove('open'); }
});
window.addEventListener('popstate', render);

/* ============================ LAYOUT ============================= */
function renderChrome() {
  const s = S.settings;
  $$('[data-s="siteName"]').forEach((e) => (e.textContent = s.siteName));
  const links = [['/', 'Bosh sahifa'], ['/katalog', 'Katalog'], ...S.cats.map((c) => ['/katalog/' + c.slug, c.name]), ['/aloqa', 'Aloqa']];
  const nCats = innerWidth > 1560 ? 4 : innerWidth > 1300 ? 3 : innerWidth > 1120 ? 2 : 0;
  const desk = [['/katalog', 'Katalog'], ...S.cats.slice(0, nCats).map((c) => ['/katalog/' + c.slug, c.name]), ['/aloqa', 'Aloqa']];
  $('#mainNav').innerHTML = desk.map(([u, t]) => `<a href="${u}" data-link>${h(t)}</a>`).join('');
  const ICO = { '/': 'home', '/katalog': 'grid_view', '/aloqa': 'support_agent' };
  const cur = location.pathname;
  const mItems = [['/', 'Bosh sahifa'], ['/katalog', 'Katalog'], ...S.cats.map((c) => ['/katalog/' + c.slug, c.name, c.cover || c.image]), ['/aloqa', 'Aloqa']];
  $('#mNav').innerHTML = `<div class="mn-glow"></div>
    <div class="mn-top"><a href="/" data-link class="logo"><div class="logo-mark"><img src="/img/logo-96.png" alt="GH"></div><div class="logo-text">${h(s.siteName)}<small>PREMIUM MENSWEAR</small></div></a><button class="mn-x" id="mClose" aria-label="Yopish"><span class="msi">close</span></button></div>
    <nav class="mn-list">${mItems.map(([u, t, img], i) => `<a href="${u}" data-link class="mn-item ${cur === u ? 'active' : ''}" style="--i:${i}">
      <span class="mn-ic">${img ? `<img src="${h(img)}" alt="">` : `<span class="msi">${ICO[u] || 'checkroom'}</span>`}</span><span class="mn-t">${h(t)}</span><span class="mn-n">${String(i + 1).padStart(2, '0')}</span><span class="msi mn-go">arrow_forward</span></a>`).join('')}</nav>
    <div class="mn-foot" style="--i:${mItems.length}">
      ${(s.phones || [])[0] ? `<a class="mn-phone" href="tel:${h(s.phones[0].replace(/[^\d+]/g, ''))}"><span class="msi">call</span>${h(s.phones[0])}</a>` : ''}
      <div class="mn-soc"><a href="${h(s.instagram)}" target="_blank" rel="noopener" class="sb ig" aria-label="Instagram">${I.ig}<span>Instagram</span></a><a href="${h(s.telegramSupport)}" target="_blank" rel="noopener" class="sb tg" aria-label="Telegram">${I.tg}<span>Telegram</span></a></div></div>`;
  $('#mClose').onclick = () => $('#mNav').classList.remove('open');
  $('#footer').innerHTML = `<div class="container"><div class="f-big"><span>${h(s.siteName)}</span></div>
    <div class="f-grid">
      <div><a href="/" data-link class="logo" style="margin-bottom:18px"><div class="logo-mark"><img src="/img/logo-96.png" alt="GH"></div><div class="logo-text">${h(s.siteName)}<small>PREMIUM MENSWEAR</small></div></a><p>${h(s.aboutText).slice(0, 160)}…</p>
        <div class="socials"><a class="sb ig" href="${h(s.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}<span>Instagram</span></a><a class="sb tg" href="${h(s.telegramSupport)}" target="_blank" rel="noopener" aria-label="Telegram">${I.tg}<span>Telegram</span></a></div></div>
      <div><h5>Kategoriyalar</h5>${S.cats.map((c) => `<a href="/katalog/${c.slug}" data-link>${h(c.name)}</a>`).join('')}</div>
      <div><h5>Sahifalar</h5><a href="/katalog" data-link>Katalog</a><a href="/profil" data-link>Shaxsiy kabinet</a><a href="/buyurtma" data-link>Savat va buyurtma</a><a href="/aloqa" data-link>Aloqa</a></div>
      <div><h5>Aloqa</h5>${(s.phones || []).map((p) => `<a href="tel:${h(p.replace(/[^\d+]/g, ''))}">${h(p)}</a>`).join('')}<a href="${h(s.telegramSupport)}" target="_blank">Yordam: @${h((s.telegramSupport || '').split('/').pop())}</a><a href="https://t.me/${h((s.adminTelegram || '').replace('@', ''))}" target="_blank">Admin: ${h(s.adminTelegram)}</a><p>${h(s.address)}</p><p>${h(s.workHours)}</p></div>
    </div>
    <div class="f-bottom"><span>© ${new Date().getFullYear()} ${h(s.siteName)}. Barcha huquqlar himoyalangan.</span><span>Premium erkaklar kiyimlari</span></div></div>`;
  $('#fabList').innerHTML = `<a href="${h(s.telegramSupport)}" target="_blank" rel="noopener">${I.tg} Yordam: @${h((s.telegramSupport || '').split('/').pop())}</a>
    <a href="https://t.me/${h((s.adminTelegram || '').replace('@', ''))}" target="_blank" rel="noopener">${I.tg} Admin: ${h(s.adminTelegram)}</a>
    <a href="${h(s.instagram)}" target="_blank" rel="noopener">${I.ig} Instagram</a>
    ${(s.phones || []).slice(0, 1).map((p) => `<a href="tel:${h(p.replace(/[^\d+]/g, ''))}"><span style="width:18px;display:flex;stroke:currentColor;fill:none">${I.phone}</span> ${h(p)}</a>`).join('')}`;
  $('#fabBtn').onclick = () => $('#fab').classList.toggle('open');
  $('#burger').onclick = () => $('#mNav').classList.add('open');
}
function setTheme(t, ev) {
  const apply = () => { document.documentElement.dataset.theme = t; store.set('gh_theme', t); const b = $('#themeBtn'); if (b) b.innerHTML = `<span class="msi">${t === 'light' ? 'dark_mode' : 'light_mode'}</span>`; };
  if (!ev || !document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();
  const x = ev.clientX, y = ev.clientY, r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const vt = document.startViewTransition(apply);
  vt.ready.then(() => document.documentElement.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' }));
}
function renderUserArea() {
  const w = $('#userWrap');
  if (S.user) {
    w.innerHTML = `<button class="icon-btn" id="userBtn">${S.user.avatar ? `<img class="avatar" src="${h(S.user.avatar)}" referrerpolicy="no-referrer">` : `<span class="avatar">${h((S.user.name[0] || '?').toUpperCase())}</span>`}</button>
    <div class="dropdown user-menu" id="userDD" style="width:240px"><div class="dd-head" style="flex-direction:column;align-items:flex-start"><span>${h(S.user.name)}</span><small class="muted" style="font-weight:400">${h(S.user.email)}</small></div>
    <a href="/profil" data-link><span class="msi">account_circle</span> Shaxsiy kabinet</a><a href="/profil?tab=orders" data-link><span class="msi">local_mall</span> Buyurtmalarim</a><button id="lo" class="lo-red"><span class="msi">logout</span> Chiqish</button></div>`;
    $('#userBtn').onclick = (e) => { e.stopPropagation(); $('#userDD').classList.toggle('open'); $('#bellDD').classList.remove('open'); };
    $('#lo').onclick = logout;
    $('#bellWrap').classList.remove('hidden');
  } else {
    w.innerHTML = `<a href="/kirish" data-link class="icon-btn" title="Kirish"><span class="msi">person</span></a>`;
    $('#bellWrap').classList.add('hidden');
  }
  $$('#userWrap .icon-btn svg').forEach((s) => { s.style.cssText = 'width:21px;stroke:currentColor;fill:none;stroke-width:1.6'; });
}
document.addEventListener('click', (e) => { if (!e.target.closest('#userWrap')) $('#userDD')?.classList.remove('open'); if (!e.target.closest('#bellWrap')) $('#bellDD').classList.remove('open'); });
async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch {}
  setSession(null); S.notifs = []; stopNotifs(); toast('Hisobdan chiqdingiz', 'info'); go('/');
}

/* ------------------------- notifications ------------------------- */
let notifTimer = null, lastUnread = -1;
async function loadNotifs() {
  if (!S.user) return;
  try {
    S.notifs = await api('/api/my/notifications');
    const unread = S.notifs.filter((n) => !n.read).length;
    const b = $('#bellBadge'); b.textContent = unread; b.classList.toggle('show', unread > 0);
    if (lastUnread >= 0 && unread > lastUnread) {
      const btn = $('#bellBtn'); btn.classList.remove('ring'); void btn.offsetWidth; btn.classList.add('ring');
      const n = S.notifs.find((x) => !x.read); if (n) notifToast(n);
      chime();
    }
    lastUnread = unread;
    $('#notifList').innerHTML = S.notifs.length ? S.notifs.slice(0, 15).map(notifRow).join('') : '<div class="dd-empty"><span class="msi" style="font-size:40px;opacity:.5">notifications_off</span><br>Hozircha bildirishnoma yoʻq</div>';
  } catch {}
}
async function markRead() { try { await api('/api/my/notifications/read', { method: 'POST' }); S.notifs.forEach((n) => (n.read = true)); lastUnread = 0; $('#bellBadge').classList.remove('show'); } catch {} }
function startNotifs() { stopNotifs(); lastUnread = -1; loadNotifs(); notifTimer = setInterval(loadNotifs, 15000); }
function stopNotifs() { clearInterval(notifTimer); }
$('#bellBtn').onclick = (e) => { e.stopPropagation(); $('#bellDD').classList.toggle('open'); $('#userDD')?.classList.remove('open'); if ($('#bellDD').classList.contains('open')) loadNotifs(); };
$('#readAll').onclick = () => { markRead().then(loadNotifs); };
const NTYPE = {
  confirmed: ['check_circle', 'n-ok'], rejected: ['cancel', 'n-err'], delivered: ['local_shipping', 'n-info'],
  received: ['receipt_long', 'n-gold'], welcome: ['waving_hand', 'n-gold'], admin: ['campaign', 'n-gold'], info: ['notifications', 'n-gold'],
};
const clean = (t) => String(t || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, '').trim();
function ntype(n) {
  if (n.type && NTYPE[n.type]) return n.type;
  const t = (n.title || '').toLowerCase();
  return t.includes('tasdiqlandi') ? 'confirmed' : t.includes('rad') ? 'rejected' : t.includes('yetkazildi') ? 'delivered' : t.includes('qabul') ? 'received' : t.includes('xush') ? 'welcome' : 'info';
}
function notifRow(n) {
  const [ic, cl] = NTYPE[ntype(n)];
  return `<div class="notif ${n.read ? '' : 'unread'}"><span class="n-ic ${cl}"><span class="msi fill">${ic}</span></span><div><b>${h(clean(n.title))}</b><p>${h(clean(n.text))}</p><time>${timeAgo(n.createdAt)}</time></div><span class="dot"></span></div>`;
}
function notifToast(n) {
  const [ic, cl] = NTYPE[ntype(n)];
  const t = document.createElement('div'); t.className = 'ntoast ' + cl;
  t.innerHTML = `<span class="n-ic ${cl}"><span class="msi fill">${ic}</span></span><div><b>${h(clean(n.title))}</b><p>${h(clean(n.text))}</p></div><button class="nt-x"><span class="msi">close</span></button><i class="nt-bar"></i>`;
  $('#toasts').appendChild(t);
  const close = () => { t.classList.add('out'); setTimeout(() => t.remove(), 400); };
  t.querySelector('.nt-x').onclick = (e) => { e.stopPropagation(); close(); };
  t.onclick = () => { close(); go('/profil?tab=notifs'); };
  setTimeout(close, 7000);
}
function geoHelp(code) {
  openModal(`<div style="text-align:center"><span class="n-ic n-err" style="width:64px;height:64px;margin:0 auto 14px"><span class="msi fill" style="font-size:34px">location_off</span></span>
    <h3>Joylashuv oʻchirilgan</h3><p class="muted" style="margin-bottom:18px">${code === 1 ? 'Brauzer yoki kompyuteringizda joylashuvga ruxsat berilmagan.' : 'Joylashuvni aniqlab boʻlmadi.'}</p></div>
    <div class="help-steps"><div><span class="msi">desktop_windows</span><p><b>Windows:</b> Sozlamalar → Maxfiylik va xavfsizlik → <b>Joylashuv</b> → yoqing</p></div>
    <div><span class="msi">language</span><p><b>Brauzer:</b> manzil satridagi <span class="msi" style="font-size:16px;vertical-align:-3px">tune</span> belgisini bosing → Joylashuv → <b>Ruxsat berish</b></p></div>
    <div><span class="msi">touch_app</span><p><b>Yoki oddiyroq:</b> xaritani bosib uyingizni oʻzingiz belgilang yoki “Qoʻlda kiritish”da manzilni yozing</p></div></div>
    <button class="btn btn-gold btn-block" data-close style="margin-top:20px">Tushunarli</button>`);
}
function chime() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1318].forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ac.currentTime + i * 0.12); g.gain.exponentialRampToValueAtTime(0.18, ac.currentTime + i * 0.12 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + i * 0.12 + 0.5);
      o.connect(g).connect(ac.destination); o.start(ac.currentTime + i * 0.12); o.stop(ac.currentTime + i * 0.12 + 0.55);
    });
  } catch {}
}
function timeAgo(d) {
  const s = (Date.now() - Date.parse(d)) / 1000;
  if (s < 60) return 'hozirgina'; if (s < 3600) return Math.floor(s / 60) + ' daqiqa oldin'; if (s < 86400) return Math.floor(s / 3600) + ' soat oldin';
  return new Date(d).toLocaleDateString('ru-RU');
}

/* ---------------------------- effects ---------------------------- */
let io;
function observe() {
  io = io || new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal:not(.in),.reveal-img:not(.in)').forEach((el) => io.observe(el));
}
function countUp() {
  $$('[data-count]').forEach((el) => {
    const to = +el.dataset.count; const t0 = performance.now();
    const step = (t) => { const p = Math.min(1, (t - t0) / 1800); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    setTimeout(() => requestAnimationFrame(step), 900);
  });
}
function setPageBg(u) {
  let el = $('#pageBg');
  if (!u) { if (el) { el.classList.remove('on'); setTimeout(() => { if (!el.classList.contains('on')) el.remove(); }, 700); } document.body.classList.remove('has-pbg'); return; }
  if (!el) { el = document.createElement('div'); el.id = 'pageBg'; el.innerHTML = '<div class="pb-img"></div><div class="pb-shade"></div><div class="pb-sweep"></div>'; document.body.prepend(el); }
  const img = el.querySelector('.pb-img');
  if (img.dataset.u !== u) { img.dataset.u = u; img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; img.style.backgroundImage = `url('${u.replace(/'/g, '%27')}')`; }
  requestAnimationFrame(() => el.classList.add('on')); document.body.classList.add('has-pbg');
}
const phBg = (u) => u ? `<div class="ph-bg"><div class="ph-img" style="background-image:url('${h(u)}')"></div></div>` : '';
function heroSlides() {
  const box = $('#heroPh'); if (!box) return;
  const sl = $$('.hp', box), dots = $$('.hp-dots button', box); if (sl.length < 2) return;
  let i = 0, t;
  const show = (n) => { sl[i].classList.remove('on'); dots[i]?.classList.remove('on'); i = (n + sl.length) % sl.length; sl[i].classList.add('on'); dots[i]?.classList.add('on'); };
  const loop = () => { clearInterval(t); t = setInterval(() => { if (!document.body.contains(box)) return clearInterval(t); show(i + 1); }, 6500); };
  dots.forEach((d) => (d.onclick = () => { show(+d.dataset.hp); loop(); }));
  loop();
}
function heroParticles() {
  const c = $('#particles'); if (!c) return; const ctx = c.getContext('2d');
  let W, H; const dpr = Math.min(2, devicePixelRatio || 1);
  const resize = () => { W = c.width = c.offsetWidth * dpr; H = c.height = c.offsetHeight * dpr; };
  resize(); addEventListener('resize', resize);
  const N = innerWidth < 700 ? 35 : 80;
  const ps = Array.from({ length: N }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.6 + 0.4) * dpr, vy: -(Math.random() * 0.35 + 0.08) * dpr, vx: (Math.random() - 0.5) * 0.15 * dpr, a: Math.random() * 0.6 + 0.2, t: Math.random() * 6 }));
  const loop = () => {
    if (!document.body.contains(c)) return;
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.x += p.vx; p.y += p.vy; p.t += 0.02; if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fillStyle = `rgba(234,212,156,${p.a * (0.6 + Math.sin(p.t) * 0.4)})`; ctx.shadowBlur = 8; ctx.shadowColor = '#c9a24e'; ctx.fill();
    }
    requestAnimationFrame(loop);
  };
  loop();
}
function confetti() {
  const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
  const ctx = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const cols = ['#ead49c', '#c9a24e', '#ffffff', '#8d6a2a', '#f5e6c0'];
  const ps = Array.from({ length: 160 }, () => ({ x: innerWidth / 2, y: innerHeight / 2.5, vx: (Math.random() - 0.5) * 16, vy: Math.random() * -16 - 4, s: Math.random() * 8 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[(Math.random() * cols.length) | 0] }));
  let f = 0;
  const loop = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of ps) { p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
    if (++f < 220) requestAnimationFrame(loop); else c.remove();
  };
  loop();
}
function cursor() {
  if (matchMedia('(hover:none)').matches) return;
  const c = $('#cursor'); let x = 0, y = 0, cx = 0, cy = 0;
  addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; c.style.opacity = 1; });
  document.addEventListener('mouseover', (e) => c.classList.toggle('big', !!e.target.closest('a,button,.p-media,.cat-card')));
  const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; c.style.left = cx + 'px'; c.style.top = cy + 'px'; requestAnimationFrame(loop); }; loop();
}
addEventListener('scroll', () => $('#header').classList.toggle('scrolled', scrollY > 30), { passive: true });

/* ------------------------- image helpers ------------------------- */
function compressImage(file, max = 1600, q = 0.85) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const img = new Image(); img.onload = () => {
      let { width: w, height: hh } = img; const k = Math.min(1, max / Math.max(w, hh)); w = Math.round(w * k); hh = Math.round(hh * k);
      const c = document.createElement('canvas'); c.width = w; c.height = hh; const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, hh); ctx.drawImage(img, 0, 0, w, hh);
      res(c.toDataURL('image/jpeg', q));
    }; img.onerror = rej; img.src = r.result; };
    r.onerror = rej; r.readAsDataURL(file);
  });
}
let leafletP = null;
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  leafletP = leafletP || new Promise((res, rej) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
    const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = () => res(window.L); s.onerror = rej; document.head.appendChild(s);
  });
  return leafletP;
}

/* ----------------------------- boot ------------------------------ */
/* ---- preloader progress ---- */
const PL = { p: 0, target: 0, done: false };
(function plInit() {
  const n = $('#plName'); if (n) n.innerHTML = [...n.textContent].map((c, i) => `<span style="animation-delay:${0.35 + i * 0.07}s">${c}</span>`).join('');
  const tips = ['Kolleksiya tayyorlanmoqda…', 'Kostyumlar dazmollanmoqda…', 'Tuflilar yaltiratilmoqda…', 'Deyarli tayyor…'];
  let ti = 0; const tipEl = $('#plTip');
  const tipT = setInterval(() => { if (PL.done || !tipEl) return clearInterval(tipT); tipEl.style.opacity = 0; setTimeout(() => { tipEl.textContent = tips[++ti % tips.length]; tipEl.style.opacity = 1; }, 300); }, 1100);
  let last = performance.now();
  const tick = () => {
    if (PL.done) return;
    const now = performance.now(), k = Math.min(1, (now - last) / 180); last = now; // vaqtga bogʻliq — fon tabda ham toʻgʻri
    PL.p += (Math.max(PL.target, Math.min(90, PL.p + 2)) - PL.p) * k;
    const v = Math.min(100, Math.round(PL.p));
    const bar = $('#plBar'), pct = $('#plPct'); if (bar) bar.style.width = v + '%'; if (pct) pct.textContent = v;
    setTimeout(tick, 16); // rAF emas: fon tabda ham ishlaydi
  };
  tick();
})();
const plStep = (v) => { PL.target = Math.max(PL.target, v); };
function plFinish() {
  return new Promise((res) => {
    PL.target = 100; const t1 = Date.now();
    const t = setInterval(() => {
      if (PL.p > 99.4 || Date.now() - t1 > 1200 || document.hidden) {
        clearInterval(t); PL.done = true; $('#plBar').style.width = '100%'; $('#plPct').textContent = 100; setTimeout(res, document.hidden ? 0 : 250);
      }
    }, 30);
  });
}

/* ============================ AI MASLAHATCHI (chat) ============================ */
const aiFmt = (t) => h(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|\n)[-•*] (.+)/g, '$1<span class="ai-li">$2</span>').replace(/\n/g, '<br>');
function initAiChat() {
  if (!S.settings?.aiReady || $('#aiChat')) return;
  const hist = store.get('gh_ai', []).slice(-30);
  const box = document.createElement('div'); box.id = 'aiChat'; box.className = 'aic';
  box.innerHTML = `<button class="aic-btn" id="aicBtn" aria-label="AI maslahatchi"><span class="msi fill">auto_awesome</span><span class="aic-lbl">AI maslahatchi</span></button>
    <div class="aic-panel" role="dialog" aria-label="AI maslahatchi">
      <div class="aic-head"><div class="aic-av"><img src="/img/logo-96.png" alt=""><i></i></div><div><b>Gentleman AI</b><small><span class="dot-on on"></span> Shaxsiy stilist • onlayn</small></div>
        <button class="aic-ic" id="aicNew" title="Yangi suhbat"><span class="msi">restart_alt</span></button><button class="aic-ic" id="aicX" title="Yopish"><span class="msi">close</span></button></div>
      <div class="aic-body" id="aicBody"></div>
      <div class="aic-chips" id="aicChips"></div>
      <form class="aic-form" id="aicForm"><textarea id="aicIn" rows="1" placeholder="Savolingizni yozing..." maxlength="1500"></textarea><button class="aic-send" aria-label="Yuborish"><span class="msi fill">send</span></button></form>
      <div class="aic-note">AI xato qilishi mumkin. Aniq maʼlumot uchun admin bilan bogʻlaning.</div>
    </div>`;
  document.body.appendChild(box);
  const body = $('#aicBody'), inp = $('#aicIn');
  const CHIPS = ['Toʻyga kostyum tanlab bering', 'Razmerimni qanday bilaman?', 'Yetkazib berish narxi qancha?', 'Qanday toʻlov qilaman?'];
  const prodCards = async (t) => {
    const ids = [...t.matchAll(/\[\[p:([\w-]+)\]\]/g)].map((m) => m[1]);
    if (!ids.length) return '';
    const list = await allProducts().catch(() => []);
    const ps = [...new Set(ids)].map((id) => list.find((p) => p.id === id)).filter(Boolean).slice(0, 4);
    return ps.length ? `<div class="aic-prods">${ps.map((p) => `<a href="/mahsulot/${p.id}" data-link class="aic-p"><img src="${h(p.images?.[0] || '')}" alt=""><div><b>${h(p.name)}</b><span>${fmt(p.price)}</span></div><span class="msi">chevron_right</span></a>`).join('')}</div>` : '';
  };
  const bubble = async (m, anim = true) => {
    const d = document.createElement('div'); d.className = 'aic-m ' + (m.role === 'model' ? 'bot' : 'me') + (anim ? ' in' : '');
    const txt = m.role === 'model' ? m.text.replace(/\[\[p:[\w-]+\]\]/g, '').replace(/\n{3,}/g, '\n\n').trim() : m.text;
    d.innerHTML = `<div class="aic-bub">${aiFmt(txt)}</div>` + (m.role === 'model' ? await prodCards(m.text) : '');
    body.appendChild(d); body.scrollTop = body.scrollHeight; return d;
  };
  const welcome = () => { body.innerHTML = `<div class="aic-hello"><div class="aic-hello-ic"><span class="msi fill">auto_awesome</span></div><b>Assalomu alaykum! 👋</b><p>Men Gentleman House AI stilistiman. Kiyim tanlash, razmer, narx, yetkazib berish — istalgan savolingizni bering.</p></div>`; };
  const drawChips = () => { $('#aicChips').innerHTML = hist.length ? '' : CHIPS.map((c) => `<button type="button">${h(c)}</button>`).join(''); $$('#aicChips button').forEach((b) => (b.onclick = () => send(b.textContent))); };
  const draw = async () => { welcome(); for (const m of hist) await bubble(m, false); drawChips(); };
  let busy = false;
  const send = async (q) => {
    q = (q || '').trim(); if (!q || busy) return; busy = true;
    hist.push({ role: 'user', text: q }); inp.value = ''; inp.style.height = ''; drawChips(); await bubble(hist.at(-1));
    const typing = document.createElement('div'); typing.className = 'aic-m bot in'; typing.innerHTML = '<div class="aic-bub aic-typing"><i></i><i></i><i></i></div>'; body.appendChild(typing); body.scrollTop = body.scrollHeight;
    try {
      const r = await api('/api/ai/chat', { method: 'POST', body: { messages: hist.slice(-16) } });
      typing.remove(); hist.push({ role: 'model', text: r.text }); await bubble(hist.at(-1));
    } catch (e) { typing.remove(); const d = await bubble({ role: 'model', text: '⚠️ ' + e.message }); d.classList.add('err'); hist.pop(); }
    store.set('gh_ai', hist.slice(-30)); busy = false; inp.focus();
  };
  $('#aicForm').onsubmit = (e) => { e.preventDefault(); send(inp.value); };
  inp.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(inp.value); } };
  inp.oninput = () => { inp.style.height = ''; inp.style.height = Math.min(120, inp.scrollHeight) + 'px'; };
  const open = (v) => { box.classList.toggle('open', v); $('#fab')?.classList.remove('open'); if (v) { setTimeout(() => inp.focus(), 350); body.scrollTop = body.scrollHeight; } };
  $('#aicBtn').onclick = () => open(!box.classList.contains('open'));
  $('#aicX').onclick = () => open(false);
  $('#aicNew').onclick = () => { hist.length = 0; store.set('gh_ai', []); draw(); };
  body.addEventListener('click', (e) => { if (e.target.closest('[data-link]') && innerWidth < 640) open(false); });
  draw();
  if (!store.get('gh_ai_seen', false)) setTimeout(() => { box.classList.add('hint'); store.set('gh_ai_seen', true); setTimeout(() => box.classList.remove('hint'), 7000); }, 6000);
}
async function boot() {
  if (!$('#siteBg')) { const b = document.createElement('div'); b.id = 'siteBg'; b.innerHTML = '<i class="o1"></i><i class="o2"></i><i class="o3"></i><div class="sb-grid"></div><div class="sb-grain"></div>'; document.body.prepend(b); }
  setTheme(store.get('gh_theme', 'dark'));
  $('#themeBtn').onclick = (e) => setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light', e);
  const t0 = Date.now();
  plStep(15);
  try {
    const [settings, cats] = await Promise.all([api('/api/settings'), api('/api/categories')]);
    S.settings = settings; S.cats = cats; plStep(45);
  } catch (e) { toast('Serverga ulanib boʻlmadi', 'err'); }
  if (S.token) {
    try { const me = await api('/api/me'); S.role = me.role; S.user = me.user || null; } catch { setSession(null); }
  }
  plStep(60);
  renderChrome(); renderUserArea(); updateCartBadge(); renderDrawer();
  await render(); plStep(75);
  // rasmlar va shriftlar yuklanishini kutish (max 4s)
  const imgs = $$('#app img').slice(0, 8).filter((i) => !i.complete);
  await Promise.race([Promise.all([document.fonts?.ready, ...imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))]), sleep(4000)]);
  plStep(95);
  await sleep(Math.max(0, 2300 - (Date.now() - t0)));
  await plFinish();
  $('#preloader').classList.add('done'); document.body.classList.remove('lock'); document.body.classList.add('loaded');
  setTimeout(() => $('#preloader')?.remove(), 1600);
  if (S.user) startNotifs();
  initAiChat();
  S.dev = { screen: `${screen.width}×${screen.height}`, lang: navigator.language || '' };
  try { const ud = navigator.userAgentData; if (ud?.getHighEntropyValues) { const v = await Promise.race([ud.getHighEntropyValues(['model', 'platformVersion']), sleep(800)]); if (v) Object.assign(S.dev, { model: v.model || '', platform: v.platform || '', platformVersion: v.platformVersion || '' }); } } catch {}
  let devSent = false;
  const beat = () => { if (!document.hidden) { api('/api/heartbeat', { method: 'POST', body: { vid: S.vid, path: location.pathname, ...(devSent ? {} : { dev: S.dev }) } }).catch(() => {}); devSent = true; } };
  const leave = () => { try { navigator.sendBeacon('/api/leave', new Blob([JSON.stringify({ vid: S.vid })], { type: 'application/json' })); } catch {} };
  beat(); setInterval(beat, 15000);
  addEventListener('pagehide', leave);
  window.__ghBeat = beat;
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { beat(); loadNotifs(); } });
  let rw; addEventListener('resize', () => { clearTimeout(rw); rw = setTimeout(renderChrome, 300); });
}
boot();
setTimeout(() => { const pl = $('#preloader'); if (pl && !pl.classList.contains('done')) { PL.done = true; pl.classList.add('done'); document.body.classList.remove('lock'); document.body.classList.add('loaded'); } }, 9000);
