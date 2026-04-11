import { NextResponse } from "next/server";
import { clearSessionCookie, readSessionCookie } from "@/lib/auth/cookie";
import { invalidateSessionByToken } from "@/lib/auth/session";

// POST /api/auth/logout — 세션 무효화 + 쿠키 삭제
// form action에서 호출되는 경우(no JS)엔 랜딩으로 리다이렉트한다.
export async function POST(request: Request) {
  const token = await readSessionCookie();
  if (token) {
    await invalidateSessionByToken(token);
  }
  await clearSessionCookie();

  // Content-Type이 form이면(브라우저 form 제출) 랜딩으로 리다이렉트
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url, { status: 303 });
  }

  return NextResponse.json({ success: true });
}
