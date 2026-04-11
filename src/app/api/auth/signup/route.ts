import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/cookie";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { validateSignup } from "@/lib/auth/validation";
import { getDb } from "@/lib/db/client";
import { users, userStats } from "@/lib/db/schema";
import { newUserId } from "@/lib/utils/id";

// POST /api/auth/signup — 신규 가입
// TECH_SPEC 8.1 참조
export async function POST(request: Request) {
  const rawBody = await request.json().catch(() => ({}));
  const parsed = validateSignup(rawBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const db = await getDb();

  // 이메일 중복 체크
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.email))
    .limit(1);

  if (existing[0]) {
    return NextResponse.json(
      {
        error: {
          message: "이미 이 세계에 입장한 이메일입니다.",
          fields: { email: "이미 사용 중인 이메일입니다." },
        },
      },
      { status: 409 },
    );
  }

  const userId = newUserId();
  const passwordHash = await hashPassword(parsed.password);

  // users insert + user_stats insert
  // D1 batch 트랜잭션이 이상적이지만 Sprint 1에서는 순차 insert로 충분.
  // 실패 시 stats만 비는 케이스는 Sprint 2 온보딩에서 자체 복구.
  await db.insert(users).values({
    id: userId,
    email: parsed.email,
    passwordHash,
    nickname: parsed.nickname,
  });

  await db.insert(userStats).values({ userId });

  const { token, expiresAt } = await createSession(userId);
  await setSessionCookie(token, expiresAt);

  return NextResponse.json(
    {
      user: {
        id: userId,
        email: parsed.email,
        nickname: parsed.nickname,
      },
    },
    { status: 201 },
  );
}
