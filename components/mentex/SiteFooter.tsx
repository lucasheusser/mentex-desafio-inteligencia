import { legalLinks, siteConfig } from '@/config/site';
import { ConsentPreferences } from './ConsentPreferences';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand"><span className="brand-mark">M</span><div><strong>{siteConfig.brandName}</strong><small>{siteConfig.productName}</small></div></div>
      <p>Uma experiência recreativa de lógica, memória e percepção. Não é avaliação psicológica, diagnóstico ou teste clínico de QI.</p>
      <nav aria-label="Links legais">
        {legalLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
        <ConsentPreferences />
      </nav>
      <small>© {new Date().getFullYear()} {siteConfig.companyName}. Dados empresariais configuráveis antes da publicação comercial.</small>
    </footer>
  );
}
