import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const challengeSessions = sqliteTable(
  'challenge_sessions',
  {
    id: text('id').primaryKey(),
    status: text('status').notNull().default('started'),
    createdAt: integer('created_at').notNull(),
    completedAt: integer('completed_at'),
    expiresAt: integer('expires_at').notNull(),
    answersJson: text('answers_json'),
    resultJson: text('result_json'),
    paymentStatus: text('payment_status').notNull().default('locked'),
    accessToken: text('access_token').unique(),
  },
  (table) => [index('idx_challenge_sessions_expires_at').on(table.expiresAt)],
);

export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id').notNull().references(() => challengeSessions.id),
    provider: text('provider').notNull(),
    providerReference: text('provider_reference').unique(),
    status: text('status').notNull(),
    amountCents: integer('amount_cents').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('idx_payments_session_id').on(table.sessionId)],
);
