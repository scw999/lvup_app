import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BottomNav } from "@/components/layout/bottom-nav";

// LV UP — (app) 그룹 레이아웃
//
// 미들웨어에서 이미 쿠키 존재 여부로 1차 게이트를 쳤지만,
// 이 레이아웃에서 실제 세션을 검증해서 쿠키만 있고 세션이 만료/위조된 경우를 막는다.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[--color-border] bg-[--color-bg]/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Link href="/status" className="text-sm font-bold tracking-[0.25em] text-[--color-accent]">
            LV UP
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[--color-accent]">
              Lv.{user.level}
            </span>
            <span className="text-[11px] text-[--color-text-faint]">
              {user.nickname}
            </span>
            <Link
              href="/settings"
              className="text-[--color-text-faint] hover:text-[--color-text-muted]"
              aria-label="설정"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="2.5" />
                <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.2 3.2l.7.7M12.1 12.1l.7.7M12.8 3.2l-.7.7M3.9 12.1l-.7.7" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-6 pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
