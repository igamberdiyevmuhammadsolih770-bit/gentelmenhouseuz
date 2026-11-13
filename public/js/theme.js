/* Gentleman House — sayt rang mavzusi (admin tanlaydi, hamma uchun qoʻllanadi) */
(function () {
  const hexRgb = (h) => { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(','); };
  window.GH_THEME_CSS = function (v) {
    if (!v || !v.gold) return '';
    const m = { '--gold': v.gold, '--gold2': v.gold2, '--gold3': v.gold3, '--bg': v.bg, '--bg2': v.bg2, '--card': v.card, '--card2': v.card2 };
    let css = ':root{' + Object.entries(m).filter(([, x]) => x).map(([k, x]) => k + ':' + x).join(';');
    css += ';--g-rgb:' + hexRgb(v.gold) + ';--g2-rgb:' + hexRgb(v.gold2 || v.gold) + '}';
    return css;
  };
  window.GH_APPLY_THEME = function (v, preview) {
    let el = document.getElementById('ghTheme');
    if (!el) { el = document.createElement('style'); el.id = 'ghTheme'; document.head.appendChild(el); }
    el.textContent = window.GH_THEME_CSS(v);
    if (!preview) try { if (v && v.gold) localStorage.setItem('gh_theme_vars', JSON.stringify(v)); else localStorage.removeItem('gh_theme_vars'); } catch (e) {}
  };
  // sahifa ochilishi bilan oxirgi saqlangan rangni darhol qoʻllash (miltillamasligi uchun)
  try { const v = JSON.parse(localStorage.getItem('gh_theme_vars') || 'null'); if (v) window.GH_APPLY_THEME(v); } catch (e) {}
})();
