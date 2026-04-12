import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";

// LV UP — 세션 관리 (DB 저장 세션 쿠키 모델)
//
// 동작 흐름:
//   1) 로그인 성공 시 `createSession(userId)` → 쿠키에 담을 원본 토큰을 반환
//   2) 요청 진입 시 `validateSessionToken(token)` → { user, session } 또는 null
//   3) 로그아웃 시 `invalidateSession(sessionId)`
//
// 보안 포인트:
//   - 원본 토큰은 쿠키에만 존재. 서버 DB에는 SHA-256 해시만 저장 → 유출 시 롤백 쉬움
//   - 세션은 sliding expiration 없이 고정 만료 (30일). 필요해지면 확장.

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30일

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(new ArrayBuffer(24)); // 192 bit
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data as BufferSource);
  return toHex(new Uint8Array(digest));
}

export async function createSession(userId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = generateSessionToken();
  const sessionId = await hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const db = await getDb();
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt: expiresAt.toISOString(),
  });

  return { token, expiresAt };
}

export type SessionUser = {
  id: string;
  email: string;
  nickname: string;
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  streakDays: number;
  lastActiveDate: string | null;
  classCode: string | null;
};

export async function validateSessionToken(token: string): Promise<{
  user: SessionUser;
  sessionId: string;
} | null> {
  if (!token) return null;

  const sessionId = await hashToken(token);
  const db = await getDb();

  const rows = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      userId: users.id,
      email: users.email,
      nickname: users.nickname,
      level: users.level,
      title: users.title,
      xp: users.xp,
      xpToNext: users.xpToNext,
      streakDays: users.streakDays,
      lastActiveDate: users.lastActiveDate,
      classCode: users.classCode,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // 만료 체크 (lazy cleanup — 조회 시 만료됐으면 삭제하고 null 반환)
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  return {
    sessionId: row.sessionId,
    user: {
      id: row.userId,
      email: row.email,
      nickname: row.nickname,
      level: row.level,
      title: row.title,
      xp: row.xp,
      xpToNext: row.xpToNext,
      streakDays: row.streakDays,
      lastActiveDate: row.lastActiveDate,
      classCode: row.classCode,
    },
  };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  const db = await getDb();
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateSessionByToken(token: string): Promise<void> {
  const sessionId = await hashToken(token);
  await invalidateSession(sessionId);
}
