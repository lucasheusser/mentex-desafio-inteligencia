import { publicQuestions } from '@/lib/questions';
import { createSession, paymentMode } from '@/lib/server/state';

export async function POST() {
  const { session, token } = createSession();

  return Response.json({
    sessionId: session.id,
    sessionToken: token,
    expiresAt: session.expiresAt,
    questions: publicQuestions,
    paymentMode: paymentMode(),
  });
}
