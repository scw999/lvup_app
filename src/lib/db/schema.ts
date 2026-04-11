import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// ══════════════════════════════════════════════════════════
// LV UP — D1(SQLite) 데이터 스키마
//
// 기준 문서: docs/TECH_SPEC.md Section 5 (v1.1)
// 원칙:
//   - snake_case 컬럼, camelCase TS 필드
//   - timestamps는 ISO string (`datetime('now')` default)
//   - enum은 app 레벨에서 검증 (아래 상수 배열 참조)
//   - ID prefix: usr_, qst_, vrf_ … (디버깅 편의)
//   - Phase 2 확장 포인트는 구조에 미리 예약 (마이그레이션 비용 최소화)
// ══════════════════════════════════════════════════════════

// ── Enum 상수 (app 레벨 검증용) ─────────────────────────────
export const CLASS_CODES = [
  "builder",
  "creator",
  "leader",
  "explorer",
  "supporter",
] as const;
export type ClassCode = (typeof CLASS_CODES)[number];

export const FIRST_GOALS = ["habit", "project", "income", "team"] as const;
export type FirstGoal = (typeof FIRST_GOALS)[number];

export const MAIN_STAT_TYPES = [
  "vitality",
  "focus",
  "execution",
  "knowledge",
  "relationship",
  "influence",
] as const;
export type MainStatType = (typeof MAIN_STAT_TYPES)[number];

export const QUEST_TYPES = ["daily", "story", "custom", "project"] as const;
export type QuestType = (typeof QUEST_TYPES)[number];

export const QUEST_DIFFICULTIES = ["easy", "normal", "hard", "epic"] as const;
export type QuestDifficulty = (typeof QUEST_DIFFICULTIES)[number];

export const QUEST_STATUSES = ["active", "completed", "archived"] as const;
export type QuestStatus = (typeof QUEST_STATUSES)[number];

export const BADGE_CATEGORIES = [
  "certification",
  "contribution",
  "mastery",
  "title",
] as const;
export type BadgeCategory = (typeof BADGE_CATEGORIES)[number];

