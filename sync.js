// حساب ومزامنة اختياريان عبر Supabase (REST مباشرة). لا يعمل شيء هنا ما لم تضبط المشروع من صفحة الإعدادات.
(function () {
'use strict';
const SK = 'tracker-4am-sync', Sync = window.Sync = {};
const cfg = Sync.cfg = () => { try { return JSON.parse(localStorage.getItem(SK)) || {}; } catch (e) { return {}; } };
const save = Sync.save = c => { try { localStorage.setItem(SK, JSON.stringify(c)); } catch (e) {} };
async function req(path, o, c) {
  c = c || cfg(); const h = Object.assign({ apikey: c.k, 'Content-Type': 'application/json' }, o.h || {}); if (o.auth && c.at) h.Authorization = 'Bearer ' + c.at;
  const r = await fetch(c.u.replace(/\/$/, '') + path, { method: o.m || 'GET', headers: h, body: o.b ? JSON.stringify(o.b) : undefined });
  const t = await r.text(); let j; try { j = t ? JSON.parse(t) : {}; } catch (e) { j = {}; }
  if (!r.ok) throw { s: r.status, m: j.msg || j.message || j.error_description || j.error || t.slice(0, 120) };
  return j;
}
function store(c, j) { c.at = j.access_token; c.rt = j.refresh_token; c.exp = Date.now() + (j.expires_in || 3600) * 1000 - 60000; if (j.user) { c.uid = j.user.id; c.em = j.user.email || c.em; } save(c); }
Sync.signup = async (em, pw) => { const c = cfg(), j = await req('/auth/v1/signup', { m: 'POST', b: { email: em, password: pw } }, c); if (j.access_token) { store(c, j); return 'in'; } return 'confirm'; };
Sync.login = async (em, pw) => { const c = cfg(); store(c, await req('/auth/v1/token?grant_type=password', { m: 'POST', b: { email: em, password: pw } }, c)); return 'in'; };
async function fresh() {
  let c = cfg(); if (!c.at) throw { s: 401, m: 'سجّل الدخول أولًا' };
  if (Date.now() > c.exp && c.rt) { store(c, await req('/auth/v1/token?grant_type=refresh_token', { m: 'POST', b: { refresh_token: c.rt } }, c)); c = cfg(); }
  return c;
}
Sync.ready = () => { const c = cfg(); return !!(c.u && c.k && c.at); };
Sync.logout = () => { const c = cfg(); ['at', 'rt', 'uid', 'exp'].forEach(k => delete c[k]); save(c); };
Sync.push = async json => { const c = await fresh(); await req('/rest/v1/backups?on_conflict=user_id', { m: 'POST', auth: 1, h: { Prefer: 'resolution=merge-duplicates,return=minimal' }, b: { user_id: c.uid, data: JSON.parse(json), updated_at: new Date().toISOString() } }, c); const n = cfg(); n.last = new Date().toISOString(); save(n); };
Sync.pull = async () => { const c = await fresh(), j = await req('/rest/v1/backups?select=data,updated_at&user_id=eq.' + c.uid, { auth: 1 }, c); return j[0] || null; };
Sync.wipe = async () => { const c = await fresh(); await req('/rest/v1/backups?user_id=eq.' + c.uid, { m: 'DELETE', auth: 1 }, c); };
Sync.err = e => e && e.s === 400 ? 'طلب غير صالح: ' + (e.m || '') : e && e.s === 401 ? 'بيانات الدخول غير صحيحة أو انتهت الجلسة.' : e && e.s === 404 ? 'الجدول backups غير موجود. نفّذ كود SQL أولًا.' : e && e.s === 422 ? (e.m || 'بيانات غير مقبولة (كلمة المرور قصيرة؟)') : e && e.s === 429 ? 'محاولات كثيرة. انتظر قليلًا.' : e && e.s ? 'خطأ ' + e.s + (e.m ? ': ' + e.m : '') : 'تعذّر الاتصال. تحقق من الرابط والإنترنت.';
Sync.sql = 'create table public.backups (\n  user_id uuid primary key references auth.users on delete cascade,\n  data jsonb not null,\n  updated_at timestamptz not null default now()\n);\nalter table public.backups enable row level security;\ncreate policy "own row" on public.backups\n  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);';

// ---- داخل الموقع الرئيسي: رفع تلقائي بعد كل حفظ، وسؤال عند وجود نسخة أحدث ----
const X = window.T4x; if (!X) return;
X.ready.push(() => {
  const A = X.api, c = cfg(); if (!Sync.ready() || !c.auto) return; let tm;
  Sync.pull().then(r => {
    const ts = +localStorage.getItem('tracker-4am-ts') || 0;
    if (r && Date.parse(r.updated_at) > ts + 5000) A.T.ask({ msg: 'وُجدت نسخة أحدث في حسابك. استبدال بياناتك على هذا الجهاز بها؟', ok: 'استبدال', danger: 1 }).then(y => { if (y) { const bk = A.T.snap(); A.T.undoTo(JSON.stringify(r.data)); A.T.toast('تمت المزامنة', () => A.T.undoTo(bk)); } });
  }).catch(() => {});
  X.onSave = () => { clearTimeout(tm); tm = setTimeout(() => { Sync.push(A.T.snap()).catch(() => {}); }, 5000); };
});
})();
