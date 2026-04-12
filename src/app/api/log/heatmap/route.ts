import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { growthLog } from "@/lib/db/schema";

// GET /api/log/heatmap — TECH_SPEC 8.7
// 캘린더 히트맵용 경량 데이터 (최근 N주)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weeks = Math.min(parseInt(searchParams.get("weeks") ?? "12", 10), 24);

  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);
  const sinceStr = since.toISOString().slice(0, 10);

  const db = await getDb();
  const rows = await db
    .select({
      date: growthLog.date,
      xpEarned: growthLog.xpEarned,
      questsCompleted: growthLog.questsCompleted,
    })
    .from(growthLog)
    .where(and(eq(growthLog.userId, user.id), gte(growthLog.date, sinceStr)))
    .orderBy(growthLog.date);

  return NextResponse.json({ days: rows });
}
