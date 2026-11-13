/* ================================================================
   GENTLEMAN HOUSE — backend server
   Hech qanday npm paket talab qilmaydi (Node.js 18+).
   Ishga tushirish:  node server.js   →  http://localhost:3000
   ================================================================ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');
// Ba'zi tarmoqlarda IPv6 ishlamaydi (Google'ga ulanish vaqti tugaydi) — avval IPv4 ishlatiladi
require('dns').setDefaultResultOrder('ipv4first');
try { require('net').setDefaultAutoSelectFamily(true); } catch {}

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
// Vercel (serverless) rejimi: baza — Upstash Redis, fayllar — Vercel Blob, Telegram — webhook
const IS_VERCEL = !!process.env.VERCEL;
const PUBLIC = path.join(ROOT, 'public');
// DATA_DIR — maʼlumotlar papkasi. Google Drive (400GB) papkasini koʻrsatsangiz, baza va rasmlar avtomatik Google’ga zaxiralanadi.
const DATA = IS_VERCEL ? '/tmp/gh-data' : process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, 'data');
const UPLOADS = path.join(DATA, 'uploads');
const CHECKS = path.join(DATA, 'checks');
const DB_FILE = path.join(DATA, 'db.json');
for (const d of [DATA, UPLOADS, CHECKS]) { try { fs.mkdirSync(d, { recursive: true }); } catch {} }

/* ---------------------------- helpers ---------------------------- */
const uid = (n = 12) => crypto.randomBytes(n).toString('hex');
const now = () => new Date().toISOString();
function hashPass(pw, salt = uid(16)) {
  return { salt, hash: crypto.scryptSync(String(pw), salt, 64).toString('hex') };
}
function checkPass(pw, salt, hash) {
  if (!salt || !hash) return false;
  const a = Buffer.from(crypto.scryptSync(String(pw), salt, 64).toString('hex'));
  const b = Buffer.from(hash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const money = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/,/g, ' ') + ' soʻm';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s, max = 500) => String(s ?? '').trim().slice(0, max);

/* ------------------------------ DB ------------------------------- */
let db;
function seedDB() {
  const a = hashPass(process.env.ADMIN_PASSWORD || (process.env.VERCEL ? uid(8) : 'admin' + '2211'));
  const cats = [
    { id: 'c1', slug: 'kostyum', name: 'Kostyumlar', subtitle: 'Klassik va zamonaviy', image: '/img/seed/cat-kostyum.jpg', model3d: 'suit', sizeType: 'clothes', order: 1 },
    { id: 'c2', slug: 'shim', name: 'Shimlar', subtitle: 'Klassik shimlar', image: '/img/seed/cat-shim.jpg', model3d: 'pants', sizeType: 'clothes', order: 2 },
    { id: 'c3', slug: 'koylak', name: 'Koʻylaklar', subtitle: 'Rasmiy va kundalik', image: '/img/seed/cat-koylak.jpg', model3d: 'shirt', sizeType: 'clothes', order: 3 },
    { id: 'c4', slug: 'oyoq-kiyim', name: 'Oyoq kiyimlar', subtitle: 'Charm tuflilar', image: '/img/seed/cat-oyoq.jpg', model3d: 'shoes', sizeType: 'shoes', order: 4 },
    { id: 'c5', slug: 'remen', name: 'Remenlar', subtitle: 'Charm tasmalar', image: '/img/seed/cat-remen.jpg', model3d: 'belt', sizeType: 'belt', order: 5 },
    { id: 'c6', slug: 'qishki', name: 'Qishki kiyimlar', subtitle: 'Paltolar va kurtkalar', image: '/img/seed/cat-qishki.jpg', model3d: 'coat', sizeType: 'clothes', order: 6 },
  ];
  const C = ['S', 'M', 'L', 'XL', 'XXL'];
  const SH = ['39', '40', '41', '42', '43', '44', '45'];
  const B = ['95', '100', '105', '110', '115', '120'];
  const p = (id, categoryId, name, price, oldPrice, img, color, sizes, desc, featured = false) => ({
    id, categoryId, name, price, oldPrice, description: desc, images: [img], sizes,
    color3d: color, model3d: null, stock: 25, featured, active: true, createdAt: now(), sold: 0,
  });
  const products = [
    p('p1', 'c1', 'Royal Navy kostyum', 2450000, null, '/img/seed/p-suit-navy.jpg', '#1d2a44', C, 'Italyan junidan tikilgan klassik ikki qismli kostyum. Slim-fit bichim, atlas astar, ikki tugmali.', true),
    p('p2', 'c1', 'Charcoal Classic kostyum', 2190000, null, '/img/seed/p-suit-grey.jpg', '#3b3d42', C, 'Toʻq kulrang rangdagi universal kostyum — ofis, toʻy va tadbirlar uchun.', true),
    p('p3', 'c1', 'Midnight Black smoking', 3200000, null, '/img/seed/p-suit-black.jpg', '#121214', C, 'Atlas yoqali qora smoking. Kechki tadbirlar uchun eng yaxshi tanlov.', true),
    p('p4', 'c2', 'Klassik qora shim', 590000, null, '/img/seed/p-pants-black.jpg', '#18181b', C, 'Ajinlanmaydigan matodan tikilgan klassik shim, oʻrta bel.'),
    p('p5', 'c2', 'Beige Chino shim', 520000, null, '/img/seed/p-pants-beige.jpg', '#b49a74', C, 'Yengil paxta aralash matodan chino shim, kundalik kiyish uchun.', true),
    p('p6', 'c3', 'Oq Oxford koʻylak', 390000, null, '/img/seed/p-shirt-white.jpg', '#f2f0ea', C, '100% paxta Oxford koʻylak, kostyum ostiga ideal.'),
    p('p7', 'c3', 'Sky Blue koʻylak', 370000, null, '/img/seed/p-shirt-blue.jpg', '#a9c4e0', C, 'Havorang klassik koʻylak, slim-fit.'),
    p('p8', 'c4', 'Oxford charm tufli', 1150000, null, '/img/seed/p-shoes-black.jpg', '#151515', SH, 'Tabiiy charmdan qoʻlda tikilgan klassik Oxford tufli.', true),
    p('p9', 'c4', 'Brogue jigarrang tufli', 1090000, null, '/img/seed/p-shoes-brown.jpg', '#5a3720', SH, 'Naqshli brogue uslubidagi jigarrang charm tufli.'),
    p('p10', 'c5', 'Qora charm remen', 290000, null, '/img/seed/p-belt-black.jpg', '#141414', B, 'Tabiiy charm remen, oltin rangli metall toʻqa.'),
    p('p11', 'c5', 'Jigarrang charm remen', 270000, null, '/img/seed/p-belt-brown.jpg', '#6b4426', B, 'Jigarrang tabiiy charm, klassik toʻqa.'),
    p('p12', 'c6', 'Kashemir palto', 3450000, null, '/img/seed/p-coat-camel.jpg', '#a57c52', C, 'Kashemir aralash jundan uzun palto. Qish uchun issiq va nafis.', true),
    p('p13', 'c6', 'Qora qishki palto', 2950000, null, '/img/seed/p-coat-black.jpg', '#1c1c1f', C, 'Klassik qora palto, ichi issiq astarli.'),
  ];
  return {
    settings: {
      siteName: 'Gentleman House',
      tagline: 'Erkaklar uchun premium kiyimlar',
      heroTitle: 'Haqiqiy janoblar uchun',
      heroSubtitle: 'Kostyumlar, shimlar, koʻylaklar, oyoq kiyimlar va remenlar — barchasi bir joyda. Uslubingizni biz bilan yarating.',
      heroImage: '/img/seed/hero.jpg',
      aboutTitle: 'Biz haqimizda',
      aboutText: 'Gentleman House — zamonaviy erkaklar uchun sifatli va nafis kiyimlar doʻkoni. Har bir mahsulot ehtiyotkorlik bilan tanlanadi: mato, bichim va tikuv sifati birinchi oʻrinda.',
      phones: ['+998 90 000 00 00', '+998 91 000 00 00'],
      address: 'Toshkent shahri',
      workHours: 'Har kuni 09:00 — 21:00',
      lat: 41.311081, lng: 69.240562,
      instagram: 'https://www.instagram.com/gentleman_housen1',
      telegramSupport: 'https://t.me/Gentleman_Lokatsiya',
      adminTelegram: '@Boburxon23',
      cardNumber: '8600 0000 0000 0000',
      cardHolder: 'KARTA EGASI ISMI',
      cardBank: 'Uzcard',
      deliveryNote: 'Toshkent boʻylab yetkazib berish 1 kun ichida.',
      botToken: '',
      adminChatIds: [],
      googleClientId: '',
      googleClientSecret: '',
      gdriveDeviceClientId: '',
      gdriveDeviceSecret: '',
      gdrive: null,
      marquee: 'YANGI KOLLEKSIYA • PREMIUM SIFAT • TEZ YETKAZIB BERISH • 100% KAFOLAT',
    },
    admin: { login: 'admin1122', salt: a.salt, hash: a.hash },
    categories: cats,
    products,
    users: [],
    sessions: {},
    orders: [],
    notifications: [],
    media: [],
    orderCounter: 1000,
  };
}
/* ---------- Vercel: Redis (Upstash REST) va Blob ---------- */
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
async function kv(...cmd) {
  if (!KV_URL) throw new Error('Redis ulanmagan: Vercel → Storage → Upstash Redis qoʻshing (KV_REST_API_URL)');
  const r = await fetch(KV_URL, { method: 'POST', headers: { Authorization: 'Bearer ' + KV_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error('Redis: ' + (j.error || r.status));
  return j.result;
}
let blobLib = null;
function blob() { if (!blobLib) blobLib = require('@vercel/blob'); return blobLib; }
let fnLib = null;
// javobdan keyin ham ishni davom ettirish (AI tekshiruv, Telegram va h.k.)
function bg(promise) {
  const p = Promise.resolve(promise).catch((e) => console.error('[BG]', e.message)).then(() => IS_VERCEL && flushDB());
  if (IS_VERCEL) { try { if (!fnLib) fnLib = require('@vercel/functions'); fnLib.waitUntil(p); } catch {} }
  return p;
}
let dbLoadedAt = 0, dbDirty = false, dbLoading = null, dbVer = null, dbFromKv = false;
function normalizeDB() {
  const base = seedDB();
  for (const k of Object.keys(base)) if (db[k] === undefined) db[k] = base[k];
  for (const k of Object.keys(base.settings)) if (db.settings[k] === undefined) db.settings[k] = base.settings[k];
  if (!db.blobs) db.blobs = {};
}
async function ensureDB(force = false) {
  if (!IS_VERCEL) return;
  if (!force && db && Date.now() - dbLoadedAt < 1500) return;
  if (dbLoading) return dbLoading;
  dbLoading = (async () => {
    const ver = await kv('GET', 'gh:dbv');
    if (dbFromKv && String(ver) === String(dbVer)) { dbLoadedAt = Date.now(); return; } // oʻzgarmagan — qayta yuklash shart emas
    const raw = await kv('GET', 'gh:db');
    if (raw) db = JSON.parse(raw); else { db = seedDB(); dbDirty = true; }
    normalizeDB(); dbLoadedAt = Date.now(); dbVer = ver; dbFromKv = true;
    if (dbDirty) await flushDB();
  })().finally(() => { dbLoading = null; });
  return dbLoading;
}
async function flushDB() {
  if (!IS_VERCEL || !dbDirty || !db) return;
  dbDirty = false;
  // eski sessiyalarni tozalash (hajmni kichik saqlash)
  const lim = Date.now() - 45 * 864e5; for (const [k, v] of Object.entries(db.sessions || {})) if (v.createdAt < lim) delete db.sessions[k];
  if (db.notifications?.length > 2000) db.notifications = db.notifications.slice(-2000);
  await kv('SET', 'gh:db', JSON.stringify(db));
  dbVer = await kv('INCR', 'gh:dbv'); dbLoadedAt = Date.now();
  if (db.settings.gdrive?.refreshToken && !flushDB.mirroring) { flushDB.mirroring = true; bg(gdMirrorDb().catch((e) => { GD.lastError = e.message; }).finally(() => { flushDB.mirroring = false; })); }
}
function loadDB() {
  if (IS_VERCEL) { db = seedDB(); normalizeDB(); return; }
  try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { db = seedDB(); saveNow(); }
  const base = seedDB();
  for (const k of Object.keys(base)) if (db[k] === undefined) db[k] = base[k];
  for (const k of Object.keys(base.settings)) if (db.settings[k] === undefined) db.settings[k] = base.settings[k];
}
let saveTimer = null;
function saveNow() {
  if (IS_VERCEL) { dbDirty = true; return; }
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
  fs.renameSync(tmp, DB_FILE);
}
function save() { if (IS_VERCEL) { dbDirty = true; return; } clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 150); }
loadDB();
for (const p of db.products) { const t = db.categories.find((c) => c.id === p.categoryId)?.sizeType; const f = fixSizes(p.sizes || [], t); if (f.length !== (p.sizes || []).length) { p.sizes = f.length ? f : (t === 'shoes' ? ['39', '40', '41', '42', '43', '44', '45'] : t === 'belt' ? ['95', '100', '105', '110', '115', '120'] : []); save(); } }
// start.bat dagi BOT_TOKEN avtomatik ulanadi (admin paneldan ham oʻzgartirsa boʻladi)
if (process.env.BOT_TOKEN && !db.settings.botToken) { db.settings.botToken = process.env.BOT_TOKEN.trim(); saveNow(); }

/* ------------------------- online tracking ----------------------- */
const online = new Map(); // visitorId -> {t, userId}
const ONLINE_MS = 35 * 1000;
function onlineStats() {
  const t = Date.now(); let guests = 0, users = 0;
  for (const [k, v] of online) {
    if (t - v.t > ONLINE_MS) { online.delete(k); continue; }
    v.userId ? users++ : guests++;
  }
  return { total: guests + users, users, guests };
}

/* ----------------------------- auth ------------------------------ */
function createSession(data) {
  const token = uid(24);
  db.sessions[token] = { ...data, createdAt: Date.now() };
  // eski sessiyalarni tozalash (60 kun)
  const lim = Date.now() - 60 * 864e5;
  for (const [k, v] of Object.entries(db.sessions)) if (v.createdAt < lim) delete db.sessions[k];
  save();
  return token;
}
function getAuth(req, urlObj) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : urlObj?.searchParams.get('t');
  if (!token || !db.sessions[token]) return null;
  const s = db.sessions[token];
  if (s.role === 'admin') return { role: 'admin', token };
  const user = db.users.find((u) => u.id === s.userId);
  if (!user || user.blocked) return null;
  return { role: 'user', user, token };
}
const publicUser = (u) => u && ({ id: u.id, email: u.email, name: u.name, phone: u.phone || '', avatar: u.avatar || '', google: !!u.google, createdAt: u.createdAt });

const loginAttempts = new Map();
function tooMany(ip) {
  const r = loginAttempts.get(ip) || { n: 0, t: Date.now() };
  if (Date.now() - r.t > 10 * 60e3) { r.n = 0; r.t = Date.now(); }
  r.n++; loginAttempts.set(ip, r);
  return r.n > 20;
}

/* ---------------------------- files ------------------------------ */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.mov': 'video/mp4', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
async function saveDataUrl(dataUrl, dir, prefix = '') {
  const m = /^data:(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime));base64,(.+)$/s.exec(String(dataUrl || ''));
  if (!m) throw httpErr(400, 'Fayl formati notoʻgʻri (faqat rasm yoki video)');
  const ext = m[2] === 'jpeg' ? 'jpg' : m[3] === 'quicktime' ? 'mov' : (m[2] || m[3]);
  const buf = Buffer.from(m[4], 'base64');
  if (buf.length > 150 * 1024 * 1024) throw httpErr(413, 'Fayl juda katta (max 150MB)');
  const name = prefix + Date.now().toString(36) + '-' + uid(5) + '.' + ext;
  await storeFile(name, buf, m[1], dir === CHECKS ? 'checks' : 'uploads');
  return { name, size: buf.length, type: m[1] };
}
async function storeFile(name, buf, type, kind = 'uploads') {
  if (!IS_VERCEL) { fs.writeFileSync(path.join(kind === 'checks' ? CHECKS : UPLOADS, name), buf); return '/' + kind + '/' + name; }
  if (db.settings.gdrive?.refreshToken) { // asosiy ombor — Google Drive (400GB)
    const id = await gdStore(name, buf, type, kind); return '/' + kind + '/' + name + '#' + id;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw httpErr(500, 'Fayl ombori ulanmagan: Vercel → Storage → Blob qoʻshing');
  const r = await blob().put(`${kind}/${name}`, buf, { access: 'public', contentType: type, addRandomSuffix: kind === 'checks' });
  db.blobs[name] = r.url; save();
  return r.url;
}
// faylni Buffer sifatida oʻqish (lokal disk yoki Vercel Blob)
async function readStored(name, kind = 'uploads') {
  if (!name) return null;
  if (!IS_VERCEL) { try { return fs.readFileSync(path.join(kind === 'checks' ? CHECKS : UPLOADS, path.basename(name))); } catch { return null; } }
  const gid = gdIdOf(path.basename(name), kind);
  if (gid) { const r = await gdRaw(gid); return r.ok ? Buffer.from(await r.arrayBuffer()) : null; }
  const u = db.blobs?.[path.basename(name)]; if (!u) return null;
  const r = await fetch(u); if (!r.ok) return null; return Buffer.from(await r.arrayBuffer());
}
function serveFile(res, file, status = 200, cache = true, req = null) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send404(res);
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const headers = {
      'Content-Type': type, 'Accept-Ranges': 'bytes',
      'Cache-Control': cache && !/\.(js|css|html)$/i.test(file) ? 'public, max-age=86400' : 'no-cache',
      'Last-Modified': st.mtime.toUTCString(),
    };
    const range = req?.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (range && status === 200) {
      let start = range[1] === '' ? st.size - Number(range[2]) : Number(range[1]);
      let end = range[1] === '' || range[2] === '' ? st.size - 1 : Math.min(Number(range[2]), st.size - 1);
      if (start >= st.size || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end(); }
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1 });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(status, { ...headers, 'Content-Length': st.size });
    fs.createReadStream(file).pipe(res);
  });
}
function send404(res) {
  const f = path.join(PUBLIC, '404.html');
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  fs.createReadStream(f).pipe(res);
}