// ── users ─────────────────────────────────────────────────
// TECH_SPEC 5.1 — 사용자 기본 정보
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // usr_xxx
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // 소셜 로그인(Phase 2) 대비 nullable
  nickname: text("nickname").notNull(),
  // 가입 직후엔 null. 온보딩 완료 시 채워짐.
  classCode: text("class_code"), // ClassCode | null
  firstGoal: text("first_goal"), // FirstGoal | null
  level: integer("level").notNull().default(1),
  title: text("title").notNull().default("입장한 자"),
  xp: integer("xp").notNull().default(0),
  xpToNext: integer("xp_to_next").notNull().default(100),
  streakDays: integer("streak_days").notNull().default(0),
  lastActiveDate: text("last_active_date"), // YYYY-MM-DD
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── sessions ──────────────────────────────────────────────
// 쿠키 기반 세션 (Lucia 패턴 또는 자체 구현 공통 구조)
// TECH_SPEC에는 명시되지 않았으나 인증 구현에 필수.
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // 세션 토큰 해시 (원본 토큰은 쿠키에만)
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(), // ISO timestamp
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── user_stats ────────────────────────────────────────────
// TECH_SPEC 5.2 — 6대 메인 스탯 (PRD Part 5)
export const userStats = sqliteTable("user_stats", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  vitality: integer("vitality").notNull().default(10),
  focus: integer("focus").notNull().default(10),
  execution: integer("execution").notNull().default(10),
  knowledge: integer("knowledge").notNull().default(10),
  relationship: integer("relationship").notNull().default(10),
  influence: integer("influence").notNull().default(10),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── user_role_tags ────────────────────────────────────────
// TECH_SPEC 5.3 — 사용자 역할 태그 (PRD Part 7)
export const userRoleTags = sqliteTable("user_role_tags", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tagCode: text("tag_code").notNull(), // dev / design / research …
  tagName: text("tag_name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── quests ────────────────────────────────────────────────
// TECH_SPEC 5.4 — 퀘스트
export const quests = sqliteTable("quests", {
  id: text("id").primaryKey(), // qst_xxx
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // QuestType
  difficulty: text("difficulty").notNull(), // QuestDifficulty
  mainStatType: text("main_stat_type").notNull(), // MainStatType
  xpRewardBase: integer("xp_reward_base").notNull(),
  statReward: integer("stat_reward").notNull().default(1), // 난이도별 1/2/3/5
  status: text("status").notNull().default("active"), // QuestStatus
  estimatedMinutes: integer("estimated_minutes"),
  dueDate: text("due_date"),
  completedAt: text("completed_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── verifications ─────────────────────────────────────────
// TECH_SPEC 5.5 — 퀘스트 인증 (3단 XP 구조)
export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(), // vrf_xxx
  questId: text("quest_id")
    .notNull()
    .references(() => quests.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  note: text("note"),
  representativeImageUrl: text("representative_image_url"),
  linkUrl: text("link_url"), // GitHub/Notion 등 외부 증빙
  textOnly: integer("text_only").notNull().default(0), // 0/1
  // ── 3단 XP (PRD Part 9) ──
  xpBaseEarned: integer("xp_base_earned").notNull().default(0), // 수행 XP
  xpEvidenceEarned: integer("xp_evidence_earned").notNull().default(0), // 증빙 XP
  xpBonusEarned: integer("xp_bonus_earned").notNull().default(0), // 기여 XP (Phase 2 예약, MVP=0)
  xpTotalEarned: integer("xp_total_earned").notNull().default(0), // 저장된 합계
  narrativeMessage: text("narrative_message"), // 보상 시점에 생성되어 로그로 남음
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── quest_media ───────────────────────────────────────────
// TECH_SPEC 5.6 — 추가 이미지 첨부
export const questMedia = sqliteTable("quest_media", {
  id: text("id").primaryKey(),
  verificationId: text("verification_id")
    .notNull()
    .references(() => verifications.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── growth_log ────────────────────────────────────────────
// TECH_SPEC 5.7 — 일별 성장 로그 (user_id + date UNIQUE)
export const growthLog = sqliteTable(
  "growth_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    questsCompleted: integer("quests_completed").notNull().default(0),
    xpEarned: integer("xp_earned").notNull().default(0),
    vitalityDelta: integer("vitality_delta").notNull().default(0),
    focusDelta: integer("focus_delta").notNull().default(0),
    executionDelta: integer("execution_delta").notNull().default(0),
    knowledgeDelta: integer("knowledge_delta").notNull().default(0),
    relationshipDelta: integer("relationship_delta").notNull().default(0),
    influenceDelta: integer("influence_delta").notNull().default(0),
    levelAtEnd: integer("level_at_end").notNull(),
    summaryText: text("summary_text"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => ({
    userDateUnique: uniqueIndex("growth_log_user_date_unique").on(
      table.userId,
      table.date,
    ),
  }),
);

// ── level_events ──────────────────────────────────────────
// TECH_SPEC 5.8 — 레벨업 발생 이벤트 (로그에서 특별 표시용)
export const levelEvents = sqliteTable("level_events", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fromLevel: integer("from_level").notNull(),
  toLevel: integer("to_level").notNull(),
  newTitle: text("new_title").notNull(),
  triggeredByVerificationId: text("triggered_by_verification_id").references(
    () => verifications.id,
    { onDelete: "set null" },
  ),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── badges ────────────────────────────────────────────────
// TECH_SPEC 5.9 — 뱃지 정의
export const badges = sqliteTable("badges", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // BadgeCategory
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── user_badges ───────────────────────────────────────────
// TECH_SPEC 5.10 — 사용자 보유 뱃지
export const userBadges = sqliteTable("user_badges", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  badgeId: text("badge_id")
    .notNull()
    .references(() => badges.id, { onDelete: "cascade" }),
  acquiredAt: text("acquired_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Type exports ──────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type UserStats = typeof userStats.$inferSelect;
export type NewUserStats = typeof userStats.$inferInsert;
export type Quest = typeof quests.$inferSelect;
export type NewQuest = typeof quests.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
export type GrowthLog = typeof growthLog.$inferSelect;
export type LevelEvent = typeof levelEvents.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
