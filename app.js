(function () {
'use strict';
var KEY = 'tracker-4am-2026-2027';
// مواد السنة الرابعة متوسط. قوائم الدروس فارغة عمدًا: تُضاف من المنهاج الرسمي أو الكتاب المدرسي.
var DEFAULT = ['اللغة العربية','الرياضيات','اللغة الفرنسية','اللغة الإنجليزية','علوم الطبيعة والحياة',
  'العلوم الفيزيائية والتكنولوجيا','التربية الإسلامية','التربية المدنية','التاريخ','الجغرافيا',
  'المعلوماتية','التربية التشكيلية','التربية الموسيقية','التربية البدنية والرياضية','اللغة الأمازيغية'];
var PAL = [['#0a84ff','#5e5ce6'],['#ff9f0a','#ff453a'],['#30d158','#00c7be'],['#bf5af2','#ff375f'],['#64d2ff','#0a84ff'],
  ['#ffd60a','#ff9f0a'],['#ff375f','#bf5af2'],['#5e5ce6','#bf5af2'],['#00c7be','#30d158'],['#ac8e68','#ff9f0a']];
var EMO = ['📖','➗','🗼','🔤','🧬','⚛️','🕌','⚖️','🏛️','🌍','💻','🎨','🎵','⚽','🔬','🧪','📐','✏️','📚','🧠'];
// المطابقة على النص بعد التطبيع (بلا تشكيل، وبهمزة موحّدة). الترتيب مهم: «بدني» قبل «رياض».
var ICONS = [['بدني','⚽'],['رياضه','⚽'],['عربي','📖'],['رياض','➗'],['فرنس','🗼'],['انجليز','🔤'],['انكليز','🔤'],
  ['فيزيا','⚛️'],['فزيا','⚛️'],['تكنولوج','⚛️'],['طبيع','🧬'],['حياه','🧬'],['اسلام','🕌'],['مدني','⚖️'],
  ['تاريخ','🏛️'],['جغراف','🌍'],['معلومات','💻'],['اعلام','💻'],['تشكيل','🎨'],['رسم','🎨'],['موسيق','🎵'],['امازيغ','ⵣ']];

var $ = function (s) { return document.querySelector(s); };
var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

function fresh() {
  return { term: 'all', open: null, subjects: DEFAULT.map(function (n, i) { return { id: uid(), name: n, c: i, lessons: [] }; }) };
}
function clean(d) {
  if (!d || !Array.isArray(d.subjects)) return null;
  var ok = function (v) { return typeof v === 'string' && /^[\w-]{1,24}$/.test(v); };
  var out = { term: /^[123]$/.test(String(d.term)) ? String(d.term) : 'all', open: null, subjects: [] };
  if (typeof d.bem === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.bem)) out.bem = d.bem;
  d.subjects.forEach(function (s, i) {
    if (!s || typeof s.name !== 'string' || !Array.isArray(s.lessons)) return;
    var o = { id: ok(s.id) ? s.id : uid() + i, name: s.name.slice(0, 80), c: (s.c !== null && isFinite(+s.c)) ? Math.abs(Math.round(+s.c)) % 100 : i, lessons: [] };
    if (typeof s.i === 'string' && s.i.length && s.i.length <= 8) o.i = s.i;
    s.lessons.forEach(function (l, k) {
      if (!l || typeof l.t !== 'string' || !l.t.trim()) return;
      var t = Math.round(+l.term);
      o.lessons.push({ id: ok(l.id) ? l.id : uid() + k, t: l.t.slice(0, 200), done: l.done === true, term: t >= 1 && t <= 3 ? t : 1, r: l.r === true });
    });
    out.subjects.push(o);
  });
  if (window.T4x) T4x.clean(d, out, ok);
  return out;
}
function load() { try { var d = JSON.parse(localStorage.getItem(KEY)); if (d = clean(d)) return d; } catch (e) {} return fresh(); }
var S = load(); S.open = null; S.term = S.term || 'all';
var tt;
function toast(m, undo) {
  var t = $('#toast'); t.textContent = m; t.classList.toggle('act', !!undo);
  if (undo) { var b = document.createElement('button'); b.textContent = 'تراجع'; b.onclick = function () { undo(); t.classList.remove('show'); }; t.appendChild(b); }
  t.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, undo ? 6000 : 2400);
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('تعذّر الحفظ في هذا المتصفح. صدّر نسخة احتياطية.'); } }

