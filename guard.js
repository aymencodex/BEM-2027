(function () {
'use strict';
const X = window.T4x; let A;
const b64 = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const tot = r => [r[1] + r[3] + r[5], r[2] + r[4] + r[6]];
function avg() {
  const M = A.G('marks', {}); let a = 0, c = 0;
  A.T.S.subjects.forEach(s => { const m = M[s.id] || {}, k = m.c == null ? 1 : m.c, v = (m.a || []).filter(x => x != null); if (!k || !v.length) return; a += v.reduce((x, y) => x + y, 0) / v.length * k; c += k; });
  return c ? Math.round(a / c * 100) / 100 : null;
}
function pay(pp) {
  const S = A.T.S, L = (X.level && X.level()) || {}, wk = []; for (let i = 6; i >= 0; i--) wk.push(A.mins(A.ago(i)));
  return { v: 2, n: S.nk || 'التلميذ', lv: L.code || '', lb: L.label || '', d: A.D(), k: A.streak(), w: pp.t ? A.week() : null, g: pp.t ? (S.g || 0) : null, a: pp.t ? wk : null, av: pp.a ? avg() : null, sc: A.sc(),
    s: S.subjects.slice(0, 24).map(s => { const r = [s.name.slice(0, 40)]; [1, 2, 3].forEach(t => { const ls = s.lessons.filter(l => +l.term === t); r.push(ls.filter(l => l.done).length, ls.length); }); return r; }) };
}
function txt(o) {
  const f = o.s.filter(r => tot(r)[1] > 0), dn = f.filter(r => tot(r)[0] === tot(r)[1]).map(r => r[0]);
  let t = '📊 تقرير ' + o.n + (o.lb ? ' (' + o.lb + ')' : '') + '\n✅ المواد المكتملة: ' + (dn.join('، ') || 'لا توجد بعد') + '\n\n';
  f.forEach(r => { const [d, n] = tot(r); t += '• ' + r[0] + ': ' + Math.round(d / n * 100) + '% (' + d + '/' + n + ')\n'; });
  if (o.w != null) t += '\n⏱ دراسة هذا الأسبوع: ' + A.hm(o.w) + ' · 🔥 ' + o.k + ' يوم متتالٍ';
  if (o.av != null) t += '\n🧮 المعدل الحالي: ' + o.av;
  return t;
}
const url = o => new URL('parents.html', location.href).href + '#r=' + b64(o);
const pp = () => A.T.S.pp || (A.T.S.pp = { t: 1, a: 1, ts: '' });
const stamp = () => { pp().ts = A.D(); A.T.save(); };
function view() {
  const p = pp(), o = pay(p), u = url(o), days = p.ts ? Math.floor((Date.now() - new Date(p.ts)) / 864e5) : null;
  A.openTool('guard', '👨‍👩‍👦', 'مراقبة الأولياء', '<p>يتيح لوليّ أمرك متابعة تقدّمك: <b>المواد التي أكملتَها</b> ونسبة التقدّم في كل مادة. <b>أنت من يرسل الرابط ويقرّر ما يُشارَك.</b></p>' +
    '<h4>① ماذا تشارك؟</h4><label class="chk"><input type="checkbox" data-g="t"' + (p.t ? ' checked' : '') + '> وقت دراستي وسلسلة الأيام</label><label class="chk"><input type="checkbox" data-g="a"' + (p.a ? ' checked' : '') + '> معدلاتي</label><p class="mut">المواد والنسب تُشارَك دائمًا. لا تُشارَك عناوين الدروس ولا ملاحظاتك.</p>' +
    '<h4>② أرسل الرابط لوليّ أمرك</h4><textarea class="lk" readonly rows="3" dir="ltr" data-x="sel">' + A.esc(u) + '</textarea><div class="chs"><button class="pill pri" data-x="gwa">💬 إرسال بواتساب</button><button class="pill" data-x="gcopy">📋 نسخ الرابط</button><button class="pill" data-x="gtxt">📝 نسخ تقرير نصي</button><button class="pill" data-x="gprev">👁️ معاينة</button></div>' +
    '<div class="tip">يفتح الولي الرابط في صفحة <b>مراقبة الأولياء</b> على هاتفه، فيرى المواد المكتملة والتقدّم، ويحتفظ بها لمتابعة عدة أبناء. الرابط يحمل <b>لقطة لحظة إنشائه</b>، فأرسل رابطًا جديدًا كل أسبوع لتتحدّث الأرقام.' + (days == null ? '' : '<br>آخر مرة أرسلتَ فيها رابطًا: قبل ' + days + ' يوم' + (days > 6 ? ' ⏰ حان وقت التحديث.' : '.')) + '</div>');
}
X.acts.gwa = () => { const o = pay(pp()); window.open('https://wa.me/?text=' + encodeURIComponent(txt(o) + '\n\n🔗 التفاصيل: ' + url(o)), '_blank', 'noopener'); stamp(); };
X.acts.gcopy = () => { A.copy(url(pay(pp()))); stamp(); };
X.acts.gtxt = () => { A.copy(txt(pay(pp()))); stamp(); };
X.acts.gprev = () => window.open(url(pay(pp())), '_blank', 'noopener');
X.chgs.push(i => { if (i.dataset.g) { pp()[i.dataset.g] = i.checked ? 1 : 0; A.T.save(); view(); } });
X.addTool('guard', '👨‍👩‍👦', 'مراقبة الأولياء', '#30d158', '#00c7be', view);
X.ready.push(() => { A = X.api; });
})();
