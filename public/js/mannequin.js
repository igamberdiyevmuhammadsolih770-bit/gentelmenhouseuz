/* ============ GENTLEMAN HOUSE — 3D kiyib koʻrish studiyasi ============ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SLOT_OF = { suit: 'suit', coat: 'coat', shirt: 'shirt', pants: 'pants', shoes: 'shoes', belt: 'belt' };
const BODY = [
  { name: 'Ozgʻin', k: 0.92, size: 'S', belt: '95' },
  { name: 'Oʻrta', k: 1.0, size: 'M', belt: '100' },
  { name: 'Sport', k: 1.05, size: 'L', belt: '105' },
  { name: 'Toʻla', k: 1.1, size: 'XL', belt: '110' },
  { name: 'Katta', k: 1.16, size: 'XXL', belt: '115' },
];
const CLOTH_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const CLOTH_K = { XS: 0.88, S: 0.92, M: 1.0, L: 1.05, XL: 1.1, XXL: 1.16, '3XL': 1.22 };

/* --------------------------- geometry --------------------------- */
const TORSO = [[0, 0.9], [0.15, 0.905], [0.18, 0.94], [0.185, 0.99], [0.168, 1.06], [0.178, 1.15], [0.2, 1.26], [0.212, 1.34], [0.205, 1.42], [0.17, 1.49], [0.1, 1.53], [0.055, 1.545], [0, 1.55]];
const LEG = [[0, 0.07], [0.045, 0.08], [0.052, 0.15], [0.062, 0.3], [0.056, 0.45], [0.066, 0.52], [0.09, 0.7], [0.108, 0.86], [0.1, 0.95], [0, 0.97]];
const ARM = [[0, 0.02], [0.058, 0.0], [0.06, -0.08], [0.05, -0.27], [0.044, -0.32], [0.04, -0.5], [0.033, -0.6], [0, -0.62]];
function rAt(prof, y) {
  for (let i = 0; i < prof.length - 1; i++) {
    const [r1, y1] = prof[i], [r2, y2] = prof[i + 1];
    const lo = Math.min(y1, y2), hi = Math.max(y1, y2);
    if (y >= lo && y <= hi) return r1 + (r2 - r1) * ((y - y1) / (y2 - y1 || 1));
  }
  return 0;
}
const lathe = (pts, seg = 56) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(0.0005, r), y)), seg);
function shell(prof, y0, y1, rf, n = 40) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const y = y0 + ((y1 - y0) * i) / n; pts.push([rf(rAt(prof, y), y), y]); }
  return lathe(pts);
}

/* ------------------- rasmdan 3D koʻrinishni olish ------------------- */
const LOOK = new Map();
const lum = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
function analyzeImage(url) {
  if (!url) return Promise.resolve(null);
  if (LOOK.has(url)) return LOOK.get(url);
  const pr = new Promise((res) => {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const N = 90, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0, N, N); const d = x.getImageData(0, 0, N, N).data;
        const px = [], border = [];
        for (let yy = 0; yy < N; yy++) for (let xx = 0; xx < N; xx++) {
          const i = (yy * N + xx) * 4; const v = [d[i], d[i + 1], d[i + 2]]; px.push(v);
          if (xx < 7 || yy < 7 || xx >= N - 7 || yy >= N - 7) border.push(px.length - 1);
        }
        // k-means (k=6)
        const K = 6; let cen = Array.from({ length: K }, (_, k) => px[Math.floor(((k + 0.5) / K) * px.length)].slice());
        const lab = new Int32Array(px.length);
        for (let it = 0; it < 12; it++) {
          const sum = Array.from({ length: K }, () => [0, 0, 0, 0]);
          px.forEach((v, i) => { let bi = 0, bd = 1e9; cen.forEach((ce, k) => { const dd = (v[0] - ce[0]) ** 2 + (v[1] - ce[1]) ** 2 + (v[2] - ce[2]) ** 2; if (dd < bd) { bd = dd; bi = k; } }); lab[i] = bi; const s2 = sum[bi]; s2[0] += v[0]; s2[1] += v[1]; s2[2] += v[2]; s2[3]++; });
          cen = sum.map((s2, k) => (s2[3] ? [s2[0] / s2[3], s2[1] / s2[3], s2[2] / s2[3]] : cen[k]));
        }
        const cnt = new Array(K).fill(0), bcnt = new Array(K).fill(0), mid = new Array(K).fill(0);
        px.forEach((_, i) => { cnt[lab[i]]++; const xx = i % N, yy = (i / N) | 0; if (xx > N * 0.2 && xx < N * 0.8 && yy > N * 0.2 && yy < N * 0.8) mid[lab[i]]++; });
        border.forEach((i) => bcnt[lab[i]]++);
        const isBg = (k) => bcnt[k] / border.length > 0.12 && bcnt[k] / Math.max(1, cnt[k]) > 0.12;
        let obj = [...Array(K).keys()].filter((k) => !isBg(k) && cnt[k] > px.length * 0.015);
        if (!obj.length) obj = [...Array(K).keys()];
        // asosiy rang — markazda eng koʻp, juda yorqin "yaltirash" emas
        const main = obj.slice().sort((a, b) => mid[b] - mid[a]).find((k) => lum(...cen[k]) < 0.86) ?? obj[0];
        const [r, g, b] = cen[main];
        // metall bezak (kumush / oltin)
        let accent = null;
        for (const k of obj) {
          if (k === main) continue; const [cr, cg, cb] = cen[k]; const L = lum(cr, cg, cb); const mx = Math.max(cr, cg, cb), mn = Math.min(cr, cg, cb); const sat = mx ? (mx - mn) / mx : 0;
          if (L > 0.55 && sat < 0.2 && cnt[k] > px.length * 0.003) { accent = '#d9dde2'; break; }
          if (L > 0.45 && sat > 0.3 && cr > cb * 1.4 && cg > cb * 1.1 && cnt[k] > px.length * 0.003) { accent = '#d4af63'; break; }
        }
        // yaltiroqlik: asosiy rangga yaqin piksellar ichida yorqin dogʻlar boʻlsa — lak (glossy)
        let hi = 0, tot = 0; const mL = lum(r, g, b);
        px.forEach((v, i) => { const xx = i % N, yy = (i / N) | 0; if (isBg(lab[i]) || xx < N * 0.15 || xx > N * 0.85 || yy < N * 0.15 || yy > N * 0.85) return; tot++; if (lum(...v) > mL + 0.25) hi++; });
        const hex = '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
        res({ color: hex, accent, gloss: tot ? Math.min(1, (hi / tot) * 5) : 0.4 });
      } catch { res(null); }
    };
    img.onerror = () => res(null); img.src = url;
  });
  LOOK.set(url, pr); return pr;
}
function shoeStyle(p) {
  if (p.style3d) return p.style3d;
  const n = (p.name + ' ' + (p.description || '')).toLowerCase();
  if (/lofer|loafer|mokasin|moccasin|slip/.test(n)) return 'loafer';
  if (/etik|botinka|boot|chelsea|челси/.test(n)) return 'boot';
  if (/krossovka|sneaker|kedi|kroso/.test(n)) return 'sneaker';
  return 'oxford';
}

