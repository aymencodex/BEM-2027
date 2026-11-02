(function () {
'use strict';
const X = window.T4x, $ = s => document.querySelector(s), CK = 'tracker-4am-ai2';
let A, chat = [], busy = 0, showCfg = 0, cm = '', cs = '';
const esc = s => A.esc(s);
const cfg = () => { try { const c = JSON.parse(localStorage.getItem(CK)); if (c && typeof c === 'object') return c; const o = localStorage.getItem('tracker-4am-ai'); if (o) return { m: 'srv', u: o, md: 'fast' }; } catch (e) {} return { m: '', md: 'fast' }; };
const setCfg = c => { try { localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {} };
const ready = (c = cfg()) => c.m === 'key' ? !!c.k : c.m === 'srv' ? !!c.u : false;

// ---- سياق التلميذ وتعليمات المدرّب ----
function ctx(sid, lesson) {
  const S = A.T.S, s = A.sOf(sid) || { name: '', lessons: [] }, L = (X.level && X.level()) || {}, ex = X.exam && X.exam(), t = s.lessons;
  const weak = S.subjects.filter(x => x.lessons.length).map(x => [x.name, Math.round(x.lessons.filter(l => l.done).length / x.lessons.length * 100)]).sort((a, b) => a[1] - b[1]).slice(0, 3);
  return { lv: L.label || '', br: L.br || '', subject: s.name, lesson: lesson || '', sp: t.length ? Math.round(t.filter(l => l.done).length / t.length * 100) : 0, weak, rev: S.subjects.reduce((n, x) => n + x.lessons.filter(l => l.r).length, 0), week: A.week(), streak: A.streak(), days: ex ? ex.days : null };
}
const sys = (c, j) => 'أنت «مدرّب»، مدرّس ومرشد دراسي ذكي ولطيف لتلميذ جزائري.\nمستواه: ' + (c.lv || 'غير محدد') + (c.br ? ' (' + c.br + ')' : '') + '. المادة: ' + c.subject + (c.lesson ? '. الدرس: ' + c.lesson : '') + '.\nبياناته: تقدّمه في المادة ' + c.sp + '%، أضعف مواده: ' + (c.weak.map(w => w[0] + ' ' + w[1] + '%').join('، ') || 'غير معروف') + '، دروس للمراجعة: ' + c.rev + '، دراسته هذا الأسبوع ' + c.week + ' دقيقة، سلسلة ' + c.streak + ' يوم' + (c.days != null ? '، المتبقي للامتحان ' + c.days + ' يومًا' : '') + '.\nالقواعد: أجب بالعربية (وبالفرنسية أو الإنجليزية إذا كانت المادة لغة أجنبية) بلغة بسيطة تناسب عمره. اشرح بخطوات وأمثلة وشجّعه، وعلّمه التفكير بدل الحل الجاهز دائمًا. لا تخترع معلومات: إن لم تكن متأكدًا فقل ذلك واطلب منه مراجعة كتابه أو أستاذه. التزم بالدراسة ومحتوى مناسب لعمره، وأجب في أقل من 300 كلمة.' + (j ? '\nمهم: أجب بـ JSON صالح فقط دون أي نص قبله أو بعده ودون علامات ```.' : '');

async function call(c, msgs, j) {
  const k = cfg();
  if (k.m === 'key') {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': k.k, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: k.md === 'smart' ? 'claude-sonnet-5-5' : 'claude-haiku-5-5', max_tokens: j ? 1800 : 900, system: sys(c, j), messages: msgs }) });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw { s: r.status, m: d.error && d.error.message };
    return (d.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n');
  }
  const r = await fetch(k.u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ctx: c, json: !!j, smart: k.md === 'smart', messages: msgs }) });
  const d = await r.json().catch(() => ({})); if (!r.ok) throw { s: r.status, m: d.error };
  return d.text || '';
}
function errMsg(e) {
  const s = e && e.s;
  return s === 401 ? 'المفتاح غير صالح. تأكد من نسخه كاملًا.' : s === 403 ? 'الطلب مرفوض. إن كنت تستعمل خادمًا فتحقق أن ALLOWED_ORIGIN يطابق نطاق موقعك تمامًا (مثل https://example.com بلا شرطة في النهاية).' : s === 404 || s === 405 ? 'رابط الخادم غير صحيح.' : s === 429 ? 'طلبات كثيرة. انتظر دقيقة ثم حاول.' : s === 400 ? 'رفض الخادم الطلب' + (e.m ? ': ' + e.m : '') + '.' : s >= 500 ? 'الخدمة مشغولة الآن. حاول بعد قليل.' :
    'تعذّر الاتصال. تحقق من الإنترنت ومن أن الخادم يسمح بنطاق موقعك (CORS). ملاحظة: لا يعمل المساعد إذا فتحت الملف مباشرة من الجهاز (file://)، فانشر الموقع أو شغّله عبر خادم محلي.';
}
const md = t => esc(t).replace(/```(?:\w+\n)?([\s\S]*?)```/g, '<pre>$1</pre>').split('\n').map(l => /^#{1,4} /.test(l) ? '<h5>' + l.replace(/^#+ /, '') + '</h5>' : /^\s*([-*•]|\d+[.)]) /.test(l) ? '<li>' + l.replace(/^\s*([-*•]|\d+[.)]) /, '') + '</li>' : l.trim() ? '<p>' + l + '</p>' : '').join('').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>');

// ---- خطة اليوم المحلية (تعمل دون إنترنت ودون إعداد) ----
function plan() {
  const S = A.T.S, L = X.exam && X.exam(), pc = s => Math.round(s.lessons.filter(l => l.done).length / s.lessons.length * 100),
    open = S.subjects.filter(s => s.lessons.some(l => !l.done)), nx = s => s.lessons.filter(l => !l.done).sort((a, b) => a.term - b.term)[0],
    m7 = s => { let n = 0; for (let i = 0; i < 7; i++) n += A.mins(A.ago(i), s.id); return n; }, T = [];
  const low = open.slice().sort((a, b) => pc(a) - pc(b))[0];
  if (low) T.push([low.id, 'ابدأ بدرس «' + nx(low).t + '» في ' + low.name + ' (تقدّمك فيها ' + pc(low) + '% فقط)', 25]);
  const cold = open.filter(s => s !== low && !m7(s.id))[0];
  if (cold) T.push([cold.id, 'لم تدرس ' + cold.name + ' هذا الأسبوع. جرّب «' + nx(cold).t + '»', 20]);
  let rv = null; S.subjects.forEach(s => { if (!rv) s.lessons.forEach(l => { if (l.r && !rv) rv = [s, l]; }); });
  if (rv) T.push([rv[0].id, 'راجع «' + rv[1].t + '» (' + rv[0].name + ') فقد علّمته للمراجعة', 15]);
  let pace = ''; if (L && L.days > 0) { const rem = open.reduce((n, s) => n + s.lessons.filter(l => !l.done).length, 0); if (rem) pace = '<p class="mut">⏳ تبقّى ' + L.days + ' يومًا و' + rem + ' درسًا. الوتيرة المناسبة نحو ' + Math.max(1, Math.ceil(rem / (L.days / 7))) + ' دروس أسبوعيًا.</p>'; }
  return '<div class="tip"><b>🎯 خطتك لليوم</b> <small class="mut">(تعمل دون إنترنت)</small>' + (T.length ? '<ol class="pl">' + T.map(t => '<li><span>' + esc(t[1]) + '</span><button class="pill pri" data-x="pstart" data-s="' + esc(t[0]) + '" data-m="' + t[2] + '">⏱ ' + t[2] + ' د</button></li>').join('') + '</ol>' : '<p class="mut">أضف دروس موادك لتحصل على خطة ذكية لكل يوم.</p>') + pace + '</div>';
}

// ---- الواجهة ----
const AC = [['explain', '💡', 'اشرح'], ['sum', '📝', 'لخّص'], ['quiz', '🧠', 'اختبار تفاعلي'], ['cards', '🃏', 'بطاقات مراجعة'], ['plan', '🗓️', 'خطة أسبوعية'], ['coach', '🎯', 'حلّل تقدّمي'], ['check', '✍️', 'صحّح إجابتي']];
const lopts = () => '<option value="">(بدون درس محدد)</option>' + A.sOf(cs).lessons.map(l => '<option>' + esc(l.t) + '</option>').join('');
function cfgHTML(k) {
  const m = cm || k.m || 'key'; cm = m;
  return '<div class="tip"><b>تفعيل الذكاء الاصطناعي</b><div class="chs"><button class="pill' + (m === 'key' ? ' pri' : '') + '" data-x="aim" data-m="key">🔑 مفتاحي الشخصي (الأسهل)</button><button class="pill' + (m === 'srv' ? ' pri' : '') + '" data-x="aim" data-m="srv">🌐 خادم (لموقع يستعمله الجميع)</button></div>' +
    (m === 'key' ? '<p class="mut">أنشئ مفتاحًا من console.anthropic.com والصقه هنا. يُحفظ في هذا المتصفح فقط ولا يدخل في النسخ الاحتياطي. استعمله على جهازك الشخصي فقط، ولا تضعه على جهاز يستعمله غيرك.</p>' : '<p class="mut">انشر الملف <b>ai-worker.js</b> على Cloudflare Workers (مجانًا) وألصق رابطه. يبقى المفتاح سرًّا هناك، وهذه هي الطريقة الصحيحة إذا كان تلاميذ آخرون سيستعملون موقعك.</p>') +
    '<form data-x="aisave">' + (m === 'key' ? '<input name="k" type="password" dir="ltr" placeholder="sk-ant-…" autocomplete="off" value="' + esc(k.k || '') + '">' : '<input name="u" type="url" dir="ltr" placeholder="https://….workers.dev" value="' + esc(k.u || '') + '">') +
    '<select name="md"><option value="fast"' + (k.md !== 'smart' ? ' selected' : '') + '>سريع واقتصادي</option><option value="smart"' + (k.md === 'smart' ? ' selected' : '') + '>أذكى (أبطأ وأغلى)</option></select><button>حفظ</button></form><div class="chs"><button class="pill" data-x="aitest">🔌 اختبار الاتصال</button><button class="pill danger" data-x="aiclr">حذف الإعدادات</button></div><p id="aist" class="mut"></p></div>';
}
function view() {
  const S = A.T.S; if (!S.subjects.length) return A.openTool('ai', '🤖', 'المدرّب الذكي', '<p class="empty">أضف مادة أولًا.</p>');
  const k = cfg(); if (!cs || !S.subjects.some(s => s.id === cs)) cs = S.subjects[0].id;
  A.openTool('ai', '🤖', 'المدرّب الذكي', '<div class="aib"><span>' + (ready(k) ? '🟢 الذكاء الاصطناعي مفعّل' : '⚪ الذكاء الاصطناعي غير مفعّل') + '</span><button class="x" data-x="aicfg" aria-label="الإعدادات">⚙️</button></div>' + plan() + ((showCfg || !ready(k)) ? cfgHTML(k) : '') +
    '<div class="row"><select id="aS">' + A.opts(cs) + '</select><select id="aL">' + lopts() + '</select></div><div class="chs">' + AC.map(a => '<button class="pill" data-x="aia" data-a="' + a[0] + '">' + a[1] + ' ' + a[2] + '</button>').join('') + '</div><div id="aM" class="chat" aria-live="polite"></div>' +
    '<form data-x="aisend"><input name="q" id="aQ" placeholder="اسأل أي شيء…" autocomplete="off" required><button>إرسال</button></form><p class="mut">قد يخطئ المساعد. راجع كتابك وأستاذك.</p>');
  draw();
}
function quizHTML(m, i) {
  const q = m.d[m.i];
  if (!q) { const p = Math.round(m.sc / m.d.length * 100); return '<div class="qz"><b>نتيجتك: ' + m.sc + ' من ' + m.d.length + ' (' + p + '%)</b><p>' + (p >= 80 ? '🌟 ممتاز! أنت متمكّن من هذا الدرس.' : p >= 50 ? '👍 جيد. راجع الأسئلة التي أخطأت فيها.' : '💪 لا بأس، أعد قراءة الدرس ثم جرّب مجددًا.') + (m.flag ? '<br>🔖 علّمتُ الدرس للمراجعة تلقائيًا.' : '') + '</p></div>'; }
  return '<div class="qz"><small>سؤال ' + (m.i + 1) + ' من ' + m.d.length + '</small><b>' + esc(q.q) + '</b>' + q.o.map((o, j) => '<button class="opt2' + (m.pk != null ? (j === q.a ? ' ok' : j === m.pk ? ' no' : '') : '') + '" data-x="qpick" data-m="' + i + '" data-o="' + j + '"' + (m.pk != null ? ' disabled' : '') + '>' + esc(o) + '</button>').join('') + (m.pk != null ? '<p class="mut">' + esc(q.e) + '</p><button class="pill pri" data-x="qnext" data-m="' + i + '">' + (m.i + 1 < m.d.length ? 'التالي' : 'النتيجة') + '</button>' : '') + '</div>';
}
function cardsHTML(m, i) {
  const c = m.d[m.i];
  return '<div class="fc' + (m.fl ? ' fl' : '') + '" data-x="cflip" data-m="' + i + '" role="button" tabindex="0"><small>' + (m.i + 1) + '/' + m.d.length + ' · اضغط للقلب</small><b>' + esc(m.fl ? c.b : c.f) + '</b></div><div class="chs"><button class="pill" data-x="cprev" data-m="' + i + '">السابق</button><button class="pill pri" data-x="cnext" data-m="' + i + '">التالي</button></div>';
}
function draw() {
  const m = $('#aM'); if (!m) return;
  m.innerHTML = chat.map((c, i) => c.ui === 'quiz' ? '<div class="msg2 assistant wide">' + quizHTML(c, i) + '</div>' : c.ui === 'cards' ? '<div class="msg2 assistant wide">' + cardsHTML(c, i) + '</div>' : '<div class="msg2 ' + c.r + '">' + (c.r === 'user' ? esc(c.c) : md(c.c)) + '</div>').join('') + (busy ? '<div class="msg2 assistant typing"><i></i><i></i><i></i></div>' : '');
  m.scrollTop = m.scrollHeight;
}
function parse(t, kind) {
  try {
    const a = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1)); if (!Array.isArray(a)) return null;
    if (kind === 'quiz') { const q = a.map(x => x && typeof x.q === 'string' && Array.isArray(x.o) && x.o.length > 1 && Number.isInteger(x.a) && x.a >= 0 && x.a < Math.min(x.o.length, 4) ? { q: x.q.slice(0, 300), o: x.o.slice(0, 4).map(o => String(o).slice(0, 150)), a: x.a, e: String(x.e || '').slice(0, 300) } : null).filter(Boolean); return q.length ? q : null; }
    const c = a.map(x => x && x.f && x.b ? { f: String(x.f).slice(0, 200), b: String(x.b).slice(0, 400) } : null).filter(Boolean); return c.length ? c : null;
  } catch (e) { return null; }
}
async function send(text, kind) {
  const k = cfg(); if (!ready(k)) { showCfg = 1; view(); return A.T.toast('فعّل المساعد أولًا'); }
  if (busy) return; chat.push({ r: 'user', c: text }); busy = 1; draw();
  try {
    const msgs = chat.map(m => ({ role: m.r, content: m.ui ? '[' + m.c + ']' : m.c })).slice(-8); while (msgs.length && msgs[0].role !== 'user') msgs.shift();
    const t = await call(ctx(cs, $('#aL') ? $('#aL').value : ''), msgs, !!kind), d = kind && parse(t, kind);
    chat.push(d ? { r: 'assistant', ui: kind, c: kind === 'quiz' ? 'اختبار تفاعلي' : 'بطاقات مراجعة', d, i: 0, sc: 0, pk: null, fl: 0 } : { r: 'assistant', c: t || 'لا يوجد جواب.' });
  } catch (e) { chat.push({ r: 'assistant', c: '⚠️ ' + errMsg(e) }); }
  busy = 0; draw();
}

