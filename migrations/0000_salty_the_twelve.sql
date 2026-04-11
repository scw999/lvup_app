CREATE TABLE `badges` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `badges_code_unique` ON `badges` (`code`);--> statement-breakpoint
CREATE TABLE `growth_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`quests_completed` integer DEFAULT 0 NOT NULL,
	`xp_earned` integer DEFAULT 0 NOT NULL,
	`vitality_delta` integer DEFAULT 0 NOT NULL,
	`focus_delta` integer DEFAULT 0 NOT NULL,
	`execution_delta` integer DEFAULT 0 NOT NULL,
	`knowledge_delta` integer DEFAULT 0 NOT NULL,
	`relationship_delta` integer DEFAULT 0 NOT NULL,
	`influence_delta` integer DEFAULT 0 NOT NULL,
	`level_at_end` integer NOT NULL,
	`summary_text` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `growth_log_user_date_unique` ON `growth_log` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `level_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`from_level` integer NOT NULL,
	`to_level` integer NOT NULL,
	`new_title` text NOT NULL,
	`triggered_by_verification_id` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`triggered_by_verification_id`) REFERENCES `verifications`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `quest_media` (
	`id` text PRIMARY KEY NOT NULL,
	`verification_id` text NOT NULL,
	`image_url` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`verification_id`) REFERENCES `verifications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`difficulty` text NOT NULL,
	`main_stat_type` text NOT NULL,
	`xp_reward_base` integer NOT NULL,
	`stat_reward` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`estimated_minutes` integer,
	`due_date` text,
	`completed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`badge_id` text NOT NULL,
	`acquired_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_role_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tag_code` text NOT NULL,
	`tag_name` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_stats` (
	`user_id` text PRIMARY KEY NOT NULL,
	`vitality` integer DEFAULT 10 NOT NULL,
	`focus` integer DEFAULT 10 NOT NULL,
	`execution` integer DEFAULT 10 NOT NULL,
	`knowledge` integer DEFAULT 10 NOT NULL,
	`relationship` integer DEFAULT 10 NOT NULL,
	`influence` integer DEFAULT 10 NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`nickname` text NOT NULL,
	`class_code` text,
	`first_goal` text,
	`level` integer DEFAULT 1 NOT NULL,
	`title` text DEFAULT '입장한 자' NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`xp_to_next` integer DEFAULT 100 NOT NULL,
	`streak_days` integer DEFAULT 0 NOT NULL,
	`last_active_date` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`quest_id` text NOT NULL,
	`user_id` text NOT NULL,
	`note` text,
	`representative_image_url` text,
	`link_url` text,
	`text_only` integer DEFAULT 0 NOT NULL,
	`xp_base_earned` integer DEFAULT 0 NOT NULL,
	`xp_evidence_earned` integer DEFAULT 0 NOT NULL,
	`xp_bonus_earned` integer DEFAULT 0 NOT NULL,
	`xp_total_earned` integer DEFAULT 0 NOT NULL,
	`narrative_message` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`quest_id`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
