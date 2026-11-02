(function () {
'use strict';
const $ = s => document.querySelector(s), esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const K = { main: 'tracker-4am-2026-2027', ui: 'tracker-4am-ui', th: 'tracker-4am-theme', ai: 'tracker-4am-ai2', bk: 'tracker-4am-bk', tm: 'tracker-4am-tm', ts: 'tracker-4am-ts' };
const rd = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast('تعذّر الحفظ: ربما المساحة ممتلئة'); return false; } };
let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2400); };
const LV = { p: ['ابتدائي', ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة']], m: ['متوسط', ['الأولى', 'الثانية', 'الثالثة', 'الرابعة']], s: ['ثانوي', ['الأولى', 'الثانية', 'الثالثة']] };
// مواعيد تقديرية: لم أجد إعلانًا رسميًا مؤكدًا للامتحانات الوطنية 2027 وقت كتابة هذا الملف.
const EX = { m4: { n: 'شهادة التعليم المتوسط', d: '2027-06-07' }, s3: { n: 'شهادة البكالوريا', d: '2027-06-13' } };
let S = rd(K.main), aiM = '';
const dis = () => S ? '' : ' disabled';
const U = () => rd(K.ui) || {}, P = (k, d) => { const v = U()[k]; return v == null ? d : v; };
function applyUi() { const r = document.documentElement, u = U(); ['ac', 'fs'].forEach(k => u[k] ? r.setAttribute('data-' + k, u[k]) : r.removeAttribute('data-' + k)); u.mo === 'off' ? r.setAttribute('data-mo', 'off') : r.removeAttribute('data-mo'); u.ob === 0 ? r.setAttribute('data-ob', 'off') : r.removeAttribute('data-ob'); }
const setU = (k, v) => { const u = U(); if (v == null) delete u[k]; else u[k] = v; wr(K.ui, u); applyUi(); };
const th = () => { try { return localStorage.getItem(K.th) || 'dark'; } catch (e) { return 'dark'; } };
function applyTh(m) { const r = document.documentElement; m === 'auto' ? r.removeAttribute('data-theme') : r.setAttribute('data-theme', m); const dk = m === 'dark' || (m === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches); $('meta[name=theme-color]').setAttribute('content', dk ? '#000000' : '#f2f2f7'); }
const saveS = () => { if (!S) return; S.open = null; wr(K.main, S); try { localStorage.setItem(K.ts, Date.now()); } catch (e) {} toast('تم الحفظ ✓'); };
const lvKey = () => S && S.pf && S.pf.ok ? S.pf.st + S.pf.y : '';
const scale = () => S && S.pf && S.pf.st === 'p' ? 10 : 20;
function ask(o) {
  const d = $('#dlg'); return new Promise(res => {
    d.innerHTML = '<form method="dialog" class="' + (o.danger ? 'dg' : '') + '"><h3 id="dT"></h3><div class="row"><button value="ok">' + esc(o.ok || 'موافق') + '</button><button value="no">إلغاء</button></div></form>'; d.querySelector('h3').textContent = o.msg;
    d.onclose = () => res(d.returnValue === 'ok'); d.returnValue = ''; if (d.open) d.close(); d.showModal();
  });
}

// ---------- مكوّنات الواجهة ----------
const sec = (id, ic, t, body) => '<section class="sg" id="sec-' + id + '"><h2><span>' + ic + '</span>' + t + '</h2>' + body + '</section>';
const row = (l, c, h) => '<div class="srow"><div class="sl"><b>' + l + '</b>' + (h ? '<small>' + h + '</small>' : '') + '</div><div class="sc">' + c + '</div></div>';
const sw = (h, on, off) => '<label class="sw"><input type="checkbox" data-h="' + h + '"' + (on ? ' checked' : '') + (off ? ' disabled' : '') + '><i></i></label>';
const seg = (h, o, cur) => '<div class="segm">' + o.map(x => '<button type="button" data-h="' + h + '" data-v="' + x[0] + '" class="' + (String(x[0]) === String(cur) ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div>';
const num = (h, v, a, b, st, un, off) => '<input class="ni" type="number" inputmode="decimal" data-h="' + h + '" value="' + (v == null ? '' : v) + '" min="' + a + '" max="' + b + '" step="' + st + '"' + (off ? ' disabled' : '') + '>' + (un ? '<span class="mut">' + un + '</span>' : '');
const needS = () => S ? '' : '<p class="tip">افتح الموقع الرئيسي مرة واحدة ليتم إنشاء بياناتك، ثم عد إلى هنا.</p>';

function sProfile() {
  const pf = S && S.pf && S.pf.ok ? S.pf : null, L = pf ? LV[pf.st] : null;
  return sec('profile', '👤', 'الملف الشخصي', needS() + row('الاسم أو اللقب', '<input class="ti" maxlength="20" data-h="nk" value="' + esc(S && S.nk) + '"' + dis() + '>', 'يظهر في التحدّي وتقرير الأولياء. لا تضع اسمك الكامل.') +
    row('المستوى', L ? '<b>السنة ' + L[1][pf.y - 1] + ' ' + L[0] + (pf.br ? ' · ' + esc(pf.br) : '') + '</b>' : '<span class="mut">غير محدد</span>') + row('تغيير المستوى والمواد', '<button class="pill pri" data-h="lvl"' + dis() + '>فتح المعالج</button>', 'يعيد أسئلة الإعداد دون أن يمسح دروسك.'));
}
function sLook() {
  const ac = [['', '#0a84ff'], ['purple', '#bf5af2'], ['green', '#30d158'], ['orange', '#ff9f0a'], ['pink', '#ff375f']], cur = U().ac || '';
  return sec('look', '🎨', 'المظهر', row('الثيم', seg('th', [['dark', '🌙 داكن'], ['light', '☀️ فاتح'], ['auto', '🌓 تلقائي']], th())) +
    row('لون التمييز', '<div class="swr">' + ac.map(a => '<button type="button" class="swatch' + (a[0] === cur ? ' on' : '') + '" data-h="ac" data-v="' + a[0] + '" style="background:' + a[1] + '" aria-label="لون"></button>').join('') + '</div>') +
    row('حجم الخط', seg('fs', [['sm', 'صغير'], ['md', 'عادي'], ['lg', 'كبير']], U().fs || 'md')) + row('الخلفية المتحركة', sw('ob', P('ob', 1) !== 0), 0) + row('تقليل الحركة', sw('mo', U().mo === 'off'), 0));
}
function sStudy() {
  const all = [10, 15, 20, 25, 30, 45, 60, 90], cur = P('du', [15, 25, 45, 60]);
  return sec('study', '⏱', 'الدراسة والتركيز', row('مدد جلسات التركيز', '<div class="segm wrap">' + all.map(m => '<button type="button" data-h="du" data-v="' + m + '" class="' + (cur.indexOf(m) > -1 ? 'on' : '') + '">' + m + 'د</button>').join('') + '</div>', 'اختر ما تريد ظهوره في وضع التركيز.') +
    row('صوت عند انتهاء المؤقت', sw('sd', P('sd', 1) !== 0)) + row('اهتزاز (الهاتف)', sw('vb', P('vb', 1) !== 0), 'عند الإنجاز وانتهاء المؤقت') +
    row('هدف الأسبوع', num('wg', S ? Math.round((S.g || 300) / 6) / 10 : '', .5, 100, .5, 'ساعة', !S), '') +
    row('هدف اليوم', num('dg', S && S.pf ? S.pf.dg : '', 10, 600, 5, 'دقيقة', !(S && S.pf)), '') +
    row('المعدل المستهدف', num('tg', S && S.pf ? S.pf.tg : '', 0, scale(), .5, '/ ' + scale(), !(S && S.pf)), 'يستعمله محاكي المعدل') +
    row('وزن معدل السنة في النهائي', num('w', S ? Math.round((S.w == null ? .5 : S.w) * 100) : '', 0, 100, 5, '%', !S), 'تأكد من الصيغة الرسمية للوزارة') +
    row('تذكير بالدراسة', '<select class="sel" data-h="rm">' + [[0, 'بدون'], [16, '4 مساءً'], [18, '6 مساءً'], [20, '8 مساءً'], [21, '9 مساءً']].map(o => '<option value="' + o[0] + '"' + (P('rm', 0) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>', 'يظهر عند فتح الموقع بعد هذه الساعة إن لم تدرس اليوم'));
}
function sExam() {
  const d = EX[lvKey()], on = S && !S.hb && (d || S.bn);
  return sec('exam', '📅', 'العد التنازلي للامتحان', needS() + row('إظهار العد التنازلي', sw('cd', !!on, !S)) + row('اسم الامتحان أو الهدف', '<input class="ti" maxlength="40" data-h="bn" placeholder="' + esc(d ? d.n : 'مثال: اختبار الفصل الأول') + '" value="' + esc(S && S.bn) + '"' + dis() + '>') +
    row('الموعد', '<input class="ni dt" type="date" data-h="bd" value="' + esc(S && (S.bem || (d ? d.d : ''))) + '"' + dis() + '>', d ? 'الموعد الافتراضي تقديري، لم أجد إعلانًا رسميًا مؤكدًا للامتحانات الوطنية 2027. تأكد من موقع وزارة التربية أو الديوان الوطني (onec.dz) وعدّله.' : 'مستواك ليس فيه امتحان وطني، لكن تستطيع وضع عدّاد لأي موعد تريده.') +
    row('استرجاع الافتراضي', '<button class="pill" data-h="bdreset"' + dis() + '>استرجاع</button>'));
}
function sParents() {
  const p = S && S.pp || { t: 1, a: 1 };
  return sec('parents', '👨‍👩‍👦', 'مراقبة الأولياء', row('مشاركة وقت الدراسة وسلسلة الأيام', sw('pt', p.t !== 0, !S)) + row('مشاركة المعدلات', sw('pa', p.a !== 0, !S)) +
    '<p class="mut">لإنشاء رابط وليّ الأمر: الصفحة الرئيسية ← الأدوات ← «مراقبة الأولياء». وصفحة الولي هي <a href="parents.html">parents.html</a>.</p>');
}
function sAi() {
  const k = rd(K.ai) || { m: '', md: 'fast' }, m = aiM || k.m || 'key'; aiM = m;
  return sec('ai', '🤖', 'المدرّب الذكي', '<div class="srow"><div class="sl"><b>طريقة الاتصال</b><small>' + (k.m === 'key' ? (k.k ? '🟢 مفتاح شخصي محفوظ' : '⚪') : k.m === 'srv' ? (k.u ? '🟢 خادم محفوظ' : '⚪') : '⚪ غير مفعّل') + '</small></div><div class="sc">' + seg('aim', [['key', '🔑 مفتاحي'], ['srv', '🌐 خادم']], m) + '</div></div>' +
    '<form data-f="aisave">' + (m === 'key' ? '<input class="ti" name="k" type="password" dir="ltr" placeholder="sk-ant-…" autocomplete="off" value="' + esc(k.k) + '">' : '<input class="ti" name="u" type="url" dir="ltr" placeholder="https://….workers.dev" value="' + esc(k.u) + '">') +
    '<select class="sel" name="md"><option value="fast"' + (k.md !== 'smart' ? ' selected' : '') + '>سريع واقتصادي</option><option value="smart"' + (k.md === 'smart' ? ' selected' : '') + '>أذكى (أغلى)</option></select><button>حفظ</button></form>' +
    '<div class="chs"><button class="pill" data-h="aitest">🔌 اختبار الاتصال</button><button class="pill danger" data-h="aiclr">حذف</button></div><p id="aist" class="mut"></p><p class="mut">المفتاح يُحفظ في هذا المتصفح فقط ولا يدخل في النسخ الاحتياطي ولا في المزامنة. استعمل «خادم» (ملف ai-worker.js) إذا كان تلاميذ آخرون سيستعملون موقعك.</p>');
}
function sAcct() {
  const c = Sync.cfg(), on = Sync.ready(); let b;
  const sql = '<details><summary>كود SQL لإنشاء الجدول (مرة واحدة)</summary><pre class="sql">' + esc(Sync.sql) + '</pre></details>';
  if (!c.u || !c.k) b = '<div class="tip"><b>هل تحتاج حسابًا؟</b> الموقع يعمل كاملًا بدونه. الحساب مفيد فقط إذا أردت فتح بياناتك من عدة أجهزة أو حفظ نسخة خارج المتصفح. بما أن كثيرًا من المستعملين قاصرون، فالأحسن أن يُنشأ الحساب بعلم ولي الأمر وببريده.</div>' +
    '<ol class="stp"><li>أنشئ مشروعًا مجانيًا في <b>supabase.com</b>.</li><li>من <b>SQL Editor</b> نفّذ الكود أدناه.</li><li>من <b>Project Settings ← API</b> انسخ <b>Project URL</b> و<b>المفتاح العام</b> (anon أو publishable) فقط، ولا تضع أبدًا مفتاح service_role أو secret.</li></ol>' + sql +
    '<form data-f="syncfg"><input class="ti" name="u" type="url" placeholder="https://xxxx.supabase.co" dir="ltr" required><input class="ti" name="k" placeholder="المفتاح العام" dir="ltr" required><button>حفظ</button></form>';
  else if (!on) b = '<p class="mut">المشروع: <b dir="ltr">' + esc(c.u) + '</b></p><form data-f="login"><input class="ti" name="e" type="email" placeholder="البريد الإلكتروني" dir="ltr" autocomplete="email" required><input class="ti" name="p" type="password" placeholder="كلمة المرور (8 أحرف على الأقل)" dir="ltr" autocomplete="current-password" minlength="8" required><button value="in">دخول</button><button value="up" class="alt">إنشاء حساب</button></form><div class="chs"><button class="pill danger" data-h="syncclr">حذف إعدادات الخادم</button></div>' + sql;
  else b = '<p>مسجّل باسم <b dir="ltr">' + esc(c.em) + '</b>' + (c.last ? '<br><small class="mut">آخر رفع: ' + esc(new Date(c.last).toLocaleString('ar')) + '</small>' : '') + '</p>' + row('مزامنة تلقائية', sw('auto', !!c.auto), 0) + '<p class="mut">تُرفع بياناتك بعد كل تغيير بخمس ثوانٍ تقريبًا، وعند فتح الموقع يُعرض عليك استبدال بياناتك إن وُجدت نسخة أحدث في الحساب. الأحدث يفوز، فلا تعدّل من جهازين في الوقت نفسه.</p>' +
    '<div class="chs"><button class="pill pri" data-h="push">⬆️ رفع الآن</button><button class="pill" data-h="pull">⬇️ جلب من الحساب</button><button class="pill" data-h="logout">خروج</button><button class="pill danger" data-h="wipe">حذف بياناتي من الخادم</button></div><p id="syst" class="mut"></p>';
  return sec('acct', '☁️', 'الحساب والمزامنة (اختياري)', b);
}
const kb = n => Math.round(n / 1024) + ' ك.ب';
function sData() {
  const bk = rd(K.bk) || []; let used = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); used += (k.length + (localStorage.getItem(k) || '').length) * 2; } } catch (e) {}
  return sec('data', '💾', 'البيانات والنسخ الاحتياطي', row('نسخة احتياطية تلقائية يومية', sw('ab', P('ab', 1) !== 0), 'تحفظ آخر 5 نسخ في هذا المتصفح') +
    '<div class="chs"><button class="pill pri" data-h="exp"' + dis() + '>⬇️ تصدير</button><button class="pill" data-h="imp">⬆️ استيراد</button><button class="pill" data-h="bknow"' + dis() + '>📌 نسخة الآن</button></div>' +
    '<ul class="ls bkl">' + (bk.slice().reverse().map((b, i) => { let n = 0; try { n = JSON.parse(b.s).subjects.length; } catch (e) {} return '<li><span class="txt"><b>' + esc(b.d) + '</b><small>' + n + ' مواد · ' + kb(b.s.length * 2) + '</small></span><button class="pill" data-h="bkres" data-v="' + (bk.length - 1 - i) + '">استرجاع</button></li>'; }).join('') || '<li class="empty">لا توجد نسخ تلقائية بعد.</li>') + '</ul>' +
    '<p class="mut">المساحة المستعملة في المتصفح: ' + kb(used) + '</p><h4>منطقة الخطر</h4><div class="chs"><button class="pill" data-h="clrlog"' + dis() + '>مسح سجل الدراسة</button><button class="pill" data-h="rstui">إعادة ضبط الإعدادات</button><button class="pill danger" data-h="rst"' + dis() + '>مسح كل البيانات</button></div>');
}
const sAbout = () => sec('about', 'ℹ️', 'حول', '<p class="mut">متابعة دراسية · الإصدار 5. بياناتك تبقى في متصفحك ما لم تفعّل المزامنة بنفسك. لا يوجد تتبّع ولا إعلانات.</p>');

function render() {
  const secs = [['profile', 'الملف'], ['look', 'المظهر'], ['study', 'الدراسة'], ['exam', 'الامتحان'], ['parents', 'الأولياء'], ['ai', 'المدرّب'], ['acct', 'الحساب'], ['data', 'البيانات']];
  $('#app').innerHTML = '<nav class="snav">' + secs.map(s => '<a class="pill" href="#sec-' + s[0] + '">' + s[1] + '</a>').join('') + '</nav>' + [sProfile, sLook, sStudy, sExam, sParents, sAi, sAcct, sData, sAbout].map(f => f()).join('');
}
function addBk(label, s) { const bk = rd(K.bk) || []; bk.push({ d: label, s: s || localStorage.getItem(K.main) || '' }); while (bk.length > 5) bk.shift(); wr(K.bk, bk); }
const nowL = () => { const d = new Date(), p = n => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); };
function errAi(e) { const s = e && e.s; return s === 401 ? 'المفتاح غير صالح.' : s === 403 ? 'الطلب مرفوض (تحقق من ALLOWED_ORIGIN في الخادم).' : s === 404 || s === 405 ? 'رابط الخادم غير صحيح.' : s === 429 ? 'طلبات كثيرة.' : s ? 'خطأ ' + s : 'تعذّر الاتصال (الإنترنت أو CORS، ولا يعمل من file://).'; }

// ---------- المعالجات (تُرجع true لإعادة الرسم) ----------
const H = {
  nk: v => { S.nk = v.trim().slice(0, 20); saveS(); }, lvl: () => { location.href = 'index.html#setup'; },
  th: v => { try { localStorage.setItem(K.th, v); } catch (e) {} applyTh(v); return 1; },
  ac: v => { setU('ac', v || null); return 1; }, fs: v => { setU('fs', v === 'md' ? null : v); return 1; }, ob: c => setU('ob', c ? null : 0), mo: c => setU('mo', c ? 'off' : null),
  du: v => { const cur = P('du', [15, 25, 45, 60]).slice(), m = +v, i = cur.indexOf(m); if (i > -1) { if (cur.length < 2) return toast('اترك مدة واحدة على الأقل'); cur.splice(i, 1); } else cur.push(m); setU('du', cur.sort((a, b) => a - b)); return 1; },
  sd: c => setU('sd', c ? null : 0), vb: c => setU('vb', c ? null : 0), ab: c => setU('ab', c ? null : 0), rm: v => setU('rm', +v || null),
  wg: v => { const h = parseFloat(v); if (h >= .5 && h <= 100) { S.g = Math.round(h * 60); saveS(); } }, dg: v => { const m = parseFloat(v); if (S.pf && m >= 10 && m <= 600) { S.pf.dg = Math.round(m); saveS(); } },
  tg: v => { const t = parseFloat(v); if (S.pf && t >= 0 && t <= scale()) { S.pf.tg = t; saveS(); } }, w: v => { const p = parseFloat(v); if (p >= 0 && p <= 100) { S.w = p / 100; saveS(); } },
  cd: c => { S.hb = c ? 0 : 1; if (c && !EX[lvKey()] && !S.bn) { S.bn = 'موعدي'; if (!S.bem) S.bem = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10); } if (c && EX[lvKey()] && !S.bem) S.bem = EX[lvKey()].d; saveS(); return 1; },
  bn: v => { S.bn = v.trim().slice(0, 40); if (S.bn && !S.bem) S.bem = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10); saveS(); }, bd: v => { if (/^\d{4}-\d{2}-\d{2}$/.test(v)) { S.bem = v; saveS(); } },
  bdreset: () => { const d = EX[lvKey()]; if (d) S.bem = d.d; else delete S.bem; S.bn = ''; saveS(); return 1; },
  pt: c => { S.pp = S.pp || { t: 1, a: 1, ts: '' }; S.pp.t = c ? 1 : 0; saveS(); }, pa: c => { S.pp = S.pp || { t: 1, a: 1, ts: '' }; S.pp.a = c ? 1 : 0; saveS(); },
  aim: v => { aiM = v; return 1; },
  aitest: async () => {
    const k = rd(K.ai) || {}, s = $('#aist'); if (!(k.m === 'key' ? k.k : k.u)) { s.textContent = 'احفظ الإعدادات أولًا.'; return; } s.textContent = 'جارٍ الاختبار…';
    try { const r = k.m === 'key' ? await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': k.k, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: k.md === 'smart' ? 'claude-sonnet-5-5' : 'claude-haiku-5-5', max_tokens: 20, messages: [{ role: 'user', content: 'أجب بكلمة: مرحبا' }] }) })
      : await fetch(k.u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ctx: { subject: '', weak: [] }, messages: [{ role: 'user', content: 'مرحبا' }] }) });
      if (!r.ok) throw { s: r.status }; s.textContent = '✅ الاتصال يعمل!'; } catch (e) { s.textContent = '❌ ' + errAi(e); }
  },
  aiclr: () => ask({ msg: 'حذف إعدادات الذكاء الاصطناعي؟', ok: 'حذف', danger: 1 }).then(y => { if (y) { try { localStorage.removeItem(K.ai); } catch (e) {} aiM = ''; render(); } }),
  auto: c => { const k = Sync.cfg(); k.auto = c ? 1 : 0; Sync.save(k); },
  push: async () => { const s = $('#syst'); s.textContent = 'جارٍ الرفع…'; try { await Sync.push(localStorage.getItem(K.main) || '{}'); toast('تم الرفع ✓'); render(); } catch (e) { s.textContent = '❌ ' + Sync.err(e); } },
  pull: async () => { const s = $('#syst'); s.textContent = 'جارٍ الجلب…'; try { const r = await Sync.pull(); if (!r) { s.textContent = 'لا توجد نسخة في حسابك بعد.'; return; } if (await ask({ msg: 'استبدال بيانات هذا الجهاز بنسخة الحساب؟ (تُحفظ نسخة احتياطية قبل ذلك)', ok: 'استبدال', danger: 1 })) { addBk('قبل الجلب ' + nowL()); wr(K.main, r.data); S = rd(K.main); toast('تم الجلب ✓'); render(); } else s.textContent = ''; } catch (e) { s.textContent = '❌ ' + Sync.err(e); } },
  logout: () => { Sync.logout(); render(); }, syncclr: () => { try { localStorage.removeItem('tracker-4am-sync'); } catch (e) {} render(); },
  wipe: () => ask({ msg: 'حذف نسختك من الخادم نهائيًا؟ تبقى بيانات هذا الجهاز كما هي.', ok: 'حذف', danger: 1 }).then(async y => { if (!y) return; try { await Sync.wipe(); toast('حُذفت من الخادم'); } catch (e) { $('#syst').textContent = '❌ ' + Sync.err(e); } }),
  exp: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([localStorage.getItem(K.main) || '{}'], { type: 'application/json' })); a.download = 'tracker-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('تم التصدير'); },
  imp: () => $('#file').click(), bknow: () => { addBk(nowL()); toast('تم حفظ نسخة'); return 1; },
  bkres: v => { const bk = rd(K.bk) || [], b = bk[+v]; if (!b) return; ask({ msg: 'استرجاع نسخة ' + b.d + '؟ (تُحفظ نسختك الحالية أولًا)', ok: 'استرجاع', danger: 1 }).then(y => { if (!y) return; addBk('قبل الاسترجاع ' + nowL()); try { localStorage.setItem(K.main, b.s); } catch (e) { return toast('تعذّر الاسترجاع'); } S = rd(K.main); toast('تم الاسترجاع ✓'); render(); }); },
  clrlog: () => ask({ msg: 'مسح سجل الدراسة (دقائق التركيز والإحصائيات) فقط؟', ok: 'مسح', danger: 1 }).then(y => { if (y) { addBk('قبل مسح السجل ' + nowL()); S.log = {}; saveS(); try { localStorage.removeItem(K.tm); } catch (e) {} } }),
  rstui: () => ask({ msg: 'إعادة ضبط المظهر والتفضيلات إلى الافتراضي؟', ok: 'إعادة ضبط', danger: 1 }).then(y => { if (y) { try { localStorage.removeItem(K.ui); localStorage.setItem(K.th, 'dark'); } catch (e) {} applyUi(); applyTh('dark'); render(); } }),
  rst: () => ask({ msg: 'مسح كل بياناتك من هذا الجهاز؟ (تُحفظ نسخة احتياطية أخيرة هنا)', ok: 'مسح كل شيء', danger: 1 }).then(y => { if (!y) return; addBk('قبل المسح الكامل ' + nowL()); try { localStorage.removeItem(K.main); localStorage.removeItem(K.tm); } catch (e) {} S = null; toast('تم المسح'); render(); })
};
const F = {
  aisave: f => { const e = f.elements, c = { m: aiM, md: e.md.value, k: '', u: '' }; if (aiM === 'key') { c.k = e.k.value.trim(); if (c.k && !/^sk-/.test(c.k)) return toast('المفتاح يبدأ عادة بـ sk-'); } else { c.u = e.u.value.trim(); if (c.u && !/^https?:\/\//.test(c.u)) return toast('الرابط يجب أن يبدأ بـ https://'); } wr(K.ai, c); toast('تم الحفظ ✓'); render(); },
  syncfg: f => {
    const u = f.elements.u.value.trim(), k = f.elements.k.value.trim(); let bad = /^sb_secret_/.test(k);
    try { const p = JSON.parse(atob(k.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); if (p.role === 'service_role') bad = true; } catch (e) {}
    if (bad) return toast('هذا مفتاح سرّي! استعمل المفتاح العام فقط'); if (!/^https:\/\//.test(u)) return toast('الرابط يجب أن يبدأ بـ https://');
    Sync.save(Object.assign(Sync.cfg(), { u, k })); toast('تم الحفظ ✓'); render();
  },
  login: async (f, up) => { const e = f.elements.e.value.trim(), p = f.elements.p.value; try { const r = up ? await Sync.signup(e, p) : await Sync.login(e, p); if (r === 'confirm') toast('أُرسل بريد تأكيد. أكّده ثم سجّل الدخول'); else { toast('تم الدخول ✓'); render(); } } catch (x) { toast(Sync.err(x)); } }
};
document.addEventListener('change', e => { const t = e.target, h = t.dataset.h; if (!h || !H[h] || t.type === 'file') return; if (H[h](t.type === 'checkbox' ? t.checked : t.value) === true) render(); });
document.addEventListener('click', e => { const b = e.target.closest('button[data-h]'); if (!b || !H[b.dataset.h]) return; const r = H[b.dataset.h](b.dataset.v != null ? b.dataset.v : b); if (r === 1 || r === true) render(); else if (r && r.then) r.then(x => { if (x === 1) render(); }); });
document.addEventListener('submit', e => { const f = e.target, n = f.dataset.f; if (!n || !F[n]) return; e.preventDefault(); F[n](f, e.submitter && e.submitter.value === 'up'); });
$('#file').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return; if (f.size > 4e6) return toast('الملف كبير جدًا'); f.text().then(t => {
    let j; try { j = JSON.parse(t); if (!j || !Array.isArray(j.subjects)) throw 0; } catch (x) { return toast('الملف غير صالح'); }
    ask({ msg: 'استبدال بياناتك الحالية بهذه النسخة؟ (تُحفظ نسختك الحالية أولًا)', ok: 'استبدال', danger: 1 }).then(y => { if (!y) return; addBk('قبل الاستيراد ' + nowL()); try { localStorage.setItem(K.main, t); } catch (x) { return toast('تعذّر الحفظ'); } S = rd(K.main); toast('تم الاستيراد ✓'); render(); });
  }); e.target.value = '';
});
applyUi(); applyTh(th()); render();
})();
