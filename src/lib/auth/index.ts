import { redirect } from "next/navigation";
import { readSessionCookie } from "./cookie";
import { validateSessionToken, type SessionUser } from "./session";

// LV UP — 서버 측 "현재 사용자" 조회
//
// 사용 위치:
//   - Route Handlers (API)
//   - Server Components (예: /status 페이지)
//   - Server Actions
//
// 미들웨어에서는 사용하지 말 것. 미들웨어는 edge runtime에 가깝고 DB 접근이
// 비싼 편이므로, 쿠키 존재 여부 정도만 확인하고 실제 검증은 여기서 수행한다.
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await readSessionCookie();
  if (!token) return null;
  const result = await validateSessionToken(token);
  return result?.user ?? null;
}

export async function requireCurrentUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

// 온보딩이 끝난 사용자만 통과. (app) 그룹의 /status, /quests, /log, /settings의
// 서버 컴포넌트 최상단에서 호출한다. 온보딩이 안 끝났으면 /onboarding으로,
// 아예 로그인 안 됐으면 /login으로 redirect.
export type OnboardedUser = SessionUser & { classCode: string };

export async function requireOnboardedUser(): Promise<OnboardedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.classCode === null) redirect("/onboarding");
  return user as OnboardedUser;
}

export { validateSessionToken, type SessionUser } from "./session";
export {
  setSessionCookie,
  clearSessionCookie,
  readSessionCookie,
  getSessionCookieName,
} from "./cookie";
