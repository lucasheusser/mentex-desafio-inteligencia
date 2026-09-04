'use client';

import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { ArrowLeft, ArrowRight, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import type { ChallengeQuestion } from '@/lib/questions';
import type { SubmittedAnswer } from '@/lib/scoring';
import { trackEvent } from '@/lib/analytics';

type PublicQuestion = Omit<ChallengeQuestion, 'answer'>;

export function QuizExperience({ questions, onFinish, onExit }: {
  questions: PublicQuestion[];
  onFinish: (answers: SubmittedAnswer[]) => Promise<void>;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());
  const question = questions[index];

  useEffect(() => {
    startedAt.current = Date.now();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animate('.question-card', { opacity: [0, 1], translateY: [22, 0], duration: 520, ease: 'outExpo' });
    }
  }, [index]);

  const advance = async () => {
    if (!selected || submitting) return;
    const nextAnswers = [...answers, { questionId: question.id, optionId: selected, responseMs: Date.now() - startedAt.current }];
    trackEvent('challenge_step_completed', { step: index + 1, category: question.category });
    if (index === questions.length - 1) {
      setSubmitting(true);
      await onFinish(nextAnswers);
      return;
    }
    setAnswers(nextAnswers);
    setSelected('');
    setIndex((current) => current + 1);
  };

  const back = () => {
    if (index === 0) return;
    const previous = answers.at(-1);
    setAnswers((current) => current.slice(0, -1));
    setIndex((current) => current - 1);
    setSelected(previous?.optionId ?? '');
  };

  return (
    <section className="quiz-shell" aria-labelledby="question-title">
      <header className="quiz-header">
        <a className="brand" href="#" onClick={(event) => event.preventDefault()} aria-label="MenteX">
          <span className="brand-mark">M</span><span>MenteX</span>
        </a>
        <Dialog>
          <DialogTrigger render={<Button variant="ghost" className="exit-button"><X /> Sair</Button>} />
          <DialogContent className="exit-dialog">
            <DialogHeader>
              <DialogTitle>Sair do desafio?</DialogTitle>
              <DialogDescription>Seu progresso atual será descartado. Você poderá começar novamente sem criar uma conta.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Continuar teste</DialogClose>
              <Button onClick={onExit} variant="destructive"><RotateCcw /> Sair e reiniciar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="quiz-progress">
        <div><span>{String(index + 1).padStart(2, '0')}</span> / {String(questions.length).padStart(2, '0')} <b>{question.category}</b></div>
        <Progress value={((index + 1) / questions.length) * 100} aria-label={`Progresso: pergunta ${index + 1} de ${questions.length}`} />
      </div>

      <article className="question-card">
        <p className="mono-label">{question.instruction}</p>
        <h1 id="question-title" className={`question-prompt question-${question.display}`}>{question.prompt}</h1>
        {question.helper && <p className="question-helper">{question.helper}</p>}
        <RadioGroup className="answer-grid" value={selected} onValueChange={(value) => setSelected(String(value))} aria-label="Alternativas">
          {question.options.map((option, optionIndex) => (
            <label key={option.id} className={`answer-option ${selected === option.id ? 'is-selected' : ''}`}>
              <RadioGroupItem value={option.id} aria-label={option.label} />
              <span className="answer-key">{String.fromCharCode(65 + optionIndex)}</span>
              <span className="answer-label">{option.label}</span>
            </label>
          ))}
        </RadioGroup>
        <div className="quiz-actions">
          <Button variant="ghost" onClick={back} disabled={index === 0}><ArrowLeft /> Voltar</Button>
          <Button className="next-button" onClick={advance} disabled={!selected || submitting}>
            {index === questions.length - 1 ? 'Concluir desafio' : 'Próximo desafio'} <ArrowRight />
          </Button>
        </div>
      </article>
      <p className="keyboard-tip">Dica: use Tab para navegar e Espaço para selecionar.</p>
    </section>
  );
}