function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function theme(s) { var p = PAL[(s.c != null ? s.c : hash(s.id)) % PAL.length]; return '--c1:' + p[0] + ';--c2:' + p[1]; }
function norm(s) { return s.replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه'); }
function icon(s) { if (s.i) return esc(s.i); var n = norm(s.name); for (var i = 0; i < ICONS.length; i++) if (n.indexOf(ICONS[i][0]) > -1) return ICONS[i][1]; return '📚'; }
function vis(s) { return S.term === 'all' ? s.lessons : s.lessons.filter(function (l) { return String(l.term) === String(S.term); }); }
function stat(ls) { var d = ls.filter(function (l) { return l.done; }).length; return { d: d, n: ls.length, p: ls.length ? Math.round(d / ls.length * 100) : 0, r: ls.filter(function (l) { return l.r; }).length }; }
function meta(t) { return t.n ? t.d + ' من ' + nl(t.n) + (t.r ? ' · ' + t.r + ' للمراجعة' : '') : 'لا توجد دروس بعد'; }

function ringSm(p) {
  return '<span class="ring sm"><svg viewBox="0 0 60 60" aria-hidden="true"><circle class="bg" cx="30" cy="30" r="24" pathLength="100"/><circle class="fg" cx="30" cy="30" r="24" pathLength="100" data-p="' + p + '"/></svg><em>' + p + '%</em></span>';
}
function fill(root) {
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    root.querySelectorAll('.fg[data-p]').forEach(function (c) { c.style.strokeDashoffset = 100 - c.dataset.p; c.style.opacity = +c.dataset.p ? 1 : 0; });
  }); });
}
function countTo(el, to) {
  var from = el._v || 0, t0 = performance.now(); el._v = to;
  (function f(t) { var k = Math.min(1, (t - t0) / 700); k = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * k); if (k < 1) requestAnimationFrame(f); })(t0);
}

