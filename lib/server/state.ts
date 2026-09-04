import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { siteConfig } from '@/config/site';
import type { ResultProfile } from '@/lib/scoring';

const encoder = new TextEncoder();
const capsuleVersion = 1;
const sessionLifetimeMs = 2 * 60 * 60 * 1000;

type SignedSession = { id: string; createdAt: number; expiresAt: number; nonce: string };
type CapsulePayload = SignedSession & { result: ResultProfile; preview: ResultPreview; methodologyVersion: string };
type PaymentReceipt = { sessionId: string; status: 'approved'; createdAt: number; expiresAt: number; nonce: string };
export type ResultPreview = { answered: number; total: number; completion: number; preliminary: string; strength: string };

function secret() {
  const value = process.env.RESULT_TOKEN_SECRET;
  if (!value || value.length < 32) throw new Error('A configuração segura do resultado não está disponível.');
  return value;
}

function encode(value: Uint8Array | string) {
  return Buffer.from(value).toString('base64url');
}

function decode(value: string) {
  return Buffer.from(value, 'base64url');
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

function signedToken(payload: object) {
  const body = encode(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function verifySignedToken<T>(token: string): T | null {
  const [body, signature, extra] = token.split('.');
  if (!body || !signature || extra) return null;
  const expected = sign(body);
  const received = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (received.length !== expectedBuffer.length || !timingSafeEqual(received, expectedBuffer)) return null;
  try { return JSON.parse(decode(body).toString('utf8')) as T; } catch { return null; }
}

function assertFresh(payload: { expiresAt: number }) {
  return Number.isFinite(payload.expiresAt) && payload.expiresAt > Date.now();
}

export function createSession() {
  const createdAt = Date.now();
  const session: SignedSession = { id: randomUUID(), createdAt, expiresAt: createdAt + sessionLifetimeMs, nonce: encode(randomBytes(18)) };
  return { session, token: signedToken(session) };
}

export function verifySession(token: unknown, id: string) {
  if (typeof token !== 'string') return null;
  const session = verifySignedToken<SignedSession>(token);
  return session && session.id === id && typeof session.nonce === 'string' && assertFresh(session) ? session : null;
}

export function paymentMode() {
  if (process.env.PAYMENT_MODE !== 'live') return 'demo' as const;
  return process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'live' as const : 'unavailable' as const;
}

export async function createCapsule(session: SignedSession, result: ResultProfile) {
  const preview: ResultPreview = { answered: result.answered, total: result.total, completion: 100, preliminary: result.preliminary, strength: result.strength };
  const payload: CapsulePayload = { ...session, expiresAt: Date.now() + siteConfig.resultRetentionDays * 24 * 60 * 60 * 1000, result, preview, methodologyVersion: '2026-09-04' };
  const iv = randomBytes(12);
  const key = createHash('sha256').update(secret()).digest();
  const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['encrypt']);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoder.encode(JSON.stringify(payload)));
  return `${capsuleVersion}.${encode(iv)}.${encode(new Uint8Array(encrypted))}`;
}

export async function openCapsule(token: unknown) {
  if (typeof token !== 'string') return null;
  const [version, ivValue, cipherValue, extra] = token.split('.');
  if (version !== String(capsuleVersion) || !ivValue || !cipherValue || extra) return null;
  try {
    const key = createHash('sha256').update(secret()).digest();
    const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(ivValue) }, cryptoKey, decode(cipherValue));
    const payload = JSON.parse(new TextDecoder().decode(plain)) as CapsulePayload;
    return typeof payload.id === 'string' && typeof payload.nonce === 'string' && payload.result && payload.preview && assertFresh(payload) ? payload : null;
  } catch { return null; }
}

export function createDemoReceipt(sessionId: string) {
  const createdAt = Date.now();
  return signedToken({ sessionId, status: 'approved', createdAt, expiresAt: createdAt + siteConfig.resultRetentionDays * 24 * 60 * 60 * 1000, nonce: encode(randomBytes(18)) } satisfies PaymentReceipt);
}

export function verifyDemoReceipt(receipt: unknown, sessionId: string) {
  if (typeof receipt !== 'string') return false;
  const payment = verifySignedToken<PaymentReceipt>(receipt);
  return Boolean(payment && payment.sessionId === sessionId && payment.status === 'approved' && assertFresh(payment));
}

export async function verifyMercadoPagoPayment(paymentId: unknown, sessionId: string) {
  if (typeof paymentId !== 'string' || !/^[\w-]+$/.test(paymentId)) return { valid: false, error: 'Pagamento inválido.' };
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) return { valid: false, error: 'Credenciais de pagamento indisponíveis.' };
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store',
    });
    if (!response.ok) return { valid: false, error: 'Falha temporária ao consultar o pagamento.' };
    const payment = await response.json() as { status?: string; transaction_amount?: number; currency_id?: string; external_reference?: string };
    if (payment.status !== 'approved') return { valid: false, status: payment.status, error: 'Pagamento ainda não aprovado.' };
    if (payment.transaction_amount !== siteConfig.priceCents / 100) return { valid: false, error: 'Divergência no valor do pagamento.' };
    if (payment.currency_id !== 'BRL') return { valid: false, error: 'Divergência na moeda do pagamento.' };
    if (payment.external_reference !== sessionId) return { valid: false, error: 'Divergência na referência do pagamento.' };
    return { valid: true, status: 'approved' };
  } catch { return { valid: false, error: 'Falha temporária ao consultar o pagamento.' }; }
}

export function verifyMercadoPagoSignature(request: Request, paymentId: string) {
  const secretValue = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const signature = request.headers.get('x-signature');
  if (!secretValue || !signature) return false;
  const parts = Object.fromEntries(signature.split(',').map((part) => part.trim().split('=')));
  if (!parts.ts || !parts.v1) return false;
  const requestId = request.headers.get('x-request-id') ?? '';
  const manifest = `id:${paymentId};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac('sha256', secretValue).update(manifest).digest('hex');
  const received = Buffer.from(parts.v1, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}