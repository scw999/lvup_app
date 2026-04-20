import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { users, userRoleTags } from "@/lib/db/schema";

// GET /api/settings/profile — 현재 프로필 조회
export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const db = await getDb();

  const [fullUser, tags] = await Promise.all([
    db.select().from(users).where(eq(users.id, sessionUser.id)).get(),
    db.select().from(userRoleTags).where(eq(userRoleTags.userId, sessionUser.id)),
  ]);

  if (!fullUser) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    nickname: fullUser.nickname,
    email: fullUser.email,
    classCode: fullUser.classCode,
    firstGoal: fullUser.firstGoal,
    level: fullUser.level,
    title: fullUser.title,
    streakDays: fullUser.streakDays,
    createdAt: fullUser.createdAt,
    roleTags: tags.map((t) => ({ code: t.tagCode, name: t.tagName })),
  });
}

// PATCH /api/settings/profile — 닉네임 수정
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: { nickname?: string; classCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { nickname, classCode } = body;
  const updates: Record<string, string> = { updatedAt: new Date().toISOString() };

  if (nickname !== undefined) {
    if (typeof nickname !== "string") {
      return NextResponse.json({ error: "NICKNAME_REQUIRED" }, { status: 400 });
    }
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      return NextResponse.json({ error: "NICKNAME_LENGTH" }, { status: 400 });
    }
    updates.nickname = trimmed;
  }

  const VALID_CLASSES = ["builder", "creator", "leader", "explorer", "supporter"];
  if (classCode !== undefined) {
    if (!VALID_CLASSES.includes(classCode)) {
      return NextResponse.json({ error: "INVALID_CLASS" }, { status: 400 });
    }
    updates.classCode = classCode;
  }

  const db = await getDb();
  await db
    .update(users)
    .set(updates)
    .where(eq(users.id, user.id));

  return NextResponse.json({ success: true, ...updates });
}
