type EventPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, payload: EventPayload = {}) {
  if (typeof window === 'undefined' || localStorage.getItem('mentex_analytics_consent') !== 'granted') return;
  window.dataLayer?.push({ event, ...payload });
  window.dispatchEvent(new CustomEvent('mentex:analytics', { detail: { event, ...payload } }));
}