/* -------------------------- http utils --------------------------- */
function httpErr(status, message) { const e = new Error(message); e.status = status; return e; }
function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req, limit = 220 * 1024 * 1024) {
  if (IS_VERCEL && req.body !== undefined) { const b = req.body; if (Buffer.isBuffer(b)) { try { return Promise.resolve(JSON.parse(b.toString('utf8') || '{}')); } catch { return Promise.reject(httpErr(400, 'JSON notoʻgʻri')); } } if (typeof b === 'string') { try { return Promise.resolve(JSON.parse(b || '{}')); } catch { return Promise.reject(httpErr(400, 'JSON notoʻgʻri')); } } return Promise.resolve(b || {}); }
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(httpErr(413, 'Soʻrov juda katta')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(httpErr(400, 'JSON notoʻgʻri')); }
    });
    req.on('error', reject);
  });
}

/* ----------------------------- router ---------------------------- */
const routes = [];
const route = (method, pattern, handler, opts = {}) => {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  routes.push({ method, re, keys, handler, ...opts });
};

/* ---------- public ---------- */
function publicSettings() {
  const s = db.settings;
  const { botToken, adminChatIds, googleClientSecret, gdrive, gdriveDeviceClientId, gdriveDeviceSecret, geminiApiKey, monitorBotToken, monitorChatIds, ...rest } = s;
  return { ...rest, hosting: IS_VERCEL ? 'vercel' : 'local', botConnected: !!botToken, aiReady: !!geminiApiKey && s.aiChat !== false };
}
route('GET', '/api/settings', () => publicSettings());
route('GET', '/api/categories', () => [...db.categories].sort((a, b) => a.order - b.order));
route('GET', '/api/products', ({ url }) => {
  let list = db.products.filter((p) => p.active !== false);
  const cat = url.searchParams.get('cat');
  const q = (url.searchParams.get('q') || '').toLowerCase();
  if (cat) { const c = db.categories.find((x) => x.slug === cat || x.id === cat); list = c ? list.filter((p) => p.categoryId === c.id) : []; }
  if (url.searchParams.get('featured')) list = list.filter((p) => p.featured);
  if (q) list = list.filter((p) => (p.name + ' ' + p.description).toLowerCase().includes(q));
  return list.map(productOut);
});
route('GET', '/api/products/:id', ({ params }) => {
  const p = db.products.find((x) => x.id === params.id && x.active !== false);
  if (!p) throw httpErr(404, 'Mahsulot topilmadi');
  return productOut(p);
});
function productOut(p) {
  const c = db.categories.find((x) => x.id === p.categoryId);
  return { ...p, category: c ? { id: c.id, slug: c.slug, name: c.name, sizeType: c.sizeType } : null, model3d: p.model3d || c?.model3d || 'suit' };
}
route('POST', '/api/heartbeat', async ({ body, auth, req }) => {
  if (auth?.role === 'admin') return { ok: true };
  const vid = clean(body.vid, 64) || uid(8);
  if (IS_VERCEL) await loadOnline(vid);
  const prev = online.get(vid);
  const ua = String(req.headers['user-agent'] || '');
  online.set(vid, { t: Date.now(), since: prev?.since || Date.now(), userId: auth?.user?.id || null, path: clean(body.path, 120) || prev?.path || '/',
    device: /mobile|android|iphone/i.test(ua) ? 'mobile' : 'desktop', dev: body.dev ? devInfo(ua, body.dev) : prev?.dev || devInfo(ua) });
  if (IS_VERCEL) { await kv('HSET', 'gh:online', vid, JSON.stringify(online.get(vid))); await kv('EXPIRE', 'gh:online', 3600); }
  await monVisit(vid, online.get(vid), auth?.user, req);
  if (auth?.user && !IS_VERCEL) { auth.user.lastSeen = now(); }
  return { ok: true };
}, { auth: 'optional', noSave: IS_VERCEL });
// Vercel: onlayn roʻyxat Redis'da (bir nechta server nusxasi orasida umumiy)
async function loadOnline(only) {
  if (!IS_VERCEL) return;
  if (only) { const v = await kv('HGET', 'gh:online', only); if (v) online.set(only, JSON.parse(v)); else online.delete(only); return; }
  const arr = await kv('HGETALL', 'gh:online') || []; online.clear(); const dead = [];
  for (let i = 0; i < arr.length; i += 2) { try { const v = JSON.parse(arr[i + 1]); if (Date.now() - v.t > ONLINE_MS) dead.push(arr[i]); else online.set(arr[i], v); } catch {} }
  if (dead.length) kv('HDEL', 'gh:online', ...dead).catch(() => {});
  // aʼzolarning oxirgi faolligi
  for (const [, v] of online) if (v.userId) { const u = db.users.find((x) => x.id === v.userId); if (u && (!u.lastSeen || Date.now() - new Date(u.lastSeen) > 60000)) { u.lastSeen = new Date(v.t).toISOString(); save(); } }
}

route('POST', '/api/leave', async ({ body }) => { const vid = clean(body?.vid, 64); if (vid) { online.delete(vid); if (IS_VERCEL) await kv('HDEL', 'gh:online', vid); } return { ok: true }; }, { noSave: IS_VERCEL });

/* ---------- auth ---------- */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
route('POST', '/api/auth/register', ({ body, req }) => {
  const email = clean(body.email, 120).toLowerCase();
  const name = clean(body.name, 80);
  const password = String(body.password || '');
  if (!emailRe.test(email)) throw httpErr(400, 'Email notoʻgʻri kiritildi');
  if (password.length < 6) throw httpErr(400, 'Parol kamida 6 ta belgidan iborat boʻlsin');
  if (!name) throw httpErr(400, 'Ismingizni kiriting');
  if (db.users.some((u) => u.email === email)) throw httpErr(409, 'Bu email allaqachon roʻyxatdan oʻtgan');
  const h = hashPass(password);
  const user = { id: 'u' + uid(6), email, name, phone: clean(body.phone, 30), salt: h.salt, hash: h.hash, google: false, createdAt: now(), lastSeen: now() };
  db.users.push(user);
  pushNotif(user.id, 'Xush kelibsiz!', `${name}, Gentleman House oilasiga xush kelibsiz!`, null, 'welcome');
  const token = createSession({ role: 'user', userId: user.id });
  monAuthEvent('🆕 Roʻyxatdan oʻtdi', user, req, body.dev);
  return { token, role: 'user', user: publicUser(user) };
});
route('POST', '/api/auth/login', ({ body, req }) => {
  if (tooMany(req.socket.remoteAddress)) throw httpErr(429, 'Juda koʻp urinish. 10 daqiqadan soʻng qayta urining');
  const login = clean(body.email, 120);
  const password = String(body.password || '');
  if (login === db.admin.login && checkPass(password, db.admin.salt, db.admin.hash)) {
    return { token: createSession({ role: 'admin' }), role: 'admin' };
  }
  const user = db.users.find((u) => u.email === login.toLowerCase());
  if (!user || !checkPass(password, user.salt, user.hash)) throw httpErr(401, 'Email yoki parol notoʻgʻri');
  if (user.blocked) throw httpErr(403, 'Hisobingiz bloklangan');
  monAuthEvent('🔐 Hisobiga kirdi', user, req, body.dev);
  return { token: createSession({ role: 'user', userId: user.id }), role: 'user', user: publicUser(user) };
});
route('POST', '/api/auth/google', async ({ body, req }) => {
  const cid = db.settings.googleClientId;
  if (!cid) throw httpErr(400, 'Google orqali kirish hali sozlanmagan');
  const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(body.credential || ''));
  const info = await r.json().catch(() => ({}));
  if (!r.ok || info.aud !== cid || !info.email) throw httpErr(401, 'Google tasdiqlashda xatolik');
  const email = info.email.toLowerCase();
  let user = db.users.find((u) => u.email === email); const isNewG = !user;
  if (!user) {
    user = { id: 'u' + uid(6), email, name: info.name || email.split('@')[0], avatar: info.picture || '', google: true, createdAt: now(), lastSeen: now() };
    db.users.push(user);
    pushNotif(user.id, 'Xush kelibsiz!', `${user.name}, Gentleman House oilasiga xush kelibsiz!`, null, 'welcome');
  } else { user.google = true; if (!user.avatar) user.avatar = info.picture || ''; }
  if (user.blocked) throw httpErr(403, 'Hisobingiz bloklangan');
  monAuthEvent(isNewG ? '🆕 Google orqali roʻyxatdan oʻtdi' : '🔐 Google orqali kirdi', user, req, body.dev);
  return { token: createSession({ role: 'user', userId: user.id }), role: 'user', user: publicUser(user) };
});
route('GET', '/api/me', ({ auth }) => (auth.role === 'admin' ? { role: 'admin' } : { role: 'user', user: publicUser(auth.user) }), { auth: 'any' });
route('PUT', '/api/me', ({ auth, body }) => {
  const u = auth.user;
  if (body.name) u.name = clean(body.name, 80);
  if (body.phone !== undefined) u.phone = clean(body.phone, 30);
  if (body.newPassword) {
    if (u.hash && !checkPass(body.oldPassword || '', u.salt, u.hash)) throw httpErr(400, 'Eski parol notoʻgʻri');
    if (String(body.newPassword).length < 6) throw httpErr(400, 'Yangi parol kamida 6 belgi');
    Object.assign(u, hashPass(body.newPassword));
  }
  return { user: publicUser(u) };
}, { auth: 'user' });
route('POST', '/api/auth/logout', ({ auth }) => { delete db.sessions[auth.token]; return { ok: true }; }, { auth: 'any' });

/* ---------- user: orders & notifications ---------- */
route('POST', '/api/orders', async ({ auth, body }) => {
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  if (!items.length) throw httpErr(400, 'Savat boʻsh');
  const lines = [];
  for (const it of items) {
    const p = db.products.find((x) => x.id === it.productId && x.active !== false);
    if (!p) throw httpErr(400, 'Mahsulot topilmadi yoki sotuvdan olingan');
    const size = clean(it.size, 10);
    if (p.sizes?.length && !p.sizes.includes(size)) throw httpErr(400, `${p.name} uchun razmer tanlang`);
    const qty = Math.max(1, Math.min(20, parseInt(it.qty) || 1));
    lines.push({ productId: p.id, name: p.name, price: p.price, size, qty, image: p.images?.[0] || '', sum: p.price * qty });
  }
  const name = clean(body.name, 80), phone = clean(body.phone, 30);
  if (!name) throw httpErr(400, 'Ism-familiyangizni kiriting');
  if (!/^[+\d][\d\s()-]{6,}$/.test(phone)) throw httpErr(400, 'Telefon raqamni toʻgʻri kiriting');
  const loc = body.location || {};
  let location;
  if (loc.type === 'map') {
    const lat = Number(loc.lat), lng = Number(loc.lng);
    if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw httpErr(400, 'Xaritada joyni belgilang');
    location = { type: 'map', lat, lng, address: clean(loc.address, 300) };
  } else {
    const address = clean(loc.address, 500);
    if (address.length < 5) throw httpErr(400, 'Manzilni toʻliq kiriting');
    location = { type: 'manual', address };
    const lat = Number(loc.lat), lng = Number(loc.lng);
    if (loc.lat != null && isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) { location.lat = lat; location.lng = lng; }
  }
  if (!body.check) throw httpErr(400, 'Toʻlov cheki (skrinshot) yuklanmagan! Cheksiz buyurtma qabul qilinmaydi.');
  const check = await saveDataUrl(body.check, CHECKS, 'chek-');
  const subtotal = lines.reduce((s, l) => s + l.sum, 0);
  const delivery = deliveryFor(subtotal);
  const total = subtotal + delivery;
  const order = {
    id: 'o' + uid(6), number: ++db.orderCounter, userId: auth.user.id, userEmail: auth.user.email,
    items: lines, subtotal, delivery, total, customer: { name, phone, phone2: clean(body.phone2, 30) }, location,
    note: clean(body.note, 500), checkImage: check.name, status: 'pending', createdAt: now(), history: [{ status: 'pending', at: now() }], tg: [],
  };
  db.orders.push(order);
  if (!auth.user.phone) auth.user.phone = phone;
  pushNotif(auth.user.id, 'Buyurtma qabul qilindi', `#${order.number} buyurtmangiz qabul qilindi. Toʻlov cheki tekshirilmoqda.`, order.id, 'received');
  save();
  bg(sendOrderToTelegram(order).catch((e) => console.error('[TG] buyurtma yuborilmadi:', e.message))
    .finally(() => aiCheckOrder(order).catch((e) => console.error('[AI] chek tekshirilmadi:', e.message))));
  gdriveSoon();
  return { ok: true, order: orderOut(order) };
}, { auth: 'user' });

/* ============================ YETKAZIB BERISH ============================ */
function deliveryFor(subtotal) {
  const s = db.settings; const price = +s.deliveryPrice || 0, free = +s.deliveryFreeFrom || 0;
  if (free > 0 && subtotal >= free) return 0;
  return price;
}

