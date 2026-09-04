import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { legalPages } from '@/lib/legal';
import { SiteFooter } from '@/components/mentex/SiteFooter';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return Object.keys(legalPages).map((legal) => ({ legal }));
}

export async function generateMetadata({ params }: { params: Promise<{ legal: string }> }): Promise<Metadata> {
  const { legal } = await params;
  const page = legalPages[legal];
  return page ? { title: page.title, description: page.intro } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ legal: string }> }) {
  const { legal } = await params;
  const page = legalPages[legal];
  if (!page) notFound();
  return (
    <main className="legal-shell">
      <header className="site-header"><a className="brand" href="/"><span className="brand-mark">M</span><span>MenteX</span></a><a className="back-link" href="/"><ArrowLeft /> Voltar ao desafio</a></header>
      <article className="legal-page">
        <p className="mono-label">{page.eyebrow}</p><h1>{page.title}</h1><p className="legal-intro">{page.intro}</p>
        <div className="legal-sections">{page.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}</div>
        <div className="legal-warning">Esta minuta não substitui revisão jurídica. Campos “CONFIGURAR” precisam ser preenchidos antes da publicação comercial.</div>
      </article>
      <SiteFooter />
    </main>
  );
}
