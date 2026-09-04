'use client';

import { useEffect, useState } from 'react';

const messages = [
  'Analisando seus padrões de resposta…',
  'Comparando precisão e velocidade…',
  'Identificando seus pontos fortes…',
];

export function Processing() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => setIndex((current) => Math.min(current + 1, messages.length - 1)), 720);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <section className="processing-screen" aria-live="polite">
      <div className="processing-orb" aria-hidden="true"><span /><span /><span /></div>
      <p className="mono-label">ANÁLISE LOCAL + SERVIDOR</p>
      <h1>Montando seu perfil</h1>
      <p className="processing-message">{messages[index]}</p>
      <div className="processing-line"><span style={{ width: `${((index + 1) / messages.length) * 100}%` }} /></div>
      <small>Isso leva apenas alguns segundos.</small>
    </section>
  );
}