/* ============================ AI CHEK TEKSHIRUV (Gemini) ============================ */
const AI_VERDICT = { ok: '✅ Chek toʻgʻri', warning: '⚠️ Shubhali', fake: '❌ Soxta / mos emas', error: '⚙️ Tekshirib boʻlmadi' };
const GEMINI_FALLBACK = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest'];
let geminiLastModel = '', geminiLastAt = 0;
async function geminiOnce(model, parts, json, opts = {}) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': db.settings.geminiApiKey },
    body: JSON.stringify({ contents: opts.contents || [{ role: 'user', parts }], ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
      generationConfig: { temperature: opts.temperature ?? 0.1, maxOutputTokens: opts.maxTokens || 2048, ...(json ? { responseMimeType: 'application/json' } : {}) } }),
    signal: AbortSignal.timeout(30000),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(d.error?.message || ('HTTP ' + r.status)); e.status = r.status; throw e; }
  const text = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  if (!text) throw new Error('AI boʻsh javob qaytardi');
  return text;
}
async function geminiCall(parts, json = true, opts = {}) {
  const s = db.settings;
  if (!s.geminiApiKey) throw new Error('Gemini API kaliti kiritilmagan');
  const first = (s.geminiModel || GEMINI_FALLBACK[0]).replace(/[^\w.-]/g, '');
  let chain = [first, ...GEMINI_FALLBACK.filter((m) => m !== first)];
  if (geminiLastModel && Date.now() - geminiLastAt < 30 * 60000) chain = [geminiLastModel, ...chain.filter((m) => m !== geminiLastModel)];
  let last;
  for (const m of chain) {
    try { const t = await geminiOnce(m, parts, json, opts); geminiLastModel = m; geminiLastAt = Date.now(); return t; }
    catch (e) {
      last = e;
      if (e.status === 400 && /api key|API_KEY|permission/i.test(e.message)) throw e; // kalit xato — boshqa model yordam bermaydi
      console.log(`[AI] ${m} ishlamadi (${e.message.slice(0, 80)}) — keyingi model`);
    }
  }
  throw last;
}
async function aiCheckOrder(o, force = false) {
  const s = db.settings;
  if (!s.geminiApiKey || (s.aiCheck === false && !force)) return null;
  const file = path.join(CHECKS, o.checkImage || '');
  const checkBuf = await readStored(o.checkImage, 'checks');
  if (!checkBuf) return null;
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const card = (s.cardNumber || '').replace(/\D/g, '');
  const prompt = `Sen onlayn doʻkon uchun toʻlov cheklarini tekshiruvchi ekspertsan. Rasmda mijoz yuborgan toʻlov cheki (Click, Payme, Uzum, bank ilovasi skrinshoti yoki kvitansiya) boʻlishi kerak.
Kutilgan maʼlumotlar:
- Toʻlanishi kerak boʻlgan summa: ${o.total} soʻm
- Qabul qiluvchi karta: ${card ? '**** ' + card.slice(-4) + ' (toʻliq: ' + card + ')' : 'nomaʼlum'}
- Karta egasi: ${s.cardHolder || 'nomaʼlum'}
- Buyurtma vaqti: ${new Date(o.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })} (Toshkent vaqti)
Tekshir: 1) bu haqiqatan toʻlov cheki/skrinshotmi; 2) toʻlov muvaffaqiyatli oʻtganmi; 3) summa kutilgan summaga teng yoki koʻpmi; 4) qabul qiluvchi karta oxirgi 4 raqami mosmi; 5) sana buyurtma vaqtiga yaqinmi (oldingi eski chek emasmi); 6) tahrirlash/montaj belgilari bormi.
Faqat JSON qaytar: {"is_receipt":bool,"success":bool,"amount":number|null,"amount_ok":bool,"card_last4":string|null,"card_ok":bool|null,"date":string|null,"date_ok":bool|null,"edited":bool,"verdict":"ok"|"warning"|"fake","confidence":0-100,"summary":"oʻzbek tilida 1-2 gap xulosa","issues":["oʻzbek tilida har bir muammo"]}
verdict: hammasi mos boʻlsa "ok"; ozgina noaniqlik boʻlsa "warning"; chek emas, summa kam, karta boshqa yoki soxta boʻlsa "fake".`;
  let res;
  try {
    const text = await geminiCall([{ text: prompt }, { inline_data: { mime_type: mime, data: checkBuf.toString('base64') } }]);
    const j = JSON.parse(text.replace(/^```(json)?|```$/g, '').trim());
    res = {
      verdict: ['ok', 'warning', 'fake'].includes(j.verdict) ? j.verdict : 'warning',
      confidence: Math.max(0, Math.min(100, +j.confidence || 0)),
      summary: clean(j.summary || '', 400), issues: (Array.isArray(j.issues) ? j.issues : []).map((x) => clean(x, 200)).filter(Boolean).slice(0, 8),
      amount: isFinite(+j.amount) && j.amount !== null ? +j.amount : null, amountOk: !!j.amount_ok, cardLast4: j.card_last4 ? clean(String(j.card_last4), 8) : null,
      cardOk: j.card_ok ?? null, date: j.date ? clean(String(j.date), 60) : null, dateOk: j.date_ok ?? null, edited: !!j.edited, isReceipt: !!j.is_receipt, success: !!j.success,
    };
  } catch (e) {
    res = { verdict: 'error', summary: 'AI tekshiruv xatosi: ' + clean(e.message, 200), issues: [] };
  }
  res.checkedAt = now(); res.model = geminiLastModel || s.geminiModel || GEMINI_FALLBACK[0]; res.seen = false;
  const cur = db.orders.find((x) => x.id === o.id); if (!cur) return res;
  cur.ai = res; save();
  console.log(`[AI] #${cur.number}: ${res.verdict} — ${res.summary}`);
  if (s.botToken && s.adminChatIds.length) {
    const txt = [`🤖 <b>AI chek tekshiruvi — #${cur.number}</b>`, `<b>${AI_VERDICT[res.verdict]}</b>${res.confidence ? ` (${res.confidence}% ishonch)` : ''}`,
      res.amount != null ? `💳 Chekdagi summa: ${money(res.amount)} / kerak: ${money(cur.total)}` : '', res.summary ? `📝 ${esc(res.summary)}` : '',
      ...(res.issues || []).map((x) => '• ' + esc(x))].filter(Boolean).join('\n');
    for (const chat of s.adminChatIds) {
      const prev = (cur.tg || []).find((t) => String(t.chat_id) === String(chat));
      tg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: txt, ...(prev?.message_id ? { reply_to_message_id: prev.message_id, allow_sending_without_reply: true } : {}) }).catch(() => {});
    }
  }
  return res;
}
route('POST', '/api/admin/orders/:id/ai-check', async ({ params }) => {
  const o = db.orders.find((x) => x.id === params.id); if (!o) throw httpErr(404, 'Buyurtma topilmadi');
  if (!db.settings.geminiApiKey) throw httpErr(400, 'Avval Sozlamalarda Gemini API kalitini kiriting');
  const r = await aiCheckOrder(o, true); return { ok: true, ai: r, order: orderOut(o, true) };
}, { auth: 'admin' });
route('POST', '/api/admin/orders/:id/ai-seen', ({ params }) => {
  const o = db.orders.find((x) => x.id === params.id); if (o?.ai) { o.ai.seen = true; save(); } return { ok: true };
}, { auth: 'admin' });
route('POST', '/api/admin/ai/test', async ({ body }) => {
  if (body?.key) db.settings.geminiApiKey = clean(body.key, 200);
  if (body?.model) db.settings.geminiModel = clean(body.model, 60);
  save();
  const t = await geminiCall([{ text: 'Faqat "OK" deb javob ber.' }], false).catch((e) => { throw httpErr(400, 'Gemini xatosi: ' + e.message); });
  return { ok: true, reply: clean(t, 100), model: geminiLastModel };
}, { auth: 'admin' });

/* ============================ AI CHAT (mijoz va admin) ============================ */
const chatHits = new Map();
function chatLimited(ip) {
  const t = Date.now(), a = (chatHits.get(ip) || []).filter((x) => t - x < 10 * 60000);
  a.push(t); chatHits.set(ip, a); return a.length > 40;
}
function chatHistory(body) {
  const msgs = (Array.isArray(body?.messages) ? body.messages : []).slice(-16)
    .map((m) => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: clean(m.text, 1500) }] })).filter((m) => m.parts[0].text);
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') throw httpErr(400, 'Savol yozing');
  return msgs;
}
function shopContext() {
  const s = db.settings;
  const cats = Object.fromEntries(db.categories.map((c) => [c.id, c.name]));
  const prods = db.products.filter((p) => p.active !== false).map((p) => `- [${p.id}] ${p.name} | ${cats[p.categoryId] || ''} | ${money(p.price)}${p.oldPrice > p.price ? ` (chegirma, eski narx ${money(p.oldPrice)})` : ''} | razmerlar: ${(p.sizes || []).join(', ') || '—'} | omborda: ${p.stock ?? '?'} | ${p.video ? 'video bor | ' : ''}${clean(p.description || '', 160)}`).join('\n');
  const d = +s.deliveryPrice || 0, fr = +s.deliveryFreeFrom || 0;
  return `DOʻKON: ${s.siteName} — ${s.tagline}. Erkaklar uchun premium kiyim doʻkoni.
Kategoriyalar: ${db.categories.map((c) => c.name).join(', ')}.
Yetkazib berish: ${d ? money(d) : 'bepul'}${fr ? `, ${money(fr)} dan oshsa bepul` : ''}. ${s.deliveryNote || ''}
Toʻlov: saytda buyurtma berib, karta raqamiga pul oʻtkaziladi va toʻlov cheki (skrinshot) yuklanadi. Cheksiz buyurtma qabul qilinmaydi. Admin chekni tekshirib tasdiqlaydi, mijozga saytda xabar keladi.
Manzil: ${s.address}. Ish vaqti: ${s.workHours}. Telefon: ${(s.phones || []).join(', ')}. Telegram yordam: ${s.telegramSupport}. Admin: ${s.adminTelegram}. Instagram: ${s.instagram}.
MAHSULOTLAR (id | nomi | kategoriya | narx | razmer | ombor | tavsif):
${prods || '— hozircha mahsulot yoʻq'}`;
}
route('POST', '/api/ai/chat', async ({ body, req }) => {
  if (!db.settings.geminiApiKey || db.settings.aiChat === false) throw httpErr(503, 'AI maslahatchi hozircha oʻchirilgan');
  if (chatLimited(req.socket.remoteAddress)) throw httpErr(429, 'Juda koʻp savol. Birozdan soʻng qayta yozing');
  const contents = chatHistory(body);
  const system = `Sen "${db.settings.siteName}" doʻkonining xushmuomala, aqlli AI maslahatchisisan. Mijozga kiyim tanlashda, razmer, rang uygʻunligi, uslub, narx, yetkazib berish, toʻlov va buyurtma berish boʻyicha yordam berasan.
QOIDALAR:
- Mijoz qaysi tilda yozsa, oʻsha tilda javob ber (odatda oʻzbek lotin). Qisqa, samimiy, 2-6 gapdan oshirma. Kerak boʻlsa roʻyxat qil.
- Faqat quyidagi MAHSULOTLAR roʻyxatidagi narsalarni tavsiya qil, narx va razmerlarni oʻzgartirma. Roʻyxatda yoʻq mahsulot (masalan kostyum) haqida "bor" dema — ochiq ayt: "hozircha bu turdagi mahsulot sotuvda yoʻq, tez orada qoʻshiladi" va Telegram yordamga yoʻnaltir.
- Mahsulot tavsiya qilsang, uning id sini aynan shunday yoz: [[p:ID]] (masalan [[p:p1]]) — sayt uni rasmli kartaga aylantiradi. Bir javobda koʻpi bilan 4 ta.
- Razmer: kostyum/koʻylak/shim uchun S–XXL (boʻy va vaznini soʻrab maslahat ber), oyoq kiyim uchun raqam (38–45), remen uchun sm.
- Karta raqamini, admin parolini yoki maxfiy maʼlumotni hech qachon aytma. Bilmagan savolingga Telegram yordamga yoʻnaltir.
- Doʻkonga aloqasi yoʻq mavzularda qisqa javob berib, kiyimga qaytar.
${shopContext()}`;
  const text = await geminiCall(null, false, { contents, system, temperature: 0.6, maxTokens: 900 }).catch((e) => { throw httpErr(502, 'AI hozir band, birozdan soʻng urinib koʻring'); });
  return { text: clean(text, 4000), model: geminiLastModel };
});
route('POST', '/api/admin/ai/chat', async ({ body }) => {
  if (!db.settings.geminiApiKey) throw httpErr(400, 'Avval Sozlamalarda Gemini API kalitini kiriting');
  const contents = chatHistory(body);
  const st = adminStatsData();
  const ord = db.orders.slice(-40).map((o) => `#${o.number} ${o.status} ${money(o.total)} ${o.customer.name} ${new Date(o.createdAt).toISOString().slice(0, 10)} ${o.items.map((i) => `${i.name}(${i.size || '-'})x${i.qty}`).join(', ')}${o.ai ? ' AI:' + o.ai.verdict : ''}`).join('\n');
  const system = `Sen "${db.settings.siteName}" internet doʻkoni egasining shaxsiy AI yordamchisisan (admin panel). Oʻzbek tilida, aniq va qisqa javob ber. Savdo tahlili, mahsulot tavsifi yozish, Instagram post/reklama matni, narx strategiyasi, mijozga javob matni, buyurtmalar boʻyicha savollarga yordam ber. Raqamlarni faqat quyidagi maʼlumotlardan ol, toʻqima.
STATISTIKA: ${JSON.stringify({ savdo: st.revenue, bugun: st.revenueToday, sotilgan: st.itemsSold, buyurtmalar: st.orders, foydalanuvchilar: st.users, onlayn: st.online, top: st.top.map((t) => `${t.name}: ${t.qty} dona, ${t.sum}`), kunlar: st.days })}
SOʻNGGI BUYURTMALAR:
${ord || '—'}
${shopContext()}`;
  const text = await geminiCall(null, false, { contents, system, temperature: 0.5, maxTokens: 2048 }).catch((e) => { throw httpErr(502, 'AI xatosi: ' + e.message); });
  return { text: clean(text, 8000), model: geminiLastModel };
}, { auth: 'admin' });


