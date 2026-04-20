import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte, lt } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { verifications, quests } from "@/lib/db/schema";

// GET /api/log/verifications?date=YYYY-MM-DD
// 특정 날짜의 인증 내역 조회 (갤러리용)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "DATE_REQUIRED" }, { status: 400 });
  }

  const dateStart = `${date}T00:00:00`;
  const dateEnd = `${date}T23:59:59`;

  const db = await getDb();

  const rows = await db
    .select({
      id: verifications.id,
      questId: verifications.questId,
      note: verifications.note,
      representativeImageUrl: verifications.representativeImageUrl,
      linkUrl: verifications.linkUrl,
      xpTotalEarned: verifications.xpTotalEarned,
      xpBaseEarned: verifications.xpBaseEarned,
      xpEvidenceEarned: verifications.xpEvidenceEarned,
      narrativeMessage: verifications.narrativeMessage,
      createdAt: verifications.createdAt,
      questTitle: quests.title,
      questMainStatType: quests.mainStatType,
    })
    .from(verifications)
    .innerJoin(quests, eq(verifications.questId, quests.id))
    .where(
      and(
        eq(verifications.userId, user.id),
        gte(verifications.createdAt, dateStart),
        lt(verifications.createdAt, dateEnd),
      ),
    )
    .orderBy(verifications.createdAt);

  return NextResponse.json({ verifications: rows });
}