function totals() {
  var all = [], done = 0;
  S.subjects.forEach(function (s) { var ls = vis(s), t = stat(ls); all = all.concat(ls); if (t.n && t.p === 100) done++; });
  var t = stat(all); return { d: t.d, n: t.n, p: t.p, s: done };
}
function updateHero() {
  var t = totals();
  $('#hr').style.strokeDashoffset = 100 - t.p; $('#hr').style.opacity = t.p ? 1 : 0;
  countTo($('#pct'), t.p); countTo($('#cD'), t.d); countTo($('#cN'), t.n); countTo($('#cS'), t.s);
  $('#msg').textContent = !t.n ? 'أضف دروس موادك لتبدأ رحلتك.' : t.p === 0 ? 'ابدأ بأول درس. كل خطوة تُحسب.' :
    t.p < 50 ? 'بداية موفقة. واصل بنفس الإيقاع.' : t.p < 100 ? 'تجاوزتَ منتصف الطريق. أنت قريب جدًا.' : 'أنهيت كل الدروس. أحسنت!';
  updateBem();
}
function renderGrid() {
  var g = $('#grid');
  g.innerHTML = S.subjects.map(function (s, i) {
    var t = stat(vis(s));
    return '<article class="card" data-s="' + esc(s.id) + '" style="' + theme(s) + ';--i:' + i + '"><button class="cbtn" data-a="open" aria-haspopup="dialog">' +
      '<span class="ico">' + icon(s) + '</span><span class="txt"><b>' + esc(s.name) + '</b><small>' + meta(t) + '</small></span>' + ringSm(t.p) + '</button></article>';
  }).join('') || '<p class="empty">لا توجد مواد. اضغط «+ مادة» للبدء.</p>';
  fill(g);
}
function posThumb() {
  var b = document.querySelector('#terms button[aria-pressed="true"]'), th = $('.thumb'); if (!b) return;
  th.style.width = b.offsetWidth + 'px'; th.style.transform = 'translateX(' + b.offsetLeft + 'px)';
}
function renderAll() {
  document.querySelectorAll('#terms button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.term === String(S.term))); });
  posThumb(); renderGrid(); updateHero();
}
function commit() { save(); renderAll(); }

// ---------- نافذة المادة ----------
var sheet = $('#sheet'), panel = sheet.querySelector('.panel');
function cur() { return S.subjects.find(function (s) { return s.id === S.open; }); }
function termSel() {
  var c = S.term === 'all' ? '1' : String(S.term);
  return '<select name="term" aria-label="الفصل">' + [1, 2, 3].map(function (n) { return '<option value="' + n + '"' + (String(n) === c ? ' selected' : '') + '>الفصل ' + n + '</option>'; }).join('') + '</select>';
}
function li(l) {
  return '<li class="' + (l.done ? 'done' : '') + '"><label><input type="checkbox" data-l="' + l.id + '"' + (l.done ? ' checked' : '') +
    '><span class="ck"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" pathLength="1"/></svg></span><span class="lt">' + esc(l.t) +
    '</span></label><em>ف' + l.term + '</em><button class="x fl' + (l.r ? ' on' : '') + '" data-a="fl" data-l="' + l.id + '" aria-pressed="' + (l.r ? 'true' : 'false') + '" aria-label="علّم للمراجعة">🔖</button><button class="x" data-a="ed" data-l="' + l.id + '" aria-label="تعديل العنوان">✎</button><button class="x" data-a="dl" data-l="' + l.id + '" aria-label="حذف الدرس">✕</button></li>';
}
function sheetHTML(s) {
  var ls = vis(s), t = stat(ls);
  return '<span class="grip"></span><div class="ph"><span class="ico">' + icon(s) + '</span><div class="txt"><h3 id="sT">' + esc(s.name) + '</h3><small id="sM">' + meta(t) + '</small></div>' +
    '<div id="sR">' + ringSm(t.p) + '</div><button class="close" data-close aria-label="إغلاق">✕</button></div>' +
    '<div class="pb"><ul class="ls">' + (ls.map(li).join('') || '<li class="empty">لا توجد دروس هنا بعد. انسخ العناوين من فهرس الكتاب المدرسي أو من المنهاج الرسمي.</li>') + '</ul>' +
    '<form data-a="add"><input name="t" placeholder="عنوان درس جديد" required>' + termSel() + '<button>إضافة</button></form>' +
    '<details><summary>إضافة عدة دروس دفعة واحدة</summary><form data-a="bulk"><textarea name="t" rows="5" placeholder="اكتب درسًا في كل سطر"></textarea>' + termSel() + '<button>إضافة الكل</button></form></details>' +
    '<details><summary>تغيير الأيقونة</summary><div class="icons">' + EMO.map(function (e) { return '<button type="button" class="pill ic" data-a="ic" data-e="' + e + '">' + e + '</button>'; }).join('') + '</div></details>' +
    '<div class="row"><button class="pill" data-a="rn">إعادة تسمية المادة</button><button class="pill danger" data-a="ds">حذف المادة</button></div></div>';
}
function rebuild(focus) {
  var s = cur(), pb = panel.querySelector('.pb'), sc = pb ? pb.scrollTop : 0;
  panel.innerHTML = sheetHTML(s); fill(panel);
  var n = panel.querySelector('.pb'); n.scrollTop = sc;
  if (focus) { var i = panel.querySelector('input[name=t]'); if (i) i.focus(); }
  save(); updateHero();
}
function openSheet(id) {
  S.open = id; var s = cur();
  panel.setAttribute('style', theme(s)); panel.innerHTML = sheetHTML(s);
  sheet.hidden = false; document.body.style.overflow = 'hidden';
  requestAnimationFrame(function () { requestAnimationFrame(function () { sheet.classList.add('on'); fill(panel); }); });
  setTimeout(function () { var c = panel.querySelector('.close'); if (c) c.focus(); }, 350);
}
function closeSheet() {
  if (sheet.hidden) return;
  var oid = S.open; sheet.classList.remove('on'); document.body.style.overflow = ''; S.open = null; save();
  setTimeout(function () { if (!S.open) sheet.hidden = true; }, 380);
  renderGrid();
  var cb = oid && $('.card[data-s="' + oid + '"] .cbtn'); if (cb) cb.focus({ preventScroll: true });
}
function pushLessons(s, lines, term) {
  lines.forEach(function (t) { t = t.trim(); if (t) s.lessons.push({ id: uid(), t: t, done: false, term: Number(term) }); });
}
function burst() {
  if (calm) return;
  var fx = $('#fx'), cols = ['#0a84ff', '#bf5af2', '#ff375f', '#ff9f0a', '#30d158', '#ffd60a'];
  for (var i = 0; i < 46; i++) {
    var p = document.createElement('span'), a = Math.random() * Math.PI * 2, d = 140 + Math.random() * 320;
    p.style.cssText = 'position:absolute;left:50%;top:55%;width:9px;height:14px;border-radius:2px;background:' + cols[i % 6];
    fx.appendChild(p);
    p.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
      { transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 160) + 'px) rotate(' + (Math.random() * 720 - 360) + 'deg)', opacity: 0 }],
      { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.1,.8,.3,1)' }).onfinish = (function (n) { return function () { n.remove(); }; })(p);
  }
}

