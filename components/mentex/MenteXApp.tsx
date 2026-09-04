'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Landing } from './Landing';
import { NeuralBackground } from './NeuralBackground';
import { QuizExperience } from './QuizExperience';
import { Processing } from './Processing';
import { ResultPreview } from './ResultPreview';
import { UnlockedResult } from './UnlockedResult';
import { ConsentBanner } from './ConsentBanner';
import type { ChallengeQuestion } from '@/lib/questions';
import type { ResultProfile, SubmittedAnswer } from '@/lib/scoring';
import { trackEvent } from '@/lib/analytics';

type PublicQuestion = Omit<ChallengeQuestion, 'answer'>;
type View = 'landing' | 'quiz' | 'processing' | 'preview' | 'result';
type Preview = { answered: number; total: number; completion: number; preliminary: string; strength: string };

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: {
        name: string;
        title?: string;
        description: string;
        inputSchema: Record<string, unknown>;
        annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
        execute: (input: unknown) => unknown | Promise<unknown>;
      }, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

export function MenteXApp() {
  const [view, setView] = useState<View>('landing');
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<ResultProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const viewRef = useRef<View>('landing');

  const startChallenge = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/session', { method: 'POST' });
      const data = await response.json() as { sessionId?: string; questions?: PublicQuestion[]; error?: string };
      if (!response.ok || !data.sessionId || !data.questions) throw new Error(data.error ?? 'Não foi possível preparar o desafio.');
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setView('quiz');
      localStorage.setItem('mentex_session_id', data.sessionId);
      trackEvent('challenge_started');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha temporária. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const finishChallenge = async (answers: SubmittedAnswer[]) => {
    setView('processing');
    setError('');
    const started = Date.now();
    try {
      const response = await fetch(`/api/session/${sessionId}/complete`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers }),
      });
      const data = await response.json() as { preview?: Preview; error?: string };
      if (!response.ok || !data.preview) throw new Error(data.error ?? 'Não foi possível calcular o resultado.');
      const remaining = Math.max(0, 2300 - (Date.now() - started));
      await new Promise((resolve) => window.setTimeout(resolve, remaining));
      setPreview(data.preview);
      setView('preview');
      trackEvent('challenge_completed');
      trackEvent('paywall_viewed');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível concluir o desafio.');
      setView('quiz');
    }
  };

  const unlock = async (accessToken: string) => {
    const response = await fetch(`/api/result/${accessToken}`);
    const data = await response.json() as { result?: ResultProfile; error?: string };
    if (!response.ok || !data.result) throw new Error(data.error ?? 'Não foi possível liberar o relatório.');
    localStorage.setItem('mentex_access_token', accessToken);
    setResult(data.result);
    setView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restart = () => {
    setSessionId(''); setQuestions([]); setPreview(null); setResult(null); setError(''); setView('landing');
    localStorage.removeItem('mentex_session_id');
    localStorage.removeItem('mentex_access_token');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    trackEvent('landing_viewed');
    const storedSessionId = localStorage.getItem('mentex_session_id');
    const accessToken = localStorage.getItem('mentex_access_token');
    if (!storedSessionId || !accessToken) return;
    void fetch('/api/session/recover', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: storedSessionId, accessToken }),
    }).then((response) => response.json()).then(async (data: { recovered?: boolean }) => {
      if (!data.recovered) return;
      setSessionId(storedSessionId);
      await unlock(accessToken);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: 'start_mentex_challenge',
        title: 'Iniciar desafio MenteX',
        description: 'Inicia a sessão anônima e abre o primeiro desafio recreativo visível.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          if (!input || typeof input !== 'object' || Object.keys(input as object).length !== 0) throw new Error('Este comando não aceita parâmetros.');
          await startChallenge();
          return { state: 'quiz_started' };
        },
      }, { signal: lifecycle.signal })).catch(() => undefined);
      void Promise.resolve(context.registerTool({
        name: 'read_mentex_challenge_state',
        title: 'Consultar etapa do desafio',
        description: 'Retorna apenas a etapa atual visível do desafio MenteX.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: (input) => {
          if (!input || typeof input !== 'object' || Object.keys(input as object).length !== 0) throw new Error('Este comando não aceita parâmetros.');
          return { state: viewRef.current };
        },
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch { /* Navegadores sem WebMCP seguem com a interface normal. */ }
    return () => lifecycle.abort();
  }, [startChallenge]);

  return (
    <main className="site-shell">
      <NeuralBackground />
      {error && <div className="global-error" role="alert"><AlertTriangle /> {error}</div>}
      {view === 'landing' && <Landing onStart={startChallenge} loading={loading} />}
      {view === 'quiz' && <QuizExperience questions={questions} onFinish={finishChallenge} onExit={restart} />}
      {view === 'processing' && <Processing />}
      {view === 'preview' && preview && <ResultPreview sessionId={sessionId} preview={preview} onUnlock={unlock} onRestart={restart} />}
      {view === 'result' && result && <UnlockedResult result={result} onRestart={restart} />}
      <ConsentBanner />
    </main>
  );
}
