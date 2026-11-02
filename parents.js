(function () {
'use strict';
const KEY = 'parents-kids-v1', $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const st = (v, l) => typeof v === 'string' ? v.slice(0, l) : '';
const nm = (v, m) => { v = +v; return isFinite(v) && v >= 0 && v <= m ? v : 0; };
const nn = (v, m) => v == null ? null : nm(v, m);
let sel = 0, kids = [];

function clean(o) {
  if (!o || o.v !== 2 || !Array.isArray(o.s)) return null;
  const k = { n: st(o.n, 20) || 'التلميذ', lv: st(o.lv, 6), lb: st(o.lb, 40), d: /^\d{4}-\d{2}-\d{2}$/.test(o.d) ? o.d : '', k: nm(o.k, 400), w: nn(o.w, 6000), g: nn(o.g, 6000), a: Array.isArray(o.a) && o.a.length === 7 ? o.a.map(v => nm(v, 1440)) : null, av: nn(o.av, 20), sc: o.sc === 10 ? 10 : 20,
    s: o.s.slice(0, 24).map(r => Array.isArray(r) ? [st(r[0], 40)].concat([1, 2, 3, 4, 5, 6].map(i => Math.round(nm(r[i], 999)))) : null).filter(Boolean) };
  k.id = k.n + '|' + k.lv; return k;
}
function dec(x) { x = x.trim().split('#r=').pop().replace(/-/g, '+').replace(/_/g, '/'); while (x.length % 4) x += '='; return clean(JSON.parse(decodeURIComponent(escape(atob(x))))); }
const load = () => { try { const a = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(a) ? a.map(clean).filter(Boolean) : []; } catch (e) { return []; } };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(kids.map(k => Object.assign({ v: 2 }, k)))); } catch (e) { toast('تعذّر الحفظ في هذا المتصفح'); } };
let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2400); }
function add(text) {
  let k; try { k = dec(text); } catch (e) {} if (!k) return toast('الرابط غير صالح. اطلب رابطًا جديدًا من ابنك.');
  const i = kids.findIndex(x => x.id === k.id); if (i < 0) { kids.push(k); sel = kids.length - 1; } else { kids[i] = k; sel = i; } save(); toast('تم تحديث تقرير ' + k.n);
}
const tot = r => [r[1] + r[3] + r[5], r[2] + r[4] + r[6]];
const hm = m => m >= 60 ? Math.floor(m / 60) + 'س' + (m % 60 ? ' ' + m % 60 + 'د' : '') : m + 'د';
const form = '<form id="pf"><input name="l" placeholder="ألصق هنا رابط التقدّم الذي أرسله ابنك" dir="ltr" required><button>إضافة</button></form>';