sheet.addEventListener('click', function (e) {
  var b = e.target.closest('[data-close],[data-a]'); if (!b) return;
  if (b.hasAttribute('data-close')) return closeSheet();
  var s = cur(), a = b.dataset.a;
  var fnd = function () { return s.lessons.find(function (x) { return x.id === b.dataset.l; }); };
  if (a === 'dl') { var bk = snap(); s.lessons = s.lessons.filter(function (l) { return l.id !== b.dataset.l; }); rebuild(); toast('حُذف الدرس', function () { undoTo(bk, true); }); }
  else if (a === 'fl') { var fl = fnd(); if (fl) { fl.r = !fl.r; rebuild(); } }
  else if (a === 'ed') { var el = fnd(); if (el) ask({ msg: 'تعديل عنوان الدرس', input: el.t, ok: 'حفظ' }).then(function (v) { if (v) { el.t = v.slice(0, 200); rebuild(); } }); }
  else if (a === 'ic') { s.i = b.dataset.e; rebuild(); }
  else if (a === 'rn') { ask({ msg: 'الاسم الجديد للمادة', input: s.name, ok: 'حفظ', max: 80 }).then(function (n) { if (n) { s.name = n; rebuild(); } }); }
  else if (a === 'ds') { ask({ msg: 'حذف «' + s.name + '» وكل دروسها؟', ok: 'حذف', danger: 1 }).then(function (y) { if (!y) return; var bk2 = snap(); S.subjects = S.subjects.filter(function (x) { return x !== s; }); S.open = null; closeSheet(); updateHero(); toast('حُذفت المادة', function () { undoTo(bk2); }); }); }
});
sheet.addEventListener('change', function (e) {
  var c = e.target; if (!c.matches('input[data-l]')) return;
  var s = cur(), l = s.lessons.find(function (x) { return x.id === c.dataset.l; }); if (!l) return;
  var was = stat(vis(s)).p; l.done = c.checked; if (c.checked && navigator.vibrate) navigator.vibrate(8);
  c.closest('li').classList.toggle('done', c.checked); save();
  var t = stat(vis(s)), r = $('#sR');
  $('#sM').textContent = meta(t); r.querySelector('.fg').style.strokeDashoffset = 100 - t.p; r.querySelector('.fg').style.opacity = t.p ? 1 : 0; r.querySelector('em').textContent = t.p + '%';
  updateHero(); if (t.p === 100 && was < 100) burst();
});
sheet.addEventListener('submit', function (e) {
  e.preventDefault();
  var f = e.target, s = cur();
  pushLessons(s, f.dataset.a === 'bulk' ? f.elements.t.value.split('\n') : [f.elements.t.value], f.elements.term.value);
  rebuild(true);
});
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dlg.open) closeSheet(); });

