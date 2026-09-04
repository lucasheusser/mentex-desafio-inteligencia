import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mentex-desafio-inteligencia.roiserr.chatgpt.site'),
  title: {
    default: 'MenteX — Desafio de Inteligência',
    template: '%s · MenteX',
  },
  description:
    'Desafios recreativos de lógica, memória e percepção com resultado personalizado.',
  keywords: ['desafio de lógica', 'jogos mentais', 'raciocínio', 'memória', 'percepção'],
  openGraph: {
    title: 'Até onde vai o seu raciocínio?',
    description: '15 desafios recreativos de lógica, memória e percepção. Sem cadastro.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary',
    title: 'Até onde vai o seu raciocínio?',
    description: '15 desafios recreativos de lógica, memória e percepção. Sem cadastro.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#070918',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