function report(k) {
  const ds = k.d ? Math.floor((Date.now() - new Date(k.d)) / 864e5) : null, rows = k.s.map(r => { const [d, n] = tot(r); return { r, d, n, p: n ? Math.round(d / n * 100) : 0 }; }), act = rows.filter(x => x.n > 0),
    done = act.filter(x => x.d === x.n), run = act.filter(x => x.d < x.n).sort((a, b) => b.p - a.p), all = act.reduce((a, x) => a + x.d, 0), tt = act.reduce((a, x) => a + x.n, 0), pc = tt ? Math.round(all / tt * 100) : 0;
  const DN = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'], mx = k.a ? Math.max.apply(0, k.a.concat(30)) : 1;
  const wk = k.a ? '<h4>آخر 7 أيام</h4><div class="vbs">' + k.a.map((m, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return '<div class="vb"><span style="height:' + Math.round(m / mx * 100) + '%"></span><small>' + DN[d.getDay()] + '</small></div>'; }).join('') + '</div>' : '';
  return '<h1 class="ph1">' + esc(k.n) + '</h1><p class="mut">' + esc(k.lb || '') + (k.d ? ' · آخر تحديث ' + esc(k.d) : '') + '</p>' +
    (ds != null && ds > 7 ? '<div class="tip">⏰ آخر تحديث قبل ' + ds + ' يومًا. اطلب من ابنك رابطًا جديدًا ليتحدّث التقرير.</div>' : '') +
    '<div class="chips st"><div class="chip"><b>' + pc + '%</b><span>الدروس المنجزة</span></div><div class="chip"><b>' + done.length + '/' + act.length + '</b><span>مواد مكتملة</span></div>' + (k.w != null ? '<div class="chip"><b>' + hm(k.w) + '</b><span>دراسة الأسبوع</span></div><div class="chip"><b>' + k.k + '🔥</b><span>أيام متتالية</span></div>' : '') + (k.av != null ? '<div class="chip"><b>' + k.av.toFixed(2) + '</b><span>المعدل /' + k.sc + '</span></div>' : '') + '</div>' +
    '<h2 class="ph2">✅ المواد المكتملة</h2>' + (done.length ? '<div class="dn">' + done.map(x => '<span>' + esc(x.r[0]) + '</span>').join('') + '</div>' : '<p class="empty">لا توجد مادة مكتملة بعد.</p>') +
    '<h2 class="ph2">📚 قيد الدراسة</h2>' + (run.map(x => '<div class="pr"><div class="hb" style="--c1:#0a84ff;--c2:#bf5af2"><span>' + esc(x.r[0]) + '</span><div><i style="width:' + x.p + '%"></i></div><small>' + x.p + '%</small></div><div class="tm">' + [1, 2, 3].map(t => x.r[2 * t] ? '<em>ف' + t + ' ' + x.r[2 * t - 1] + '/' + x.r[2 * t] + '</em>' : '').join('') + '</div></div>').join('') || '<p class="empty">لا توجد مواد قيد الدراسة.</p>') + wk +
    '<h2 class="ph2">تحديث التقرير</h2><p class="mut">عندما يرسل ابنك رابطًا جديدًا، ألصقه هنا ليتحدّث التقرير.</p>' + form + '<div class="chs"><button class="pill danger" id="del">حذف هذا التقرير</button></div><p class="note">يعرض هذا التقرير ما اختار ابنك مشاركته فقط. البيانات محفوظة في هاتفك ولا تُرسل إلى أي خادم.</p>';
}
function render() {
  const a = $('#app');
  if (!kids.length) { a.innerHTML = '<section class="hero" style="grid-template-columns:1fr"><div class="hero-t"><p class="sub">للأولياء</p><h1>تابع تقدّم ابنك</h1><p class="msg">اطلب من ابنك أن يفتح قسم «مراقبة الأولياء» في موقعه ويرسل لك الرابط، ثم ألصقه هنا. سترى المواد التي أكملها ونسبة تقدّمه في كل مادة.</p></div></section>' + form; }
  else { sel = Math.min(sel, kids.length - 1); a.innerHTML = '<div class="chs kt">' + kids.map((k, i) => '<button class="pill' + (i === sel ? ' pri' : '') + '" data-i="' + i + '">' + esc(k.n) + '</button>').join('') + '</div>' + report(kids[sel]); }
}
document.addEventListener('submit', e => { if (e.target.id !== 'pf') return; e.preventDefault(); add(e.target.elements.l.value); render(); });
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.i != null) { sel = +b.dataset.i; render(); }
  else if (b.id === 'del') { kids.splice(sel, 1); save(); render(); toast('تم حذف التقرير'); }
});
const tb = $('#themeBtn'), cur = () => document.documentElement.getAttribute('data-theme');
const ic = () => { tb.textContent = cur() === 'light' ? '☀️' : '🌙'; $('meta[name=theme-color]').setAttribute('content', cur() === 'light' ? '#f2f2f7' : '#000000'); };
tb.addEventListener('click', () => { const n = cur() === 'light' ? 'dark' : 'light'; document.documentElement.setAttribute('data-theme', n); try { localStorage.setItem('tracker-4am-theme', n); } catch (e) {} ic(); });
ic(); kids = load();
if (location.hash.indexOf('#r=') === 0) { add(location.hash); history.replaceState(null, '', location.pathname + location.search); }
render();
})();
