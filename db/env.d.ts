declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    PAYMENT_WEBHOOK_SECRET?: string;
    PAYMENT_PROVIDER?: string;
    PAYMENT_MODE?: string;
  }
}
