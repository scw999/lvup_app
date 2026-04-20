import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { verdicts, verifications } from "@/lib/db/schema";
import { newVerdictId } from "@/lib/utils/id";

// POST /api/verdicts — 박수 토글 (있으면 제거, 없으면 추가)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: { verificationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { verificationId } = body;
  if (!verificationId) {
    return NextResponse.json({ error: "VERIFICATION_ID_REQUIRED" }, { status: 400 });
  }

  const db = await getDb();

  // 대상 인증이 공개 상태인지 확인
  const target = await db
    .select({ id: verifications.id, isPublic: verifications.isPublic })
    .from(verifications)
    .where(eq(verifications.id, verificationId))
    .get();

  if (!target || target.isPublic === 0) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // 기존 verdict 조회
  const existing = await db
    .select({ id: verdicts.id })
    .from(verdicts)
    .where(
      and(
        eq(verdicts.verificationId, verificationId),
        eq(verdicts.userId, user.id),
      ),
    )
    .get();

  if (existing) {
    // 이미 있으면 제거 (토글 오프)
    await db.delete(verdicts).where(eq(verdicts.id, existing.id));
    return NextResponse.json({ active: false });
  }

  // 없으면 추가 (토글 온)
  await db.insert(verdicts).values({
    id: newVerdictId(),
    verificationId,
    userId: user.id,
  });

  return NextResponse.json({ active: true });
}