// ---------- الشبكة والتأثيرات ----------
var grid = $('#grid');
grid.addEventListener('click', function (e) {
  var c = e.target.closest('.card'); if (c && e.target.closest('[data-a="open"]')) openSheet(c.dataset.s);
});
grid.addEventListener('pointermove', function (e) {
  var c = e.target.closest('.card'); if (!c) return;
  var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
  if (e.pointerType === 'mouse' && !calm) c.style.transform = 'perspective(800px) rotateX(' + ((.5 - y) * 8) + 'deg) rotateY(' + ((x - .5) * 8) + 'deg) translateY(-4px)';
});
grid.addEventListener('pointerout', function (e) {
  var c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) c.style.transform = '';
});
setTimeout(function () { grid.classList.remove('intro'); }, 1800);

$('#terms').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { S.term = b.dataset.term; commit(); } });
$('#addSubject').addEventListener('click', function () {
  ask({ msg: 'اسم المادة الجديدة', input: '', ok: 'إضافة', max: 80 }).then(function (n) {
    if (n) { var s = { id: uid(), name: n, c: S.subjects.length % PAL.length, lessons: [] }; S.subjects.push(s); commit(); openSheet(s.id); }
  });
});
$('#exp').addEventListener('click', function () {
  var nm = 'tracker-4am-' + new Date().toISOString().slice(0, 10) + '.json';
  try { var fo = new File([JSON.stringify(S, null, 2)], nm, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [fo] })) { navigator.share({ files: [fo] }).catch(function () {}); return; } } catch (e) {}
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
  a.download = 'متابعة-4-متوسط-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); toast('تم تصدير النسخة الاحتياطية');
});
$('#imp').addEventListener('click', function () { $('#file').click(); });
$('#file').addEventListener('change', function (e) {
  var f = e.target.files[0]; if (!f) return; var r = new FileReader();
  r.onload = function () {
    try { var d = clean(JSON.parse(r.result)); if (!d) throw 0;
      ask({ msg: 'استبدال بياناتك الحالية بهذه النسخة؟', ok: 'استبدال', danger: 1 }).then(function (y) { if (!y) return; var bk3 = snap(); S = d; commit(); toast('تم الاستيراد', function () { undoTo(bk3); }); });
    } catch (x) { toast('الملف غير صالح'); }
  };
  r.readAsText(f); e.target.value = '';
});
$('#rst').addEventListener('click', function () { ask({ msg: 'مسح كل الدروس والتقدّم من هذا الجهاز؟', ok: 'مسح', danger: 1 }).then(function (y) { if (!y) return; var bk4 = snap(); S = fresh(); commit(); toast('تم المسح', function () { undoTo(bk4); }); }); });

