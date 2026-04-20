import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { verifications, quests, users } from "@/lib/db/schema";

const PAGE_SIZE = 20;

// GET /api/feed?offset=0
// 공개 인증 피드 — 최신순, 페이지네이션
export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));

  const db = await getDb();
  const currentUserId = currentUser?.id ?? "";

  const rows = await db
    .select({
      id: verifications.id,
      userId: verifications.userId,
      note: verifications.note,
      representativeImageUrl: verifications.representativeImageUrl,
      linkUrl: verifications.linkUrl,
      xpTotalEarned: verifications.xpTotalEarned,
      narrativeMessage: verifications.narrativeMessage,
      createdAt: verifications.createdAt,
      questTitle: quests.title,
      questMainStatType: quests.mainStatType,
      nickname: users.nickname,
      classCode: users.classCode,
      level: users.level,
      verdictCount: sql<number>`(SELECT COUNT(*) FROM verdicts WHERE verification_id = ${verifications.id})`,
      myVerdict: sql<number>`(SELECT COUNT(*) FROM verdicts WHERE verification_id = ${verifications.id} AND user_id = ${currentUserId})`,
    })
    .from(verifications)
    .innerJoin(quests, eq(verifications.questId, quests.id))
    .innerJoin(users, eq(verifications.userId, users.id))
    .where(eq(verifications.isPublic, 1))
    .orderBy(desc(verifications.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  return NextResponse.json({
    items: rows.map((r) => ({
      ...r,
      myVerdict: r.myVerdict > 0,
    })),
    hasMore: rows.length === PAGE_SIZE,
    nextOffset: offset + rows.length,
  });
}
