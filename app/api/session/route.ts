import { env } from 'cloudflare:workers';
import { publicQuestions } from '@/lib/questions';
import { siteConfig } from '@/config/site';

export async function POST() {
  const id = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + siteConfig.resultRetentionDays * 24 * 60 * 60 * 1000;

  await env.DB.prepare(
    `INSERT INTO challenge_sessions (id, status, created_at, expires_at, payment_status)
     VALUES (?, 'started', ?, ?, 'locked')`,
  ).bind(id, now, expiresAt).run();

  return Response.json({
    sessionId: id,
    expiresAt,
    questions: publicQuestions,
    paymentMode: env.PAYMENT_MODE === 'live' ? 'live' : 'demo',
  });
}