/* --------------------------- materials -------------------------- */
let fabricBump;
function bumpTex() {
  if (fabricBump) return fabricBump;
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#808080'; x.fillRect(0, 0, 256, 256);
  for (let i = -256; i < 512; i += 4) { x.strokeStyle = `rgba(255,255,255,${0.12 + Math.random() * 0.1})`; x.lineWidth = 1.4; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 256, 256); x.stroke(); }
  for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.15})`; x.fillRect(Math.random() * 256, Math.random() * 256, 1, 1); }
  fabricBump = new THREE.CanvasTexture(c); fabricBump.wrapS = fabricBump.wrapT = THREE.RepeatWrapping; fabricBump.repeat.set(8, 8);
  return fabricBump;
}
const fabric = (hex, rough = 0.82) => {
  const col = new THREE.Color(hex);
  return new THREE.MeshPhysicalMaterial({ color: col, roughness: rough, metalness: 0, sheen: 1, sheenRoughness: 0.5, sheenColor: col.clone().lerp(new THREE.Color('#ffffff'), 0.35), bumpMap: bumpTex(), bumpScale: 0.6, side: THREE.DoubleSide });
};
const leather = (hex, gloss = 0.5) => new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.55 - gloss * 0.42, metalness: 0.05, clearcoat: 0.4 + gloss * 0.6, clearcoatRoughness: 0.3 - gloss * 0.25 });
const metalM = (hex) => new THREE.MeshStandardMaterial({ color: hex, metalness: 1, roughness: 0.18 });
const goldM = () => new THREE.MeshStandardMaterial({ color: '#d4af63', metalness: 1, roughness: 0.22 });
const skin = () => new THREE.MeshPhysicalMaterial({ color: '#e9e3d8', roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.4 });
const darker = (hex, f = 0.7) => new THREE.Color(hex).multiplyScalar(f);

function mesh(geo, mat, cast = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; return m; }
function armGroup(side) { const g = new THREE.Group(); g.position.set(side * 0.238, 1.455, 0); g.rotation.z = side * 0.11; return g; }

/* ---------------------------- body ------------------------------ */
function buildBody() {
  const g = new THREE.Group(); const m = skin();
  const torso = mesh(lathe(TORSO), m); torso.scale.z = 0.66; g.add(torso);
  for (const s of [-1, 1]) {
    const leg = mesh(lathe(LEG), m); leg.position.x = s * 0.095; leg.scale.z = 0.95; g.add(leg);
    const sh = mesh(new THREE.SphereGeometry(0.072, 32, 24), m); sh.position.set(s * 0.205, 1.445, 0); sh.scale.set(1, 0.9, 0.85); g.add(sh);
    const a = armGroup(s); a.add(mesh(lathe(ARM), m));
    const hand = mesh(new THREE.SphereGeometry(0.045, 24, 16), m); hand.position.y = -0.66; hand.scale.set(0.7, 1.35, 1); a.add(hand); g.add(a);
    const foot = mesh(new THREE.SphereGeometry(1, 28, 18), m); foot.scale.set(0.048, 0.04, 0.115); foot.position.set(s * 0.095, 0.04, 0.04); foot.name = 'foot'; g.add(foot);
  }
  const neck = mesh(new THREE.CylinderGeometry(0.048, 0.055, 0.14, 24), m); neck.position.y = 1.59; g.add(neck);
  const head = mesh(new THREE.SphereGeometry(0.105, 40, 30), m); head.position.y = 1.745; head.scale.set(0.95, 1.22, 1.05); g.add(head);
  return g;
}

/* --------------------------- garments --------------------------- */
function lapels(color, big, z0) {
  const g = new THREE.Group();
  const mat = fabric(darker(color, 0.62), 0.55);
  for (const s of [-1, 1]) {
    const sh = new THREE.Shape();
    const W = big ? 1.25 : 1;
    sh.moveTo(0.004 * s, 0); sh.lineTo(0.055 * s * W, 0.33); sh.lineTo(0.105 * s * W, 0.3); sh.lineTo(0.09 * s * W, 0.24); sh.lineTo(0.115 * s * W, 0.2); sh.lineTo(0.018 * s, 0.02);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.006, bevelEnabled: false });
    const m = mesh(geo, mat); m.position.set(0, big ? 1.12 : 1.18, z0); m.rotation.x = -0.1; g.add(m);
  }
  return g;
}
function shirtFront(color, y0) {
  const sh = new THREE.Shape(); sh.moveTo(-0.06, 0.34); sh.lineTo(0.06, 0.34); sh.lineTo(0, 0); sh.closePath();
  const m = mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color, roughness: 0.7, side: THREE.DoubleSide }));
  m.position.set(0, y0, 0.163); m.rotation.x = -0.12; return m;
}
function buttons(g, list, mat) { for (const [x, y, z] of list) { const b = mesh(new THREE.SphereGeometry(0.011, 16, 10), mat); b.position.set(x, y, z); b.scale.z = 0.5; g.add(b); } }

const G = {
  shirt(color, loose) {
    const g = new THREE.Group(); const m = fabric(color, 0.7); const off = 0.012 + loose;
    const t = mesh(shell(TORSO, 0.96, 1.535, (r) => Math.max(r, 0.18) + off), m); t.scale.z = 0.66; g.add(t);
    const collar = mesh(new THREE.TorusGeometry(0.06, 0.016, 12, 40), m); collar.position.y = 1.56; collar.rotation.x = Math.PI / 2; collar.scale.y = 0.92; g.add(collar);
    for (const s of [-1, 1]) {
      const sh = mesh(new THREE.SphereGeometry(0.08 + loose * 0.6, 28, 20), m); sh.position.set(s * 0.205, 1.445, 0); sh.scale.set(1, 0.9, 0.85); g.add(sh);
      const a = armGroup(s); a.add(mesh(shell(ARM, -0.6, 0.0, (r) => r + 0.014 + loose * 0.4), m));
      const cuff = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 24, 1, true), m); cuff.position.y = -0.585; a.add(cuff); g.add(a);
    }
    buttons(g, [1.02, 1.1, 1.18, 1.26, 1.34, 1.42].map((y) => [0, y, (Math.max(rAt(TORSO, y), 0.18) + off) * 0.66 + 0.004]), new THREE.MeshStandardMaterial({ color: darker(color, 0.75) }));
    return g;
  },
  suit(color, loose, opts) {
    const g = new THREE.Group(); const m = fabric(color); const off = 0.035 + loose;
    const t = mesh(shell(TORSO, 0.84, 1.535, (r, y) => (y < 1.0 ? 0.188 + (1.0 - y) * 0.08 : Math.max(r, 0.18)) + off), m); t.scale.z = 0.66; g.add(t);
    for (const s of [-1, 1]) {
      const sh = mesh(new THREE.SphereGeometry(0.085 + loose * 0.6, 28, 20), m); sh.position.set(s * 0.205, 1.45, 0); sh.scale.set(1.05, 0.62, 0.9); g.add(sh);
      const a = armGroup(s); a.add(mesh(shell(ARM, -0.57, 0.0, (r) => r + 0.022 + loose * 0.4), m)); g.add(a);
    }
    const zf = (0.2 + off) * 0.66 + 0.004;
    g.add(lapels(color, false, zf + 0.006));
    g.add(shirtFront(opts.shirtColor || '#f4f1ea', 1.19));
    buttons(g, [[0, 1.02, (0.188 + off) * 0.66 + 0.006], [0, 1.1, (0.175 + off) * 0.66 + 0.006]], new THREE.MeshStandardMaterial({ color: darker(color, 0.5), roughness: 0.4 }));
    if (!opts.noPants) g.add(G.pants(color, loose * 0.8));
    return g;
  },
  coat(color, loose) {
    const g = new THREE.Group(); const m = fabric(color, 0.9); const off = 0.058 + loose;
    const t = mesh(shell(TORSO, 0.42, 1.545, (r, y) => (y < 1.0 ? 0.192 + (1.0 - y) * 0.15 : Math.max(r, 0.18)) + off), m); t.scale.z = 0.7; g.add(t);
    for (const s of [-1, 1]) {
      const sh = mesh(new THREE.SphereGeometry(0.1 + loose * 0.6, 28, 20), m); sh.position.set(s * 0.21, 1.45, 0); sh.scale.set(1.05, 0.65, 0.9); g.add(sh);
      const a = armGroup(s); a.add(mesh(shell(ARM, -0.58, 0.02, (r) => r + 0.05 + loose * 0.4), m));
      const cuff = mesh(new THREE.TorusGeometry(0.075, 0.012, 10, 30), fabric(darker(color, 0.8))); cuff.position.y = -0.55; cuff.rotation.x = Math.PI / 2; a.add(cuff); g.add(a);
    }
    const coll = mesh(new THREE.TorusGeometry(0.085, 0.03, 14, 40, Math.PI * 1.3), m); coll.position.y = 1.555; coll.rotation.set(Math.PI / 2, 0, Math.PI * 1.35); g.add(coll);
    const z = (y) => (Math.max(rAt(TORSO, y), 0.192 + Math.max(0, 1.0 - y) * 0.15) + off) * 0.7 + 0.006;
    g.add(lapels(color, true, z(1.25) + 0.004));
    const bm = new THREE.MeshStandardMaterial({ color: darker(color, 0.4), roughness: 0.35 });
    buttons(g, [0.78, 0.92, 1.06].flatMap((y) => [[-0.06, y, z(y)], [0.06, y, z(y)]]), bm);
    const belt = mesh(new THREE.TorusGeometry(0.192 + off + 0.008, 0.012, 8, 60), fabric(darker(color, 0.85))); belt.rotation.x = Math.PI / 2; belt.position.y = 1.0; belt.scale.y = 0.7; g.add(belt);
    return g;
  },
  pants(color, loose) {
    const g = new THREE.Group(); const m = fabric(color, 0.8); const off = 0.02 + loose;
    const hip = mesh(shell(TORSO, 0.9, 1.085, (r) => Math.max(r, 0.185) + off), m); hip.scale.z = 0.66; g.add(hip);
    const crotch = mesh(new THREE.SphereGeometry(1, 30, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), m); crotch.scale.set(0.185 + off, 0.06, (0.185 + off) * 0.66); crotch.position.y = 0.905; g.add(crotch);
    for (const s of [-1, 1]) {
      const leg = mesh(shell(LEG, 0.06, 0.93, (r, y) => Math.max(r + 0.018, 0.072 + (y < 0.5 ? 0 : (y - 0.5) * 0.08)) + loose * 0.5, 50), m);
      leg.position.x = s * 0.095; leg.scale.z = 0.95; g.add(leg);
    }
    const wb = mesh(new THREE.CylinderGeometry(0.185 + off + 0.003, 0.185 + off + 0.003, 0.04, 48, 1, true), fabric(darker(color, 0.85))); wb.position.y = 1.065; wb.scale.z = 0.66; g.add(wb);
    return g;
  },
  belt(color, loose, opts) {
    const g = new THREE.Group(); const R = 0.185 + 0.008 + (opts.beltK || 0);
    const strap = mesh(new THREE.CylinderGeometry(R, R, 0.036, 64, 1, true), leather(color)); strap.position.y = 1.065; strap.scale.z = 0.66; strap.material.side = THREE.DoubleSide; g.add(strap);
    const buckle = new THREE.Group(); buckle.position.set(0, 1.065, R * 0.66 + 0.004);
    const frame = mesh(new THREE.TorusGeometry(0.024, 0.005, 10, 4), goldM()); frame.rotation.z = Math.PI / 4; frame.scale.set(1.25, 0.95, 1); buckle.add(frame);
    const pin = mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.045), goldM()); pin.rotation.z = Math.PI / 2; buckle.add(pin);
    g.add(buckle);
    return g;
  },
  shoes(color, loose, opts) {
    const g = new THREE.Group(); const k = opts.shoeK || 1; const style = opts.style || 'oxford';
    const m = leather(color, Math.max(0.45, opts.gloss ?? 0.55));
    const sneaker = style === 'sneaker', boot = style === 'boot', loafer = style === 'loafer';
    const soleM = new THREE.MeshStandardMaterial({ color: sneaker ? '#f2f0ea' : '#21160e', roughness: sneaker ? 0.8 : 0.6 });
    const hp = (t) => (loafer ? 0.3 : 0.34) + (loafer ? 0.56 : 0.66) * Math.exp(-Math.pow((t - 0.28) / 0.3, 2));
    const wp = (t) => 1 - (sneaker ? 0.15 : 0.32) * Math.pow(Math.max(0, t - 0.55) / 0.45, 1.5);
    function last(sx, sy, sz, bottom) {
      const geo = new THREE.SphereGeometry(1, 56, 36); const P = geo.attributes.position;
      for (let i = 0; i < P.count; i++) {
        let x = P.getX(i), y = P.getY(i), z = P.getZ(i); const t = (z + 1) / 2;
        x *= wp(t); y = y > 0 ? y * hp(t) : y * bottom;
        P.setXYZ(i, x * sx, y * sy, z * sz);
      }
      geo.computeVertexNormals(); return geo;
    }
    const SX = sneaker ? 0.052 : 0.047, SY = sneaker ? 0.085 : 0.078;
    const upGeo = last(SX, SY, 0.132, 0.1);
    const soleH = sneaker ? 0.03 : 0.012;
    const soleGeo = last(SX + 0.005, soleH, 0.139, 0.9);
    const heelGeo = new THREE.BoxGeometry(0.07, 0.022, 0.06);
    const topY = (t) => 0.02 + SY * hp(t) * Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2)));
    const zt = (t) => -0.132 + t * 0.264;
    for (const sd of [-1, 1]) {
      const f = new THREE.Group(); f.position.set(sd * 0.095, 0, 0.055); f.scale.set(1, 1, k);
      const sole = mesh(soleGeo, soleM); sole.position.y = sneaker ? 0.02 : 0.012; f.add(sole);
      if (!sneaker) { const heel = mesh(heelGeo, soleM); heel.position.set(0, 0.011, -0.09); f.add(heel); }
      const upper = mesh(upGeo, m); upper.position.y = sneaker ? 0.03 : 0.02; f.add(upper);
      if (style === 'oxford' || sneaker) {
        const laceM = new THREE.MeshStandardMaterial({ color: sneaker ? '#f5f5f5' : darker(color, 0.4), roughness: 0.7 });
        for (let i = 0; i < (sneaker ? 5 : 4); i++) {
          const t = 0.34 + i * 0.065;
          const l = mesh(new THREE.BoxGeometry(0.03 - i * 0.002, 0.003, 0.005), laceM); l.position.set(0, topY(t) + (sneaker ? 0.012 : 0.002), zt(t)); l.rotation.x = 0.35 + i * 0.08; f.add(l);
        }
      }
      if (loafer) {
        // old qismidagi tikuv (apron) va metall toʻqa (horsebit)
        const seamM = new THREE.MeshStandardMaterial({ color: darker(color, color === '#000000' ? 1 : 0.6), roughness: 0.5 });
        const apron = mesh(new THREE.TorusGeometry(0.036, 0.0022, 8, 40), seamM); apron.rotation.x = -Math.PI / 2 + 0.25; apron.scale.set(0.9, 1.55, 1); apron.position.set(0, topY(0.68) - 0.004, zt(0.68)); f.add(apron);
        const bar = new THREE.Group(); bar.position.set(0, topY(0.42) + 0.003, zt(0.42)); bar.rotation.x = 0.42;
        if (opts.accent) {
          const mm = metalM(opts.accent);
          const rod = mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.046, 12), mm); rod.rotation.z = Math.PI / 2; bar.add(rod);
          for (const ex of [-1, 1]) { const ring = mesh(new THREE.TorusGeometry(0.0075, 0.0026, 10, 24), mm); ring.position.x = ex * 0.023; ring.rotation.y = Math.PI / 2; bar.add(ring); }
        } else {
          // ikki qatorli charm tasma (penny / strap lofer)
          const sm = leather(darker(color, 0.8), 0.7);
          for (const dz of [-0.007, 0.007]) { const st = mesh(new THREE.BoxGeometry(0.1, 0.004, 0.006), sm); st.position.z = dz; bar.add(st); }
          // tasma ostidagi mat (zamsh) qism
          const saddle = mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: darker(color, 0.75), roughness: 1 }));
          saddle.scale.set(0.044, 0.008, 0.045); saddle.position.set(0, -0.004, 0.022); bar.add(saddle);
        }
        f.add(bar);
      }
      if (boot) {
        const shaft = mesh(new THREE.CylinderGeometry(0.056, 0.062, 0.13, 36), m); shaft.position.set(0, 0.13, -0.045); shaft.scale.z = 1.15; f.add(shaft);
        const el = mesh(new THREE.CylinderGeometry(0.057, 0.063, 0.07, 36, 1, true, -0.5, 1), new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.9, side: THREE.DoubleSide })); el.position.set(0, 0.15, -0.045); el.scale.z = 1.16; f.add(el);
      }
      if (sneaker) { const sw = mesh(new THREE.TorusGeometry(0.04, 0.004, 8, 30, Math.PI), new THREE.MeshStandardMaterial({ color: '#f5f5f5' })); sw.position.set(sd * 0.05, 0.05, 0.05); sw.rotation.set(0, Math.PI / 2, 0.3); f.add(sw); }
      g.add(f);
    }
    return g;
  },
};

/* ============================ STUDIO ============================ */
export function openTryOn({ product, size, products, cats, fmt, onAdd, sizeTable }) {
  const old = document.querySelector('.tryon'); if (old) old.remove();
  const el = document.createElement('div'); el.className = 'tryon';
  el.innerHTML = `
    <div class="tryon-stage" id="stage">
      <div class="tryon-loading" id="tLoad"><div style="text-align:center"><span class="spin" style="display:inline-block;width:34px;height:34px;border:2px solid #c9a24e;border-right-color:transparent;border-radius:50%"></span><p class="muted" style="margin-top:12px;font-size:13px">3D maket tayyorlanmoqda…</p></div></div>
      <div class="tryon-top"><div class="tryon-title"><small>3D studiya</small>Kiyib koʻrish</div><button class="icon-btn" id="tClose" style="background:rgba(0,0,0,.4)"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <div class="tryon-hint">⟲ Aylantirish uchun suring • Yaqinlashtirish uchun g‘ildirak / ikki barmoq</div>
      <div class="tryon-tools">
        <button data-v="full" class="active">Toʻliq</button><button data-v="top">Ust</button><button data-v="pants">Shim</button><button data-v="shoes">Oyoq</button>
        <button id="tRot" class="active" title="Avto aylanish"><svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg></button>
        <button id="tShot" title="Rasmga olish"><svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></button>
      </div>
    </div>
    <aside class="tryon-panel" id="tPanel"></aside>`;
  document.body.appendChild(el); document.body.classList.add('lock');
  requestAnimationFrame(() => el.classList.add('open'));

  /* ---- state ---- */
  const outfit = {}; // slot -> {p, size}
  let bodyIdx = 1, activeTab = null;
  const slotOf = (p) => SLOT_OF[p.model3d] || 'suit';
  const defSize = (p) => {
    if (!p.sizes?.length) return '';
    const st = p.category?.sizeType;
    const want = st === 'shoes' ? '42' : st === 'belt' ? BODY[bodyIdx].belt : BODY[bodyIdx].size;
    return p.sizes.includes(want) ? want : p.sizes[Math.floor(p.sizes.length / 2)];
  };
  function put(p, s) {
    const slot = slotOf(p);
    if (slot === 'suit') delete outfit.pants;
    if (slot === 'pants' && outfit.suit) outfit.suit.noPants = true;
    outfit[slot] = { p, size: s || defSize(p) };
  }
  put(product, size);
  activeTab = product.categoryId;

  /* ---- three ---- */
  const stage = el.querySelector('#stage');
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#0d0c0a', 6, 14);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
  camera.position.set(0.6, 1.25, 4.2);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.95, 0); controls.enableDamping = true; controls.dampingFactor = 0.07;
  controls.minDistance = 0.6; controls.maxDistance = 7; controls.maxPolarAngle = Math.PI * 0.56; controls.enablePan = false;
  controls.autoRotate = true; controls.autoRotateSpeed = 1.6;

  scene.add(new THREE.HemisphereLight('#fff6e6', '#2a2418', 0.55));
  const key = new THREE.DirectionalLight('#fff3dd', 2.4); key.position.set(2.5, 4, 3); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -1.5; key.shadow.camera.right = 1.5; key.shadow.camera.top = 2.5; key.shadow.camera.bottom = -0.5; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.camera.updateProjectionMatrix();
  scene.add(key);
  const rim = new THREE.DirectionalLight('#e7c27a', 1.6); rim.position.set(-3, 2.5, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight('#b8c8ff', 0.4); fill.position.set(-3, 1, 3); scene.add(fill);

  const podium = mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.06, 80), new THREE.MeshStandardMaterial({ color: '#16140f', roughness: 0.35, metalness: 0.4 }), false);
  podium.position.y = -0.03; podium.receiveShadow = true; scene.add(podium);
  const ring = mesh(new THREE.TorusGeometry(0.64, 0.006, 8, 120), goldM(), false); ring.rotation.x = Math.PI / 2; ring.position.y = 0.001; scene.add(ring);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.MeshStandardMaterial({ color: '#0e0d0b', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.06; ground.receiveShadow = true; scene.add(ground);
  // glow particles
  const pg = new THREE.BufferGeometry(); const N = 140; const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = 0.8 + Math.random() * 2.2; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.random() * 2.6; pos[i * 3 + 2] = Math.sin(a) * r; }
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#e9cf8e', size: 0.012, transparent: true, opacity: 0.6 })); scene.add(dust);

  const root = new THREE.Group(); scene.add(root);
  const body = buildBody(); root.add(body);
  const clothes = new THREE.Group(); root.add(clothes);

  function dispose(o) { o.traverse((c) => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose?.(); }); }
  const looks = new Map();
  function lookOf(p) {
    const u = p.images?.[0]; if (!u) return null;
    if (looks.has(u)) return looks.get(u);
    looks.set(u, null);
    analyzeImage(u).then((l) => { looks.set(u, l); if (l && alive) rebuild(); });
    return null;
  }
  function rebuild() {
    const bk = BODY[bodyIdx].k;
    root.scale.set(bk, 1, bk);
    dispose(clothes); clothes.clear();
    const loose = (it) => {
      const k = CLOTH_K[it.size]; if (!k) return 0.004;
      return Math.max(-0.008, (k - bk) * 0.2);
    };
    const shirtColor = outfit.shirt ? ((outfit.shirt.p.color3dMode !== 'manual' && lookOf(outfit.shirt.p)?.color) || outfit.shirt.p.color3d) : null;
    const order = ['shoes', 'pants', 'shirt', 'belt', 'suit', 'coat'];
    for (const slot of order) {
      const it = outfit[slot]; if (!it) continue;
      const look = it.p.color3dMode !== 'manual' ? lookOf(it.p) : null;
      const c = look?.color || it.p.color3d || '#333';
      const opts = { shirtColor, noPants: !!outfit.pants || it.noPants, gloss: look?.gloss, accent: look?.accent, style: slot === 'shoes' ? shoeStyle(it.p) : null };
      if (slot === 'shoes') opts.shoeK = 1 + ((parseInt(it.size) || 42) - 42) * 0.022;
      if (slot === 'belt') { const pa = outfit.pants || outfit.suit; opts.beltK = Math.max(-0.006, ((parseInt(it.size) || 100) - 100) * 0.0006) + (pa ? 0.02 + loose(pa) * (outfit.pants ? 1 : 0.8) : 0); }
      clothes.add(G[slot](c, loose(it), opts));
    }
    body.children.forEach((c) => { if (c.name === 'foot') c.visible = !outfit.shoes; });
    clothes.position.y = 0;
    clothes.scale.set(1, 1, 1);
    // pop animation
    pop = 1;
  }
  let pop = 0;

  /* views */
  const VIEWS = { full: [[0.6, 1.25, 4.2], [0, 0.95, 0]], top: [[0.35, 1.45, 1.75], [0, 1.28, 0]], pants: [[0.4, 0.75, 2.1], [0, 0.6, 0]], shoes: [[0.5, 0.34, 1.05], [0, 0.06, 0.1]] };
  let anim = null;
  function view(v) {
    const [p, t] = VIEWS[v]; anim = { t0: performance.now(), fp: camera.position.clone(), ft: controls.target.clone(), tp: new THREE.Vector3(...p), tt: new THREE.Vector3(...t) };
    el.querySelectorAll('[data-v]').forEach((b) => b.classList.toggle('active', b.dataset.v === v));
  }

  function resize() { const w = stage.clientWidth, hh = stage.clientHeight; renderer.setSize(w, hh, false); camera.aspect = w / hh; camera.updateProjectionMatrix(); }
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();
  let raf, alive = true; const clock = new THREE.Clock();
  function loop() {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    const dt = clock.getDelta(), t = clock.elapsedTime;
    if (anim) {
      const k = Math.min(1, (performance.now() - anim.t0) / 900); const e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(anim.fp, anim.tp, e); controls.target.lerpVectors(anim.ft, anim.tt, e); if (k >= 1) anim = null;
    }
    if (pop > 0) { pop = Math.max(0, pop - dt * 2.5); const s = 1 + Math.sin(pop * Math.PI) * 0.03; clothes.scale.set(s, 1 + (s - 1) * 0.3, s); }
    dust.rotation.y = t * 0.03; dust.position.y = Math.sin(t * 0.5) * 0.03;
    controls.update(); renderer.render(scene, camera);
  }
  rebuild(); loop();
  setTimeout(() => el.querySelector('#tLoad').classList.add('hide'), 250);

  /* ---- panel ---- */
  const panel = el.querySelector('#tPanel');
  const fitText = (it) => {
    const st = it.p.category?.sizeType;
    if (st !== 'clothes' || !CLOTH_K[it.size]) return '';
    const d = CLOTH_SIZES.indexOf(it.size) - CLOTH_SIZES.indexOf(BODY[bodyIdx].size);
    if (d === 0) return '<span style="color:#34c38f">✓ Ideal mos</span>';
    if (d < 0) return `<span style="color:#f87171">Tor — ${d === -1 ? 'biroz kichik' : 'kichik'} keladi</span>`;
    return `<span style="color:#facc15">${d === 1 ? 'Biroz keng' : 'Juda keng'}</span>`;
  };
  function renderPanel() {
    const items = Object.entries(outfit);
    const total = items.reduce((s, [, it]) => s + it.p.price, 0);
    const tabCats = cats.filter((c) => products.some((p) => p.categoryId === c.id));
    const list = products.filter((p) => p.categoryId === activeTab);
    panel.innerHTML = `
      <h4>Sizning obrazingiz</h4>
      <div class="outfit">${items.length ? items.map(([slot, it]) => `
        <div class="outfit-row"><img src="${h(it.p.images?.[0])}" alt=""><div><b>${h(it.p.name)}</b><span>${fmt(it.p.price)}</span>
          ${it.p.sizes?.length ? `<div style="display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap">${it.p.sizes.map((s) => `<button data-sz="${slot}" data-val="${h(s)}" style="padding:3px 8px;border-radius:7px;font-size:11px;font-weight:700;border:1px solid ${s === it.size ? 'var(--gold)' : 'var(--line2)'};background:${s === it.size ? 'var(--gold)' : 'transparent'};color:${s === it.size ? '#000' : 'inherit'}">${h(s)}</button>`).join('')}</div>
          <div style="font-size:11.5px;margin-top:5px">${fitText(it)}</div>` : ''}</div>
          <button class="icon-btn" data-rm="${slot}" title="Yechish" style="width:32px;height:32px"><svg viewBox="0 0 24 24" style="width:16px"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>`).join('') : '<p class="muted" style="font-size:13px">Maket hozir kiyimsiz. Quyidan kiyim tanlang.</p>'}</div>
      <h4>Gavdangiz</h4>
      <div class="slot-tabs">${BODY.map((b, i) => `<button data-body="${i}" class="${i === bodyIdx ? 'active' : ''}">${b.name}</button>`).join('')}</div>
      <p class="muted" style="font-size:12.5px;margin-top:8px">Tavsiya etilgan razmer: <b class="gold">${BODY[bodyIdx].size}</b> • remen: <b class="gold">${BODY[bodyIdx].belt}</b></p>
      <h4>Kiyimlar garderobi</h4>
      <div class="slot-tabs">${tabCats.map((c) => `<button data-tab="${c.id}" class="${c.id === activeTab ? 'active' : ''}">${h(c.name)}</button>`).join('')}</div>
      <div class="wardrobe">${list.map((p) => { const on = outfit[slotOf(p)]?.p.id === p.id; return `<button class="w-item ${on ? 'on' : ''}" data-pid="${p.id}" title="${h(p.name)}"><img src="${h(p.images?.[0])}" alt="" loading="lazy"></button>`; }).join('')}</div>
      <div class="tryon-total"><div class="t"><span class="muted">Obraz narxi (${items.length} ta)</span><b>${fmt(total)}</b></div>
        <button class="btn btn-gold btn-block" id="tAddAll" ${items.length ? '' : 'disabled'}>Hammasini savatga</button>
        <button class="btn btn-ghost btn-block btn-sm" id="tTable" style="margin-top:10px">Razmerlar jadvali</button></div>`;
    panel.querySelectorAll('[data-body]').forEach((b) => (b.onclick = () => { bodyIdx = +b.dataset.body; rebuild(); renderPanel(); }));
    panel.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { activeTab = b.dataset.tab; renderPanel(); }));
    panel.querySelectorAll('[data-pid]').forEach((b) => (b.onclick = () => {
      const p = products.find((x) => x.id === b.dataset.pid); const slot = slotOf(p);
      if (outfit[slot]?.p.id === p.id) delete outfit[slot]; else put(p);
      if (slot === 'pants' && !outfit.pants && outfit.suit) outfit.suit.noPants = false;
      rebuild(); renderPanel();
      if (slot === 'shoes') view('shoes'); else if (slot === 'pants' || slot === 'belt') view(slot === 'belt' ? 'top' : 'pants'); else view('full');
    }));
    panel.querySelectorAll('[data-sz]').forEach((b) => (b.onclick = () => { outfit[b.dataset.sz].size = b.dataset.val; rebuild(); renderPanel(); }));
    panel.querySelectorAll('[data-rm]').forEach((b) => (b.onclick = () => { const s = b.dataset.rm; delete outfit[s]; if (s === 'pants' && outfit.suit) outfit.suit.noPants = false; rebuild(); renderPanel(); }));
    panel.querySelector('#tAddAll').onclick = (e) => { for (const [, it] of Object.entries(outfit)) onAdd(it.p, it.size, e.currentTarget); };
    panel.querySelector('#tTable').onclick = () => sizeTable(outfit[Object.keys(outfit)[0]]?.p.category?.sizeType || 'clothes');
  }
  renderPanel();
  const initSlot = slotOf(product);
  if (initSlot === 'shoes') setTimeout(() => view('shoes'), 600);

  /* ---- tools ---- */
  el.querySelectorAll('[data-v]').forEach((b) => (b.onclick = () => view(b.dataset.v)));
  const rotBtn = el.querySelector('#tRot');
  rotBtn.onclick = () => { controls.autoRotate = !controls.autoRotate; rotBtn.classList.toggle('active', controls.autoRotate); };
  controls.addEventListener('start', () => { anim = null; });
  el.querySelector('#tShot').onclick = () => {
    renderer.render(scene, camera);
    const a = document.createElement('a'); a.download = 'gentleman-house-obraz.png'; a.href = renderer.domElement.toDataURL('image/png'); a.click();
  };
  const close = () => {
    alive = false; cancelAnimationFrame(raf); ro.disconnect(); el.classList.remove('open');
    setTimeout(() => { dispose(scene); renderer.dispose(); pmrem.dispose(); el.remove(); }, 500);
    if (!document.querySelector('.drawer.open')) document.body.classList.remove('lock');
    document.removeEventListener('keydown', esc);
  };
  const esc = (e) => { if (e.key === 'Escape' && !document.querySelector('#modal.open')) close(); };
  document.addEventListener('keydown', esc);
  el.querySelector('#tClose').onclick = close;
}
export { analyzeImage, shoeStyle };
