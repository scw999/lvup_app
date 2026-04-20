import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, count } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { users, userStats, userRoleTags, verifications, quests } from "@/lib/db/schema";

// GET /api/profile/[userId] — 공개 프로필 조회
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  await getCurrentUser(); // 로그인 확인 (비로그인 → null 이지만 에러 안 냄)

  const { userId } = await params;
  const db = await getDb();

  const [targetUser, stats, tags, countRow, recentVerifs] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).get(),
    db.select().from(userStats).where(eq(userStats.userId, userId)).get(),
    db.select().from(userRoleTags).where(eq(userRoleTags.userId, userId)),
    db
      .select({ total: count() })
      .from(verifications)
      .where(and(eq(verifications.userId, userId), eq(verifications.isPublic, 1)))
      .get(),
    db
      .select({
        id: verifications.id,
        representativeImageUrl: verifications.representativeImageUrl,
        xpTotalEarned: verifications.xpTotalEarned,
        createdAt: verifications.createdAt,
        questTitle: quests.title,
        questMainStatType: quests.mainStatType,
      })
      .from(verifications)
      .innerJoin(quests, eq(verifications.questId, quests.id))
      .where(and(eq(verifications.userId, userId), eq(verifications.isPublic, 1)))
      .orderBy(desc(verifications.createdAt))
      .limit(9),
  ]);

  if (!targetUser) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    id: targetUser.id,
    nickname: targetUser.nickname,
    classCode: targetUser.classCode,
    level: targetUser.level,
    title: targetUser.title,
    streakDays: targetUser.streakDays,
    roleTags: tags.map((t) => ({ code: t.tagCode, name: t.tagName })),
    stats: stats
      ? {
          vitality: stats.vitality,
          focus: stats.focus,
          execution: stats.execution,
          knowledge: stats.knowledge,
          relationship: stats.relationship,
          influence: stats.influence,
        }
      : null,
    publicVerificationCount: countRow?.total ?? 0,
    recentVerifications: recentVerifs,
  });
}
