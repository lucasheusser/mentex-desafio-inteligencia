import { env } from 'cloudflare:workers';

const encoder = new TextEncoder();

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function POST(request: Request) {
  if (!env.PAYMENT_WEBHOOK_SECRET) return Response.json({ error: 'Webhook não configurado.' }, { status: 503 });
  const rawBody = await request.text();
  const received = request.headers.get('x-mentex-signature') ?? '';
  const key = await crypto.subtle.importKey('raw', encoder.encode(env.PAYMENT_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody)));
  if (!constantTimeEqual(received, expected)) return Response.json({ error: 'Assinatura inválida.' }, { status: 401 });

  const payload = JSON.parse(rawBody) as { reference?: string; status?: string };
  const allowed = new Set(['pending', 'approved', 'declined', 'cancelled']);
  if (!payload.reference || !payload.status || !allowed.has(payload.status)) return Response.json({ error: 'Evento inválido.' }, { status: 400 });

  const payment = await env.DB.prepare('SELECT session_id FROM payments WHERE provider_reference = ?').bind(payload.reference).first<{ session_id: string }>();
  if (!payment) return Response.json({ received: true });
  const token = payload.status === 'approved' ? crypto.randomUUID() : null;
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('UPDATE payments SET status = ?, updated_at = ? WHERE provider_reference = ?').bind(payload.status, now, payload.reference),
    env.DB.prepare('UPDATE challenge_sessions SET payment_status = ?, access_token = COALESCE(?, access_token) WHERE id = ?').bind(payload.status, token, payment.session_id),
  ]);
  return Response.json({ received: true });
}
