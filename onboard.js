(function () {
'use strict';
var X = window.T4x, A, $ = function (s) { return document.querySelector(s); };
var LV = { p: { n: 'ابتدائي', c: 'AP', y: ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'] }, m: { n: 'متوسط', c: 'AM', y: ['الأولى', 'الثانية', 'الثالثة', 'الرابعة'] }, s: { n: 'ثانوي', c: 'AS', y: ['الأولى', 'الثانية', 'الثالثة'] } };
// العد التنازلي يظهر فقط للمستويات المذكورة هنا. لإظهاره لمستوى آخر أضف سطرًا (رمز المستوى: n الاسم، d الموعد). المواعيد هنا تقديرية.
var EXAMS = { m4: { n: 'شهادة التعليم المتوسط', d: '2027-06-07' }, s3: { n: 'شهادة البكالوريا', d: '2027-06-13' } };
var N = { ar: ['اللغة العربية'], ma: ['الرياضيات'], fr: ['اللغة الفرنسية'], en: ['اللغة الإنجليزية'], is: ['التربية الإسلامية'], ci: ['التربية المدنية'], hi: ['التاريخ'], ge: ['الجغرافيا'], hg: ['التاريخ والجغرافيا'], sn: ['علوم الطبيعة والحياة'], ph: ['العلوم الفيزيائية والتكنولوجيا'], it: ['المعلوماتية'], ds: ['التربية التشكيلية'], mu: ['التربية الموسيقية'], pe: ['التربية البدنية والرياضية'], am: ['اللغة الأمازيغية'], sc: ['التربية العلمية والتكنولوجية', '🔬'], phi: ['الفلسفة', '🧠'], te: ['الهندسة (تكنولوجيا)', '📐'], mg: ['التسيير المحاسبي والمالي', '🧾'], ec: ['الاقتصاد والمناجمنت', '📈'], l3: ['لغة أجنبية ثالثة', '🌐'] };
var BR1 = ['جذع مشترك علوم وتكنولوجيا', 'جذع مشترك آداب'], BR23 = ['علوم تجريبية', 'رياضيات', 'تقني رياضي', 'تسيير واقتصاد', 'آداب وفلسفة', 'لغات أجنبية'];
var PS = { 'جذع مشترك علوم وتكنولوجيا': 'ar ma ph sn fr en hg is it pe am', 'جذع مشترك آداب': 'ar fr en hg is ma sn pe am', 'علوم تجريبية': 'ar phi fr en hg is ma ph sn pe', 'رياضيات': 'ar phi fr en hg is ma ph sn pe', 'تقني رياضي': 'ar phi fr en hg is ma ph te pe', 'تسيير واقتصاد': 'ar phi fr en hg is ma mg ec pe', 'آداب وفلسفة': 'ar phi fr en hg is ma pe', 'لغات أجنبية': 'ar phi fr en l3 hg is ma pe' };
function preset(st, y, br) {
  if (st === 'p') return (y < 3 ? 'ar ma is ci ds pe am' : 'ar ma fr en sc hg is ci ds pe am').split(' ');
  if (st === 'm') return 'ar ma fr en sn ph is ci hi ge it ds mu pe am'.split(' ');
  return (PS[br] || PS['علوم تجريبية']).split(' ');
}
function ay() { var d = new Date(), y = d.getFullYear(); return d.getMonth() >= 7 ? y + '–' + (y + 1) : (y - 1) + '–' + y; }

X.level = function () {
  var pf = A && A.T.S.pf; if (!pf || !pf.ok) return null; var l = LV[pf.st], k = pf.st + pf.y;
  return { code: pf.y + l.c, label: 'السنة ' + l.y[pf.y - 1] + ' ' + l.n, st: pf.st, y: pf.y, br: pf.br, scale: pf.st === 'p' ? 10 : 20, exam: (function () { var S = A.T.S, x = EXAMS[k] ? { n: S.bn || EXAMS[k].n, d: EXAMS[k].d } : (S.bn ? { n: S.bn, d: '' } : null); return S.hb ? null : x; })() };
};
X.exam = function () {
  var L = X.level(); if (!L || !L.exam) return null;
  var p = (A.T.S.bem || L.exam.d || '2027-06-07').split('-'), n = new Date();
  return { n: L.exam.n, days: Math.ceil((new Date(+p[0], p[1] - 1, +p[2]) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5) };
};
function applyProfile() {
  var L = X.level(); if (!L) return;
  $('#logo').textContent = L.code; $('#sub').textContent = L.label + (L.br ? ' · ' + L.br : '') + ' · ' + ay();
  document.title = 'متابعة دراسية · ' + L.code + ' ' + ay();
  var b = $('#bem'), S = A.T.S; b.hidden = !L.exam;
  if (L.exam && !S.bem && L.exam.d) { S.bem = L.exam.d; A.T.save(); }
  if (L.exam) $('#bem h2').textContent = L.exam.n + (S.bn ? '' : ' ' + ay().split('–')[1]);
}
X.refresh = function () { if (A) applyProfile(); };

// ---------- الواجهة التفاعلية ----------
var W, step;
function steps() { var a = ['hi', 'st', 'y']; if (W.st === 's') a.push('br'); a.push('me', 'su', 'ok'); return a; }
function opts(list, cur) { return '<div class="obo">' + list.map(function (o) { return '<button class="opt' + (String(o[0]) === String(cur) ? ' sel' : '') + '" data-o="' + A.esc(o[0]) + '">' + (o[2] ? '<span>' + o[2] + '</span>' : '') + A.esc(o[1]) + '</button>'; }).join('') + '</div>'; }
function buildSubs() {
  var key = W.st + W.y + W.br; if (W.sk === key && W.subs) return; W.sk = key;
  var ex = A.T.S.subjects, list = preset(W.st, W.y, W.br).map(function (k) { return { n: N[k][0], i: N[k][1], on: 1 }; });
  ex.forEach(function (s) { if (s.lessons.length && !list.some(function (x) { return x.n === s.name; })) list.push({ n: s.name, i: s.i, on: 1 }); });
  W.subs = list;
}
function body(id) {
  var sc = W.st === 'p' ? 10 : 20;
  if (id === 'hi') return '<div class="big">👋</div><h2 id="obT">أهلًا بك!</h2><p class="mut">سنجهّز موقعك ليناسب مستواك في أقل من دقيقة. بضعة أسئلة فقط.</p>';
  if (id === 'st') return '<h2 id="obT">في أي طور تدرس؟</h2>' + opts([['p', 'ابتدائي', '🎒'], ['m', 'متوسط', '📘'], ['s', 'ثانوي', '🎓']], W.st);
  if (id === 'y') return '<h2 id="obT">في أي سنة؟</h2>' + opts(LV[W.st].y.map(function (n, i) { return [i + 1, 'السنة ' + n]; }), W.y);
  if (id === 'br') return '<h2 id="obT">ما هي شعبتك؟</h2>' + opts((W.y === 1 ? BR1 : BR23).map(function (b) { return [b, b]; }), W.br);
  if (id === 'me') return '<h2 id="obT">عرّفنا بنفسك</h2><label class="fl">اسمك أو لقبك (اختياري)<input id="obN" maxlength="20" autocomplete="off" value="' + A.esc(W.nk) + '"></label><p class="mut">المعدل الذي تطمح إليه</p><div class="obo sm">' + (sc === 10 ? [5, 7, 8, 9] : [10, 12, 14, 16]).map(function (v) { return '<button class="opt' + (W.tg === v ? ' sel' : '') + '" data-tg="' + v + '">' + v + '</button>'; }).join('') + '</div><p class="mut">كم تدرس يوميًا؟</p><div class="obo sm">' + [[30, '30 د'], [60, 'ساعة'], [90, 'ساعة ونصف'], [120, 'ساعتان']].map(function (v) { return '<button class="opt' + (W.dg === v[0] ? ' sel' : '') + '" data-dg="' + v[0] + '">' + v[1] + '</button>'; }).join('') + '</div>';
  if (id === 'su') { buildSubs(); return '<h2 id="obT">اختر موادك</h2><p class="mut">لمس المادة يضيفها أو يحذفها. تستطيع التعديل لاحقًا.</p><div class="obo chp">' + W.subs.map(function (s, i) { return '<button class="opt' + (s.on ? ' sel' : '') + '" data-s="' + i + '" aria-pressed="' + !!s.on + '">' + A.esc(s.n) + '</button>'; }).join('') + '<button class="opt add" data-add>+ مادة أخرى</button></div>'; }
  var L = LV[W.st]; return '<div class="big">🎉</div><h2 id="obT">كل شيء جاهز!</h2><p class="mut">' + 'السنة ' + L.y[W.y - 1] + ' ' + L.n + (W.br ? ' · ' + A.esc(W.br) : '') + '<br>' + W.subs.filter(function (s) { return s.on; }).length + ' مواد · هدفك ' + W.tg + ' · ' + W.dg + ' دقيقة يوميًا</p>';
}
function ok(id) { return id === 'st' ? !!W.st : id === 'y' ? !!W.y : id === 'br' ? !!W.br : true; }
function render() {
  var a = steps(), id = a[step], first = !(A.T.S.pf && A.T.S.pf.ok);
  $('#obc').innerHTML = '<div class="dots">' + a.map(function (_, i) { return '<i class="' + (i <= step ? 'on' : '') + '"></i>'; }).join('') + '</div><div class="obs">' + body(id) + '</div><div class="obf">' +
    (step ? '<button class="pill" data-bk>رجوع</button>' : '<button class="pill" data-skip>' + (first ? 'تخطّي الآن' : 'إلغاء') + '</button>') +
    '<button class="pill pri" data-nx' + (ok(id) ? '' : ' disabled') + '>' + (id === 'hi' ? 'هيّا نبدأ' : id === 'ok' ? 'ابدأ 🚀' : 'التالي') + '</button></div>';
  var n = $('#obN'); if (n && W.focusN) { W.focusN = 0; }
}
function next() {
  var a = steps(), id = a[step]; if (!ok(id)) return;
  if (id === 'me') W.nk = $('#obN').value.trim();
  if (id === 'ok') return finish(); step++; render();
}
function setOpt(id, v) {
  if (id === 'st') { if (W.st !== v) { W.st = v; W.y = 0; W.br = ''; } } else if (id === 'y') { W.y = +v; if (W.st === 's' && W.y === 1 && BR23.indexOf(W.br) > -1) W.br = ''; if (W.st === 's' && W.y > 1 && BR1.indexOf(W.br) > -1) W.br = ''; if (W.st !== 's') W.br = ''; } else W.br = v;
  step++; render();
}
function finish() {
  var S = A.T.S, old0 = S.pf && S.pf.ok ? S.pf.st + S.pf.y : '', pf = S.pf = { st: W.st, y: W.y, br: W.br, tg: W.tg || (W.st === 'p' ? 8 : 14), dg: W.dg, ok: 1 };
  S.nk = W.nk; S.g = W.dg * 6;
  var k0 = W.st + W.y, x0 = EXAMS[k0]; if (k0 !== old0) { S.bn = ''; S.hb = 0; if (x0 && (old0 || !S.bem)) S.bem = x0.d; } else if (x0 && !S.bem) S.bem = x0.d; var old = S.subjects.slice(), nx = [];
  W.subs.filter(function (s) { return s.on; }).forEach(function (s, i) {
    var f = old.find(function (o) { return o.name === s.n; }); if (f) return nx.push(f);
    var o = { id: A.T.uid(), name: s.n, c: i % 10, lessons: [] }; if (s.i) o.i = s.i; nx.push(o);
  });
  old.forEach(function (o) { if (nx.indexOf(o) < 0 && o.lessons.length) nx.push(o); });
  S.subjects = nx; S.open = null; close(); A.T.commit(); A.T.toast('تم تجهيز موقعك ✨');
}
function close() { var o = $('#ob'); if (o) o.remove(); document.body.style.overflow = ''; }
function start() {
  var S = A.T.S, pf = S.pf || {}; if (A.T.S.open) return;
  W = { st: pf.st || '', y: pf.y || 0, br: pf.br || '', nk: S.nk || '', tg: pf.tg || 0, dg: pf.dg || 60, subs: null }; step = 0;
  if (!$('#ob')) { document.body.insertAdjacentHTML('beforeend', '<div id="ob" class="ob" role="dialog" aria-modal="true" aria-labelledby="obT"><div class="obc" id="obc"></div></div>'); document.body.style.overflow = 'hidden'; }
  render();
}
X.ready.push(function () {
  A = X.api; applyProfile();
  document.addEventListener('click', function (e) {
    var ob = e.target.closest('#ob'); if (!ob) return; var b = e.target.closest('button'); if (!b) return; var id = steps()[step];
    if (b.hasAttribute('data-nx')) next();
    else if (b.hasAttribute('data-bk')) { if (id === 'me') W.nk = $('#obN').value.trim(); step--; render(); }
    else if (b.hasAttribute('data-skip')) close();
    else if (b.dataset.o != null) setOpt(id, b.dataset.o);
    else if (b.dataset.tg) { W.nk = $('#obN').value.trim(); W.tg = +b.dataset.tg; render(); }
    else if (b.dataset.dg) { W.nk = $('#obN').value.trim(); W.dg = +b.dataset.dg; render(); }
    else if (b.dataset.s != null) { W.subs[+b.dataset.s].on ^= 1; render(); }
    else if (b.hasAttribute('data-add')) A.T.ask({ msg: 'اسم المادة', input: '', ok: 'إضافة', max: 80 }).then(function (n) { if (n) { W.subs.push({ n: n, on: 1 }); render(); } });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && $('#ob') && e.target.id === 'obN') { e.preventDefault(); next(); } });
  $('#setBtn').addEventListener('click', function () { location.href = 'settings.html'; });
  var wantSetup = location.hash === '#setup'; if (wantSetup) history.replaceState(null, '', location.pathname + location.search);
  if (wantSetup || !(A.T.S.pf && A.T.S.pf.ok)) start();
});
})();
