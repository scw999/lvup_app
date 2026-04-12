import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { growthLog } from "@/lib/db/schema";

// GET /api/log — TECH_SPEC 8.7
// 최근 30일 성장 로그 목록
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(parseInt(searchParams.get("days") ?? "30", 10), 90);

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const db = await getDb();
  const logs = await db
    .select()
    .from(growthLog)
    .where(and(eq(growthLog.userId, user.id), gte(growthLog.date, sinceStr)))
    .orderBy(desc(growthLog.date));

  return NextResponse.json({ logs });
}
