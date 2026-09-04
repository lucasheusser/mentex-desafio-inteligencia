import { siteConfig } from '@/config/site';
import { createDemoReceipt, openCapsule, paymentMode } from '@/lib/server/state';

type DemoOutcome = 'approved' | 'pending' | 'declined' | 'cancelled';
const allowedOutcomes = new Set<DemoOutcome>(['approved', 'pending', 'declined', 'cancelled']);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json()) as { capsule?: unknown; outcome?: DemoOutcome };
  const capsule = await openCapsule(body.capsule);
  if (!capsule || capsule.id !== id) return Response.json({ error: 'Cápsula inválida, alterada ou expirada.' }, { status: 400 });
  const mode = paymentMode();
  if (mode === 'unavailable') return Response.json({ error: 'Credenciais de pagamento indisponíveis.' }, { status: 503 });
  if (mode === 'live') {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    try {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          items: [{ title: 'MenteX - Relatório recreativo', quantity: 1, unit_price: siteConfig.priceCents / 100, currency_id: 'BRL' }],
          external_reference: capsule.id,
          back_urls: { success: appUrl, pending: appUrl, failure: appUrl },
          auto_return: 'approved',
          notification_url: `${appUrl}/api/webhooks/payment`,
        }),
      });
      const preference = await response.json() as { init_point?: string; message?: string };
      if (!response.ok || !preference.init_point) return Response.json({ error: 'Falha temporária ao iniciar o checkout.' }, { status: 502 });
      return Response.json({ mode: 'live', initPoint: preference.init_point });
    } catch { return Response.json({ error: 'Falha temporária ao iniciar o checkout.' }, { status: 502 }); }
  }

  const outcome = body.outcome && allowedOutcomes.has(body.outcome) ? body.outcome : 'approved';
  const paymentId = outcome === 'approved' ? createDemoReceipt(capsule.id) : undefined;

  return Response.json({
    mode: 'demo',
    status: outcome,
    message: 'Demonstração: nenhuma cobrança foi realizada.',
    paymentId,
  });
}
