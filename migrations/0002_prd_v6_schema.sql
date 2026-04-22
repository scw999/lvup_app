-- PRD v6 (2026-04-21) 스키마 마이그레이션
-- 변경 요약:
--   - user_classes 테이블 추가 (class_code 이력화)
--   - milestone_titles 테이블 추가 (12개 레벨 칭호)
--   - harp_messages / user_message_history 추가
--   - pattern_progress / journey_milestones / user_milestone_reached 추가
--   - user_physical_profile 추가
--   - character_courses / character_course_quests / user_course_progress 추가
--   - quests: source / challenge_level / quantitative_metric / metric_category 추가
--   - verifications: 멀티플라이어 컬럼 4개 + challenge_succeeded / qualitative_score / message_shown_id 추가
--   - growth_log: level 컬럼 추가
--   - level_events: milestone_title_id / unlocked_features 추가
--   - badges: unlock_condition / is_hidden / icon_url 추가
--   - user_badges: acknowledged 추가
--   - 데이터 마이그레이션: class_code → user_classes, first_goal → goal

-- ── 신규 테이블 ──────────────────────────────────────────────

CREATE TABLE `user_classes` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `class` text NOT NULL,
  `role` text NOT NULL DEFAULT 'primary',
  `started_at` text NOT NULL DEFAULT (datetime('now')),
  `ended_at` text,
  `reason` text,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_user_classes_active` ON `user_classes` (`user_id`, `role`, `ended_at`);
--> statement-breakpoint

CREATE TABLE `milestone_titles` (
  `id` text PRIMARY KEY NOT NULL,
  `level` integer NOT NULL UNIQUE,
  `title` text NOT NULL,
  `unlocks` text,
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint

CREATE TABLE `harp_messages` (
  `id` text PRIMARY KEY NOT NULL,
  `category` text NOT NULL,
  `message_text` text NOT NULL,
  `min_level` integer,
  `max_level` integer,
  `required_class` text,
  `tone_check` text,
  `is_active` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `idx_harp_messages_category` ON `harp_messages` (`category`, `is_active`);
--> statement-breakpoint

CREATE TABLE `user_message_history` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `message_id` text NOT NULL,
  `shown_at` text NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade,
  FOREIGN KEY (`message_id`) REFERENCES `harp_messages`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_message_history_user_time` ON `user_message_history` (`user_id`, `shown_at`);
--> statement-breakpoint