// ---------- العد التنازلي ----------
var BEM_DEFAULT = '2027-06-06';
function daysLeft() {
  var p = (S.bem || BEM_DEFAULT).split('-'), n = new Date();
  return Math.round((new Date(+p[0], +p[1] - 1, +p[2]) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5);
}
function dayWord(n) { return n === 1 ? 'يوم' : n === 2 ? 'يومان' : n <= 10 ? 'أيام' : 'يومًا'; }
function updateBem() {
  var d = daysLeft(), done = 0, tot = 0;
  S.subjects.forEach(function (s) { tot += s.lessons.length; done += s.lessons.filter(function (l) { return l.done; }).length; });
  countTo($('#bemD'), Math.max(d, 0));
  $('#bemU').textContent = d > 0 ? dayWord(d) + ' حتى الامتحان' : d === 0 ? 'الامتحان اليوم. بالتوفيق!' : 'انتهى الموعد';
  $('#bemS').textContent = d > 0 ? 'ما يعادل نحو ' + Math.max(1, Math.round(d / 7)) + ' أسبوعًا.' : '';
  var rem = tot - done, r = rem / (d / 7);
  $('#bemP').textContent = !tot ? 'أضف دروسك ليحسب لك الموقع الوتيرة المناسبة.' : !rem ? 'أنهيت كل الدروس المضافة.' :
    d > 0 ? 'تبقّى ' + nl(rem) + '. الوتيرة المناسبة: ' + (r <= 1 ? 'درس واحد' : nl(Math.ceil(r))) + ' أسبوعيًا.' : '';
  if (document.activeElement !== $('#bemDate')) $('#bemDate').value = S.bem || BEM_DEFAULT;
}
$('#bemDate').addEventListener('change', function (e) { if (e.target.value) { S.bem = e.target.value; save(); updateBem(); } });
setInterval(updateBem, 60000);

// ---------- مساعدات ----------
function nl(n) { return n === 1 ? 'درس واحد' : n === 2 ? 'درسان' : n <= 10 ? n + ' دروس' : n + ' درسًا'; }
function snap() { return JSON.stringify(S); }
function undoTo(b, keep) {
  var id = keep ? S.open : null; S = clean(JSON.parse(b)); S.open = id; save(); renderAll();
  if (id && !sheet.hidden && cur()) rebuild();
}
var dlg = $('#dlg');
function ask(o) {
  return new Promise(function (res) {
    var inp = o.input != null ? '<input name="v" autocomplete="off" maxlength="' + (o.max || 200) + '">' : '';
    dlg.innerHTML = '<form method="dialog" class="' + (o.danger ? 'dg' : '') + '"><h3 id="dT"></h3>' + inp + '<div class="row"><button value="ok">' + esc(o.ok || 'موافق') + '</button><button value="no">إلغاء</button></div></form>';
    dlg.querySelector('h3').textContent = o.msg;
    var i = dlg.querySelector('input'); if (i) i.value = o.input;
    dlg.onclose = function () { res(dlg.returnValue === 'ok' ? (i ? i.value.trim() : true) : null); };
    dlg.returnValue = ''; dlg.showModal(); if (i) { i.focus(); i.select(); }
  });
}

// ---------- المظهر: تلقائي / فاتح / داكن ----------
var TK = 'tracker-4am-theme', mode = 'auto';
try { mode = localStorage.getItem(TK) || 'auto'; } catch (e) {}
var MN = { auto: 'تلقائي', light: 'فاتح', dark: 'داكن' }, MI = { auto: '🌓', light: '☀️', dark: '🌙' };
function setMode(m, say) {
  mode = m; var r = document.documentElement;
  if (m === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', m);
  var dk = m === 'dark' || (m === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name=theme-color]').setAttribute('content', dk ? '#000000' : '#f2f2f7');
  var b = $('#themeBtn'); b.textContent = MI[m]; b.setAttribute('aria-label', 'المظهر: ' + MN[m] + ' (اضغط للتغيير)');
  if (say) { try { localStorage.setItem(TK, m); } catch (e) {} toast('المظهر: ' + MN[m]); }
}
setMode(MN[mode] ? mode : 'auto');
$('#themeBtn').addEventListener('click', function () { setMode(mode === 'auto' ? 'light' : mode === 'light' ? 'dark' : 'auto', true); });
if (matchMedia('(prefers-color-scheme: dark)').addEventListener) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { if (mode === 'auto') setMode('auto'); });

// ---------- اسحب رأس النافذة للأسفل لإغلاقها (الهاتف) ----------
var ty = null;
panel.addEventListener('touchstart', function (e) { if (innerWidth >= 700 || !e.target.closest('.ph')) return; ty = e.touches[0].clientY; panel.style.transition = 'none'; }, { passive: true });
panel.addEventListener('touchmove', function (e) { if (ty !== null) panel.style.transform = 'translateY(' + Math.max(0, e.touches[0].clientY - ty) + 'px)'; }, { passive: true });
function endDrag(e) { if (ty === null) return; var d = e.changedTouches[0].clientY - ty; ty = null; panel.style.transition = ''; panel.style.transform = ''; if (d > 90) closeSheet(); }
panel.addEventListener('touchend', endDrag); panel.addEventListener('touchcancel', endDrag);
if (navigator.storage && navigator.storage.persist) navigator.storage.persist();

window.T4 = { get S() { return S; }, save: save, toast: toast, ask: ask, esc: esc, snap: snap, undoTo: undoTo, theme: theme };
renderAll();
addEventListener('resize', posThumb);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(posThumb);
if (window.T4x) T4x.init(window.T4);
})();
