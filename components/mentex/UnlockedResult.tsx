'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { Award, Download, Gauge, RefreshCcw, Share2, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteFooter } from './SiteFooter';
import type { ResultProfile } from '@/lib/scoring';
import { trackEvent } from '@/lib/analytics';

export function UnlockedResult({ result, onRestart }: { result: ResultProfile; onRestart: () => void }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const categories = Object.entries(result.categoryScores);

  useEffect(() => {
    trackEvent('result_viewed', { score: result.score });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animate('.unlock-reveal', { opacity: [0, 1], translateY: [20, 0], delay: stagger(90), duration: 620, ease: 'outExpo' });
    if (circleRef.current) animate(circleRef.current, { strokeDashoffset: [565, 565 - (565 * result.score) / 100], duration: 1500, ease: 'outExpo' });
    animate('.skill-bar-fill', { scaleX: [0, 1], delay: stagger(100), duration: 900, ease: 'outExpo' });
  }, [result]);

  const download = () => {
    const lines = [
      'MENTEX — RESUMO DO RESULTADO', '', `Índice recreativo: ${result.score}/100`, `Faixa: ${result.band}`,
      `Acertos ponderados: ${result.accuracy}%`, `Indicador de velocidade: ${result.speed}%`,
      `Principal ponto forte: ${result.strength}`, `Maior espaço para evolução: ${result.growth}`, '',
      ...categories.map(([name, value]) => `${name}: ${value}%`), '', result.summary, '',
      'Resultado recreativo. Não é diagnóstico, laudo psicológico ou teste clínico de QI.',
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'mentex-resumo-do-resultado.txt'; anchor.click(); URL.revokeObjectURL(url);
    trackEvent('result_downloaded');
  };

  const share = async () => {
    const text = `Meu perfil recreativo MenteX: índice ${result.score}/100, com destaque em ${result.strength.toLowerCase()}.`;
    if (navigator.share) await navigator.share({ title: 'Meu resultado MenteX', text });
    else await navigator.clipboard.writeText(text);
    trackEvent('result_shared');
  };

  return (
    <>
      <section className="unlocked-shell">
        <div className="unlock-burst" aria-hidden="true" />
        <header className="result-header unlock-reveal"><div className="brand"><span className="brand-mark">M</span><span>MenteX</span></div><span className="unlocked-pill"><Sparkles /> RELATÓRIO DESBLOQUEADO</span></header>
        <div className="score-hero">
          <div className="score-ring unlock-reveal">
            <svg viewBox="0 0 200 200" aria-label={`Índice recreativo: ${result.score} de 100`}><circle className="ring-track" cx="100" cy="100" r="90"/><circle ref={circleRef} className="ring-value" cx="100" cy="100" r="90"/></svg>
            <div><strong>{result.score}</strong><span>/ 100</span><small>índice recreativo</small></div>
          </div>
          <div className="score-copy unlock-reveal"><p className="mono-label">SEU PERFIL LÓGICO ESTIMADO</p><h1>{result.band}</h1><p>{result.summary}</p><div className="score-actions"><Button onClick={download}><Download /> Baixar resumo</Button><Button variant="outline" onClick={share}><Share2 /> Compartilhar card</Button></div></div>
        </div>

        <div className="result-kpis unlock-reveal"><article><Award /><span>{result.accuracy}%</span><small>acertos ponderados</small></article><article><Gauge /><span>{result.speed}%</span><small>indicador de velocidade</small></article><article><TrendingUp /><span>{result.strength}</span><small>principal ponto forte</small></article></div>

        <div className="result-detail-grid">
          <section className="skills-panel unlock-reveal"><p className="mono-label">DESEMPENHO POR HABILIDADE</p><h2>Seu mapa de raciocínio</h2><div className="skill-list">{categories.map(([name, value]) => <div className="skill-row" key={name}><div><span>{name}</span><strong>{value}%</strong></div><div className="skill-bar"><span className="skill-bar-fill" style={{ width: `${value}%` }} /></div></div>)}</div></section>
          <aside className="insight-panel unlock-reveal"><article><span>MAIOR FORÇA</span><h3>{result.strength}</h3><p>Foi a categoria com maior proporção de acertos ponderados neste conjunto.</p></article><article><span>PARA DESENVOLVER</span><h3>{result.growth}</h3><p>Praticar desafios desta categoria pode ampliar a familiaridade com o tipo de raciocínio observado.</p></article></aside>
        </div>

        <section className="method-explanation unlock-reveal"><p className="mono-label">LEIA COM CONTEXTO</p><h2>O que esta pontuação significa</h2><p>O índice combina acertos, dificuldade e distribuição entre categorias. A velocidade representa apenas 12% do cálculo e recebe limites para evitar que pressa pareça desempenho. O resultado descreve este conjunto de 15 desafios — não mede inteligência de forma clínica nem substitui avaliação profissional.</p></section>
        <div className="restart-row"><Button variant="outline" onClick={onRestart}><RefreshCcw /> Refazer o desafio</Button></div>
      </section>
      <SiteFooter />
    </>
  );
}