CREATE TABLE `pattern_progress` (
  `user_id` text NOT NULL,
  `pattern_signature` text NOT NULL,
  `attempt_count` integer NOT NULL DEFAULT 0,
  `consecutive_count` integer NOT NULL DEFAULT 0,
  `last_diminishing_multiplier` real NOT NULL DEFAULT 1.0,
  `reset_count` integer NOT NULL DEFAULT 0,
  `best_quantitative` integer,
  `avg_qualitative` real,
  `qualitative_sample_size` integer NOT NULL DEFAULT 0,
  `first_attempted_at` text,
  `last_attempted_at` text,
  PRIMARY KEY (`user_id`, `pattern_signature`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_pattern_progress_user` ON `pattern_progress` (`user_id`, `last_attempted_at`);
--> statement-breakpoint

CREATE TABLE `journey_milestones` (
  `id` text PRIMARY KEY NOT NULL,
  `category` text NOT NULL,
  `metric_unit` text NOT NULL,
  `stage_name` text NOT NULL,
  `stage_order` integer NOT NULL,
  `threshold_value` integer NOT NULL,
  `age_min` integer,
  `age_max` integer,
  `sex` text,
  `first_reach_multiplier` real NOT NULL DEFAULT 1.3,
  `reach_message` text,
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `idx_milestones_category` ON `journey_milestones` (`category`, `stage_order`);
--> statement-breakpoint

CREATE TABLE `user_milestone_reached` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `milestone_id` text NOT NULL,
  `reached_at` text NOT NULL DEFAULT (datetime('now')),
  `reached_value` integer NOT NULL,
  `verification_id` text,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade,
  FOREIGN KEY (`milestone_id`) REFERENCES `journey_milestones`(`id`) ON DELETE cascade,
  FOREIGN KEY (`verification_id`) REFERENCES `verifications`(`id`) ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_milestone_unique` ON `user_milestone_reached` (`user_id`, `milestone_id`);
--> statement-breakpoint

CREATE TABLE `user_physical_profile` (
  `user_id` text PRIMARY KEY NOT NULL,
  `birth_year` integer,
  `sex` text,
  `country_code` text,
  `consent_for_distribution_only` integer NOT NULL DEFAULT 1,
  `shared_at` text NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade
);
--> statement-breakpoint

CREATE TABLE `character_courses` (
  `id` text PRIMARY KEY NOT NULL,
  `character_name` text NOT NULL,
  `arcana_code` text,
  `course_title` text NOT NULL,
  `course_description` text,
  `start_level` integer NOT NULL,
  `end_level` integer NOT NULL,
  `total_quests` integer NOT NULL DEFAULT 0,
  `unlocked_excerpt_count` integer NOT NULL DEFAULT 0,
  `required_membership` text NOT NULL DEFAULT 'founder',
  `is_active` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint

CREATE TABLE `character_course_quests` (
  `id` text PRIMARY KEY NOT NULL,
  `course_id` text NOT NULL,
  `quest_template_id` text NOT NULL,
  `step_order` integer NOT NULL,
  `unlocked_excerpt_id` text,
  `unlocked_excerpt_title` text,
  `character_context` text,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (`course_id`) REFERENCES `character_courses`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_step_unique` ON `character_course_quests` (`course_id`, `step_order`);
--> statement-breakpoint

CREATE TABLE `user_course_progress` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `course_id` text NOT NULL,
  `current_step` integer NOT NULL DEFAULT 1,
  `completed_steps` integer NOT NULL DEFAULT 0,
  `started_at` text NOT NULL DEFAULT (datetime('now')),
  `completed_at` text,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade,
  FOREIGN KEY (`course_id`) REFERENCES `character_courses`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_course_unique` ON `user_course_progress` (`user_id`, `course_id`);
--> statement-breakpoint

-- ── 기존 테이블 컬럼 추가 ────────────────────────────────────

-- users: goal 추가 (first_goal의 PRD v6 명칭)
ALTER TABLE `users` ADD `goal` text;
--> statement-breakpoint

-- quests: 주도성 + 도전 시스템
ALTER TABLE `quests` ADD `source` text NOT NULL DEFAULT 'system';
--> statement-breakpoint
ALTER TABLE `quests` ADD `challenge_level` text;
--> statement-breakpoint
ALTER TABLE `quests` ADD `quantitative_metric` integer;
--> statement-breakpoint
ALTER TABLE `quests` ADD `metric_category` text;
--> statement-breakpoint

-- verifications: 보상 산정 투명화
ALTER TABLE `verifications` ADD `challenge_succeeded` integer;
--> statement-breakpoint
ALTER TABLE `verifications` ADD `qualitative_score` integer;
--> statement-breakpoint
ALTER TABLE `verifications` ADD `challenge_multiplier_applied` real NOT NULL DEFAULT 1.0;
--> statement-breakpoint
ALTER TABLE `verifications` ADD `diminishing_multiplier_applied` real NOT NULL DEFAULT 1.0;
--> statement-breakpoint
ALTER TABLE `verifications` ADD `self_progress_multiplier_applied` real NOT NULL DEFAULT 1.0;
--> statement-breakpoint
ALTER TABLE `verifications` ADD `milestone_multiplier_applied` real NOT NULL DEFAULT 1.0;
--> statement-breakpoint
ALTER TABLE `verifications` ADD `message_shown_id` text;
--> statement-breakpoint

-- growth_log: 날짜별 레벨 스냅샷
ALTER TABLE `growth_log` ADD `level` integer;
--> statement-breakpoint

-- level_events: milestone_titles 정규화 참조
ALTER TABLE `level_events` ADD `milestone_title_id` text;
--> statement-breakpoint
ALTER TABLE `level_events` ADD `unlocked_features` text;
--> statement-breakpoint

-- badges: v6 확장 (업적/행동/히든 유형)
ALTER TABLE `badges` ADD `unlock_condition` text;
--> statement-breakpoint
ALTER TABLE `badges` ADD `is_hidden` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `badges` ADD `icon_url` text;
--> statement-breakpoint

-- user_badges: 히든 뱃지 인지 여부
ALTER TABLE `user_badges` ADD `acknowledged` integer NOT NULL DEFAULT 1;
--> statement-breakpoint

-- ── 데이터 마이그레이션 ──────────────────────────────────────

-- 기존 users.class_code → user_classes (primary 클래스로 이관)
INSERT OR IGNORE INTO user_classes (id, user_id, class, role, started_at, reason, created_at)
SELECT
  'ucl_' || id,
  id,
  class_code,
  'primary',
  created_at,
  'initial_choice',
  created_at
FROM users
WHERE class_code IS NOT NULL;
--> statement-breakpoint

-- users.first_goal → goal 복사
UPDATE users SET goal = first_goal WHERE first_goal IS NOT NULL;
--> statement-breakpoint

-- milestone_titles 초기 시드 (PRD v6 Part 11.4.1 — 12개 마일스톤 칭호)
INSERT OR IGNORE INTO milestone_titles (id, level, title, unlocks) VALUES
  ('mt_5',   5,   '입장한 자',          '기본 퀘스트'),
  ('mt_10',  10,  '자각한 자',          '커스텀 퀘스트 생성'),
  ('mt_15',  15,  '첫 걸음을 뗀 자',    '주간 요약 리포트'),
  ('mt_20',  20,  '자기 길을 걷는 자',  '7일 연속 배지'),
  ('mt_30',  30,  '멈추지 않는 자',     '길드 입장 (Phase 2)'),
  ('mt_40',  40,  '자기 방식을 만든 자','추천 퀘스트 고도화'),
  ('mt_50',  50,  '경지에 선 자',       '스토리 퀘스트 (Phase 2)'),
  ('mt_60',  60,  '가르칠 수 있는 자',  '멘토 자격 (Phase 2)'),
  ('mt_70',  70,  '분야를 넓힌 자',     '프로젝트 퀘스트 (Phase 2)'),
  ('mt_80',  80,  '시대를 읽는 자',     '시즌 졸업, 마스터 트랙'),
  ('mt_90',  90,  '길을 연 자',         NULL),
  ('mt_100', 100, '역사에 남은 자',      NULL);
