'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const reset = () => setVisible(true);
    setVisible(!localStorage.getItem('mentex_analytics_consent'));
    window.addEventListener('mentex:consent-reset', reset);
    return () => window.removeEventListener('mentex:consent-reset', reset);
  }, []);
  if (!visible) return null;
  const decide = (value: 'granted' | 'denied') => {
    localStorage.setItem('mentex_analytics_consent', value);
    setVisible(false);
  };
  return (
    <aside className="consent-banner" aria-label="Preferências de privacidade">
      <div><strong>Privacidade em primeiro lugar</strong><p>Usamos dados de navegação somente com seu consentimento. O teste funciona normalmente sem analytics.</p></div>
      <div><Button variant="ghost" onClick={() => decide('denied')}>Recusar</Button><Button onClick={() => decide('granted')}>Aceitar analytics</Button></div>
    </aside>
  );
}
