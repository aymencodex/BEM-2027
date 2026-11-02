(function () {
'use strict';
var T, X = window.T4x = { tools: [], ready: [], acts: {}, forms: {}, chgs: [] }, $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var pad = function (n) { return (n < 10 ? '0' : '') + n; };
var D = function (d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
var ago = function (i) { var d = new Date(); return D(new Date(d.getFullYear(), d.getMonth(), d.getDate() - i)); };
var num = function (v, mx) { v = parseFloat(String(v).replace(',', '.')); return isFinite(v) && v >= 0 && v <= mx ? v : null; };
var str = function (v, l) { return typeof v === 'string' ? v.slice(0, l) : ''; };
var DT = /^\d{4}-\d{2}-\d{2}$/, uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
var esc = function (s) { return T.esc(s); };

X.addTool = function (k, i, n, a, b, f) { X.tools.push({ k: k, i: i, n: n, a: a, b: b, f: f }); };
// تنظيف البيانات الإضافية عند التحميل/الاستيراد
X.clean = function (d, out, ok) {
  out.log = {}; var L = d.log;
  if (L && typeof L === 'object') Object.keys(L).slice(-400).forEach(function (k) {
    if (!DT.test(k) || !L[k] || typeof L[k] !== 'object') return; var o = {};
    Object.keys(L[k]).forEach(function (s) { var m = num(L[k][s], 1440); if (ok(s) && m) o[s] = Math.round(m); }); out.log[k] = o; });
  out.marks = {}; var M = d.marks;
  if (M && typeof M === 'object') Object.keys(M).forEach(function (s) {
    var m = M[s]; if (!ok(s) || !m || typeof m !== 'object') return; var a = m.a || [], c = num(m.c, 20);
    out.marks[s] = { c: c == null ? 1 : c, a: [num(a[0], 20), num(a[1], 20), num(a[2], 20)], e: num(m.e, 20) }; });
  out.ex = (Array.isArray(d.ex) ? d.ex : []).slice(0, 300).map(function (e) {
    return e && ok(e.s) ? { id: ok(e.id) ? e.id : uid(), s: e.s, t: str(e.t, 80), y: str(e.y, 4), u: /^https?:\/\//i.test(e.u) ? str(e.u, 300) : '', p: num(e.p, 20), m: num(e.m, 600), d: DT.test(e.d) ? e.d : '' } : null; }).filter(Boolean);
  out.fr = (Array.isArray(d.fr) ? d.fr : []).slice(0, 30).map(function (f) { return f && { n: str(f.n, 20) || 'صديق', w: num(f.w, 6000) || 0, k: num(f.k, 400) || 0, p: num(f.p, 100) || 0, d: DT.test(f.d) ? f.d : '' }; }).filter(Boolean);
  out.bn = str(d.bn, 40); out.hb = d.hb === 1 ? 1 : 0;
  out.g = num(d.g, 6000) || 300; out.nk = str(d.nk, 20); out.w = num(d.w, 1);
  var P = d.pf; if (P && typeof P === 'object' && /^[pms]$/.test(P.st)) { var y = Math.round(+P.y); out.pf = { st: P.st, y: y >= 1 && y <= 5 ? y : 1, br: str(P.br, 40), tg: num(P.tg, 20), dg: num(P.dg, 600), ok: P.ok === 1 ? 1 : 0 }; }
  var Q = d.pp; if (Q && typeof Q === 'object') out.pp = { t: Q.t === 0 ? 0 : 1, a: Q.a === 0 ? 0 : 1, ts: DT.test(Q.ts) ? Q.ts : '' };
};

function G(k, d) { var S = T.S; return S[k] == null ? (S[k] = d) : S[k]; }
function mins(day, sid) { var o = G('log', {})[day] || {}; return sid ? (o[sid] || 0) : Object.keys(o).reduce(function (a, k) { return a + o[k]; }, 0); }
function addMin(sid, m) { var l = G('log', {}), k = D(); l[k] = l[k] || {}; l[k][sid] = (l[k][sid] || 0) + m; T.save(); }
function week() { var s = 0; for (var i = 0; i < 7; i++) s += mins(ago(i)); return s; }
function streak() { var i = mins(ago(0)) ? 0 : 1, n = 0; while (mins(ago(i)) > 0) { n++; i++; } return n; }
function hm(m) { return m >= 60 ? Math.floor(m / 60) + 'س' + (m % 60 ? ' ' + m % 60 + 'د' : '') : m + 'د'; }
function subs() { return T.S.subjects; }
function sOf(id) { return subs().find(function (s) { return s.id === id; }) || subs()[0]; }
function opts(sel) { return subs().map(function (s) { return '<option value="' + esc(s.id) + '"' + (s.id === sel ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join(''); }
function pctAll() { var a = 0, b = 0; subs().forEach(function (s) { b += s.lessons.length; a += s.lessons.filter(function (l) { return l.done; }).length; }); return b ? Math.round(a / b * 100) : 0; }

function P(k, d) { try { var u = JSON.parse(localStorage.getItem('tracker-4am-ui')) || {}; return u[k] == null ? d : u[k]; } catch (x) { return d; } }
function sc() { var p = T.S.pf; return p && p.st === 'p' ? 10 : 20; }
function copy(t) {
  var ok = function () { T.toast('تم النسخ ✅'); }, no = function () { var ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy') ? ok() : T.toast('انسخ الرابط يدويًا من المربع'); } catch (x) { T.toast('انسخ الرابط يدويًا من المربع'); } ta.remove(); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(ok, no); else no();
}
// ---------- نافذة الأدوات ----------
var sh, pn, view = '';
function openTool(v, ico, title, html) {
  view = v; pn.innerHTML = '<div class="ph"><span class="ico">' + ico + '</span><div class="txt"><h3>' + title + '</h3></div><button class="close" data-tc aria-label="إغلاق">✕</button></div><div class="pb">' + html + '</div>';
  if (sh.hidden) { sh.hidden = false; document.body.style.overflow = 'hidden'; requestAnimationFrame(function () { requestAnimationFrame(function () { sh.classList.add('on'); }); }); setTimeout(function () { var c = $('.close', pn); if (c) c.focus(); }, 350); }
  return $('.pb', pn);
}
function closeTool() { if (sh.hidden) return; sh.classList.remove('on'); document.body.style.overflow = ''; view = ''; setTimeout(function () { if (!view) sh.hidden = true; }, 380); }

// ---------- 1) التركيز ----------
var PTK = 'tracker-4am-tm', tm = null, iv = null, ptm = function () { try { if (tm) localStorage.setItem(PTK, JSON.stringify(tm)); else localStorage.removeItem(PTK); } catch (x) {} }, fmt = function (s) { return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
function left() { return Math.max(0, Math.round((tm.end - Date.now()) / 1000)); }
function paint() {
  var chip = $('#tm'); if (!tm) { chip.hidden = true; return; }
  var l = left(), p = Math.round((1 - l / tm.total) * 100); chip.hidden = false; chip.textContent = (tm.kind === 'mock' ? '📝 ' : '⏱ ') + fmt(l);
  var t = $('#trt'); if (t) { t.textContent = fmt(l); $('#trf').style.strokeDashoffset = 100 - p; }
  if (!l) finish(true);
}
function start(sid, m, kind) { tm = { sid: sid, kind: kind || 'focus', total: m * 60, end: Date.now() + m * 60000 }; clearInterval(iv); iv = setInterval(paint, 500); ptm(); paint(); viewFocus(); }
function finish(full) {
  if (!tm) return; var t = tm, el = full ? Math.round(t.total / 60) : Math.floor((t.total - left()) / 60); clearInterval(iv); tm = null; ptm(); paint();
  if (el > 0) addMin(t.sid, el);
  if (full) { try { if (!P('sd', 1)) throw 0; var a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(); o.connect(a.destination); o.frequency.value = 880; o.start(); setTimeout(function () { o.stop(); a.close(); }, 350); } catch (e) {} if (P('vb', 1) && navigator.vibrate) navigator.vibrate([200, 100, 200]); }
  T.toast(full ? '🎉 أحسنت! ' + el + ' دقيقة تركيز. خذ استراحة 5 دقائق.' : 'حُفظت ' + el + ' دقيقة');
  if (t.kind === 'mock') T.ask({ msg: 'كم نقطتك في الامتحان التجريبي من ' + sc() + '؟ (اتركها فارغة إن لم تصحّحه بعد)', input: '', ok: 'حفظ', max: 5 }).then(function (v) {
    G('ex', []).push({ id: uid(), s: t.sid, t: 'امتحان تجريبي', y: '', u: '', p: v ? num(v, sc()) : null, m: el, d: D() }); T.save(); if (view === 'focus' || view === 'exams') viewExams(t.sid); });
  else if (view === 'focus') viewFocus();
}
function viewFocus() {
  var b, sid = tm ? tm.sid : (T.S.fs || subs()[0] && subs()[0].id);
  if (!subs().length) return openTool('focus', '⏱', 'وضع التركيز', '<p class="empty">أضف مادة أولًا.</p>');
  if (tm) b = openTool('focus', tm.kind === 'mock' ? '📝' : '⏱', tm.kind === 'mock' ? 'امتحان تجريبي' : 'وضع التركيز',
    '<div class="tc"><div class="ring big-ring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="bg" cx="100" cy="100" r="86" pathLength="100"/><circle id="trf" class="fg" cx="100" cy="100" r="86" pathLength="100" stroke="url(#g)"/></svg><div class="ring-n" style="font-size:2.6rem"><span id="trt">--:--</span></div></div><p class="mut">' + esc(sOf(sid).name) + '</p><button class="pill danger" data-x="stop">إيقاف وحفظ ما أنجزت</button></div>');
  else b = openTool('focus', '⏱', 'وضع التركيز', '<label class="fl">المادة<select id="fS">' + opts(sid) + '</select></label><p class="mut">اختر المدة وابدأ. تُسجَّل الدقائق تلقائيًا في إحصائياتك.</p><div class="chs">' + P('du', [15, 25, 45, 60]).map(function (m) { return '<button class="pill pri" data-x="go" data-m="' + m + '">' + m + ' د</button>'; }).join('') + '</div><p class="mut">اليوم: <b>' + hm(mins(D())) + '</b> · السلسلة: <b>' + streak() + ' 🔥</b></p>');
  if (tm) paint();
}

// ---------- 2) الإحصائيات ----------
function viewStats() {
  var S = T.S, g = S.g || 300, w = week(), tot = 0, t = new Date(), i, cells = '';
  Object.keys(G('log', {})).forEach(function (k) { tot += mins(k); });
  var st = new Date(t.getFullYear(), t.getMonth(), t.getDate() - (14 * 7 + t.getDay()));
  for (i = 0; i < 105; i++) { var d = new Date(st.getFullYear(), st.getMonth(), st.getDate() + i), m = d > t ? -1 : mins(D(d)); cells += '<i class="' + (m < 0 ? 'nx' : m >= 120 ? 'l4' : m >= 60 ? 'l3' : m >= 30 ? 'l2' : m > 0 ? 'l1' : '') + '" title="' + D(d) + ' · ' + Math.max(m, 0) + 'د"></i>'; }
  var DN = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'], ws = [], mx = 30;
  for (i = 6; i >= 0; i--) { var dd = new Date(t.getFullYear(), t.getMonth(), t.getDate() - i), mm = mins(D(dd)); ws.push([DN[dd.getDay()], mm]); mx = Math.max(mx, mm); }
  var ps = subs().map(function (s) { var a = 0; for (var j = 0; j < 30; j++) a += mins(ago(j), s.id); return [s, a]; }).filter(function (x) { return x[1]; }).sort(function (a, b) { return b[1] - a[1]; }), pm = ps.length ? ps[0][1] : 1;
  var cold = subs().filter(function (s) { if (!s.lessons.some(function (l) { return !l.done; })) return false; for (var j = 0; j < 14; j++) if (mins(ago(j), s.id)) return false; return true; })[0];
  openTool('stats', '📊', 'إحصائياتي',
    '<div class="chips st"><div class="chip"><b>' + streak() + '🔥</b><span>يومًا متتاليًا</span></div><div class="chip"><b>' + hm(mins(D())) + '</b><span>اليوم</span></div><div class="chip"><b>' + hm(tot) + '</b><span>المجموع</span></div></div>' +
    '<p class="mut">هدف الأسبوع: <b>' + hm(w) + '</b> من ' + hm(g) + ' <button class="x" data-x="goal" aria-label="تعديل الهدف">✎</button></p><div class="pbar"><i style="width:' + Math.min(100, Math.round(w / g * 100)) + '%"></i></div>' +
    (cold ? '<p class="tip">💡 لم تدرس «' + esc(cold.name) + '» منذ أسبوعين وفيها دروس غير منجزة.</p>' : '') +
    '<h4>آخر 15 أسبوعًا</h4><div class="hm">' + cells + '</div><h4>هذا الأسبوع</h4><div class="vbs">' + ws.map(function (x) { return '<div class="vb"><span style="height:' + Math.round(x[1] / mx * 100) + '%"></span><small>' + x[0] + '</small></div>'; }).join('') + '</div>' +
    '<h4>المواد (آخر 30 يومًا)</h4>' + (ps.map(function (x) { return '<div class="hb" style="' + T.theme(x[0]) + '"><span>' + esc(x[0].name) + '</span><div><i style="width:' + Math.round(x[1] / pm * 100) + '%"></i></div><small>' + hm(x[1]) + '</small></div>'; }).join('') || '<p class="empty">ابدأ جلسة تركيز لتظهر الإحصائيات.</p>'));
}

// ---------- 3) المعدل والمحاكي ----------
function viewMarks() {
  var M = G('marks', {});
  var rows = subs().map(function (s) { var m = M[s.id] || {}, a = m.a || [], v = function (x) { return x == null ? '' : x; };
    return '<tr data-s="' + esc(s.id) + '"><th>' + esc(s.name) + '</th><td><input data-k="c" inputmode="decimal" value="' + (m.c == null ? 1 : m.c) + '"></td>' + [0, 1, 2].map(function (i) { return '<td><input data-k="a' + i + '" inputmode="decimal" value="' + v(a[i]) + '"></td>'; }).join('') + '<td><input data-k="e" inputmode="decimal" value="' + v(m.e) + '"></td><td class="av">–</td></tr>'; }).join('');
  openTool('marks', '🧮', 'المعدل ومحاكي الشهادة', '<div class="sc"><table class="mt"><thead><tr><th>المادة</th><th>معامل</th><th>ف1</th><th>ف2</th><th>ف3</th><th>امتحان</th><th>معدل</th></tr></thead><tbody>' + rows + '</tbody></table></div><div id="mo"></div><p class="mut">المعامل 0 = المادة لا تدخل في الحساب. أدخل المعاملات من كشف نقاطك الرسمي، فالقيم الافتراضية 1 فقط. معدل المادة = متوسط الفصول المُدخلة.</p>');
  calc();
}
function calc() {
  var M = G('marks', {}), w = T.S.w == null ? .5 : T.S.w, sA = 0, cA = 0, sE = 0, cE = 0, cU = 0, tg = T.S.tg || (T.S.pf && T.S.pf.tg) || (sc() === 10 ? 6 : 12);
  subs().forEach(function (s) { var m = M[s.id] || {}, c = m.c == null ? 1 : m.c, a = (m.a || []).filter(function (v) { return v != null; }), av = a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null, r = $('tr[data-s="' + s.id + '"] .av', pn);
    if (r) r.textContent = av == null ? '–' : av.toFixed(2); if (!c) return; if (av != null) { sA += av * c; cA += c; } if (m.e != null) { sE += m.e * c; cE += c; } else cU += c; });
  var o = $('#mo', pn); if (!o) return; var an = cA ? sA / cA : null, ex = cE ? sE / cE : null, h = '<div class="chips st"><div class="chip"><b>' + (an == null ? '–' : an.toFixed(2)) + '</b><span>معدل السنة</span></div><div class="chip"><b>' + (ex == null ? '–' : ex.toFixed(2)) + '</b><span>معدل الامتحان</span></div><div class="chip"><b>' + (an != null && ex != null && !cU ? (w * an + (1 - w) * ex).toFixed(2) : '–') + '</b><span>النهائي</span></div></div>';
  h += '<p class="mut">وزن معدل السنة <b>' + Math.round(w * 100) + '%</b> <button class="x" data-x="w" aria-label="تعديل">✎</button> (تأكد من الصيغة الرسمية للوزارة)</p><h4>🎯 المحاكي: أريد معدلًا نهائيًا</h4><div class="chs">' + (sc() === 10 ? [5, 6, 8, 9] : [10, 12, 14, 16]).map(function (v) { return '<button class="pill' + (v === tg ? ' pri' : '') + '" data-x="tg" data-v="' + v + '">' + v + '</button>'; }).join('') + '</div>';
  if (an == null) h += '<p class="tip">أدخل نقاط فصل واحد على الأقل لتظهر النتيجة.</p>';
  else if (w >= 1) h += '<p class="tip">الوزن 100% للسنة: لا تأثير للامتحان.</p>';
  else { var X2 = (tg - w * an) / (1 - w), cT = cE + cU, R = cU ? (X2 * cT - sE) / cU : null;
    h += '<p class="tip">' + (X2 <= 0 ? '✅ هدف ' + tg + ' مضمون بمعدل السنة وحده.' : 'لبلوغ <b>' + tg + '</b> تحتاج معدل امتحان <b>' + X2.toFixed(2) + '</b>' + (R == null ? (X2 > (ex || 0) ? ' ولم يتحقق بعد.' : ' وقد تحقق ✅.') : (R > sc() ? '. الهدف غير ممكن بالمواد المتبقية (يتطلب أكثر من 20) ⚠️.' : R <= 0 ? ' وهو مضمون ✅.' : '، أي نحو <b>' + R.toFixed(2) + '</b> في كل مادة امتحان لم تُدخل نقطتها.'))) + '</p>'; }
  o.innerHTML = h;
}

// ---------- 5) التحدّي والمشاركة ----------
function snapshot() { return { n: T.S.nk || 'تلميذ', w: week(), k: streak(), p: pctAll(), d: D(), s: subs().slice(0, 16).map(function (s) { var t = s.lessons.length; return [s.name.slice(0, 30), t ? Math.round(s.lessons.filter(function (l) { return l.done; }).length / t * 100) : 0]; }) }; }
function enc(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function dec(x) { x = x.replace(/-/g, '+').replace(/_/g, '/'); while (x.length % 4) x += '='; var o = JSON.parse(decodeURIComponent(escape(atob(x)))); return { n: str(o.n, 20) || 'صديق', w: num(o.w, 6000) || 0, k: num(o.k, 400) || 0, p: num(o.p, 100) || 0, d: DT.test(o.d) ? o.d : '', s: (Array.isArray(o.s) ? o.s : []).slice(0, 16).map(function (a) { return [str(a[0], 30), num(a[1], 100) || 0]; }) }; }
function link() { return location.href.split('#')[0] + '#c=' + enc(snapshot()); }
function viewSocial() {
  var me = snapshot(), g = T.S.g || 300, all = [{ n: me.n + ' (أنا)', w: me.w, k: me.k, p: me.p, me: 1 }].concat(G('fr', []).map(function (f, i) { var c = Object.assign({}, f); c.i = i; return c; })).sort(function (a, b) { return b.w - a.w; });
  openTool('social', '👥', 'التحدّي مع الأصدقاء', '<p class="mut">اسمك في التحدّي: <b>' + esc(T.S.nk || 'غير محدد') + '</b> <button class="x" data-x="nick" aria-label="تعديل">✎</button></p><p class="mut">هدف الأسبوع: ' + hm(me.w) + ' من ' + hm(g) + '</p><div class="pbar"><i style="width:' + Math.min(100, Math.round(me.w / g * 100)) + '%"></i></div>' +
    '<h4>🔗 رابط تحدّيك</h4><p class="mut">أرسله لصديقك، وأرسل له رابطًا جديدًا كل بضعة أيام لتتحدّث أرقامك. (لأولياء الأمور: استعمل قسم «مراقبة الأولياء».)</p><textarea class="lk" readonly rows="3" dir="ltr" data-x="sel">' + esc(link()) + '</textarea><div class="chs"><button class="pill pri" data-x="copyc">📋 نسخ</button><button class="pill" data-x="wac">واتساب</button><button class="pill" data-x="card">🖼️ بطاقة إنجاز</button></div>' +
    '<h4>➕ أضف صديقًا</h4><form data-x="addf"><input name="l" placeholder="ألصق رابط تحدّي صديقك" dir="ltr" required><button>إضافة</button></form><h4>🏆 ترتيب الأسبوع</h4><ol class="lb">' +
    all.map(function (a, i) { return '<li' + (a.me ? ' class="me"' : '') + '><span>' + ['🥇', '🥈', '🥉'][i] + (i > 2 ? i + 1 : '') + '</span><b>' + esc(a.n) + '</b><small>' + hm(a.w) + ' · ' + a.k + '🔥 · ' + a.p + '%' + (a.d ? ' · ' + a.d : '') + '</small>' + (a.me ? '' : '<button class="x" data-x="fdel" data-i="' + a.i + '" aria-label="إزالة">✕</button>') + '</li>'; }).join('') + '</ol>' + (all.length < 2 ? '<p class="empty">أضف رابط صديق لتبدأ المنافسة.</p>' : ''));
}
function addFriend(o) { var f = G('fr', []), i = f.findIndex(function (x) { return x.n === o.n; }); var r = { n: o.n, w: o.w, k: o.k, p: o.p, d: o.d }; if (i < 0) f.push(r); else f[i] = r; T.save(); T.toast('أُضيف ' + o.n); }
function report(o) {
  openTool('rep', '📋', 'تقرير ' + esc(o.n), '<div class="chips st"><div class="chip"><b>' + o.k + '🔥</b><span>أيام متتالية</span></div><div class="chip"><b>' + hm(o.w) + '</b><span>هذا الأسبوع</span></div><div class="chip"><b>' + o.p + '%</b><span>الدروس المنجزة</span></div></div><h4>المواد</h4>' +
    o.s.map(function (a, i) { return '<div class="hb" style="--c1:#0a84ff;--c2:#bf5af2"><span>' + esc(a[0]) + '</span><div><i style="width:' + a[1] + '%"></i></div><small>' + a[1] + '%</small></div>'; }).join('') + '<p class="mut">تقرير للقراءة فقط بتاريخ ' + esc(o.d || '—') + '، وصل عبر رابط.</p><button class="pill pri" data-x="addrep">➕ أضفه إلى أصدقائي</button>');
  X.rep = o;
}
function drawCard() {
  var me = snapshot(), c = document.createElement('canvas'); c.width = 1080; c.height = 1350; var x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 1080, 1350);
  g.addColorStop(0, '#0a84ff'); g.addColorStop(.5, '#bf5af2'); g.addColorStop(1, '#ff375f'); x.fillStyle = g; x.fillRect(0, 0, 1080, 1350); x.direction = 'rtl'; x.textAlign = 'center'; x.fillStyle = '#fff';
  var F = '-apple-system,"Segoe UI",Tahoma,"Noto Sans Arabic",sans-serif'; x.font = '600 52px ' + F; x.fillText('متابعتي الدراسية · 4 متوسط', 540, 150); x.font = '800 130px ' + F; x.fillText(me.n, 540, 330);
  [[me.k + ' 🔥', 'أيام متتالية'], [hm(me.w), 'دراسة هذا الأسبوع'], [me.p + '%', 'من الدروس منجزة']].forEach(function (v, i) { var y = 560 + i * 250; x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.roundRect ? x.roundRect(120, y - 150, 840, 200, 40) : x.rect(120, y - 150, 840, 200); x.fill(); x.fillStyle = '#fff'; x.font = '800 110px ' + F; x.fillText(v[0], 540, y - 25); x.font = '500 44px ' + F; x.fillText(v[1], 540, y + 25); });
  x.font = '600 48px ' + F; x.fillText('نحو شهادة التعليم المتوسط 2027 💪', 540, 1270);
  c.toBlob(function (b) { var f = new File([b], 'progress.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f] }).catch(function () {}); else { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'progress.png'; a.click(); } });
}

// ---------- 6) أرشيف الامتحانات ----------
function viewExams(sid) {
  if (!subs().length) return openTool('exams', '📝', 'أرشيف الامتحانات', '<p class="empty">أضف مادة أولًا.</p>');
  sid = sOf(sid || T.S.es).id; T.S.es = sid; var s = sOf(sid), L = G('ex', []).filter(function (e) { return e.s === sid; }), scs = L.filter(function (e) { return e.p != null; }).map(function (e) { return e.p; });
  openTool('exams', '📝', 'أرشيف الامتحانات', '<label class="fl">المادة<select id="eS">' + opts(sid) + '</select></label><div class="chs"><button class="pill" data-x="search">🔎 ابحث عن مواضيع BEM سابقة</button></div><p class="mut">امتحان تجريبي بمؤقت (يُحسب ضمن دقائق دراستك):</p><div class="chs">' + [60, 90, 120].map(function (m) { return '<button class="pill pri" data-x="mock" data-m="' + m + '">📝 ' + m + ' د</button>'; }).join('') + '</div>' +
    (scs.length ? '<div class="chips st"><div class="chip"><b>' + (scs.reduce(function (a, b) { return a + b; }, 0) / scs.length).toFixed(1) + '</b><span>المتوسط</span></div><div class="chip"><b>' + Math.max.apply(0, scs) + '</b><span>الأفضل</span></div><div class="chip"><b>' + scs.length + '</b><span>محاولة</span></div></div>' : '') +
    '<ul class="ls">' + (L.map(function (e) { return '<li><span class="txt"><b>' + esc(e.t || 'امتحان') + '</b><small>' + [esc(e.y), esc(e.d), e.m ? e.m + 'د' : ''].filter(Boolean).join(' · ') + '</small></span>' + (e.p != null ? '<em>' + e.p + '/' + sc() + '</em>' : '') + (e.u ? '<a class="x" href="' + esc(e.u) + '" target="_blank" rel="noopener noreferrer" aria-label="فتح الرابط">↗</a>' : '') + '<button class="x" data-x="exdel" data-i="' + e.id + '" aria-label="حذف">✕</button></li>'; }).join('') || '<li class="empty">لا توجد امتحانات مسجّلة لـ' + esc(s.name) + '.</li>') + '</ul>' +
    '<form data-x="exadd"><input name="t" placeholder="عنوان الموضوع (مثال: BEM 2024)" required maxlength="80"><input class="fi" name="y" placeholder="السنة" maxlength="4" inputmode="numeric"><input class="fi" name="p" placeholder="نقطتك /' + sc() + '" inputmode="decimal"><input name="u" placeholder="رابط الموضوع (اختياري)" dir="ltr"><button>إضافة</button></form>');
}

// ---------- الأحداث ----------
function act(b, e) {
  var a = b.dataset.x, S = T.S;
  if (X.acts[a]) return X.acts[a](b, e);
  if (a === 'go') start($('#fS', pn).value, +b.dataset.m);
  else if (a === 'stop') finish(false);
  else if (a === 'goal') T.ask({ msg: 'هدف الأسبوع بالساعات', input: String(Math.round((S.g || 300) / 60)), ok: 'حفظ', max: 3 }).then(function (v) { var h = num(v, 100); if (h) { S.g = Math.round(h * 60); T.save(); viewStats(); } });
  else if (a === 'tg') { S.tg = +b.dataset.v; calc(); }
  else if (a === 'w') T.ask({ msg: 'وزن معدل السنة من 100 (مثلًا 50)', input: String(Math.round((S.w == null ? .5 : S.w) * 100)), ok: 'حفظ', max: 3 }).then(function (v) { var p = num(v, 100); if (p != null) { S.w = p / 100; T.save(); calc(); } });
  else if (a === 'nick') T.ask({ msg: 'اسمك أو لقبك في التحدّي (لا تضع اسمك الكامل)', input: S.nk || '', ok: 'حفظ', max: 20 }).then(function (v) { if (v) { S.nk = v; T.save(); viewSocial(); } });
  else if (a === 'card') drawCard();
  else if (a === 'copyc') copy(link());
  else if (a === 'wac') window.open('https://wa.me/?text=' + encodeURIComponent('تحدّاني في الدراسة هذا الأسبوع 💪 ' + link()), '_blank', 'noopener');
  else if (a === 'fdel') { var bk = T.snap(); S.fr.splice(+b.dataset.i, 1); T.save(); viewSocial(); T.toast('أُزيل الصديق', function () { T.undoTo(bk); viewSocial(); }); }
  else if (a === 'addrep') { addFriend(X.rep); closeTool(); }
  else if (a === 'search') window.open('https://www.google.com/search?q=' + encodeURIComponent('موضوع شهادة التعليم المتوسط ' + sOf($('#eS', pn).value).name + ' مع التصحيح'), '_blank', 'noopener');
  else if (a === 'mock') start($('#eS', pn).value, +b.dataset.m, 'mock');
  else if (a === 'exdel') { var bk2 = T.snap(); S.ex = S.ex.filter(function (x) { return x.id !== b.dataset.i; }); T.save(); viewExams(S.es); T.toast('حُذف الامتحان', function () { T.undoTo(bk2); viewExams(S.es); }); }
}
X.init = function (t) {
  T = t; sh = $('#tool'); pn = $('.panel', sh); pn.setAttribute('style', '--c1:#0a84ff;--c2:#bf5af2');
  var TL = [['focus', '⏱', 'تركيز', '#ff9f0a', '#ff453a', viewFocus], ['stats', '📊', 'إحصائيات', '#30d158', '#00c7be', viewStats], ['marks', '🧮', 'المعدل', '#0a84ff', '#5e5ce6', viewMarks], ['social', '👥', 'تحدّي', '#ff375f', '#ff9f0a', viewSocial], ['exams', '📝', 'امتحانات', '#64d2ff', '#0a84ff', viewExams]]
    .concat(X.tools.map(function (t) { return [t.k, t.i, t.n, t.a, t.b, t.f]; }));
  var ORD = ['focus', 'stats', 'marks', 'ai', 'guard', 'social', 'exams'];
  TL.sort(function (a, b) { return ORD.indexOf(a[0]) - ORD.indexOf(b[0]); });
  var V = {}; TL.forEach(function (x) { V[x[0]] = x[5]; });
  $('#bem').insertAdjacentHTML('afterend', '<section class="tg" aria-label="الأدوات">' + TL.map(function (x) { return '<button class="tl" data-t="' + x[0] + '"><span class="ico" style="--c1:' + x[3] + ';--c2:' + x[4] + '">' + x[1] + '</span><b>' + x[2] + '</b></button>'; }).join('') + '</section><button id="tm" class="tmchip" data-t="focus" hidden></button>');
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (b && V[b.dataset.t]) V[b.dataset.t](); });
  sh.addEventListener('click', function (e) { var b = e.target.closest('[data-tc],[data-x]'); if (!b || b.tagName === 'FORM') return; if (b.hasAttribute('data-tc')) closeTool(); else act(b, e); });
  sh.addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target, a = f.dataset.x, v = function (n) { return f.elements[n].value.trim(); };
    if (X.forms[a]) X.forms[a](f);
    else if (a === 'addf') { try { addFriend(dec(v('l').split('#c=').pop().trim())); viewSocial(); } catch (x) { T.toast('الرابط غير صالح'); } }
    else if (a === 'exadd') { G('ex', []).push({ id: uid(), s: T.S.es, t: v('t'), y: v('y').replace(/\D/g, '').slice(0, 4), u: /^https?:\/\//i.test(v('u')) ? v('u').slice(0, 300) : '', p: v('p') ? num(v('p'), sc()) : null, m: null, d: D() }); T.save(); viewExams(T.S.es); }
  });
  sh.addEventListener('input', function (e) { var i = e.target, tr = i.closest('tr[data-s]'); if (!tr || !i.dataset.k) return; var M = G('marks', {}), m = M[tr.dataset.s] = M[tr.dataset.s] || { c: 1, a: [null, null, null], e: null }, k = i.dataset.k, n = i.value.trim() === '' ? null : num(i.value, sc());
    if (k === 'c') m.c = n == null ? 1 : n; else if (k === 'e') m.e = n; else m.a[+k[1]] = n; T.save(); calc(); });
  sh.addEventListener('change', function (e) { var i = e.target;
    if (i.id === 'fS') T.S.fs = i.value; else if (i.id === 'eS') viewExams(i.value);
    X.chgs.forEach(function (f) { f(i); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#dlg').open) closeTool(); });
  try { var rt = JSON.parse(localStorage.getItem(PTK)); if (rt && rt.sid && rt.end && rt.total) { tm = rt; iv = setInterval(paint, 500); paint(); } } catch (x) {}
  X.acts.sel = function (b) { b.select(); };
  X.api = { T: T, openTool: openTool, closeTool: closeTool, opts: opts, sOf: sOf, subs: subs, week: week, streak: streak, mins: mins, D: D, ago: ago, hm: hm, G: G, sc: sc, copy: copy, start: start, esc: esc, num: num, str: str };
  X.ready.forEach(function (f) { f(); });
  try { if (P('ab', 1) && T.S.subjects.some(function (s) { return s.lessons.length; })) { var bk = JSON.parse(localStorage.getItem('tracker-4am-bk')) || [], dd = D(); if (!bk.length || bk[bk.length - 1].d.slice(0, 10) !== dd) { bk.push({ d: dd, s: JSON.stringify(T.S) }); while (bk.length > 5) bk.shift(); localStorage.setItem('tracker-4am-bk', JSON.stringify(bk)); } } } catch (x) {}
  try { var rh = P('rm', 0); if (rh && new Date().getHours() >= rh && !mins(D()) && !sessionStorage.getItem('rm')) { sessionStorage.setItem('rm', '1'); setTimeout(function () { T.toast('⏰ لم تسجّل دراسة اليوم بعد. ابدأ بـ 25 دقيقة!'); }, 1800); } } catch (x) {}
  if (location.hash.indexOf('#c=') === 0) try { report(dec(location.hash.slice(3))); } catch (x) {}
};
})();
