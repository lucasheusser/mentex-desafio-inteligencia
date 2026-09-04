export const siteConfig = {
  brandName: 'MenteX',
  productName: 'Desafio de Inteligência',
  domain: 'CONFIGURAR_DOMINIO',
  priceCents: 1990,
  priceLabel: 'R$ 19,90',
  paymentProvider: 'Mercado Pago',
  companyName: 'CONFIGURAR_EMPRESA_RESPONSAVEL',
  companyDocument: 'CONFIGURAR_CNPJ_OU_CPF',
  supportEmail: 'suporte.mentex@gmail.com',
  resultRetentionDays: 30,
  paymentMode: 'demo' as 'demo' | 'live',
  analytics: {
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? '',
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
    googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? '',
  },
} as const;

export const legalLinks = [
  { href: '/privacidade', label: 'Privacidade' },
  { href: '/termos', label: 'Termos de uso' },
  { href: '/reembolso', label: 'Pagamento e reembolso' },
  { href: '/aviso-recreativo', label: 'Natureza recreativa' },
  { href: '/suporte', label: 'Suporte' },
];
