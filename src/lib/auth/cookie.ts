import { cookies } from "next/headers";

// LV UP — 세션 쿠키 설정
//
// 이름 규칙: __Host- 접두사를 쓰면 Secure + Path=/ + 도메인 고정이 강제되어 가장 안전.
// 단 localhost(http://)에서는 __Host-가 거부되므로 개발 환경은 일반 쿠키를 사용.
//
// 쿠키 이름은 app 전역에서 이 모듈로 통일한다.

const COOKIE_NAME_PROD = "__Host-lvup_session";
const COOKIE_NAME_DEV = "lvup_session";

function cookieName(): string {
  return process.env.NODE_ENV === "production"
    ? COOKIE_NAME_PROD
    : COOKIE_NAME_DEV;
}

export function getSessionCookieName(): string {
  return cookieName();
}

export async function setSessionCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  const store = await cookies();
  store.set(cookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(cookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(cookieName())?.value ?? null;
}
