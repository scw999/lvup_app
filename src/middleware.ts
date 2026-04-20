import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookieName } from "@/lib/auth/cookie";

// LV UP — 라우트 보호 미들웨어
//
// 미들웨어는 DB에 접근하지 않는다 (엣지 비용 + 런타임 차이 문제).
// 세션 쿠키 존재 여부로만 1차 게이트를 치고, 실제 세션 검증은
// 진입한 페이지/API 안에서 `getCurrentUser()`로 수행한다.
//
// 보호 대상: (app) 그룹 = /status, /quests, /log, /settings, /onboarding
// 인증 페이지(/login, /signup)에 이미 로그인된 사용자가 오면 /status로 돌려보낸다.

const PROTECTED_PREFIXES = [
  "/status",
  "/quests",
  "/log",
  "/settings",
  "/onboarding",
  "/feed",
  "/profile",
];

const AUTH_PAGES = new Set(["/login", "/signup"]);

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const cookieName = getSessionCookieName();
  const hasSessionCookie = Boolean(request.cookies.get(cookieName)?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.has(pathname) && hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/status";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|.*\\..*).*)"],
};
