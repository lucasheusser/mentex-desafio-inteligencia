import { openCapsule, paymentMode, verifyDemoReceipt, verifyMercadoPagoPayment } from '@/lib/server/state';

export async function POST(request: Request) {
  const body = await request.json() as { capsule?: unknown; paymentId?: unknown };
  const capsule = await openCapsule(body.capsule);
  if (!capsule) return Response.json({ recovered: false }, { status: 400 });
  const mode = paymentMode();
  if (mode === 'demo') {
    const recovered = verifyDemoReceipt(body.paymentId, capsule.id);
    return Response.json({ recovered, paymentStatus: recovered ? 'approved' : 'unavailable' });
  }
  if (mode !== 'live') return Response.json({ recovered: false, paymentStatus: 'unavailable' }, { status: 503 });
  const payment = await verifyMercadoPagoPayment(body.paymentId, capsule.id);
  return Response.json({ recovered: payment.valid, paymentStatus: payment.status ?? 'unavailable' });
}
