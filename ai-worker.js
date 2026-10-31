// Cloudflare Worker: وسيط آمن بين موقعك وواجهة Claude.
// الإعداد: أنشئ Worker ثم أضف المتغيرات:
//   ANTHROPIC_API_KEY  (Secret)  مفتاحك
//   ALLOWED_ORIGIN     نطاق موقعك بالضبط، مثل https://example.com
//   MODEL              اختياري (الافتراضي أرخص نموذج مناسب)
// وفعّل Rate Limiting من لوحة Cloudflare لحماية رصيدك من الاستعمال المفرط.
export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST' || req.headers.get('Origin') !== env.ALLOWED_ORIGIN) return new Response('forbidden', { status: 403, headers: cors });
    let b; try { b = await req.json(); } catch { return new Response('bad request', { status: 400, headers: cors }); }
    const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-8).map(m => ({ role: m.r === 'assistant' ? 'assistant' : 'user', content: String(m.c || '').slice(0, 1500) }));
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();
    if (!msgs.length) return new Response('bad request', { status: 400, headers: cors });
    const system = `أنت مدرّس ودود لتلميذ جزائري في السنة الرابعة متوسط (نحو 14-15 سنة) يحضّر لشهادة التعليم المتوسط.
المادة: ${String(b.subject || '').slice(0, 60)}. الدرس: ${String(b.lesson || 'غير محدد').slice(0, 120)}.
- اشرح ببساطة وبأمثلة قريبة من التلميذ، وأجب بالعربية، وبالفرنسية أو الإنجليزية إذا كانت المادة لغة أجنبية.
- شجّع التلميذ على التفكير: اسأله وصحّح إجاباته بلطف بدل إعطاء الحل الجاهز دائمًا.
- التزم بمحتوى الدراسة. إن خرج الحديث عنها فأعده بلطف إلى الدرس. محتوى مناسب لعمر التلميذ فقط.
- إن لم تكن متأكدًا فقل ذلك واطلب منه مراجعة كتابه أو أستاذه. اجعل الجواب أقل من 250 كلمة.`;
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: env.MODEL || 'claude-haiku-5-5', max_tokens: 700, system, messages: msgs }) });
    const j = await r.json().catch(() => ({}));
    const text = (j.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n');
    return new Response(JSON.stringify({ text: text || 'تعذّر الحصول على جواب الآن.' }), { headers: { ...cors, 'content-type': 'application/json' } });
  }
};
