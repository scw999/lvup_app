import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex, index, primaryKey } from "drizzle-orm/sqlite-core";

// ══════════════════════════════════════════════════════════
// LV UP — D1(SQLite) 데이터 스키마
// 기준 문서: docs/PRD.md v6 (2026-04-21)
// ══════════════════════════════════════════════════════════

// ── Enum 상수 (app 레벨 검증용) ─────────────────────────────

export const CLASS_CODES = [
  "builder", "creator", "leader", "explorer", "supporter",
] as const;
export type ClassCode = (typeof CLASS_CODES)[number];

export const CLASS_ROLES = ["primary", "secondary", "exploring"] as const;
export type ClassRole = (typeof CLASS_ROLES)[number];

export const FIRST_GOALS = ["habit", "project", "income", "team"] as const;
export type FirstGoal = (typeof FIRST_GOALS)[number];

export const MAIN_STAT_TYPES = [
  "vitality", "focus", "execution", "knowledge", "relationship", "influence",
] as const;
export type MainStatType = (typeof MAIN_STAT_TYPES)[number];

export const QUEST_TYPES = [
  "daily", "story", "custom", "project", "character_course",
] as const;
export type QuestType = (typeof QUEST_TYPES)[number];

export const QUEST_SOURCES = ["system", "harp", "user", "external"] as const;
export type QuestSource = (typeof QUEST_SOURCES)[number];

export const CHALLENGE_LEVELS = ["routine", "mild", "real", "big", "limit"] as const;
export type ChallengeLevel = (typeof CHALLENGE_LEVELS)[number];

export const QUEST_DIFFICULTIES = ["easy", "normal", "hard", "epic"] as const;
export type QuestDifficulty = (typeof QUEST_DIFFICULTIES)[number];

// 'archived' 는 하위 호환 유지 (코드 정리 전까지)
export const QUEST_STATUSES = ["active", "completed", "failed", "expired", "archived"] as const;
export type QuestStatus = (typeof QUEST_STATUSES)[number];

export const BADGE_CATEGORIES = [
  "achievement", "behavior", "hidden", "certification", "contribution", "mastery",
] as const;
export type BadgeCategory = (typeof BADGE_CATEGORIES)[number];

export const HARP_TONE_CHECKS = [
  "observer", "question", "companion", "self_compare", "acceptance",
] as const;
export type HarpToneCheck = (typeof HARP_TONE_CHECKS)[number];

// ── users ─────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  nickname: text("nickname").notNull(),
  // classCode: 하위 호환 유지. 신규 로직은 user_classes 테이블 사용.
  classCode: text("class_code"),
  // firstGoal: 하위 호환 유지. v6 기준 명칭은 goal.
  firstGoal: text("first_goal"),
  goal: text("goal"),
  level: integer("level").notNull().default(1),
  title: text("title").notNull().default("입장한 자"),
  xp: integer("xp").notNull().default(0),
  xpToNext: integer("xp_to_next").notNull().default(100),
  streakDays: integer("streak_days").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ── user_classes ──────────────────────────────────────────
// PRD v6 Part 6.3 — 클래스 이력 관리 (primary/secondary/exploring)
export const userClasses = sqliteTable("user_classes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  class: text("class").notNull(),       // ClassCode
  role: text("role").notNull().default("primary"),  // ClassRole
  startedAt: text("started_at").notNull().default(sql`(datetime('now'))`),
  endedAt: text("ended_at"),            // NULL = 현재 활성
  reason: text("reason"),               // 'initial_choice' | 'system_diagnosis' | 'user_change'
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  activeIdx: index("idx_user_classes_active").on(table.userId, table.role, table.endedAt),
}));