/* ============================ MONITORING BOT (texnik + tashriflar) ============================ */
const monState = { running: false, username: '', error: '', version: 0 };
async function mtg(method, payload = {}) {
  const token = db.settings.monitorBotToken; if (!token) throw new Error('Monitoring bot token yoʻq');
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const j = await r.json().catch(() => ({ ok: false, description: 'HTTP ' + r.status }));
  if (!j.ok) throw new Error(j.description || 'Telegram xatosi'); return j.result;
}
function monChats() { const s = db.settings; return [...new Set([...(s.monitorChatIds || []), ...(s.adminChatIds || [])])]; }
function monSend(text) {
  const s = db.settings, ps = [];
  if (s.monitorBotToken) for (const chat of monChats()) ps.push(mtg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text, disable_web_page_preview: true }).catch((e) => { if (!/chat not found|blocked|initiate/i.test(e.message)) console.error('[MON]', e.message); }));
  else if (s.botToken) for (const chat of s.adminChatIds) ps.push(tg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text }).catch(() => {}));
  return bg(Promise.all(ps));
}
function devInfo(ua = '', d = {}) {
  ua = String(ua);
  let os = /Windows NT 10/.test(ua) ? 'Windows 10/11' : /Windows/.test(ua) ? 'Windows' : /iPhone/.test(ua) ? 'iOS ' + ((ua.match(/OS (\d+)[_\d]*/) || [])[1] || '') : /iPad/.test(ua) ? 'iPadOS' : /Android/.test(ua) ? 'Android ' + ((ua.match(/Android ([\d.]+)/) || [])[1] || '') : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Nomaʼlum';
  let model = clean(d.model || '', 60);
  if (!model) { const m = ua.match(/Android [\d.]+; ([^;)]+)(?:\sBuild|\))/); if (m && !/^K$/.test(m[1].trim())) model = m[1].trim(); }
  if (!model && /iPhone/.test(ua)) model = 'iPhone'; if (!model && /iPad/.test(ua)) model = 'iPad';
  const MODELS = { 'SM-S9': 'Samsung Galaxy S', 'SM-A': 'Samsung Galaxy A', 'SM-G': 'Samsung Galaxy', 'SM-N': 'Samsung Note', 'Redmi': 'Xiaomi Redmi', 'M2': 'Xiaomi', '2201': 'Xiaomi', 'CPH': 'OPPO', 'RMX': 'Realme', 'V2': 'Vivo', 'Pixel': 'Google Pixel', 'TECNO': 'Tecno', 'Infinix': 'Infinix', 'HONOR': 'Honor', 'POCO': 'Xiaomi POCO' };
  let brand = ''; for (const [k, v] of Object.entries(MODELS)) if (model.startsWith(k)) { brand = v; break; }
  const br = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /YaBrowser/.test(ua) ? 'Yandex' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /Telegram/i.test(ua) ? 'Telegram' : /Instagram/.test(ua) ? 'Instagram' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Brauzer';
  const mobile = /mobile|android|iphone/i.test(ua);
  if (d.platform && d.platformVersion) { const mj = parseInt(d.platformVersion) || 0; os = /Windows/i.test(d.platform) ? (mj >= 13 ? 'Windows 11' : 'Windows 10') : /Android/i.test(d.platform) ? 'Android ' + mj : /mac/i.test(d.platform) ? 'macOS' : clean(d.platform, 20) + ' ' + mj; }
  return { os, model: brand ? `${brand} (${model})` : model || (mobile ? 'Telefon' : 'Kompyuter'), browser: br, mobile, screen: clean(d.screen || '', 20), lang: clean(d.lang || '', 10) };
}
const devLine = (d) => d ? `${d.mobile ? '📱' : '💻'} <b>${esc(d.model)}</b> • ${esc(d.os)} • ${esc(d.browser)}${d.screen ? ' • ' + esc(d.screen) : ''}` : '';
const visitSeen = new Map();
async function monVisit(vid, v, user, req) {
  if (!v) return; const t = Date.now();
  if (IS_VERCEL) { if (await kv('SET', 'gh:visit:' + vid, '1', 'NX', 'EX', 1800) !== 'OK') return; }
  else { const last = visitSeen.get(vid); visitSeen.set(vid, t); if (last && t - last < 30 * 60000) return; }
  if (db.settings.monitorVisits === false) return;
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].replace('::ffff:', '');
  const later = IS_VERCEL ? (fn) => bg(loadOnline().then(fn)) : (fn) => setTimeout(fn, 2500);
  later(() => {
    const cur = online.get(vid) || v; const st = onlineStats();
    monSend([`👤 <b>Saytga kirdi</b>`, user ? `🙍 <b>${esc(user.name)}</b> (${esc(user.email)})` : `🙍 Mehmon (roʻyxatdan oʻtmagan)`, devLine(cur.dev), `📄 Sahifa: ${esc(cur.path || '/')}`, ip && !/^(127\.|::1)/.test(ip) ? `🌐 IP: ${esc(ip)}` : '', `🟢 Hozir onlayn: <b>${st.total}</b> (${st.users} aʼzo, ${st.guests} mehmon)`, `🕒 ${new Date().toLocaleTimeString('ru-RU', { timeZone: 'Asia/Tashkent' })}`].filter(Boolean).join('\n'));
  }, 2500);
}
function monAuthEvent(title, user, req, dev) {
  const d = devInfo(req?.headers['user-agent'] || '', dev || {});
  monSend([`${title}`, `🙍 <b>${esc(user.name)}</b> (${esc(user.email)})`, devLine(d), `👥 Jami aʼzolar: ${db.users.length}`, `🕒 ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`].join('\n'));
}
async function monHandle(m) {
  const s = db.settings; if (!s.monitorChatIds) s.monitorChatIds = [];
        const chat = String(m.chat.id), text = (m.text || '').trim(), isA = (s.monitorChatIds || []).includes(chat);
  if (text.startsWith('/admin')) {
    if (checkPass(text.split(/\s+/)[1] || '', db.admin.salt, db.admin.hash)) { if (!isA) s.monitorChatIds.push(chat); save(); await mtg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: '🛡 <b>Monitoring ulandi!</b>\n\nBu botga keladi:\n• 🚨 texnik nosozliklar va xatolar (AI tushuntirishi bilan)\n• 👤 saytga kim kirgani, qaysi telefon/kompyuterdan\n• 🔐 roʻyxatdan oʻtish va kirishlar\n\n/onlayn — hozir kim saytda\n/holat — tizim holati' }).catch(() => {}); }
    else await mtg('sendMessage', { chat_id: chat, text: '❌ Parol notoʻgʻri. /admin <parol>' }).catch(() => {});
  } else if (!isA) { await mtg('sendMessage', { chat_id: chat, text: '🔒 Bu Gentleman House monitoring boti. Ulanish: /admin <parol>' }).catch(() => {}); }
  else if (text === '/start') { await mtg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: '🛡 <b>Gentleman House monitoring</b>\n\n/onlayn — hozir kim saytda\n/holat — tizim holati' }).catch(() => {}); }
  else if (text === '/onlayn') {
    if (IS_VERCEL) await loadOnline();
    const t = Date.now(), rows = [];
    for (const [, o] of online) { if (t - o.t > ONLINE_MS) continue; const u = o.userId ? db.users.find((x) => x.id === o.userId) : null; rows.push(`• ${u ? '<b>' + esc(u.name) + '</b>' : 'Mehmon'} — ${o.dev ? esc(o.dev.model) + ', ' + esc(o.dev.os) : ''} — ${esc(o.path)}`); }
    await mtg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: rows.length ? `🟢 <b>Hozir saytda: ${rows.length}</b>\n\n${rows.join('\n')}` : '😴 Hozir saytda hech kim yoʻq' }).catch(() => {});
  } else if (text === '/holat') {
    const h = await runHealth(true).catch(() => healthState);
    await mtg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: `🩺 <b>Tizim holati</b>\n\n${h.checks.map((c) => `${c.ok === true ? '✅' : c.ok === false ? '❌' : '⚪️'} <b>${esc(c.name)}</b>: ${esc(c.msg || '')}`).join('\n')}` }).catch(() => {});
  }
      
}
async function startMonBot() {
  if (IS_VERCEL) return setupWebhooks().catch((e) => { monState.error = e.message; });
  const v = ++monState.version; monState.running = false; monState.username = ''; monState.error = '';
  const s = db.settings; if (!s.monitorBotToken) return;
  if (!s.monitorChatIds) s.monitorChatIds = [...(s.adminChatIds || [])];
  for (;;) {
    if (v !== monState.version) return;
    try { const me = await mtg('getMe'); monState.username = me.username; monState.running = true; await mtg('deleteWebhook', {}).catch(() => {}); console.log(`[MON] monitoring bot: @${me.username}`); break; }
    catch (e) { monState.error = e.message; if (/Unauthorized|Not Found/i.test(e.message)) return; await sleep(10000); }
  }
  let offset = 0;
  while (v === monState.version) {
    try {
      const ups = await mtg('getUpdates', { offset, timeout: 25, allowed_updates: ['message'] });
      for (const up of ups) { offset = up.update_id + 1; if (up.message) monHandle(up.message).catch((e) => console.error('[MON]', e.message)); }
      monState.error = '';
    } catch (e) { monState.error = e.message; if (v === monState.version) await sleep(5000); }
  }
}

