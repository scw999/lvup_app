import type { Metadata } from "next";
import { requireCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "상태창",
};

// LV UP — 상태창 (Sprint 1: placeholder)
//
// Sprint 3에서 /api/status로 실제 6스탯 그리드 + 메인 퀘스트 카드를 그린다.
// 지금은 "세계에 입장한 뒤 처음 보는 화면"의 톤을 잡는 역할만 한다.
export default async function StatusPage() {
  const user = await requireCurrentUser();

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-6 inline-block rounded-full border border-[--color-border] px-3 py-1 text-[10px] tracking-[0.25em] text-[--color-text-faint]">
        CHAPTER 0
      </span>

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        안녕하세요, {user.nickname}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[--color-text-muted] sm:text-base">
        곧 당신의 상태창이 열립니다.
        <br />
        클래스를 고르고 첫 퀘스트를 받는 순간, 이 화면이 살아납니다.
      </p>

      <div className="mt-10 rounded-xl border border-dashed border-[--color-border] bg-[--color-surface]/60 px-6 py-5 font-[family-name:var(--font-mono)] text-xs text-[--color-text-faint]">
        {"// status window · initializing..."}
        <br />
        {"// class: undefined"}
        <br />
        {`// level: ${user.level} · title: ${user.title}`}
      </div>

      <form action="/api/auth/logout" method="post" className="mt-16">
        <button
          type="submit"
          className="text-xs text-[--color-text-faint] underline-offset-4 hover:text-[--color-text-muted] hover:underline"
        >
          이 세계에서 잠시 벗어나기
        </button>
      </form>
    </main>
  );
}
