import { env } from 'cloudflare:workers';
import { calculateResult, type SubmittedAnswer } from '@/lib/scoring';
import { questions } from '@/lib/questions';

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
  const session = await env.DB.prepare('SELECT id, expires_at FROM challenge_sessions WHERE id = ?').bind(id).first<{ id: string; expires_at: number }>();
  if (!session || session.expires_at < Date.now()) return Response.json({ error: 'Sessão inválida ou expirada.' }, { status: 404 });

  const payload = (await request.json()) as { answers?: unknown[] };
  const answers = Array.isArray(payload.answers) ? payload.answers.filter(isValidAnswer) : [];
  const uniqueAnswers = [...new Map(answers.map((answer) => [answer.questionId, answer])).values()];
  if (uniqueAnswers.length !== questions.length) return Response.json({ error: 'Responda todos os desafios antes de concluir.' }, { status: 400 });

  const result = calculateResult(uniqueAnswers);
  await env.DB.prepare(
    `UPDATE challenge_sessions
     SET status = 'completed', completed_at = ?, answers_json = ?, result_json = ?
     WHERE id = ?`,
  ).bind(Date.now(), JSON.stringify(uniqueAnswers), JSON.stringify(result), id).run();

  return Response.json({
    preview: {
      answered: result.answered,
      total: result.total,
      completion: 100,
      preliminary: result.preliminary,
      strength: result.strength,
    },
  });
}