/* ============================ TIZIM MONITORINGI (AI) ============================ */
const healthState = { checks: [], lastCheck: null, running: false };
function monitorDb() { if (!db.monitor) db.monitor = { issues: [] }; return db.monitor; }
async function aiExplain(issue) {
  if (!db.settings.geminiApiKey) return;
  try {
    const t = await geminiCall([{ text: `Sen Node.js internet doʻkon serverini kuzatuvchi texnik yordamchisan. Quyidagi muammoni doʻkon egasiga (dasturchi emas) oʻzbek tilida 2-3 gapda tushuntir: nima boʻldi, mijozlarga taʼsiri bormi, nima qilish kerak. Qisqa va aniq yoz.\nTuri: ${issue.kind}\nXabar: ${issue.msg}\nTafsilot: ${issue.detail || '-'}` }], false, { temperature: 0.3, maxTokens: 300 });
    issue.ai = clean(t.replace(/\*\*|__|^#+ /gm, ''), 700); save();
    return issue.ai;
  } catch { return null; }
}
async function reportIssue(kind, msg, detail = '', opts = {}) {
  const m = monitorDb(); const key = opts.key || (kind + ':' + String(msg).slice(0, 80));
  const ex = m.issues.find((x) => x.key === key && !x.resolved);
  if (ex) { ex.count = (ex.count || 1) + 1; ex.lastAt = now(); save(); return ex; }
  const issue = { id: 'i' + uid(5), key, kind, level: opts.level || 'error', msg: clean(msg, 300), detail: clean(detail, 1200), at: now(), lastAt: now(), count: 1, resolved: false, seen: false };
  m.issues.unshift(issue); m.issues = m.issues.slice(0, 120); save();
  console.log(`[MONITOR] ${kind}: ${issue.msg}`);
  const ai = await aiExplain(issue);
  const s = db.settings;
  if (opts.notify !== false) {
    const icon = issue.level === 'warn' ? '⚠️' : '🚨';
    monSend([`${icon} <b>Texnik nosozlik</b>`, `<b>${esc(KIND_TXT[kind] || kind)}:</b> ${esc(issue.msg)}`, ai ? `\n🤖 <i>${esc(ai)}</i>` : '', `\n🕒 ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`].filter(Boolean).join('\n'));
  }
  return issue;
}
const KIND_TXT = { monbot: 'Monitoring bot', server: 'Server xatosi', client: 'Saytda (brauzerda) xato', bot: 'Telegram bot', drive: 'Google Drive zaxira', ai: 'AI (Gemini)', disk: 'Disk xotirasi', orders: 'Buyurtmalar', system: 'Tizim' };
function resolveIssue(key) {
  const m = monitorDb(); let any = false;
  for (const x of m.issues) if (x.key === key && !x.resolved) { x.resolved = true; x.resolvedAt = now(); any = true; }
  if (any) {
    save();
    monSend(`✅ <b>Muammo hal boʻldi:</b> ${esc(KIND_TXT[key.split(':')[0]] || key)}`);
  }
}
let aiLastOk = 0;
let healthPromise = null;
function runHealth(manual = false) {
  if (healthPromise) return healthPromise;
  healthPromise = runHealthInner(manual).finally(() => { healthPromise = null; healthState.running = false; });
  return healthPromise;
}
async function runHealthInner(manual) {
  healthState.running = true;
  const s = db.settings, C = [];
  const chk = async (key, name, fn) => {
    let r; try { r = await fn(); } catch (e) { r = { ok: false, msg: e.message }; }
    C.push({ key, name, ...r }); healthState.checks = [...C, ...healthState.checks.filter((x) => !C.some((c) => c.key === x.key))];
    if (r.ok === false) await reportIssue(key, r.msg, r.detail || '', { key: key + ':health', level: r.level || 'error' });
    else if (r.ok === true) resolveIssue(key + ':health');
  };
  await chk('system', 'Sayt serveri', () => ({ ok: true, msg: `Ishlayapti • ${Math.round(process.uptime() / 60)} daqiqadan beri • xotira ${Math.round(process.memoryUsage().rss / 1048576)} MB` }));
  if (IS_VERCEL) await setupWebhooks().catch(() => {});
  await chk('bot', 'Telegram bot', async () => {
    if (!s.botToken) return { ok: null, msg: 'Token kiritilmagan' };
    if (IS_VERCEL) { const w = await tg('getWebhookInfo'); const recent = w.last_error_date && Date.now() / 1000 - w.last_error_date < 600; return w.url && !recent ? { ok: true, msg: '@' + (botState.username || 'bot') + ' • webhook • adminlar: ' + s.adminChatIds.length } : { ok: false, msg: 'Bot webhook xatosi: ' + (w.last_error_message || 'ulanmagan') }; }
    return botState.running && !botState.error ? { ok: true, msg: '@' + botState.username + ' • adminlar: ' + s.adminChatIds.length } : { ok: false, msg: 'Bot ishlamayapti: ' + (botState.error || 'ulanmagan'), level: 'error' };
  });
  await chk('monbot', 'Monitoring bot', () => !s.monitorBotToken ? { ok: null, msg: 'Token kiritilmagan' } : monState.running ? { ok: true, msg: '@' + monState.username } : { ok: false, msg: 'Monitoring bot ishlamayapti: ' + (monState.error || 'ulanmagan'), level: 'warn' });
  await chk('drive', IS_VERCEL ? 'Maʼlumotlar bazasi (Redis)' : 'Google Drive zaxira', async () => {
    if (IS_VERCEL) { const t0 = Date.now(); await kv('PING'); const sz = await kv('STRLEN', 'gh:db'); return { ok: true, msg: `Redis ${(sz / 1024).toFixed(0)} KB • ${Date.now() - t0} ms` }; }
    const g = s.gdrive; if (!g) return { ok: null, msg: 'Ulanmagan' };
    const age = g.lastBackup ? (Date.now() - new Date(g.lastBackup)) / 36e5 : 999;
    if (GD.lastError && age > 1) return { ok: false, msg: 'Zaxira xatosi: ' + GD.lastError, level: 'warn' };
    if (age > 3) return { ok: false, msg: `Oxirgi zaxira ${Math.round(age)} soat oldin`, level: 'warn' };
    return { ok: true, msg: 'Oxirgi zaxira: ' + new Date(g.lastBackup).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' }) };
  });
  await chk('ai', 'AI (Gemini)', async () => {
    if (!s.geminiApiKey) return { ok: null, msg: 'Kalit kiritilmagan' };
    if (!manual && Date.now() - aiLastOk < 30 * 60000) return { ok: true, msg: `${geminiLastModel || 'Gemini'} • ishlayapti` };
    const t0 = Date.now(); const models = [geminiLastModel, 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest'].filter((m, i, a) => m && a.indexOf(m) === i);
    let err;
    for (const m of models) {
      try { await Promise.race([geminiOnce(m, [{ text: 'OK deb yoz' }], false, { maxTokens: 5 }), sleep(15000).then(() => { throw new Error('javob 15 soniyada kelmadi'); })]); geminiLastModel = m; geminiLastAt = Date.now(); aiLastOk = Date.now(); return { ok: true, msg: `${m} • ${((Date.now() - t0) / 1000).toFixed(1)} s` }; }
      catch (e) { err = e; if (/api key|API_KEY|permission/i.test(e.message)) break; }
    }
    return { ok: false, msg: 'Gemini javob bermayapti: ' + err.message, level: 'warn' };
  });
  if (IS_VERCEL) await chk('gdrive', 'Google Drive (fayllar ombori)', async () => {
    const g = s.gdrive; if (!g?.refreshToken) return { ok: false, msg: 'Google Drive ulanmagan — fayllar vaqtincha Vercel Blob’ga saqlanadi', level: 'warn' };
    await gdToken(); const about = await gdApi('https://www.googleapis.com/drive/v3/about?fields=storageQuota');
    const q = about.storageQuota || {}; const free = q.limit ? (q.limit - q.usage) / 1073741824 : null;
    return { ok: true, msg: `${g.email || ''} • fayllar: ${Object.keys(g.uploaded || {}).length}${free != null ? ` • ${free.toFixed(0)} GB boʻsh` : ''}` };
  });
  await chk('disk', 'Disk xotirasi', () => {
    if (IS_VERCEL) return { ok: true, msg: 'Vercel Blob ombori (cheksiz kengayadi)' };
    if (!fs.statfsSync) return { ok: null, msg: 'Tekshirib boʻlmadi' };
    const st = fs.statfsSync(DATA); const free = st.bavail * st.bsize / 1073741824;
    return free < 1 ? { ok: false, msg: `Diskda joy kam: ${free.toFixed(2)} GB qoldi`, level: free < 0.3 ? 'error' : 'warn' } : { ok: true, msg: `${free.toFixed(1)} GB boʻsh` };
  });
  await chk('orders', 'Kutilayotgan buyurtmalar', () => {
    const old = db.orders.filter((o) => o.status === 'pending' && Date.now() - new Date(o.createdAt) > 2 * 36e5);
    return old.length ? { ok: false, msg: `${old.length} ta buyurtma 2 soatdan beri tasdiqlanmagan (#${old.map((o) => o.number).join(', #')})`, level: 'warn' } : { ok: true, msg: 'Hammasi oʻz vaqtida' };
  });
  healthState.checks = C; healthState.lastCheck = now(); healthState.running = false;
  monitorDb().health = { checks: C, lastCheck: healthState.lastCheck }; save();
  return healthState;
}
if (!IS_VERCEL) { setTimeout(() => runHealth().catch(() => {}), 20000); setInterval(() => runHealth().catch(() => {}), 5 * 60000); }
process.on('uncaughtException', (e) => { console.error(e); reportIssue('server', e.message, e.stack).catch(() => {}); });
process.on('unhandledRejection', (e) => { console.error(e); reportIssue('server', e?.message || String(e), e?.stack || '').catch(() => {}); });
const clientErrHits = new Map();
route('POST', '/api/client-error', ({ body, req }) => {
  const ip = req.socket.remoteAddress, t = Date.now(); const a = (clientErrHits.get(ip) || []).filter((x) => t - x < 600000);
  if (a.length > 10) return { ok: true }; a.push(t); clientErrHits.set(ip, a);
  const msg = clean(body?.msg, 300); if (!msg || /ResizeObserver|Script error|extension|chrome-extension/i.test(msg)) return { ok: true };
  reportIssue('client', msg, `Sahifa: ${clean(body.page, 200)}\nFayl: ${clean(body.src, 200)}:${+body.line || 0}\n${clean(body.stack, 600)}\nBrauzer: ${clean(req.headers['user-agent'], 160)}`, { key: 'client:' + msg.slice(0, 80) }).catch(() => {});
  return { ok: true };
});
// botlarni chiroyli bezash: nom, tavsif, buyruqlar, rasm
route('POST', '/api/admin/bots/brand', async () => {
  const s = db.settings, out = {};
  const site = s.siteName || 'Gentleman House';
  const jobs = [];
  if (s.botToken) jobs.push(['main', tg, {
    name: `${site} • Savdo`,
    short: `🎩 ${site} — premium erkaklar kiyimlari. Buyurtmalar, toʻlovlar va savdo boshqaruvi.`,
    desc: `🎩 ${site.toUpperCase()}\nPremium erkaklar kiyimlari doʻkoni\n\n🛍 Yangi buyurtmalar — rasmlari, razmer, telefon va lokatsiya bilan\n💳 Toʻlov cheklari + 🤖 AI tekshiruvi\n✅ Bir bosishda tasdiqlash yoki rad etish\n📊 Savdo statistikasi\n\n🔐 Admin ulanishi: /admin <parol>`,
    cmds: [['stat', '📊 Savdo statistikasi'], ['kutilmoqda', '⏳ Tasdiqlanmagan buyurtmalar'], ['admin', '🔐 Admin sifatida ulanish'], ['chiqish', '🚪 Bildirishnomalarni oʻchirish']],
  }]);
  if (s.monitorBotToken) jobs.push(['mon', mtg, {
    name: `${site} • Texnik`,
    short: `🛡 ${site} saytining texnik monitoringi: xatolar, tashriflar va tizim holati.`,
    desc: `🛡 ${site.toUpperCase()} — MONITORING\n\n🚨 Texnik nosozliklar (AI tushuntirishi bilan)\n👤 Saytga kim kirdi va qaysi telefondan\n🔐 Roʻyxatdan oʻtish va kirishlar\n🩺 Server, bot, baza va AI holati\n\n🔐 Ulanish: /admin <parol>`,
    cmds: [['onlayn', '🟢 Hozir saytda kim bor'], ['holat', '🩺 Tizim holati'], ['admin', '🔐 Admin sifatida ulanish']],
  }]);
  for (const [key, call, b] of jobs) {
    const r = {};
    for (const [m, p] of [['setMyName', { name: b.name }], ['setMyShortDescription', { short_description: b.short }], ['setMyDescription', { description: b.desc }], ['setMyCommands', { commands: b.cmds.map(([command, description]) => ({ command, description })) }]]) {
      try { await call(m, p); r[m] = 'ok'; } catch (e) { r[m] = e.message; }
    }
    out[key] = r;
  }
  return out;
}, { auth: 'admin' });
route('POST', '/api/admin/monbot/test', async () => {
  if (!db.settings.monitorBotToken) throw httpErr(400, 'Monitoring bot tokenini kiriting va saqlang');
  let ok = 0, err = '';
  for (const chat of monChats()) { try { await mtg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: '✅ <b>Test:</b> monitoring bot ishlayapti. Texnik nosozliklar va tashriflar shu yerga keladi.' }); ok++; } catch (e) { err = e.message; } }
  if (!ok) throw httpErr(400, 'Xabar yuborilmadi: ' + (err || 'admin yoʻq') + '. Telegramda @' + (monState.username || 'botingiz') + ' ni oching va /start bosing (yoki /admin parol yozing).');
  return { ok: true, sent: ok, username: monState.username };
}, { auth: 'admin' });
route('GET', '/api/admin/health', async () => {
  if (IS_VERCEL) { const h = monitorDb().health; if (h && !healthState.lastCheck) Object.assign(healthState, h); if (!h || Date.now() - new Date(h.lastCheck) > 5 * 60000) await runHealth(); }
  return { ...healthState, issues: monitorDb().issues.slice(0, 60) };
}, { auth: 'admin' });
route('GET', '/api/cron/health', async ({ req }) => {
  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) throw httpErr(401, 'no');
  await runHealth(); await gdMirrorDb(true).catch(() => {}); return { ok: true, at: healthState.lastCheck };
});
route('POST', '/api/admin/health/run', async () => { await runHealth(true); return { ...healthState, issues: monitorDb().issues.slice(0, 60) }; }, { auth: 'admin' });
route('POST', '/api/admin/issues/:id/resolve', ({ params }) => { const x = monitorDb().issues.find((i) => i.id === params.id); if (x) { x.resolved = true; x.resolvedAt = now(); save(); } return { ok: true }; }, { auth: 'admin' });
route('POST', '/api/admin/issues/clear', () => { const m = monitorDb(); m.issues = m.issues.filter((x) => !x.resolved); for (const x of m.issues) x.seen = true; save(); return { ok: true }; }, { auth: 'admin' });
route('GET', '/api/admin/online', () => {
  const t = Date.now(), list = [];
  for (const [k, v] of online) {
    if (t - v.t > ONLINE_MS) { online.delete(k); continue; }
    const u = v.userId ? db.users.find((x) => x.id === v.userId) : null;
    list.push({ name: u ? u.name : 'Mehmon', email: u?.email || '', user: !!u, path: v.path, device: v.device, model: v.dev ? `${v.dev.model} • ${v.dev.os}` : '', since: v.since, ago: Math.round((t - v.t) / 1000) });
  }
  list.sort((a, b) => b.user - a.user || a.since - b.since);
  return { total: list.length, users: list.filter((x) => x.user).length, guests: list.filter((x) => !x.user).length, list };
}, { auth: 'admin' });
function orderOut(o, admin = false) {
  const out = { ...o };
  delete out.tg;
  if (!admin) delete out.checkImage;
  return out;
}
route('GET', '/api/my/orders', ({ auth }) => db.orders.filter((o) => o.userId === auth.user.id).reverse().map((o) => orderOut(o)), { auth: 'user' });
route('GET', '/api/my/notifications', ({ auth }) => db.notifications.filter((n) => n.userId === auth.user.id).slice(-40).reverse(), { auth: 'user' });
route('POST', '/api/my/notifications/read', ({ auth }) => {
  for (const n of db.notifications) if (n.userId === auth.user.id) n.read = true;
  return { ok: true };
}, { auth: 'user' });
function pushNotif(userId, title, text, orderId = null, type = 'info') {
  db.notifications.push({ id: 'n' + uid(5), userId, title, text, orderId, type, read: false, createdAt: now() });
  if (db.notifications.length > 5000) db.notifications = db.notifications.slice(-4000);
  save();
}

/* ---------- admin ---------- */
const A = { auth: 'admin' };
function adminStatsData() {
  const ok = db.orders.filter((o) => o.status === 'confirmed' || o.status === 'delivered');
  const revenue = ok.reduce((s, o) => s + o.total, 0);
  const today = new Date().toISOString().slice(0, 10);
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    const list = ok.filter((o) => (o.confirmedAt || o.createdAt).slice(0, 10) === d);
    days.push({ date: d, revenue: list.reduce((s, o) => s + o.total, 0), orders: list.length });
  }
  const sold = {};
  for (const o of ok) for (const it of o.items) {
    const k = it.productId;
    sold[k] = sold[k] || { productId: k, name: it.name, image: it.image, qty: 0, sum: 0 };
    sold[k].qty += it.qty; sold[k].sum += it.sum;
  }
  const cnt = (s) => db.orders.filter((o) => o.status === s).length;
  const weekAgo = Date.now() - 7 * 864e5;
  return {
    revenue, revenueToday: ok.filter((o) => (o.confirmedAt || '').slice(0, 10) === today).reduce((s, o) => s + o.total, 0),
    itemsSold: ok.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0),
    orders: { total: db.orders.length, pending: cnt('pending'), confirmed: cnt('confirmed'), delivered: cnt('delivered'), rejected: cnt('rejected') },
    users: { total: db.users.length, newWeek: db.users.filter((u) => Date.parse(u.createdAt) > weekAgo).length },
    aiReady: !!db.settings.geminiApiKey, online: onlineStats(), issues: (db.monitor?.issues || []).filter((x) => !x.resolved).length,
    products: db.products.length,
    days, top: Object.values(sold).sort((a, b) => b.qty - a.qty).slice(0, 8),
    recent: ok.slice(-10).reverse().map((o) => ({ id: o.id, number: o.number, name: o.customer.name, total: o.total, at: o.confirmedAt || o.createdAt, items: o.items.map((i) => `${i.name} (${i.size || '-'}) ×${i.qty}`) })),
    bot: { connected: !!db.settings.botToken, admins: db.settings.adminChatIds.length, running: botState.running, username: botState.username, error: botState.error },
  };
}
route('GET', '/api/admin/stats', () => adminStatsData(), A);
route('GET', '/api/admin/settings', () => ({ ...db.settings, gdrive: gdriveStatus() }), A);
route('PUT', '/api/admin/settings', ({ body }) => {
  const s = db.settings; const oldToken = s.botToken; const oldMon = s.monitorBotToken;
  const strKeys = ['siteName', 'tagline', 'heroTitle', 'heroSubtitle', 'heroImage', 'aboutTitle', 'aboutText', 'address', 'workHours', 'instagram', 'telegramSupport', 'adminTelegram', 'cardNumber', 'cardHolder', 'cardBank', 'deliveryNote', 'botToken', 'googleClientId', 'googleClientSecret', 'gdriveDeviceClientId', 'gdriveDeviceSecret', 'marquee', 'geminiApiKey', 'geminiModel', 'monitorBotToken'];
  for (const k of strKeys) if (body[k] !== undefined) s[k] = clean(body[k], 3000);
  if (Array.isArray(body.phones)) s.phones = body.phones.map((x) => clean(x, 40)).filter(Boolean).slice(0, 10);
  if (Array.isArray(body.monitorChatIds)) s.monitorChatIds = body.monitorChatIds.map((x) => clean(x, 30)).filter(Boolean).slice(0, 20);
  if (Array.isArray(body.adminChatIds)) s.adminChatIds = body.adminChatIds.map((x) => clean(x, 30)).filter(Boolean).slice(0, 20);
  for (const k of ['deliveryPrice', 'deliveryFreeFrom']) if (body[k] !== undefined) s[k] = Math.max(0, Math.min(1e9, Math.round(+body[k] || 0)));
  if (Array.isArray(body.heroBgs)) s.heroBgs = body.heroBgs.map((x) => clean(x, 500)).filter((x) => /^(\/uploads\/|\/img\/|https:\/\/)/.test(x)).slice(0, 8);
  if (body.aiCheck !== undefined) s.aiCheck = !!body.aiCheck;
  if (body.aiChat !== undefined) s.aiChat = !!body.aiChat;
  if (body.themeVars && typeof body.themeVars === 'object') {
    const tv = {}; for (const k of ['gold', 'gold2', 'gold3', 'bg', 'bg2', 'card', 'card2']) { const v = String(body.themeVars[k] || ''); if (/^#[0-9a-f]{6}$/i.test(v)) tv[k] = v.toLowerCase(); }
    s.themeVars = Object.keys(tv).length ? tv : null; s.themePreset = clean(body.themePreset || 'custom', 30);
  }
  if (body.monitorVisits !== undefined) s.monitorVisits = !!body.monitorVisits;
  if (body.lat !== undefined && isFinite(+body.lat)) s.lat = +body.lat;
  if (body.lng !== undefined && isFinite(+body.lng)) s.lng = +body.lng;
  save();
  if (s.botToken !== oldToken) startBot();
  if (s.monitorBotToken !== oldMon) startMonBot();
  gdriveSoon();
  return { ...s, gdrive: gdriveStatus() };
}, A);
route('PUT', '/api/admin/credentials', ({ body }) => {
  if (!checkPass(body.oldPassword || '', db.admin.salt, db.admin.hash)) throw httpErr(400, 'Joriy parol notoʻgʻri');
  const login = clean(body.login, 60); const pw = String(body.newPassword || '');
  if (login.length < 4) throw httpErr(400, 'Login kamida 4 belgi');
  if (pw && pw.length < 6) throw httpErr(400, 'Yangi parol kamida 6 belgi');
  db.admin.login = login;
  if (pw) Object.assign(db.admin, hashPass(pw));
  return { ok: true };
}, A);
route('POST', '/api/admin/upload', async ({ body }) => {
  const f = await saveDataUrl(body.data, UPLOADS);
  const item = { id: 'm' + uid(5), url: '/uploads/' + f.name, type: f.type, size: f.size, name: clean(body.name, 120) || f.name, createdAt: now() };
  db.media.push(item); save(); gdriveSoon();
  return item;
}, A);
route('GET', '/api/admin/media', () => [...db.media].reverse(), A);
route('DELETE', '/api/admin/media/:id', ({ params }) => {
  const m = db.media.find((x) => x.id === params.id);
  if (!m) throw httpErr(404, 'Topilmadi');
  db.media = db.media.filter((x) => x !== m);
  if (IS_VERCEL) { const u = db.blobs[path.basename(m.url)]; if (u) { bg(blob().del(u)); delete db.blobs[path.basename(m.url)]; } }
  else try { fs.unlinkSync(path.join(UPLOADS, path.basename(m.url))); } catch {}
  return { ok: true };
}, A);

// categories
route('POST', '/api/admin/categories', ({ body }) => {
  const c = catFrom(body, { id: 'c' + uid(4), order: db.categories.length + 1 });
  if (db.categories.some((x) => x.slug === c.slug)) c.slug += '-' + uid(2);
  db.categories.push(c); return c;
}, A);
route('PUT', '/api/admin/categories/:id', ({ params, body }) => {
  const i = db.categories.findIndex((x) => x.id === params.id);
  if (i < 0) throw httpErr(404, 'Kategoriya topilmadi');
  db.categories[i] = catFrom(body, db.categories[i]); return db.categories[i];
}, A);
route('DELETE', '/api/admin/categories/:id', ({ params }) => {
  if (db.products.some((p) => p.categoryId === params.id)) throw httpErr(400, 'Avval shu kategoriyadagi mahsulotlarni oʻchiring yoki koʻchiring');
  db.categories = db.categories.filter((x) => x.id !== params.id); return { ok: true };
}, A);
function slugify(s) { return String(s).toLowerCase().replace(/[ʻʼ'‘’`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kategoriya'; }
function catFrom(b, base) {
  const name = clean(b.name ?? base.name, 60);
  if (!name) throw httpErr(400, 'Kategoriya nomi kerak');
  return {
    ...base, name, subtitle: clean(b.subtitle ?? base.subtitle ?? '', 120), image: clean(b.image ?? base.image ?? '', 500), cover: clean(b.cover ?? base.cover ?? '', 500),
    slug: b.slug ? slugify(b.slug) : (base.slug || slugify(name)),
    model3d: ['suit', 'pants', 'shirt', 'shoes', 'belt', 'coat'].includes(b.model3d) ? b.model3d : (base.model3d || 'suit'),
    sizeType: ['clothes', 'shoes', 'belt', 'none'].includes(b.sizeType) ? b.sizeType : (base.sizeType || 'clothes'),
    order: b.order !== undefined ? Number(b.order) || 0 : base.order,
  };
}
// products
route('GET', '/api/admin/products', () => [...db.products].reverse().map(productOut), A);
route('POST', '/api/admin/products', ({ body }) => {
  const p = prodFrom(body, { id: 'p' + uid(5), createdAt: now(), sold: 0 }); db.products.push(p); return productOut(p);
}, A);
route('PUT', '/api/admin/products/:id', ({ params, body }) => {
  const i = db.products.findIndex((x) => x.id === params.id);
  if (i < 0) throw httpErr(404, 'Mahsulot topilmadi');
  db.products[i] = prodFrom(body, db.products[i]); return productOut(db.products[i]);
}, A);
route('DELETE', '/api/admin/products/:id', ({ params }) => { db.products = db.products.filter((x) => x.id !== params.id); return { ok: true }; }, A);
// oyoq kiyim va remenlarda S/M/L/XL kabi harfli razmerlar boʻlmaydi — faqat raqamlar
function fixSizes(list, type) {
  if (type === 'shoes' || type === 'belt') return list.filter((x) => /^\d{2,3}(\.5)?$/.test(x));
  if (type === 'none') return [];
  return list;
}
function prodFrom(b, base) {
  const name = clean(b.name ?? base.name, 120);
  if (!name) throw httpErr(400, 'Mahsulot nomini kiriting');
  const price = Math.round(Number(b.price ?? base.price));
  if (!(price > 0)) throw httpErr(400, 'Narxni toʻgʻri kiriting');
  const categoryId = b.categoryId ?? base.categoryId;
  if (!db.categories.some((c) => c.id === categoryId)) throw httpErr(400, 'Kategoriyani tanlang');
  const arr = (v, d, max) => (Array.isArray(v) ? v.map((x) => clean(x, max)).filter(Boolean) : d);
  return {
    ...base, name, price, categoryId,
    oldPrice: b.oldPrice !== undefined ? (Number(b.oldPrice) > 0 ? Math.round(Number(b.oldPrice)) : null) : base.oldPrice ?? null,
    description: clean(b.description ?? base.description ?? '', 3000),
    images: arr(b.images, base.images || [], 500).slice(0, 12),
    video: clean(b.video ?? base.video ?? '', 500),
    sizes: fixSizes(arr(b.sizes, base.sizes || [], 10), db.categories.find((c) => c.id === categoryId)?.sizeType).slice(0, 20),
    color3d: /^#[0-9a-f]{6}$/i.test(b.color3d || '') ? b.color3d : (base.color3d || '#1d2a44'),
    model3d: ['suit', 'pants', 'shirt', 'shoes', 'belt', 'coat', ''].includes(b.model3d) ? (b.model3d || null) : (base.model3d ?? null),
    stock: b.stock !== undefined ? Math.max(0, parseInt(b.stock) || 0) : (base.stock ?? 0),
    color3dMode: ['auto', 'manual'].includes(b.color3dMode) ? b.color3dMode : (base.color3dMode || 'auto'),
    style3d: ['', 'oxford', 'loafer', 'boot', 'sneaker'].includes(b.style3d) ? b.style3d : (base.style3d || ''),
    featured: b.featured !== undefined ? !!b.featured : !!base.featured,
    active: b.active !== undefined ? !!b.active : base.active !== false,
    updatedAt: now(),
  };
}
// orders
route('GET', '/api/admin/orders', () => [...db.orders].reverse().map((o) => orderOut(o, true)), A);
route('PATCH', '/api/admin/orders/:id', async ({ params, body }) => {
  const o = db.orders.find((x) => x.id === params.id);
  if (!o) throw httpErr(404, 'Buyurtma topilmadi');
  await setOrderStatus(o, body.status, 'Admin panel');
  return orderOut(o, true);
}, A);
route('DELETE', '/api/admin/orders/:id', ({ params }) => {
  const o = db.orders.find((x) => x.id === params.id);
  if (o && (o.status === 'confirmed' || o.status === 'delivered')) for (const it of o.items) { const p = db.products.find((x) => x.id === it.productId); if (p) { p.sold = Math.max(0, (p.sold || 0) - it.qty); p.stock = (p.stock || 0) + it.qty; } }
  db.orders = db.orders.filter((x) => x.id !== params.id); return { ok: true };
}, A);
// users
route('GET', '/api/admin/users', () => {
  const st = new Map(); for (const [, v] of online) if (v.userId && Date.now() - v.t < ONLINE_MS) st.set(v.userId, true);
  return [...db.users].reverse().map((u) => ({
    ...publicUser(u), blocked: !!u.blocked, lastSeen: u.lastSeen, online: st.has(u.id),
    orders: db.orders.filter((o) => o.userId === u.id).length,
    spent: db.orders.filter((o) => o.userId === u.id && (o.status === 'confirmed' || o.status === 'delivered')).reduce((s, o) => s + o.total, 0),
  }));
}, A);
route('PATCH', '/api/admin/users/:id', ({ params, body }) => {
  const u = db.users.find((x) => x.id === params.id); if (!u) throw httpErr(404, 'Topilmadi');
  if (body.blocked !== undefined) u.blocked = !!body.blocked;
  if (body.blocked) for (const [k, s] of Object.entries(db.sessions)) if (s.userId === u.id) delete db.sessions[k];
  return { ok: true };
}, A);
route('DELETE', '/api/admin/users/:id', ({ params }) => {
  const u = db.users.find((x) => x.id === params.id); if (!u) throw httpErr(404, 'Topilmadi');
  db.users = db.users.filter((x) => x !== u);
  for (const [k, s] of Object.entries(db.sessions)) if (s.userId === u.id) delete db.sessions[k];
  db.notifications = db.notifications.filter((n) => n.userId !== u.id);
  return { ok: true };
}, A);
route('POST', '/api/admin/notify', ({ body }) => {
  const title = clean(body.title, 100), text = clean(body.text, 500);
  if (!title) throw httpErr(400, 'Sarlavha kerak');
  const targets = body.userId ? db.users.filter((u) => u.id === body.userId) : db.users;
  for (const u of targets) pushNotif(u.id, title, text, null, 'admin');
  return { ok: true, sent: targets.length };
}, A);
route('POST', '/api/admin/bot/test', async () => {
  if (!db.settings.botToken) throw httpErr(400, 'Avval bot tokenini kiriting');
  if (!db.settings.adminChatIds.length) throw httpErr(400, 'Admin chat ID yoʻq. Botga /admin <parol> yozing');
  for (const chat of db.settings.adminChatIds) await tg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: '✅ <b>Gentleman House</b>\nBot muvaffaqiyatli ulandi! Yangi buyurtmalar shu yerga keladi.' });
  return { ok: true };
}, A);
route('GET', '/api/admin/export.csv', ({ res }) => {
  const rows = [['Raqam', 'Sana', 'Holat', 'Mijoz', 'Telefon', 'Manzil', 'Mahsulotlar', 'Jami']];
  for (const o of db.orders) rows.push([o.number, o.createdAt, o.status, o.customer.name, o.customer.phone,
    o.location.type === 'map' ? `${o.location.lat},${o.location.lng} ${o.location.address || ''}` : o.location.address,
    o.items.map((i) => `${i.name} (${i.size}) x${i.qty}`).join('; '), o.total]);
  const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="savdolar.csv"' });
  res.end(csv);
  return undefined;
}, A);

/* ------------------------- order status -------------------------- */
const STATUS_TXT = { pending: '⏳ Kutilmoqda', confirmed: '✅ TASDIQLANDI', rejected: '❌ RAD ETILDI', delivered: '🚚 YETKAZIB BERILDI' };
async function setOrderStatus(o, status, by) {
  if (!STATUS_TXT[status]) throw httpErr(400, 'Holat notoʻgʻri');
  if (o.status === status) return;
  const prev = o.status;
  o.status = status;
  o.history = o.history || [];
  o.history.push({ status, at: now(), by });
  const counted = (s) => s === 'confirmed' || s === 'delivered';
  if (status === 'confirmed' && !o.confirmedAt) o.confirmedAt = now();
  if (counted(status) && !counted(prev)) for (const it of o.items) { const p = db.products.find((x) => x.id === it.productId); if (p) { p.sold = (p.sold || 0) + it.qty; p.stock = Math.max(0, (p.stock || 0) - it.qty); } }
  if (!counted(status) && counted(prev)) for (const it of o.items) { const p = db.products.find((x) => x.id === it.productId); if (p) { p.sold = Math.max(0, (p.sold || 0) - it.qty); p.stock = (p.stock || 0) + it.qty; } }
  if (status === 'confirmed') pushNotif(o.userId, 'Buyurtmangiz tasdiqlandi', `#${o.number} buyurtmangiz tasdiqlandi. Tez orada yetib boradi. Rahmat!`, o.id, 'confirmed');
  if (status === 'rejected') pushNotif(o.userId, 'Buyurtma rad etildi', `#${o.number} buyurtmangiz toʻlov cheki tasdiqlanmagani sababli rad etildi. Savollar boʻlsa yordam boʻlimiga yozing.`, o.id, 'rejected');
  if (status === 'delivered') pushNotif(o.userId, 'Buyurtma yetkazildi', `#${o.number} buyurtmangiz yetkazib berildi. Xaridingiz uchun rahmat!`, o.id, 'delivered');
  save(); gdriveSoon();
  updateTelegramOrder(o).catch((e) => console.error('[TG] edit:', e.message));
}

/* ======================== TELEGRAM BOT =========================== */
const botState = { running: false, username: '', error: '', version: 0 };
async function tg(method, payload = {}, files = null) {
  const token = db.settings.botToken;
  if (!token) throw new Error('Bot token yoʻq');
  let opts;
  if (files) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(payload)) if (v !== undefined) fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    for (const f of files) fd.append(f.field, new Blob([f.buf], { type: f.type || 'image/jpeg' }), f.filename);
    opts = { method: 'POST', body: fd };
  } else {
    opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) };
  }
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, opts);
  const j = await r.json().catch(() => ({ ok: false, description: 'HTTP ' + r.status }));
  if (!j.ok) throw new Error(j.description || 'Telegram xatosi');
  return j.result;
}
async function localImage(url) {
  // /uploads/x.jpg yoki /img/seed/x.jpg -> {buf,type,filename}; tashqi URL -> null
  if (!url || /^https?:/i.test(url)) return null;
  if (url.startsWith('/uploads/')) {
    const ext = path.extname(url).toLowerCase(); if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return null;
    const buf = await readStored(url, 'uploads'); return buf ? { buf, type: MIME[ext], filename: path.basename(url) } : null;
  }
  if (IS_VERCEL) { try { const r = await fetch(publicUrl() + url); if (!r.ok) return null; const ext = path.extname(url).toLowerCase(); if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return null; return { buf: Buffer.from(await r.arrayBuffer()), type: MIME[ext], filename: path.basename(url) }; } catch { return null; } }
  let file;
  if (url.startsWith('/uploads/')) file = path.join(UPLOADS, path.basename(url));
  else file = path.join(PUBLIC, path.normalize(url).replace(/^([/\\])+/, ''));
  if (!file.startsWith(PUBLIC) && !file.startsWith(UPLOADS)) return null;
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return null;
  try { return { buf: fs.readFileSync(file), type: MIME[ext], filename: path.basename(file) }; } catch { return null; }
}
function orderCaption(o) {
  const L = o.location;
  const line = '━━━━━━━━━━━━━━━━';
  const items = o.items.map((i, n) => `${n + 1}. <b>${esc(i.name)}</b>\n     📏 Razmer: <b>${esc(i.size || '—')}</b>  •  ${i.qty} dona  •  ${money(i.sum)}`).join('\n');
  const loc = L.type === 'map'
    ? `📍 <b>Manzil:</b> xaritada belgilangan\n🗺 <a href="https://maps.google.com/?q=${L.lat},${L.lng}">Google Maps’da ochish</a>${L.address ? '\n🏠 ' + esc(L.address) : ''}`
    : `📍 <b>Manzil (qoʻlda yozilgan):</b> ${esc(L.address)}${L.lat != null ? `\n🗺 <a href="https://maps.google.com/?q=${L.lat},${L.lng}">Xaritada taxminiy joy</a>` : ''}`;
  return [
    `🎩 <b>GENTLEMAN HOUSE</b>`,
    `🛍 <b>YANGI BUYURTMA #${o.number}</b>`,
    line,
    `👤 <b>Mijoz:</b> ${esc(o.customer.name)}`,
    `📞 <b>Telefon:</b> ${esc(o.customer.phone)}`,
    o.customer.phone2 ? `📞 <b>Qoʻshimcha:</b> ${esc(o.customer.phone2)}` : '',
    `📧 ${esc(o.userEmail || '')}`,
    loc,
    line,
    `📦 <b>Mahsulotlar:</b>`,
    items,
    line,
    o.delivery != null ? `🚚 Yetkazib berish: ${o.delivery ? money(o.delivery) : 'bepul'}` : '',
    `💰 <b>JAMI: ${money(o.total)}</b>`,
    o.note ? `📝 <b>Izoh:</b> ${esc(o.note)}` : '',
    `🕒 ${new Date(o.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`,
    line,
    `🧾 Toʻlov cheki ilova qilingan (rasmda)`,
    `📌 <b>Holat: ${STATUS_TXT[o.status]}</b>`,
  ].filter(Boolean).join('\n');
}
function orderKeyboard(o) {
  if (o.status === 'pending') return { inline_keyboard: [[{ text: '✅ Tasdiqlash', callback_data: 'ok:' + o.id }, { text: '❌ Rad etish', callback_data: 'no:' + o.id }]] };
  if (o.status === 'confirmed') return { inline_keyboard: [[{ text: '🚚 Yetkazib berildi', callback_data: 'dl:' + o.id }]] };
  return { inline_keyboard: [] };
}
function fitCaption(text) {
  if (text.length <= 1024) return text;
  return text.slice(0, 1000).replace(/<[^>]*$/, '') + '\n…';
}
async function sendOrderToTelegram(o) {
  const chats = db.settings.adminChatIds;
  if (!db.settings.botToken || !chats.length) { console.log('[TG] bot sozlanmagan — buyurtma faqat admin panelda'); return; }
  const checkBuf = await readStored(o.checkImage, 'checks');
  if (!checkBuf) throw new Error('Chek fayli topilmadi');
  const caption = orderCaption(o);
  for (const chat of chats) {
    try {
      // 1) mahsulot rasmlari (albom)
      const media = []; const files = [];
      for (const [i, it] of o.items.slice(0, 10).entries()) {
        const cap = `${i + 1}. ${it.name}\n📏 Razmer: ${it.size || '—'} • ${it.qty} dona • ${money(it.sum)}`;
        const loc = await localImage(it.image);
        if (loc) { files.push({ field: 'img' + i, ...loc }); media.push({ type: 'photo', media: 'attach://img' + i, caption: cap }); }
        else if (/^https?:/i.test(it.image || '')) media.push({ type: 'photo', media: it.image, caption: cap });
      }
      try {
        if (media.length === 1) {
          const m = media[0];
          if (files.length) await tg('sendPhoto', { chat_id: chat, caption: m.caption }, [{ ...files[0], field: 'photo' }]);
          else await tg('sendPhoto', { chat_id: chat, photo: m.media, caption: m.caption });
        } else if (media.length > 1) await tg('sendMediaGroup', { chat_id: chat, media }, files);
      } catch (e) { console.error('[TG] mahsulot rasmlari:', e.message); }
      // 2) lokatsiya
      if (o.location.lat != null) {
        try {
          await tg('sendVenue', { chat_id: chat, latitude: o.location.lat, longitude: o.location.lng, title: `📍 Buyurtma #${o.number} ${o.location.type === 'map' ? 'manzili' : '(qoʻlda yozilgan manzil)'}`, address: `${o.customer.name} • ${o.customer.phone}` });
        } catch { await tg('sendLocation', { chat_id: chat, latitude: o.location.lat, longitude: o.location.lng }).catch(() => {}); }
      }
      // 3) chek + toʻliq maʼlumot + tugmalar
      const ext = path.extname(o.checkImage).toLowerCase();
      const m = await tg('sendPhoto', { chat_id: chat, caption: fitCaption(caption), parse_mode: 'HTML', reply_markup: orderKeyboard(o) },
        [{ field: 'photo', buf: checkBuf, type: MIME[ext] || 'image/jpeg', filename: o.checkImage }]);
      o.tg.push({ chat_id: chat, message_id: m.message_id });
    } catch (e) {
      console.error('[TG] chat', chat, e.message);
      try {
        const m = await tg('sendMessage', { chat_id: chat, text: caption, parse_mode: 'HTML', reply_markup: orderKeyboard(o), disable_web_page_preview: true });
        o.tg.push({ chat_id: chat, message_id: m.message_id, text: true });
      } catch (e2) { console.error('[TG] fallback:', e2.message); }
    }
  }
  save();
}
async function updateTelegramOrder(o) {
  if (!db.settings.botToken || !o.tg?.length) return;
  const caption = orderCaption(o);
  for (const t of o.tg) {
    const base = { chat_id: t.chat_id, message_id: t.message_id, parse_mode: 'HTML', reply_markup: orderKeyboard(o) };
    try {
      if (t.text) await tg('editMessageText', { ...base, text: caption, disable_web_page_preview: true });
      else await tg('editMessageCaption', { ...base, caption: fitCaption(caption) });
    } catch (e) { if (!/not modified/.test(e.message)) console.error('[TG] edit', e.message); }
  }
}
async function handleUpdate(u) {
  const s = db.settings;
  if (u.message) {
    const chat = String(u.message.chat.id);
    const text = (u.message.text || '').trim();
    const isAdmin = s.adminChatIds.includes(chat);
    if (text.startsWith('/admin')) {
      const pw = text.split(/\s+/)[1] || '';
      if (checkPass(pw, db.admin.salt, db.admin.hash)) {
        if (!isAdmin) s.adminChatIds.push(chat); save();
        await tg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: '👑 <b>Siz admin sifatida ulandingiz!</b>\n\nEndi barcha yangi buyurtmalar, toʻlov cheklari va lokatsiyalar shu chatga keladi.\n\n/stat — statistika\n/kutilmoqda — tasdiqlanmagan buyurtmalar\n/chiqish — admin roʻyxatidan chiqish' });
      } else await tg('sendMessage', { chat_id: chat, text: '❌ Parol notoʻgʻri. Foydalanish: /admin <parol>' });
      return;
    }
    if (text === '/chiqish' && isAdmin) {
      s.adminChatIds = s.adminChatIds.filter((x) => x !== chat); save();
      return tg('sendMessage', { chat_id: chat, text: 'Siz admin roʻyxatidan chiqdingiz.' });
    }
    if (text === '/stat' && isAdmin) {
      const ok = db.orders.filter((o) => o.status === 'confirmed' || o.status === 'delivered');
      return tg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: `📊 <b>Statistika</b>\n\n💰 Jami savdo: <b>${money(ok.reduce((a, o) => a + o.total, 0))}</b>\n🧾 Buyurtmalar: ${db.orders.length}\n⏳ Kutilmoqda: ${db.orders.filter((o) => o.status === 'pending').length}\n👥 Foydalanuvchilar: ${db.users.length}\n🟢 Hozir onlayn: ${onlineStats().total}` });
    }
    if (text === '/kutilmoqda' && isAdmin) {
      const p = db.orders.filter((o) => o.status === 'pending');
      if (!p.length) return tg('sendMessage', { chat_id: chat, text: '✨ Kutilayotgan buyurtma yoʻq.' });
      for (const o of p.slice(-10)) {
        const m = await tg('sendMessage', { chat_id: chat, text: orderCaption(o), parse_mode: 'HTML', reply_markup: orderKeyboard(o), disable_web_page_preview: true });
        o.tg.push({ chat_id: chat, message_id: m.message_id, text: true });
      }
      save(); return;
    }
    return tg('sendMessage', {
      chat_id: chat, parse_mode: 'HTML',
      text: `🎩 <b>${esc(s.siteName)}</b> botiga xush kelibsiz!\n\n${esc(s.tagline)}\n\n📸 Instagram: ${esc(s.instagram)}\n💬 Yordam: ${esc(s.telegramSupport)}\n👤 Admin: ${esc(s.adminTelegram)}`,
      disable_web_page_preview: true,
    });
  }
  if (u.callback_query) {
    const q = u.callback_query; const chat = String(q.message?.chat?.id);
    if (!s.adminChatIds.includes(chat)) return tg('answerCallbackQuery', { callback_query_id: q.id, text: 'Ruxsat yoʻq', show_alert: true });
    const [act, id] = String(q.data || '').split(':');
    const o = db.orders.find((x) => x.id === id);
    if (!o) return tg('answerCallbackQuery', { callback_query_id: q.id, text: 'Buyurtma topilmadi' });
    if (o.tg && !o.tg.some((t) => String(t.chat_id) === chat && t.message_id === q.message.message_id)) o.tg.push({ chat_id: chat, message_id: q.message.message_id, text: !q.message.photo });
    const st = { ok: 'confirmed', no: 'rejected', dl: 'delivered' }[act];
    const who = q.from.username ? '@' + q.from.username : q.from.first_name;
    await setOrderStatus(o, st, 'Telegram: ' + who);
    await tg('answerCallbackQuery', { callback_query_id: q.id, text: st === 'confirmed' ? '✅ Tasdiqlandi! Mijozga xabar yuborildi' : st === 'rejected' ? '❌ Rad etildi' : '🚚 Yetkazildi' });
  }
}
function publicUrl() {
  const h = process.env.PUBLIC_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:' + PORT);
  return h.replace(/\/$/, '');
}
const hookSecret = (token) => crypto.createHash('sha256').update('gh-hook:' + token).digest('hex').slice(0, 32);
// Vercel: Telegram webhook (doimiy getUpdates oʻrniga)
async function setupWebhooks(force = false) {
  if (!IS_VERCEL) return;
  const s = db.settings, base = publicUrl(), out = {};
  if (s.botToken) {
    const url = `${base}/api/tg/main/${hookSecret(s.botToken)}`;
    if (force || s._hookMain !== url) { await tg('setWebhook', { url, allowed_updates: ['message', 'callback_query'], drop_pending_updates: false }); s._hookMain = url; save(); }
    try { const me = await tg('getMe'); botState.username = me.username; botState.running = true; botState.error = ''; } catch (e) { botState.error = e.message; }
    out.main = url;
  }
  if (s.monitorBotToken) {
    const url = `${base}/api/tg/mon/${hookSecret(s.monitorBotToken)}`;
    if (force || s._hookMon !== url) { await mtg('setWebhook', { url, allowed_updates: ['message'] }); s._hookMon = url; save(); }
    try { const me = await mtg('getMe'); monState.username = me.username; monState.running = true; monState.error = ''; } catch (e) { monState.error = e.message; }
    out.mon = url;
  }
  return out;
}
route('POST', '/api/tg/main/:secret', async ({ params, body }) => {
  if (!db.settings.botToken || params.secret !== hookSecret(db.settings.botToken)) throw httpErr(403, 'no');
  await handleUpdate(body).catch((e) => console.error('[TG] update:', e.message)); return { ok: true };
});
route('POST', '/api/tg/mon/:secret', async ({ params, body }) => {
  if (!db.settings.monitorBotToken || params.secret !== hookSecret(db.settings.monitorBotToken)) throw httpErr(403, 'no');
  if (body.message) await monHandle(body.message).catch((e) => console.error('[MON]', e.message)); return { ok: true };
});
route('POST', '/api/admin/webhooks', async () => ({ ok: true, ...(await setupWebhooks(true)) }), { auth: 'admin' });
async function startBot() {
  if (IS_VERCEL) return setupWebhooks().catch((e) => { botState.error = e.message; });
  const v = ++botState.version;
  botState.running = false; botState.username = ''; botState.error = '';
  if (!db.settings.botToken) return;
  // internet uzilgan boʻlsa — har 10 soniyada qayta urinadi
  for (;;) {
    if (v !== botState.version) return;
    try {
      const me = await tg('getMe');
      botState.username = me.username; botState.running = true; botState.error = '';
      await tg('deleteWebhook', {}).catch(() => {});
      console.log(`[TG] bot ishga tushdi: @${me.username}`);
      break;
    } catch (e) {
      botState.error = e.message;
      if (/Unauthorized|Not Found/i.test(e.message)) { console.error('[TG] bot token notoʻgʻri:', e.message); return; }
      console.error('[TG] internet yoʻq, 10 soniyadan soʻng qayta urinadi:', e.message);
      await sleep(10000);
    }
  }
  let offset = 0;
  while (v === botState.version) {
    try {
      const ups = await tg('getUpdates', { offset, timeout: 25, allowed_updates: ['message', 'callback_query'] });
      for (const up of ups) { offset = up.update_id + 1; handleUpdate(up).catch((e) => console.error('[TG] update:', e.message)); }
      botState.error = '';
    } catch (e) { botState.error = e.message; if (v === botState.version) await sleep(5000); }
  }
}


