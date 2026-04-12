import { NextResponse } from "next/server";
import { eq, and, gte, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { userStats, quests, growthLog } from "@/lib/db/schema";

// GET /api/status — TECH_SPEC 8.3
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.classCode) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const db = await getDb();

  // 1. stats
  const stats = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .get();

  if (!stats) {
    return NextResponse.json({ error: "NO_STATS" }, { status: 404 });
  }

  // 2. 7-day deltas from growth_log
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

  const deltaRows = await db
    .select({
      vitality: sql<number>`COALESCE(SUM(${growthLog.vitalityDelta}), 0)`,
      focus: sql<number>`COALESCE(SUM(${growthLog.focusDelta}), 0)`,
      execution: sql<number>`COALESCE(SUM(${growthLog.executionDelta}), 0)`,
      knowledge: sql<number>`COALESCE(SUM(${growthLog.knowledgeDelta}), 0)`,
      relationship: sql<number>`COALESCE(SUM(${growthLog.relationshipDelta}), 0)`,
      influence: sql<number>`COALESCE(SUM(${growthLog.influenceDelta}), 0)`,
    })
    .from(growthLog)
    .where(
      and(
        eq(growthLog.userId, user.id),
        gte(growthLog.date, sevenDaysAgoStr),
      ),
    )
    .get();

  const statsDelta7d = deltaRows ?? {
    vitality: 0,
    focus: 0,
    execution: 0,
    knowledge: 0,
    relationship: 0,
    influence: 0,
  };

  // 3. todayMainQuest — first active quest
  const mainQuest = await db
    .select({
      id: quests.id,
      title: quests.title,
      mainStatType: quests.mainStatType,
      xpRewardBase: quests.xpRewardBase,
      estimatedMinutes: quests.estimatedMinutes,
      difficulty: quests.difficulty,
    })
    .from(quests)
    .where(and(eq(quests.userId, user.id), eq(quests.status, "active")))
    .orderBy(quests.createdAt)
    .limit(1)
    .get();

  // 4. nextUnlockHint
  const nextUnlockHint = getNextUnlockHint(user.level, user.streakDays);

  return NextResponse.json({
    user: {
      nickname: user.nickname,
      classCode: user.classCode,
      level: user.level,
      title: user.title,
      xp: user.xp,
      xpToNext: user.xpToNext,
      streakDays: user.streakDays,
    },
    stats: {
      vitality: stats.vitality,
      focus: stats.focus,
      execution: stats.execution,
      knowledge: stats.knowledge,
      relationship: stats.relationship,
      influence: stats.influence,
    },
    statsDelta7d,
    todayMainQuest: mainQuest ?? null,
    nextUnlockHint,
  });
}

function getNextUnlockHint(level: number, streakDays: number): string {
  if (streakDays < 3) return `${3 - streakDays}일 연속 달성 시 스트릭 보너스 해금`;
  if (level < 3) return `Lv.3 달성 시 Story 퀘스트 해금`;
  if (level < 5) return `Lv.5 달성 시 새로운 칭호 해금`;
  if (level < 10) return `Lv.10 달성 시 마스터 뱃지 해금`;
  return "새로운 도전을 계속하세요";
}