// ---- الأحداث ----
X.acts.aicfg = () => { showCfg = !showCfg; view(); };
X.acts.aim = b => { cm = b.dataset.m; showCfg = 1; view(); };
X.acts.aitest = async () => { const s = $('#aist'); if (!ready()) { s.textContent = 'احفظ الإعدادات أولًا.'; return; } s.textContent = 'جارٍ الاختبار…'; try { await call(ctx(cs, ''), [{ role: 'user', content: 'أجب بكلمة واحدة: مرحبا' }], false); s.textContent = '✅ الاتصال يعمل!'; } catch (e) { s.textContent = '❌ ' + errMsg(e); } };
X.acts.aiclr = () => A.T.ask({ msg: 'حذف إعدادات الذكاء الاصطناعي من هذا المتصفح؟', ok: 'حذف', danger: 1 }).then(y => { if (y) { try { localStorage.removeItem(CK); localStorage.removeItem('tracker-4am-ai'); } catch (e) {} cm = ''; view(); } });
X.forms.aisave = f => {
  const e = f.elements, c = { m: cm, md: e.md.value, k: '', u: '' };
  if (cm === 'key') { c.k = e.k.value.trim(); if (c.k && !/^sk-/.test(c.k)) return A.T.toast('المفتاح يبدأ عادة بـ sk-'); } else { c.u = e.u.value.trim(); if (c.u && !/^https?:\/\//.test(c.u)) return A.T.toast('الرابط يجب أن يبدأ بـ https://'); }
  setCfg(c); showCfg = 1; view(); A.T.toast('تم الحفظ. جرّب «اختبار الاتصال»');
};
X.forms.aisend = f => { const v = f.elements.q.value.trim(); if (v) { f.reset(); send(v); } };
X.acts.pstart = b => A.start(b.dataset.s, +b.dataset.m);
X.acts.aia = b => {
  const a = b.dataset.a, s = A.sOf(cs).name, l = $('#aL').value, tp = l ? 'درس «' + l + '» في مادة ' + s : 'مادة ' + s;
  if (a === 'check') { const q = $('#aQ'); q.value = 'صحّح لي هذه الإجابة وبيّن أخطائي دون أن تعطيني الحل كاملًا: '; q.focus(); return; }
  const P = { explain: ['اشرح لي ' + tp + ' بخطوات بسيطة مع مثال، ثم اسألني سؤالًا واحدًا للتأكد من فهمي.'], sum: ['لخّص ' + tp + ' في نقاط قصيرة مع أهم القوانين أو التعاريف.'],
    quiz: ['أنشئ 5 أسئلة اختيار من متعدد متدرجة الصعوبة عن ' + tp + '. الصيغة: [{"q":"السؤال","o":["خيار1","خيار2","خيار3","خيار4"],"a":رقم الخيار الصحيح من 0 إلى 3,"e":"شرح قصير للجواب"}]', 'quiz'],
    cards: ['أنشئ 8 بطاقات مراجعة عن ' + tp + '. الصيغة: [{"f":"مصطلح أو سؤال","b":"التعريف أو الجواب"}]', 'cards'],
    plan: ['ضع لي خطة دراسة لأسبوع كامل مبنية على بياناتي (موادي الضعيفة ووقتي والامتحان إن وُجد) بجدول يوم بيوم وواقعي.'], coach: ['حلّل تقدّمي بصراحة ولطف: ما نقاط قوتي وضعفي، وما أهم 3 أشياء أفعلها هذا الأسبوع؟'] }[a];
  send(P[0], P[1]);
};
X.acts.qpick = b => { const m = chat[+b.dataset.m]; if (m.pk != null) return; m.pk = +b.dataset.o; if (m.pk === m.d[m.i].a) m.sc++; draw(); };
X.acts.qnext = b => {
  const m = chat[+b.dataset.m]; m.i++; m.pk = null;
  if (m.i >= m.d.length) { const l = $('#aL') && $('#aL').value; if (l && m.sc / m.d.length < .7) { const x = A.sOf(cs).lessons.find(y => y.t === l); if (x) { x.r = true; A.T.save(); m.flag = 1; } } }
  draw();
};
X.acts.cflip = b => { const m = chat[+b.dataset.m]; m.fl = m.fl ? 0 : 1; draw(); };
X.acts.cnext = b => { const m = chat[+b.dataset.m]; m.i = (m.i + 1) % m.d.length; m.fl = 0; draw(); };
X.acts.cprev = b => { const m = chat[+b.dataset.m]; m.i = (m.i + m.d.length - 1) % m.d.length; m.fl = 0; draw(); };
X.chgs.push(i => { if (i.id === 'aS') { cs = i.value; $('#aL').innerHTML = lopts(); chat = []; draw(); } else if (i.id === 'aL') { chat = []; draw(); } });
X.addTool('ai', '🤖', 'المدرّب الذكي', '#bf5af2', '#ff375f', view);
X.ready.push(() => { A = X.api; });
})();