/* ===================== GOOGLE DRIVE (400GB) ZAXIRA ===================== */
// Baza (db.json), yuklangan rasm/videolar va cheklar Google Drive'dagi "GentlemanHouse" papkasiga saqlanadi.
const GD = { token: null, exp: 0, busy: false, pending: false, states: new Set(), lastError: '' };
function gdriveStatus() {
  const g = db.settings.gdrive;
  return g ? { connected: true, email: g.email || '', lastBackup: g.lastBackup || null, files: Object.keys(g.uploaded || {}).length, folderId: g.folderId || '', error: GD.lastError } : { connected: false, error: GD.lastError };
}
function originOf(req) {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${req.headers.host}`;
}
async function gdToken() {
  const g = db.settings.gdrive; if (!g?.refreshToken) throw new Error('Google Drive ulanmagan');
  if (GD.token && Date.now() < GD.exp - 60000) return GD.token;
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: g.clientId || db.settings.googleClientId, client_secret: g.clientSecret || db.settings.googleClientSecret, refresh_token: g.refreshToken, grant_type: 'refresh_token' }) });
  const j = await r.json(); if (!r.ok) throw new Error('Google token: ' + (j.error_description || j.error));
  GD.token = j.access_token; GD.exp = Date.now() + j.expires_in * 1000; return GD.token;
}
async function gdApi(url, opts = {}) {
  const t = await gdToken();
  const r = await fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: 'Bearer ' + t } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('Drive: ' + (j.error?.message || r.status));
  return j;
}
async function gdFolder(name, parent) {
  const q = encodeURIComponent(`name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parent ? ` and '${parent}' in parents` : ''}`);
  const f = await gdApi(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&spaces=drive`);
  if (f.files?.[0]) return f.files[0].id;
  const c = await gdApi('https://www.googleapis.com/drive/v3/files?fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', ...(parent ? { parents: [parent] } : {}) }) });
  return c.id;
}
async function gdUpload(name, buf, mime, parent, existingId) {
  if (existingId) {
    try { return (await gdApi(`https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media&fields=id`, { method: 'PATCH', headers: { 'Content-Type': mime }, body: buf })).id; }
    catch (e) { if (!/404|not found/i.test(e.message)) throw e; }
  }
  const b = 'gh' + uid(8);
  const body = Buffer.concat([
    Buffer.from(`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: [parent] })}\r\n--${b}\r\nContent-Type: ${mime}\r\n\r\n`),
    buf, Buffer.from(`\r\n--${b}--`),
  ]);
  return (await gdApi('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${b}` }, body })).id;
}
/* ---------- Vercel: Google Drive — asosiy fayl ombori ---------- */
function gdIdOf(name, kind) { const g = db.settings.gdrive; return g?.uploaded?.[(kind === 'checks' ? 'c/' : 'u/') + name] || null; }
async function gdFolders() {
  const g = db.settings.gdrive;
  if (!g.folderId) g.folderId = await gdFolder('GentlemanHouse');
  if (!g.uploadsId) g.uploadsId = await gdFolder('uploads', g.folderId);
  if (!g.checksId) g.checksId = await gdFolder('cheklar', g.folderId);
  g.uploaded = g.uploaded || {}; g.public = g.public || {}; save(); return g;
}
async function gdPublic(id) {
  const g = db.settings.gdrive; if (g.public?.[id]) return;
  await gdApi(`https://www.googleapis.com/drive/v3/files/${id}/permissions?fields=id`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'reader', type: 'anyone' }) });
  g.public = g.public || {}; g.public[id] = 1; save();
}
async function gdStore(name, buf, type, kind) {
  const g = await gdFolders();
  const id = await gdUpload(name, buf, type, kind === 'checks' ? g.checksId : g.uploadsId);
  g.uploaded[(kind === 'checks' ? 'c/' : 'u/') + name] = id;
  if (kind !== 'checks') await gdPublic(id);
  save(); return id;
}
async function gdRaw(id, range) {
  const t = await gdToken();
  return fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, { headers: { Authorization: 'Bearer ' + t, ...(range ? { Range: range } : {}) } });
}
// fayl (video/chek) ni server orqali qismlab uzatish — Vercel javob chegarasi (4.5MB) uchun 4MB boʻlaklar
async function gdStream(req, res, id, type, cache) {
  const CH = 4 * 1024 * 1024;
  let range = req.headers.range; let start = 0;
  const m = /bytes=(\d+)-(\d*)/.exec(range || '');
  if (m) start = +m[1];
  const end = m && m[2] ? Math.min(+m[2], start + CH - 1) : start + CH - 1;
  const r = await gdRaw(id, `bytes=${start}-${end}`);
  if (!r.ok && r.status !== 206) { res.writeHead(r.status === 404 ? 404 : 502); return res.end(); }
  const buf = Buffer.from(await r.arrayBuffer());
  const cr = r.headers.get('content-range');
  const total = cr ? +cr.split('/')[1] : buf.length;
  if (!m && total <= CH) { res.writeHead(200, { 'Content-Type': type, 'Content-Length': buf.length, 'Accept-Ranges': 'bytes', 'Cache-Control': cache }); return res.end(buf); }
  res.writeHead(206, { 'Content-Type': type, 'Content-Length': buf.length, 'Content-Range': `bytes ${start}-${start + buf.length - 1}/${total}`, 'Accept-Ranges': 'bytes', 'Cache-Control': cache });
  res.end(buf);
}
// katta fayllar (video) uchun brauzerdan Google Drive'ga toʻgʻridan-toʻgʻri yuklash (resumable)
route('POST', '/api/admin/gd-upload', async ({ body, req }) => {
  if (!db.settings.gdrive?.refreshToken) throw httpErr(400, 'Google Drive ulanmagan');
  const g = await gdFolders(); const t = await gdToken();
  const ext = (path.extname(clean(body.name, 120)) || '.bin').toLowerCase().replace(/[^.\w]/g, '');
  const name = Date.now().toString(36) + '-' + uid(5) + ext; const type = clean(body.type, 60) || 'application/octet-stream';
  const r = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id', { method: 'POST',
    headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': type, ...(body.size ? { 'X-Upload-Content-Length': String(body.size) } : {}), Origin: req.headers.origin || publicUrl() },
    body: JSON.stringify({ name, parents: [g.uploadsId] }) });
  if (!r.ok) throw httpErr(502, 'Drive: ' + r.status);
  return { url: r.headers.get('location'), name };
}, { auth: 'admin' });
route('POST', '/api/admin/gd-upload/done', async ({ body }) => {
  const name = path.basename(clean(body.name, 120)), id = clean(body.id, 120);
  if (!name || !id) throw httpErr(400, 'Maʼlumot yetarli emas');
  const g = await gdFolders(); g.uploaded['u/' + name] = id; await gdPublic(id);
  const item = { id: 'm' + uid(5), url: '/uploads/' + name, type: clean(body.type, 60), size: +body.size || 0, name: clean(body.label, 120) || name, createdAt: now() };
  db.media.push(item); return item;
}, { auth: 'admin' });
// Vercel: bazaning nusxasi ham Google Drive'ga (koʻpi bilan 2 daqiqada bir marta + kunlik)
async function gdMirrorDb(force = false) {
  const g = db.settings.gdrive; if (!IS_VERCEL || !g?.refreshToken) return;
  if (!force && await kv('SET', 'gh:mirror', '1', 'NX', 'EX', 120) !== 'OK') return;
  await gdFolders();
  const dbBuf = Buffer.from(JSON.stringify(db));
  g.dbFileId = await gdUpload('db.json', dbBuf, 'application/json', g.folderId, g.dbFileId);
  const day = now().slice(0, 10);
  if (g.dailyDay !== day) { await gdUpload(`db-${day}.json`, dbBuf, 'application/json', g.folderId); g.dailyDay = day; }
  g.lastBackup = now(); GD.lastError = ''; dbDirty = true;
}
async function gdriveSync() {
  const g = db.settings.gdrive; if (!g?.refreshToken) return;
  if (GD.busy) { GD.pending = true; return; }
  GD.busy = true;
  try {
    if (!g.folderId) g.folderId = await gdFolder('GentlemanHouse');
    if (!g.uploadsId) g.uploadsId = await gdFolder('uploads', g.folderId);
    if (!g.checksId) g.checksId = await gdFolder('cheklar', g.folderId);
    g.uploaded = g.uploaded || {};
    for (const [dir, parent, key] of [[UPLOADS, g.uploadsId, 'u/'], [CHECKS, g.checksId, 'c/']]) {
      for (const f of fs.readdirSync(dir)) {
        if (g.uploaded[key + f]) continue;
        const ext = path.extname(f).toLowerCase();
        g.uploaded[key + f] = await gdUpload(f, fs.readFileSync(path.join(dir, f)), MIME[ext] || 'application/octet-stream', parent);
      }
    }
    // baza: db.json (har safar yangilanadi) + kunlik nusxa
    g.lastBackup = now();
    const dbBuf = Buffer.from(JSON.stringify(db, null, 1));
    g.dbFileId = await gdUpload('db.json', dbBuf, 'application/json', g.folderId, g.dbFileId);
    const day = now().slice(0, 10);
    if (g.dailyDay !== day) { await gdUpload(`db-${day}.json`, dbBuf, 'application/json', g.folderId); g.dailyDay = day; }
    GD.lastError = ''; save();
    console.log('[Drive] zaxira saqlandi', g.lastBackup);
  } catch (e) { GD.lastError = e.message; console.error('[Drive]', e.message); }
  finally { GD.busy = false; if (GD.pending) { GD.pending = false; setTimeout(gdriveSync, 3000); } }
}
let gdTimer = null;
function gdriveSoon() { if (IS_VERCEL || !db.settings.gdrive?.refreshToken) return; clearTimeout(gdTimer); gdTimer = setTimeout(gdriveSync, 8000); }
if (!IS_VERCEL) setInterval(() => gdriveSync(), 30 * 60 * 1000);

