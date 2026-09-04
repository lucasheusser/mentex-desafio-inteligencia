'use client';

import { useState } from 'react';
import { ArrowRight, Ban, CheckCircle2, CreditCard, LockKeyhole, QrCode, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig, legalLinks } from '@/config/site';
import { trackEvent } from '@/lib/analytics';

type Preview = { answered: number; total: number; completion: number; preliminary: string; strength: string };
type PaymentStatus = 'idle' | 'loading' | 'pending' | 'approved' | 'declined' | 'cancelled' | 'error';

export function ResultPreview({ sessionId, capsule, paymentMode, preview, onUnlock, onRestart }: {
  sessionId: string;
  capsule: string;
  paymentMode: 'demo' | 'live';
  preview: Preview;
  onUnlock: (paymentId: string) => Promise<void>;
  onRestart: () => void;
}) {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState('');

  const checkout = async (outcome: 'approved' | 'pending' | 'declined' | 'cancelled') => {
    setStatus('loading');
    setError('');
    trackEvent('checkout_started', { method: 'demo', value: siteConfig.priceCents / 100 });
    try {
      const response = await fetch(`/api/session/${sessionId}/checkout`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ capsule, outcome }) });
      const data = await response.json() as { status?: PaymentStatus; paymentId?: string; initPoint?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Não foi possível iniciar o checkout.');
      if (paymentMode === 'live' && data.initPoint) { window.location.assign(data.initPoint); return; }
      setStatus(data.status ?? 'error');
      if (data.status === 'approved' && data.paymentId) {
        trackEvent('payment_approved', { mode: 'demo' });
        await onUnlock(data.paymentId);
      }
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Falha temporária. Tente novamente.');
    }
  };

  return (
    <section className="result-preview-shell" aria-labelledby="result-ready">
      <div className="preview-heading"><p className="mono-label">ANÁLISE CONCLUÍDA</p><h1 id="result-ready">Seu resultado está pronto</h1><p>Esta prévia já mostra a direção geral do seu desempenho. A análise detalhada permanece protegida.</p></div>
      <div className="preview-grid">
        <div className="preview-data">
          <div className="preview-stats"><article><span>{preview.answered}</span><small>perguntas respondidas</small></article><article><span>{preview.completion}%</span><small>do teste concluído</small></article></div>
          <article className="preliminary-card"><p className="mono-label">CATEGORIA PRELIMINAR</p><h2>{preview.preliminary}</h2><p>Seu sinal mais forte apareceu em <strong>{preview.strength.toLowerCase()}</strong>.</p></article>
          <div className="locked-chart" aria-label="Gráfico parcial bloqueado">
            <div className="ghost-bars">{[78,55,88,69,61,74].map((value, i) => <span key={i} style={{ height: `${value}%` }} />)}</div>
            <div className="chart-lock"><LockKeyhole /><strong>Análise por habilidade</strong><small>Conteúdo disponível após o desbloqueio</small></div>
          </div>
        </div>

        <aside className="paywall-card">
          {paymentMode === 'demo' && <div className="demo-flag">DEMONSTRAÇÃO · NENHUMA COBRANÇA REAL</div>}
          <p className="mono-label">RELATÓRIO COMPLETO</p>
          <h2>Veja como seu raciocínio se distribui.</h2>
          <p>Desbloqueie sua pontuação recreativa, desempenho por habilidade, pontos fortes e áreas que podem ser desenvolvidas.</p>
          <ul><li><CheckCircle2 /> Índice recreativo estimado</li><li><CheckCircle2 /> Precisão e velocidade</li><li><CheckCircle2 /> Resultado por categoria</li><li><CheckCircle2 /> Resumo personalizado</li><li><CheckCircle2 /> Card para baixar e compartilhar</li></ul>
          <div className="price-row"><div><small>Pagamento único</small><strong>{siteConfig.priceLabel}</strong></div><span>sem assinatura</span></div>
          <div className="payment-methods"><span><QrCode /> Pix</span><span><CreditCard /> Cartão</span></div>
          <Button className="unlock-button" disabled={status === 'loading'} onClick={() => checkout('approved')}>{status === 'loading' ? 'Processando…' : paymentMode === 'demo' ? 'Liberar resultado no modo demo' : 'Ir para pagamento seguro'} <ArrowRight /></Button>
          <p className="security-copy"><ShieldCheck /> {paymentMode === 'demo' ? 'Demonstração segura. Nenhuma assinatura ou cobrança será criada.' : 'Pagamento processado com segurança pelo Mercado Pago.'}</p>
          {paymentMode === 'demo' && <div className="demo-states"><span>Testar outros estados:</span><button onClick={() => checkout('pending')}>Pendente</button><button onClick={() => checkout('declined')}>Recusado</button><button onClick={() => checkout('cancelled')}>Cancelado</button></div>}
          {status === 'pending' && <div className="payment-message pending"><QrCode /> Pagamento demo pendente. Aguarde a confirmação.</div>}
          {status === 'declined' && <div className="payment-message declined"><XCircle /> Pagamento demo recusado. Tente outro método.</div>}
          {status === 'cancelled' && <div className="payment-message cancelled"><Ban /> Checkout demo cancelado. Nenhuma cobrança foi feita.</div>}
          {status === 'error' && <div className="payment-message declined"><XCircle /> {error}</div>}
          <div className="paywall-legal">{legalLinks.slice(0, 3).map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</div>
        </aside>
      </div>
      <Button variant="ghost" onClick={onRestart}>Refazer o desafio</Button>
    </section>
  );
}