// ── sessions ──────────────────────────────────────────────
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── user_stats ────────────────────────────────────────────
export const userStats = sqliteTable("user_stats", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  vitality: integer("vitality").notNull().default(10),
  focus: integer("focus").notNull().default(10),
  execution: integer("execution").notNull().default(10),
  knowledge: integer("knowledge").notNull().default(10),
  relationship: integer("relationship").notNull().default(10),
  influence: integer("influence").notNull().default(10),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ── user_role_tags ────────────────────────────────────────
export const userRoleTags = sqliteTable("user_role_tags", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tagCode: text("tag_code").notNull(),
  tagName: text("tag_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── quests ────────────────────────────────────────────────
// PRD v6 Part 8 + Part 6.3 진단 데이터 소스
export const quests = sqliteTable("quests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),             // QuestType
  // 퀘스트 출처 — 주도성의 첫 번째 차원 (PRD v6)
  source: text("source").notNull().default("system"),  // QuestSource
  // 도전 수준 — 주도성의 두 번째 차원 (user/harp 출처일 때)
  challengeLevel: text("challenge_level"),  // ChallengeLevel | null
  // 양적 지표 — 점진적 과부하 추적용 (pattern_progress와 연동)
  quantitativeMetric: integer("quantitative_metric"),
  metricCategory: text("metric_category"), // journey_milestones.category와 매칭
  difficulty: text("difficulty").notNull(), // QuestDifficulty
  mainStatType: text("main_stat_type").notNull(), // MainStatType
  xpRewardBase: integer("xp_reward_base").notNull(),
  statReward: integer("stat_reward").notNull().default(1),
  status: text("status").notNull().default("active"), // QuestStatus
  estimatedMinutes: integer("estimated_minutes"),
  dueDate: text("due_date"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── verifications ─────────────────────────────────────────
// PRD v6 Part 10 + Part 20 — 보상 산정 투명화
export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  questId: text("quest_id").notNull().references(() => quests.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  note: text("note"),
  representativeImageUrl: text("representative_image_url"),
  linkUrl: text("link_url"),
  // 하위 호환 컬럼 (v5 이전)
  textOnly: integer("text_only").notNull().default(0),
  xpBaseEarned: integer("xp_base_earned").notNull().default(0),
  xpEvidenceEarned: integer("xp_evidence_earned").notNull().default(0),
  xpBonusEarned: integer("xp_bonus_earned").notNull().default(0),
  xpTotalEarned: integer("xp_total_earned").notNull().default(0),
  narrativeMessage: text("narrative_message"),
  isPublic: integer("is_public").notNull().default(1),
  // v6 신규: 도전 결과
  challengeSucceeded: integer("challenge_succeeded"),  // BOOLEAN (0/1)
  qualitativeScore: integer("qualitative_score"),      // 1~5 자기평가
  // v6 신규: 적용된 계수들 (투명성 + 디버깅)
  challengeMultiplierApplied: real("challenge_multiplier_applied").notNull().default(1.0),
  diminishingMultiplierApplied: real("diminishing_multiplier_applied").notNull().default(1.0),
  selfProgressMultiplierApplied: real("self_progress_multiplier_applied").notNull().default(1.0),
  milestoneMultiplierApplied: real("milestone_multiplier_applied").notNull().default(1.0),
  // v6 신규: 노출된 하프 메시지 추적
  messageShownId: text("message_shown_id").references(() => harpMessages.id),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── quest_media ───────────────────────────────────────────
export const questMedia = sqliteTable("quest_media", {
  id: text("id").primaryKey(),
  verificationId: text("verification_id").notNull().references(() => verifications.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── growth_log ────────────────────────────────────────────
// stat delta 컬럼은 PRD v6 모델에는 없으나 상태창 7일 변화량 기능에 필요 — 유지
export const growthLog = sqliteTable(
  "growth_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    questsCompleted: integer("quests_completed").notNull().default(0),
    xpEarned: integer("xp_earned").notNull().default(0),
    vitalityDelta: integer("vitality_delta").notNull().default(0),
    focusDelta: integer("focus_delta").notNull().default(0),
    executionDelta: integer("execution_delta").notNull().default(0),
    knowledgeDelta: integer("knowledge_delta").notNull().default(0),
    relationshipDelta: integer("relationship_delta").notNull().default(0),
    influenceDelta: integer("influence_delta").notNull().default(0),
    levelAtEnd: integer("level_at_end").notNull(),
    // v6: level 컬럼 (PRD v6 명칭, levelAtEnd와 같은 의미)
    level: integer("level"),
    summaryText: text("summary_text"),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    userDateUnique: uniqueIndex("growth_log_user_date_unique").on(table.userId, table.date),
  }),
);

// ── level_events ──────────────────────────────────────────
export const levelEvents = sqliteTable("level_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fromLevel: integer("from_level").notNull(),
  toLevel: integer("to_level").notNull(),
  newTitle: text("new_title").notNull(),  // 하위 호환 유지
  // v6: milestone_titles 정규화 참조
  milestoneTitleId: text("milestone_title_id").references(() => milestoneTitles.id),
  unlockedFeatures: text("unlocked_features"),
  triggeredByVerificationId: text("triggered_by_verification_id").references(
    () => verifications.id, { onDelete: "set null" },
  ),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── verdicts ─────────────────────────────────────────────
export const verdicts = sqliteTable(
  "verdicts",
  {
    id: text("id").primaryKey(),
    verificationId: text("verification_id").notNull().references(() => verifications.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    uniqueVerdict: uniqueIndex("verdicts_verification_user_unique").on(table.verificationId, table.userId),
  }),
);

// ── badges ────────────────────────────────────────────────
// PRD v6 Part 11.4.2 — 업적/행동/히든 3유형 확장
export const badges = sqliteTable("badges", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),  // BadgeCategory
  // v6 신규
  unlockCondition: text("unlock_condition"),  // JSON: {"type":"streak","count":100}
  isHidden: integer("is_hidden").notNull().default(0),  // 타인만 보이는 히든 뱃지
  iconUrl: text("icon_url"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── user_badges ───────────────────────────────────────────
export const userBadges = sqliteTable("user_badges", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: text("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  acquiredAt: text("acquired_at").notNull().default(sql`(datetime('now'))`),
  // v6 신규: 히든 뱃지 = FALSE로 시작, 타인이 알려줘야 TRUE
  acknowledged: integer("acknowledged").notNull().default(1),
});

// ── milestone_titles ──────────────────────────────────────
// PRD v6 Part 11.4.1 — 전체 레벨 기준 12개 마일스톤 칭호
export const milestoneTitles = sqliteTable("milestone_titles", {
  id: text("id").primaryKey(),
  level: integer("level").notNull().unique(),
  title: text("title").notNull(),
  unlocks: text("unlocks"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── harp_messages ─────────────────────────────────────────
// PRD v6 Part 11.5~11.8 — 작가가 직접 작성하는 메시지 풀
export const harpMessages = sqliteTable("harp_messages", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),  // 'reward.vitality', 'special.level_up' 등
  messageText: text("message_text").notNull(),
  minLevel: integer("min_level"),
  maxLevel: integer("max_level"),
  requiredClass: text("required_class"),
  toneCheck: text("tone_check"),  // HarpToneCheck
  isActive: integer("is_active").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  categoryIdx: index("idx_harp_messages_category").on(table.category, table.isActive),
}));

// ── user_message_history ──────────────────────────────────
// 메시지 반복 노출 방지 (PRD v6 Part 11.8)
export const userMessageHistory = sqliteTable("user_message_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  messageId: text("message_id").notNull().references(() => harpMessages.id, { onDelete: "cascade" }),
  shownAt: text("shown_at").notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  userTimeIdx: index("idx_message_history_user_time").on(table.userId, table.shownAt),
}));

// ── pattern_progress ──────────────────────────────────────
// PRD v6 Part 20 — 다이미니싱 리턴 + 자기 기준 진보 추적
export const patternProgress = sqliteTable(
  "pattern_progress",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    patternSignature: text("pattern_signature").notNull(), // 'exercise_pushup' 등
    attemptCount: integer("attempt_count").notNull().default(0),
    consecutiveCount: integer("consecutive_count").notNull().default(0),
    lastDiminishingMultiplier: real("last_diminishing_multiplier").notNull().default(1.0),
    resetCount: integer("reset_count").notNull().default(0),
    bestQuantitative: integer("best_quantitative"),
    avgQualitative: real("avg_qualitative"),
    qualitativeSampleSize: integer("qualitative_sample_size").notNull().default(0),
    firstAttemptedAt: text("first_attempted_at"),
    lastAttemptedAt: text("last_attempted_at"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.patternSignature] }),
    userIdx: index("idx_pattern_progress_user").on(table.userId, table.lastAttemptedAt),
  }),
);

// ── journey_milestones ────────────────────────────────────
// PRD v6 Part 19 — 외부 기준의 서사적 번역 (푸시업 단계 등)
export const journeyMilestones = sqliteTable("journey_milestones", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),   // pattern_progress.pattern_signature와 매칭
  metricUnit: text("metric_unit").notNull(), // 'count', 'minutes', 'meters', 'pages'
  stageName: text("stage_name").notNull(),
  stageOrder: integer("stage_order").notNull(),
  thresholdValue: integer("threshold_value").notNull(),
  ageMin: integer("age_min"),
  ageMax: integer("age_max"),
  sex: text("sex"),  // 'any' | 'male' | 'female'
  firstReachMultiplier: real("first_reach_multiplier").notNull().default(1.3),
  reachMessage: text("reach_message"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  categoryIdx: index("idx_milestones_category").on(table.category, table.stageOrder),
}));

// ── user_milestone_reached ────────────────────────────────
export const userMilestoneReached = sqliteTable(
  "user_milestone_reached",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    milestoneId: text("milestone_id").notNull().references(() => journeyMilestones.id, { onDelete: "cascade" }),
    reachedAt: text("reached_at").notNull().default(sql`(datetime('now'))`),
    reachedValue: integer("reached_value").notNull(),
    verificationId: text("verification_id").references(() => verifications.id, { onDelete: "set null" }),
  },
  (table) => ({
    uniqueMilestone: uniqueIndex("user_milestone_unique").on(table.userId, table.milestoneId),
  }),
);