route('GET', '/api/admin/gdrive/auth-url', ({ req }) => {
  const s = db.settings;
  if (!s.googleClientId || !s.googleClientSecret) throw httpErr(400, 'Avval Google Client ID va Client Secret ni kiriting va saqlang');
  const state = uid(12); GD.states.add(state); setTimeout(() => GD.states.delete(state), 15 * 60e3);
  const q = new URLSearchParams({ client_id: s.googleClientId, redirect_uri: originOf(req) + '/api/gdrive/callback', response_type: 'code', access_type: 'offline', prompt: 'consent', state,
    scope: 'https://www.googleapis.com/auth/drive.file openid email' });
  return { url: 'https://accounts.google.com/o/oauth2/v2/auth?' + q };
}, A);
route('GET', '/api/gdrive/callback', async ({ req, res, url }) => {
  const back = (msg) => { res.writeHead(302, { Location: '/admin/settings?gdrive=' + encodeURIComponent(msg) }); res.end(); };
  const state = url.searchParams.get('state'), code = url.searchParams.get('code');
  if (url.searchParams.get('error')) return back('bekor qilindi');
  if (!state || !GD.states.has(state) || !code) return back('xato: state');
  GD.states.delete(state);
  const s = db.settings;
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: s.googleClientId, client_secret: s.googleClientSecret, redirect_uri: originOf(req) + '/api/gdrive/callback', grant_type: 'authorization_code' }) });
  const j = await r.json();
  if (!r.ok || !j.refresh_token) return back('xato: ' + (j.error_description || j.error || 'refresh token yoʻq'));
  let email = '';
  try { email = JSON.parse(Buffer.from(j.id_token.split('.')[1], 'base64url').toString()).email || ''; } catch {}
  s.gdrive = { refreshToken: j.refresh_token, email, connectedAt: now(), uploaded: {} };
  GD.token = j.access_token; GD.exp = Date.now() + j.expires_in * 1000; GD.lastError = '';
  saveNow(); gdriveSync();
  return back('ok');
});

