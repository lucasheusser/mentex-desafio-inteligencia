import { env } from 'cloudflare:workers';
import { siteConfig } from '@/config/site';

type DemoOutcome = 'approved' | 'pending' | 'declined' | 'cancelled';
const allowedOutcomes = new Set<DemoOutcome>(['approved', 'pending', 'declined', 'cancelled']);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await env.DB.prepare(
    'SELECT id, status, expires_at, result_json FROM challenge_sessions WHERE id = ?',
  ).bind(id).first<{ id: string; status: string; expires_at: number; result_json: string | null }>();
  if (!session || session.expires_at < Date.now() || !session.result_json) return Response.json({ error: 'Resultado indisponível.' }, { status: 404 });

  const mode = env.PAYMENT_MODE === 'live' ? 'live' : 'demo';
  if (mode === 'live') {
    return Response.json(
      { error: 'O checkout real ainda precisa das credenciais do provedor configurado.' },
      { status: 503 },
    );
  }

  const body = (await request.json()) as { outcome?: DemoOutcome };
  const outcome = body.outcome && allowedOutcomes.has(body.outcome) ? body.outcome : 'approved';
  const paymentId = crypto.randomUUID();
  const providerReference = `demo_${crypto.randomUUID()}`;
  const accessToken = outcome === 'approved' ? crypto.randomUUID() : null;
  const now = Date.now();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO payments (id, session_id, provider, provider_reference, status, amount_cents, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(paymentId, id, 'demo', providerReference, outcome, siteConfig.priceCents, now, now),
    env.DB.prepare(
      'UPDATE challenge_sessions SET payment_status = ?, access_token = COALESCE(?, access_token) WHERE id = ?',
    ).bind(outcome, accessToken, id),
  ]);

  return Response.json({
    mode: 'demo',
    status: outcome,
    message: 'Demonstração: nenhuma cobrança foi realizada.',
    accessToken,
  });
}
