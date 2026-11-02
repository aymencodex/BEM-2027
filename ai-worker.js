// Cloudflare Worker: وسيط آمن بين موقعك وواجهة Claude (للنشر العام).
// المتغيرات في إعدادات الـWorker:
//   ANTHROPIC_API_KEY  (Secret)  مفتاحك
//   ALLOWED_ORIGIN     نطاق/نطاقات موقعك مفصولة بفاصلة، بلا شرطة في النهاية. مثال: https://mysite.com,http://localhost:8000
//   MODEL_FAST / MODEL_SMART   اختياريان (الافتراضي: claude-haiku-5-5 و claude-sonnet-5-5)
// فعّل أيضًا Rate Limiting من لوحة Cloudflare لحماية رصيدك.
const s = (v, n) => String(v == null ? '' : v).slice(0, n);
const n = (v, a, b) => { v = +v; return isFinite(v) ? Math.min(b, Math.max(a, Math.round(v))) : 0; };

function system(c, json) {
  const weak = (Array.isArray(c.weak) ? c.weak : []).slice(0, 3).map(w => s(w[0], 40) + ' ' + n(w[1], 0, 100) + '%').join('، ') || 'غير معروف';
  return `أنت «مدرّب»، مدرّس ومرشد دراسي ذكي ولطيف لتلميذ جزائري.
مستواه: ${s(c.lv, 40) || 'غير محدد'}${c.br ? ' (' + s(c.br, 40) + ')' : ''}. المادة: ${s(c.subject, 60)}${c.lesson ? '. الدرس: ' + s(c.lesson, 120) : ''}.
بياناته: تقدّمه في المادة ${n(c.sp, 0, 100)}%، أضعف مواده: ${weak}، دروس للمراجعة: ${n(c.rev, 0, 999)}، دراسته هذا الأسبوع ${n(c.week, 0, 6000)} دقيقة، سلسلة ${n(c.streak, 0, 999)} يوم${c.days != null ? '، المتبقي للامتحان ' + n(c.days, -999, 999) + ' يومًا' : ''}.
القواعد: أجب بالعربية (وبالفرنسية أو الإنجليزية إذا كانت المادة لغة أجنبية) بلغة بسيطة تناسب عمره. اشرح بخطوات وأمثلة وشجّعه، وعلّمه التفكير بدل الحل الجاهز دائمًا. لا تخترع معلومات: إن لم تكن متأكدًا فقل ذلك واطلب منه مراجعة كتابه أو أستاذه. التزم بالدراسة ومحتوى مناسب لعمره، وأجب في أقل من 300 كلمة.${json ? '\nمهم: أجب بـ JSON صالح فقط دون أي نص قبله أو بعده ودون علامات ```.' : ''}`;
}

export default {
  async fetch(req, env) {
    const origins = (env.ALLOWED_ORIGIN || '').split(',').map(x => x.trim().replace(/\/$/, '')).filter(Boolean);
    const o = req.headers.get('Origin') || '', any = origins.includes('*'), allow = any || origins.includes(o);
    const cors = { 'Access-Control-Allow-Origin': any ? '*' : allow ? o : (origins[0] || ''), 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin' };
    const out = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return out({ error: 'method' }, 405);
    if (!origins.length) return out({ error: 'ALLOWED_ORIGIN غير مضبوط في الخادم' }, 403);
    if (!allow) return out({ error: 'origin ' + (o || '(file://)') + ' غير مسموح' }, 403);
    if (!env.ANTHROPIC_API_KEY) return out({ error: 'ANTHROPIC_API_KEY غير مضبوط' }, 500);
    let b; try { b = await req.json(); } catch { return out({ error: 'bad json' }, 400); }
    const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-8).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: s(m.content, 1800) })).filter(m => m.content);
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();
    if (!msgs.length) return out({ error: 'no messages' }, 400);
    const json = !!b.json, model = b.smart ? (env.MODEL_SMART || 'claude-sonnet-5-5') : (env.MODEL_FAST || 'claude-haiku-5-5');
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: json ? 1800 : 900, system: system(b.ctx || {}, json), messages: msgs }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return out({ error: (j.error && j.error.message) || 'upstream error' }, r.status === 401 ? 500 : r.status);
    return out({ text: (j.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n') });
  }
};