// Kod orqali ulash (Google "TV / qurilma" usuli): google.com/device sahifasida kod kiritiladi — saytga qaytish shart emas
const GDDEV = { code: null };
route('POST', '/api/admin/gdrive/device-start', async () => {
  const s = db.settings; const cid = s.gdriveDeviceClientId, sec = s.gdriveDeviceSecret;
  if (!cid || !sec) throw httpErr(400, 'Avval “TV” turidagi Client ID va Secret kiriting');
  const r = await fetch('https://oauth2.googleapis.com/device/code', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: cid, scope: 'https://www.googleapis.com/auth/drive.file email openid' }) });
  const j = await r.json(); if (!r.ok) throw httpErr(400, 'Google: ' + (j.error_description || j.error));
  const job = { device: j.device_code, user_code: j.user_code, url: j.verification_url, until: Date.now() + j.expires_in * 1000, every: (j.interval || 5) * 1000, status: 'pending' };
  GDDEV.code = job;
  (async () => {
    while (GDDEV.code === job && Date.now() < job.until) {
      await sleep(job.every);
      try {
        const t = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ client_id: cid, client_secret: sec, device_code: job.device, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' }) });
        const k = await t.json();
        if (k.refresh_token) {
          let email = ''; try { email = JSON.parse(Buffer.from(k.id_token.split('.')[1], 'base64url').toString()).email || ''; } catch {}
          s.gdrive = { refreshToken: k.refresh_token, clientId: cid, clientSecret: sec, email, connectedAt: now(), uploaded: {} };
          GD.token = k.access_token; GD.exp = Date.now() + k.expires_in * 1000; GD.lastError = '';
          job.status = 'ok'; saveNow(); gdriveSync(); return;
        }
        if (k.error === 'slow_down') job.every += 3000;
        else if (k.error && k.error !== 'authorization_pending') { job.status = 'error: ' + (k.error_description || k.error); return; }
      } catch {}
    }
    if (job.status === 'pending') job.status = 'expired';
  })();
  return { user_code: j.user_code, url: j.verification_url, expires: j.expires_in };
}, A);
route('GET', '/api/admin/gdrive/device-status', () => ({ status: GDDEV.code?.status || 'none', drive: gdriveStatus() }), A);
route('POST', '/api/admin/gdrive/sync', async () => { if (!db.settings.gdrive) throw httpErr(400, 'Google Drive ulanmagan'); await gdriveSync(); if (GD.lastError) throw httpErr(500, GD.lastError); return gdriveStatus(); }, A);
route('POST', '/api/admin/gdrive/disconnect', () => { db.settings.gdrive = null; GD.token = null; return gdriveStatus(); }, A);

/* ============================ VERCEL: koʻchirish va katta fayllar ============================ */
route('POST', '/api/admin/import-db', ({ body }) => {
  if (!body?.db?.settings || !Array.isArray(body.db.products)) throw httpErr(400, 'Baza notoʻgʻri');
  const keepBlobs = db.blobs || {};
  db = body.db; normalizeDB(); db.blobs = { ...keepBlobs, ...(body.db.blobs || {}) };
  delete db.settings._hookMain; delete db.settings._hookMon; db.settings.gdrive = null;
  save(); return { ok: true, products: db.products.length, users: db.users.length, orders: db.orders.length };
}, { auth: 'admin' });
route('POST', '/api/admin/import-file', async ({ body }) => {
  const name = path.basename(clean(body.name, 120)); const kind = body.kind === 'checks' ? 'checks' : 'uploads';
  if (!name) throw httpErr(400, 'Nom yoʻq');
  if (db.blobs?.[name] && !body.force) return { ok: true, skipped: true };
  const m = /^data:([\w/+.-]+);base64,(.+)$/s.exec(String(body.data || '')); if (!m) throw httpErr(400, 'Fayl notoʻgʻri');
  const url = await storeFile(name, Buffer.from(m[2], 'base64'), m[1], kind); return { ok: true, url };
}, { auth: 'admin' });
// katta fayllar (video) brauzerdan toʻgʻridan-toʻgʻri Vercel Blob'ga yuklanadi
route('POST', '/api/admin/blob-token', async ({ body }) => {
  if (!IS_VERCEL) throw httpErr(400, 'Faqat Vercel rejimida');
  const ext = (path.extname(clean(body.name, 120)) || '.bin').toLowerCase().replace(/[^.\w]/g, '');
  const name = Date.now().toString(36) + '-' + uid(5) + ext;
  const { generateClientTokenFromReadWriteToken } = require('@vercel/blob/client');
  const token = await generateClientTokenFromReadWriteToken({ token: process.env.BLOB_READ_WRITE_TOKEN, pathname: 'uploads/' + name, maximumSizeInBytes: 200 * 1024 * 1024, allowedContentTypes: ['image/*', 'video/*'] });
  return { token, pathname: 'uploads/' + name, name };
}, { auth: 'admin' });
route('POST', '/api/admin/media/register', ({ body }) => {
  const name = path.basename(clean(body.name, 120)); const url = clean(body.url, 600);
  if (!name || !/^https:\/\/[\w.-]+\.blob\.vercel-storage\.com\//.test(url)) throw httpErr(400, 'Fayl manzili notoʻgʻri');
  db.blobs[name] = url;
  const item = { id: 'm' + uid(5), url: '/uploads/' + name, type: clean(body.type, 60), size: +body.size || 0, name: clean(body.label, 120) || name, createdAt: now() };
  db.media.push(item); return item;
}, { auth: 'admin' });

/* ============================ SERVER ============================= */
const PAGE_ROUTES = [/^\/$/, /^\/katalog(\/[\w-]+)?\/?$/, /^\/mahsulot\/[\w-]+\/?$/, /^\/savat\/?$/, /^\/buyurtma\/?$/, /^\/kirish\/?$/, /^\/royxatdan-otish\/?$/, /^\/profil\/?$/, /^\/kiyib-korish\/?$/, /^\/videolar\/?$/, /^\/aloqa\/?$/];
async function handler(req, res) {
  let url;
  try { url = new URL(req.url, 'http://x'); } catch { return send404(res); }
  const p = decodeURIComponent(url.pathname);
  const origin = req.headers.origin || '';
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) && IS_VERCEL) {
    res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  }
  try {
    if (IS_VERCEL) { await ensureDB(); if (!setupDone) { setupDone = true; bg(setupWebhooks()); } }
    if (p.startsWith('/api/')) {
      if (IS_VERCEL && p.startsWith('/api/admin')) await loadOnline();
      const r = routes.find((x) => x.method === req.method && x.re.test(p));
      if (!r) return json(res, 404, { error: 'API topilmadi' });
      const m = r.re.exec(p); const params = {}; r.keys.forEach((k, i) => (params[k] = m[i + 1]));
      const auth = getAuth(req, url);
      if (r.auth === 'admin' && auth?.role !== 'admin') return json(res, 401, { error: 'Admin sifatida kiring' });
      if (r.auth === 'user' && auth?.role !== 'user') return json(res, 401, { error: 'Iltimos, avval tizimga kiring' });
      if (r.auth === 'any' && !auth) return json(res, 401, { error: 'Iltimos, avval tizimga kiring' });
      const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readBody(req) : {};
      const out = await r.handler({ req, res, url, params, body, auth });
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !r.noSave) save();
      if (IS_VERCEL) await flushDB();
      if (out !== undefined && !res.headersSent) json(res, 200, out);
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Method not allowed' });
    if (IS_VERCEL && (p.startsWith('/uploads/') || p.startsWith('/files/checks/'))) {
      if (p.startsWith('/files/')) { const auth = getAuth(req, url); if (auth?.role !== 'admin') return json(res, 401, { error: 'Ruxsat yoʻq' }); }
      const nm = path.basename(p), kind = p.startsWith('/files/') ? 'checks' : 'uploads';
      const gid = gdIdOf(nm, kind);
      if (gid) {
        const type = MIME[path.extname(nm).toLowerCase()] || 'application/octet-stream';
        if (kind === 'uploads' && type.startsWith('image/')) { await gdPublic(gid).catch(() => {}); if (dbDirty) await flushDB(); res.writeHead(302, { Location: `https://lh3.googleusercontent.com/d/${gid}=w2000`, 'Cache-Control': 'public, max-age=86400' }); return res.end(); }
        return gdStream(req, res, gid, type, kind === 'checks' ? 'no-store' : 'public, max-age=86400');
      }
      const u = db.blobs?.[nm];
      if (!u) return send404(res);
      res.writeHead(302, { Location: u, 'Cache-Control': p.startsWith('/files/') ? 'no-store' : 'public, max-age=86400' }); return res.end();
    }
    if (p.startsWith('/uploads/')) return serveFile(res, path.join(UPLOADS, path.basename(p)), 200, true, req);
    if (p.startsWith('/files/checks/')) {
      const auth = getAuth(req, url);
      if (auth?.role !== 'admin') return json(res, 401, { error: 'Ruxsat yoʻq' });
      return serveFile(res, path.join(CHECKS, path.basename(p)), 200, false);
    }
    if (p === '/admin' || p.startsWith('/admin/')) return serveFile(res, path.join(PUBLIC, 'admin.html'), 200, false);
    if (PAGE_ROUTES.some((re) => re.test(p))) return serveFile(res, path.join(PUBLIC, 'index.html'), 200, false);
    const file = path.normalize(path.join(PUBLIC, p));
    if (!file.startsWith(PUBLIC)) return send404(res);
    return serveFile(res, file, 200, true, req);
  } catch (e) {
    if (!e.status) { console.error(e); reportIssue('server', `${req.method} ${String(req.url).split('?')[0]}: ${e.message}`, e.stack || '', { key: 'server:' + String(req.url).split('?')[0] + e.message.slice(0, 40) }).catch(() => {}); }
    if (!res.headersSent) json(res, e.status || 500, { error: e.status ? e.message : 'Serverda xatolik' });
    if (IS_VERCEL) await flushDB().catch(() => {});
  }
}
let setupDone = false;
module.exports = handler;
if (require.main === module && !IS_VERCEL) http.createServer(handler).listen(PORT, () => {
  console.log('\n  🎩  GENTLEMAN HOUSE ishga tushdi');
  console.log(`  ➜  Sayt:        http://localhost:${PORT}`);
  console.log(`  ➜  Admin panel: http://localhost:${PORT}/admin   (login: ${db.admin.login})`);
  console.log(`  ➜  Maʼlumotlar:  ${DATA}\n`);
  startBot(); startMonBot();
});
if (!IS_VERCEL) { process.on('SIGINT', () => { saveNow(); process.exit(0); }); process.on('SIGTERM', () => { saveNow(); process.exit(0); }); }
