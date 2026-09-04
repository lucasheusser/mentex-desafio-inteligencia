'use client';

export function ConsentPreferences() {
  return <button className="footer-consent" onClick={() => { localStorage.removeItem('mentex_analytics_consent'); window.dispatchEvent(new Event('mentex:consent-reset')); }}>Preferências de analytics</button>;
}