// ── user_physical_profile ─────────────────────────────────
// PRD v6 Part 19 — 선택 입력, 강제 아님 (PRD 14.5 준수)
export const userPhysicalProfile = sqliteTable("user_physical_profile", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  birthYear: integer("birth_year"),
  sex: text("sex"),  // 'male' | 'female' | 'unspecified'
  countryCode: text("country_code"),
  consentForDistributionOnly: integer("consent_for_distribution_only").notNull().default(1),
  sharedAt: text("shared_at").notNull().default(sql`(datetime('now'))`),
});

// ── character_courses ─────────────────────────────────────
// PRD v6 Part 19 — 덕훌 코스 등 (Phase 2~, Founder's Circle)
export const characterCourses = sqliteTable("character_courses", {
  id: text("id").primaryKey(),
  characterName: text("character_name").notNull(),
  arcanaCode: text("arcana_code"),
  courseTitle: text("course_title").notNull(),
  courseDescription: text("course_description"),
  startLevel: integer("start_level").notNull(),
  endLevel: integer("end_level").notNull(),
  totalQuests: integer("total_quests").notNull().default(0),
  unlockedExcerptCount: integer("unlocked_excerpt_count").notNull().default(0),
  requiredMembership: text("required_membership").notNull().default("founder"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── character_course_quests ───────────────────────────────
export const characterCourseQuests = sqliteTable(
  "character_course_quests",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id").notNull().references(() => characterCourses.id, { onDelete: "cascade" }),
    questTemplateId: text("quest_template_id").notNull(),
    stepOrder: integer("step_order").notNull(),
    unlockedExcerptId: text("unlocked_excerpt_id"),
    unlockedExcerptTitle: text("unlocked_excerpt_title"),
    characterContext: text("character_context"),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    courseStepUnique: uniqueIndex("course_step_unique").on(table.courseId, table.stepOrder),
  }),
);

// ── user_course_progress ──────────────────────────────────
export const userCourseProgress = sqliteTable(
  "user_course_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    courseId: text("course_id").notNull().references(() => characterCourses.id, { onDelete: "cascade" }),
    currentStep: integer("current_step").notNull().default(1),
    completedSteps: integer("completed_steps").notNull().default(0),
    startedAt: text("started_at").notNull().default(sql`(datetime('now'))`),
    completedAt: text("completed_at"),
  },
  (table) => ({
    userCourseUnique: uniqueIndex("user_course_unique").on(table.userId, table.courseId),
  }),
);

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
export type Verdict = typeof verdicts.$inferSelect;
export type NewVerdict = typeof verdicts.$inferInsert;
export type UserClass = typeof userClasses.$inferSelect;
export type NewUserClass = typeof userClasses.$inferInsert;
export type MilestoneTitle = typeof milestoneTitles.$inferSelect;
export type HarpMessage = typeof harpMessages.$inferSelect;
export type PatternProgress = typeof patternProgress.$inferSelect;
export type JourneyMilestone = typeof journeyMilestones.$inferSelect;
export type CharacterCourse = typeof characterCourses.$inferSelect;
