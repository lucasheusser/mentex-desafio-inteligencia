import { env } from 'cloudflare:workers';

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const session = await env.DB.prepare(
    `SELECT result_json, expires_at, payment_status
     FROM challenge_sessions WHERE access_token = ?`,
  ).bind(token).first<{ result_json: string | null; expires_at: number; payment_status: string }>();

  if (!session || session.expires_at < Date.now() || session.payment_status !== 'approved' || !session.result_json) {
    return Response.json({ error: 'Acesso inválido ou expirado.' }, { status: 404 });
  }

  return Response.json({ result: JSON.parse(session.result_json), expiresAt: session.expires_at });
}
