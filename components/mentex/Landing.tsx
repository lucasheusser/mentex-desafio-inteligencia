'use client';

import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import { ArrowRight, BrainCircuit, Clock3, Fingerprint, Gauge, ScanLine, ShieldCheck, Sparkles, UserRoundX, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SiteFooter } from './SiteFooter';
import { siteConfig } from '@/config/site';

const quickFacts = [
  { icon: Clock3, label: '≈ 5 minutos' },
  { icon: UserRoundX, label: 'Sem cadastro' },
  { icon: Sparkles, label: 'Resultado imediato' },
  { icon: ShieldCheck, label: 'Pagamento único' },
];

const steps = [
  { number: '01', icon: BrainCircuit, title: 'Resolva os desafios', text: '15 perguntas curtas de lógica, memória, atenção e percepção.' },
  { number: '02', icon: ScanLine, title: 'Veja uma prévia', text: 'Receba uma leitura inicial do seu desempenho sem pagar.' },
  { number: '03', icon: Fingerprint, title: 'Desbloqueie a análise', text: 'Acesse pontuação, categorias e um resumo personalizado.' },
];

const faqs = [
  ['O teste é gratuito?', 'Sim. Você responde a todos os desafios gratuitamente. O pagamento único libera apenas o relatório completo.'],
  ['Preciso criar uma conta?', 'Não. Criamos somente uma sessão anônima vinculada ao teste e à transação.'],
  ['Quando saberei o resultado?', 'A prévia aparece assim que você termina. O relatório completo é liberado após a confirmação do pagamento.'],
  ['O pagamento é recorrente?', 'Não. É um pagamento único e nenhuma assinatura é criada.'],
  ['Este é um teste de QI profissional?', 'Não. É uma experiência recreativa de raciocínio e não substitui avaliações padronizadas aplicadas por profissionais.'],
  ['Quais formas de pagamento são aceitas?', 'A estrutura prioriza Pix e cartão de crédito. Nesta versão, o checkout está claramente identificado como demonstração.'],
  ['Por quanto tempo posso acessar meu resultado?', `A configuração inicial prevê ${siteConfig.resultRetentionDays} dias no mesmo dispositivo. Esse prazo pode ser ajustado antes da operação comercial.`],
];

export function Landing({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animate('.hero-reveal', { opacity: [0, 1], translateY: [24, 0], delay: stagger(85), duration: 720, ease: 'outExpo' });
    animate('.orbit-a', { rotate: '1turn', duration: 26000, loop: true, ease: 'linear' });
    animate('.orbit-b', { rotate: '-1turn', duration: 18000, loop: true, ease: 'linear' });
  }, []);

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="MenteX — início"><span className="brand-mark">M</span><span>MenteX</span></a>
        <nav className="header-nav" aria-label="Navegação principal"><a href="#como-funciona">Como funciona</a><a href="#metodologia">Metodologia</a><a href="#faq">FAQ</a></nav>
        <span className="header-note">Experiência recreativa</span>
      </header>

      <section id="inicio" className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          {siteConfig.paymentMode === 'demo' && <div className="demo-flag hero-reveal">MODO DE DEMONSTRAÇÃO · SEM COBRANÇA REAL</div>}
          <div className="eyebrow hero-reveal"><span /> DESAFIO 01 · PERFIL LÓGICO</div>
          <h1 id="hero-title" className="hero-reveal">Até onde vai o seu <em>raciocínio?</em></h1>
          <p className="hero-lead hero-reveal">Resolva desafios de lógica, memória e percepção e descubra como você se sai em diferentes habilidades mentais.</p>
          <div className="fact-grid hero-reveal" aria-label="Informações do desafio">
            {quickFacts.map(({ icon: Icon, label }) => <span key={label}><Icon aria-hidden="true" />{label}</span>)}
          </div>
          <Button onClick={onStart} disabled={loading} className="primary-cta hero-reveal" size="lg">
            {loading ? 'Preparando desafio…' : 'Começar o desafio'} <ArrowRight aria-hidden="true" />
          </Button>
          <p className="cta-note hero-reveal">O teste é gratuito. O relatório completo é liberado mediante pagamento.</p>
        </div>

        <div className="hero-lab hero-reveal" aria-label="Demonstração visual de um desafio de padrões">
          <div className="lab-topline"><span>DEMO / PADRÕES</span><span className="pulse-dot">ATIVO</span></div>
          <div className="orbit-stage" aria-hidden="true">
            <span className="orbit orbit-a"><i /><i /><i /></span><span className="orbit orbit-b"><i /><i /></span><span className="core">?</span>
            <span className="coordinate coordinate-a">A1</span><span className="coordinate coordinate-b">B4</span>
          </div>
          <p>Qual elemento completa o padrão?</p>
          <div className="demo-answers" aria-hidden="true"><span>◆</span><span>●</span><span>▲</span><span>■</span></div>
        </div>
      </section>

      <section id="como-funciona" className="content-section steps-section">
        <div className="section-heading"><p className="mono-label">RÁPIDO E TRANSPARENTE</p><h2>Você entra pela curiosidade.<br />Sai com uma leitura clara.</h2></div>
        <div className="steps-grid">
          {steps.map(({ number, icon: Icon, title, text }) => <article key={number} className="step-card"><span>{number}</span><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}
        </div>
        <p className="recreation-note"><ShieldCheck aria-hidden="true" /> O MenteX observa seu desempenho apenas neste conjunto de jogos. Não oferece diagnóstico, laudo psicológico nem pontuação clínica de QI.</p>
      </section>

      <section id="metodologia" className="content-section method-section">
        <div className="method-visual" aria-hidden="true">
          <div className="method-score"><span>6</span><small>habilidades</small></div>
          {[Gauge, Zap, BrainCircuit].map((Icon, i) => <div key={i} className={`method-node node-${i}`}><Icon /></div>)}
        </div>
        <div className="method-copy"><p className="mono-label">COMO A LEITURA É FORMADA</p><h2>Acertos têm mais peso. Velocidade entra como contexto.</h2><p>A pontuação considera respostas corretas, dificuldade e categoria. O tempo tem influência limitada, e respostas rápidas demais recebem uma pequena correção para reduzir escolhas aleatórias.</p><ul><li>15 desafios com resposta defensável</li><li>6 áreas de raciocínio observadas</li><li>Sem comparação clínica ou diagnóstico</li></ul><Button onClick={onStart} className="secondary-cta">Testar meu raciocínio <ArrowRight /></Button></div>
      </section>

      <section id="faq" className="content-section faq-section">
        <div className="section-heading"><p className="mono-label">ANTES DE COMEÇAR</p><h2>Perguntas frequentes</h2></div>
        <Accordion className="faq-list">
          {faqs.map(([question, answer], index) => <AccordionItem key={question} value={`faq-${index}`}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent><p>{answer}</p></AccordionContent></AccordionItem>)}
        </Accordion>
      </section>

      <section className="final-cta"><p className="mono-label">SEU PRÓXIMO PADRÃO COMEÇA AGORA</p><h2>15 desafios. Cerca de 5 minutos.</h2><Button onClick={onStart} disabled={loading} className="primary-cta">Começar o desafio <ArrowRight /></Button></section>
      <SiteFooter />
    </>
  );
}
