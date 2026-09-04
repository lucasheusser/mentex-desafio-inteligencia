import { openCapsule, paymentMode, verifyDemoReceipt, verifyMercadoPagoPayment } from '@/lib/server/state';

export async function POST(request: Request) {
  const body = await request.json() as { capsule?: unknown; paymentId?: unknown };
  const capsule = await openCapsule(body.capsule);
  if (!capsule) return Response.json({ error: 'Cápsula inválida, alterada ou expirada.' }, { status: 400 });
  const mode = paymentMode();
  if (mode === 'unavailable') return Response.json({ error: 'Credenciais de pagamento indisponíveis.' }, { status: 503 });
  if (mode === 'demo') {
    if (!verifyDemoReceipt(body.paymentId, capsule.id)) return Response.json({ error: 'Pagamento não autorizado para este resultado.' }, { status: 402 });
  } else {
    const payment = await verifyMercadoPagoPayment(body.paymentId, capsule.id);
    if (!payment.valid) return Response.json({ error: payment.error, paymentStatus: payment.status ?? 'unavailable' }, { status: payment.status === 'pending' || payment.status === 'in_process' ? 409 : 402 });
  }
  return Response.json({ result: capsule.result, expiresAt: capsule.expiresAt });
}