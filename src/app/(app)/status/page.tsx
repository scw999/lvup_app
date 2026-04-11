import { count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { quests } from "@/lib/db/schema";
import { CLASS_INFO_BY_CODE } from "@/lib/onboarding/classes";
import type { ClassCode } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "상태창",
};

// LV UP — 상태창 (Sprint 2 interim)
//
// Sprint 3에서 /api/status로 실제 6스탯 그리드 + 메인 퀘스트 카드를 그린다.
// Sprint 2는 온보딩 직후 "첫 퀘스트가 보인다"만 증명하기 위해 클래스 카드 +
// active 퀘스트 개수 + 첫 퀘스트 타이틀만 간단히 렌더.
export default async function StatusPage() {
  const user = await requireOnboardedUser();
  const classInfo = CLASS_INFO_BY_CODE[user.classCode as ClassCode];

  const db = await getDb();
  const activeQuests = await db
    .select({ id: quests.id, title: quests.title })
    .from(quests)
    .where(eq(quests.userId, user.id))
    .orderBy(quests.createdAt)
    .limit(3);

  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(quests)
    .where(eq(quests.userId, user.id));

  return (
    <main className="flex min-h-[60vh] flex-col items-center text-center">
      <span
        className="mb-6 inline-block rounded-full border px-3 py-1 text-[10px] tracking-[0.25em]"
        style={{ borderColor: classInfo.color, color: classInfo.color }}
      >
        {classInfo.label.toUpperCase()}
      </span>

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {user.nickname}
      </h1>
      <p className="mt-2 text-sm text-[--color-text-muted]">
        Lv.{user.level} · {user.title}
      </p>
      <p className="mt-1 text-xs text-[--color-text-faint]">
        {classInfo.tagline}
      </p>

      <div className="mt-10 w-full max-w-md rounded-xl border border-[--color-border] bg-[--color-surface] p-6 text-left">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs tracking-[0.2em] text-[--color-text-faint]">
            TODAY&apos;S QUESTS
          </span>
          <span className="text-xs text-[--color-text-faint]">
            {total} active
          </span>
        </div>
        <ul className="space-y-2">
          {activeQuests.map((q, i) => (
            <li
              key={q.id}
              className="flex items-start gap-3 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-4 py-3 text-sm"
            >
              <span className="text-xs text-[--color-text-faint]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[--color-text]">{q.title}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[10px] tracking-wider text-[--color-text-faint]">
          {"// full status window ships in sprint 3"}
        </p>
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
