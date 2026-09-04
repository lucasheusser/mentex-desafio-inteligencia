import { verifyMercadoPagoPayment, verifyMercadoPagoSignature } from '@/lib/server/state';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as { data?: { id?: string | number } } | null;
  const paymentId = payload?.data?.id?.toString() ?? new URL(request.url).searchParams.get('data.id');
  if (!paymentId || !verifyMercadoPagoSignature(request, paymentId)) return Response.json({ error: 'Assinatura inválida.' }, { status: 401 });
  await verifyMercadoPagoPayment(paymentId, '');
  return Response.json({ received: true });
}
