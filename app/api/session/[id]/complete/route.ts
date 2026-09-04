import { calculateResult, type SubmittedAnswer } from '@/lib/scoring';
import { questions } from '@/lib/questions';
import { createCapsule, verifySession } from '@/lib/server/state';

function isValidAnswer(value: unknown): value is SubmittedAnswer {
  if (!value || typeof value !== 'object') return false;
  const answer = value as SubmittedAnswer;
  const question = questions.find((item) => item.id === answer.questionId);
  return Boolean(
    question &&
      question.options.some((option) => option.id === answer.optionId) &&
      Number.isFinite(answer.responseMs) &&
      answer.responseMs >= 0 &&
      answer.responseMs <= 10 * 60 * 1000,
  );
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = (await request.json()) as { sessionToken?: unknown; answers?: unknown[] };
  const session = verifySession(payload.sessionToken, id);
  if (!session) return Response.json({ error: 'Sessão inválida ou expirada.' }, { status: 400 });
  const answers = Array.isArray(payload.answers) ? payload.answers.filter(isValidAnswer) : [];
  const uniqueAnswers = [...new Map(answers.map((answer) => [answer.questionId, answer])).values()];
  if (uniqueAnswers.length !== questions.length) return Response.json({ error: 'Responda todos os desafios antes de concluir.' }, { status: 400 });

  const result = calculateResult(uniqueAnswers);
  const capsule = await createCapsule(session, result);

  return Response.json({
    preview: { answered: result.answered, total: result.total, completion: 100, preliminary: result.preliminary, strength: result.strength },
    capsule,
    expiresAt: session.expiresAt,
  });
}
