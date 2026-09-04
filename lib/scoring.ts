import { questions, type SkillCategory } from './questions';

export type SubmittedAnswer = { questionId: string; optionId: string; responseMs: number };

export type ResultProfile = {
  score: number;
  accuracy: number;
  speed: number;
  band: string;
  preliminary: string;
  categoryScores: Record<SkillCategory, number>;
  strength: SkillCategory;
  growth: SkillCategory;
  summary: string;
  answered: number;
  total: number;
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export function calculateResult(answers: SubmittedAnswer[]): ResultProfile {
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));
  const categories = [...new Set(questions.map((question) => question.category))];
  let earned = 0;
  let available = 0;
  let speedTotal = 0;
  let speedCount = 0;

  const categoryScores = Object.fromEntries(categories.map((category) => [category, 0])) as Record<SkillCategory, number>;

  for (const category of categories) {
    const subset = questions.filter((question) => question.category === category);
    let categoryEarned = 0;
    let categoryAvailable = 0;
    for (const question of subset) {
      const weight = question.difficulty;
      const answer = answerMap.get(question.id);
      categoryAvailable += weight;
      available += weight;
      if (answer?.optionId === question.answer) {
        categoryEarned += weight;
        earned += weight;
      }
      if (answer) {
        const rushedPenalty = answer.responseMs < 800 ? 0.45 : 1;
        const timeRatio = clamp(question.expectedMs / Math.max(answer.responseMs, 1), 0.55, 1.15);
        speedTotal += clamp(timeRatio * 86 * rushedPenalty);
        speedCount += 1;
      }
    }
    categoryScores[category] = Math.round((categoryEarned / categoryAvailable) * 100);
  }

  const accuracy = Math.round((earned / available) * 100);
  const speed = Math.round(speedTotal / Math.max(speedCount, 1));
  const score = Math.round(clamp(accuracy * 0.88 + speed * 0.12));
  const ordered = categories.toSorted((a, b) => categoryScores[b] - categoryScores[a]);
  const strength = ordered[0];
  const growth = ordered.at(-1) ?? ordered[0];
  const band = score >= 82 ? 'Desempenho avançado' : score >= 66 ? 'Desempenho consistente' : score >= 48 ? 'Desempenho em construção' : 'Base para desenvolver';
  const preliminary = score >= 70 ? 'Perfil analítico consistente' : score >= 50 ? 'Perfil equilibrado em desenvolvimento' : 'Perfil exploratório';
  const summary = `Você mostrou melhor consistência em ${strength.toLowerCase()}. ${growth} foi a área com maior espaço para evolução neste conjunto de desafios. O tempo teve peso secundário e nunca anulou uma resposta correta.`;

  return { score, accuracy, speed, band, preliminary, categoryScores, strength, growth, summary, answered: answers.length, total: questions.length };
}
