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
      <header className="border-b border-[--color-border] bg-[--color-bg]/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/status" className="text-sm font-bold tracking-[0.2em]">
            LV UP
          </Link>
          <span className="text-xs text-[--color-text-faint]">
            {user.nickname} · Lv.{user.level}
          </span>
        </div>
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-6 pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
