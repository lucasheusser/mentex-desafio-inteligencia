import { env } from 'cloudflare:workers';

export async function POST(request: Request) {
  const { sessionId, accessToken } = (await request.json()) as { sessionId?: string; accessToken?: string };
  if (!sessionId || !accessToken) return Response.json({ recovered: false }, { status: 400 });
  const session = await env.DB.prepare(
    `SELECT access_token, expires_at, payment_status
     FROM challenge_sessions WHERE id = ? AND access_token = ?`,
  ).bind(sessionId, accessToken).first<{ access_token: string; expires_at: number; payment_status: string }>();
  const recovered = Boolean(session && session.expires_at > Date.now() && session.payment_status === 'approved');
  return Response.json({ recovered, accessToken: recovered ? accessToken : null });
}
