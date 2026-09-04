CREATE TABLE `challenge_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'started' NOT NULL,
	`created_at` integer NOT NULL,
	`completed_at` integer,
	`expires_at` integer NOT NULL,
	`answers_json` text,
	`result_json` text,
	`payment_status` text DEFAULT 'locked' NOT NULL,
	`access_token` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `challenge_sessions_access_token_unique` ON `challenge_sessions` (`access_token`);--> statement-breakpoint
CREATE INDEX `idx_challenge_sessions_expires_at` ON `challenge_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_reference` text,
	`status` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `challenge_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_provider_reference_unique` ON `payments` (`provider_reference`);--> statement-breakpoint
CREATE INDEX `idx_payments_session_id` ON `payments` (`session_id`);