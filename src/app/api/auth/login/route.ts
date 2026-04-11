import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/cookie";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { validateLogin } from "@/lib/auth/validation";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

// POST /api/auth/login — 이메일/비밀번호 로그인
// 이메일 존재 여부와 비밀번호 불일치를 구분하지 않는다 (user enumeration 방지).
export async function POST(request: Request) {
  const rawBody = await request.json().catch(() => ({}));
  const parsed = validateLogin(rawBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const db = await getDb();
  const row = await db
    .select({
      id: users.id,
      email: users.email,
      nickname: users.nickname,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, parsed.email))
    .limit(1);

  const user = row[0];

  const genericError = NextResponse.json(
    { error: { message: "이메일 또는 비밀번호가 올바르지 않습니다." } },
    { status: 401 },
  );

  if (!user || !user.passwordHash) return genericError;

  const ok = await verifyPassword(parsed.password, user.passwordHash);
  if (!ok) return genericError;

  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    },
  });
}
