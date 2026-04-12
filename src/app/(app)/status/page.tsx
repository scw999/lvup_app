import { eq, and, gte, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { userStats, quests, growthLog } from "@/lib/db/schema";
import type { MainStatType } from "@/lib/db/schema";
import { CLASS_INFO_BY_CODE } from "@/lib/onboarding/classes";
import type { ClassCode } from "@/lib/db/schema";
import { getStatDescriptor, STAT_LABELS } from "@/lib/stats/descriptors";

export const metadata: Metadata = {
  title: "상태창",
};

// 스탯별 CSS 변수 매핑
const STAT_COLOR_VAR: Record<MainStatType, string> = {
  vitality: "var(--color-vitality)",
  focus: "var(--color-focus)",
  execution: "var(--color-execution)",
  knowledge: "var(--color-knowledge)",
  relationship: "var(--color-relationship)",
  influence: "var(--color-influence)",
};

const STAT_ORDER: MainStatType[] = [
  "vitality",
  "focus",
  "execution",
  "knowledge",
  "relationship",
  "influence",
];

export default async function StatusPage() {
  const user = await requireOnboardedUser();
  const classInfo = CLASS_INFO_BY_CODE[user.classCode as ClassCode];
  const db = await getDb();

  // 1. stats
  const stats = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .get();

  // 2. 7일 변화량
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

  const deltaRow = await db
    .select({
      vitality: sql<number>`COALESCE(SUM(${growthLog.vitalityDelta}), 0)`,
      focus: sql<number>`COALESCE(SUM(${growthLog.focusDelta}), 0)`,
      execution: sql<number>`COALESCE(SUM(${growthLog.executionDelta}), 0)`,
      knowledge: sql<number>`COALESCE(SUM(${growthLog.knowledgeDelta}), 0)`,
      relationship: sql<number>`COALESCE(SUM(${growthLog.relationshipDelta}), 0)`,
      influence: sql<number>`COALESCE(SUM(${growthLog.influenceDelta}), 0)`,
    })
    .from(growthLog)
    .where(
      and(eq(growthLog.userId, user.id), gte(growthLog.date, sevenDaysAgoStr)),
    )
    .get();

  const delta7d: Record<MainStatType, number> = {
    vitality: deltaRow?.vitality ?? 0,
    focus: deltaRow?.focus ?? 0,
    execution: deltaRow?.execution ?? 0,
    knowledge: deltaRow?.knowledge ?? 0,
    relationship: deltaRow?.relationship ?? 0,
    influence: deltaRow?.influence ?? 0,
  };

  // 3. 메인 퀘스트 (첫 번째 active)
  const mainQuest = await db
    .select({
      id: quests.id,
      title: quests.title,
      mainStatType: quests.mainStatType,
      xpRewardBase: quests.xpRewardBase,
      statReward: quests.statReward,
      estimatedMinutes: quests.estimatedMinutes,
      difficulty: quests.difficulty,
    })
    .from(quests)
    .where(and(eq(quests.userId, user.id), eq(quests.status, "active")))
    .orderBy(quests.createdAt)
    .limit(1)
    .get();

  // XP progress
  const xpProgress = user.xpToNext > 0
    ? Math.min(100, Math.round((user.xp / user.xpToNext) * 100))
    : 0;

  const nextUnlockHint = getNextUnlockHint(user.level, user.streakDays);

  return (
    <main className="flex flex-col gap-8">
      {/* ── 프로필 헤더 ── */}
      <section className="flex flex-col items-center text-center">
        <span
          className="mb-4 inline-block rounded-full border px-3 py-1 text-[10px] tracking-[0.25em]"
          style={{ borderColor: classInfo.color, color: classInfo.color }}
        >
          {classInfo.label.toUpperCase()}
        </span>
        <h1 className="text-3xl font-bold tracking-tight">{user.nickname}</h1>
        <p className="mt-1 text-sm text-[--color-text-muted]">
          Lv.{user.level} · {user.title}
        </p>

        {/* XP bar */}
        <div className="mt-4 w-full max-w-xs">
          <div className="mb-1 flex justify-between text-[10px] text-[--color-text-faint]">
            <span>XP</span>
            <span>
              {user.xp} / {user.xpToNext}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[--color-surface-alt]">
            <div
              className="h-full rounded-full bg-[--color-accent] transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {user.streakDays > 0 && (
          <p className="mt-2 text-xs text-[--color-text-muted]">
            연속 {user.streakDays}일
          </p>
        )}
      </section>

      {/* ── 6스탯 그리드 ── */}
      {stats && (
        <section className="grid grid-cols-2 gap-3">
          {STAT_ORDER.map((key) => {
            const val = stats[key] as number;
            const d = delta7d[key];
            return (
              <div
                key={key}
                className="rounded-xl border border-[--color-border] bg-[--color-surface] p-4"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: STAT_COLOR_VAR[key] }}
                  />
                  <span className="text-xs text-[--color-text-muted]">
                    {STAT_LABELS[key]}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-mono text-2xl font-bold"
                    style={{ color: STAT_COLOR_VAR[key] }}
                  >
                    {val}
                  </span>
                  {d > 0 && (
                    <span className="text-xs text-emerald-400">▲{d}</span>
                  )}
                  {d === 0 && (
                    <span className="text-xs text-[--color-text-faint]">—</span>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-[--color-text-faint]">
                  {getStatDescriptor(val)}
                </p>
              </div>
            );
          })}
        </section>
      )}

      {/* ── 메인 퀘스트 카드 ── */}
      {mainQuest ? (
        <Link href={`/quests/${mainQuest.id}`} className="block">
          <section className="rounded-xl border border-[--color-accent]/30 bg-[--color-surface] p-5">
            <p className="mb-2 text-[10px] tracking-[0.2em] text-[--color-accent]">
              TODAY&apos;S MAIN QUEST
            </p>
            <h2 className="text-lg font-semibold">{mainQuest.title}</h2>
            <div className="mt-3 flex items-center gap-4 text-xs text-[--color-text-muted]">
              {mainQuest.estimatedMinutes && (
                <span>{mainQuest.estimatedMinutes}분</span>
              )}
              <span>+{mainQuest.xpRewardBase} XP</span>
              <span
                style={{
                  color:
                    STAT_COLOR_VAR[mainQuest.mainStatType as MainStatType],
                }}
              >
                {STAT_LABELS[mainQuest.mainStatType as MainStatType]} +
                {mainQuest.statReward}
              </span>
            </div>
          </section>
        </Link>
      ) : (
        <section className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 text-center">
          <p className="text-sm text-[--color-text-faint]">
            오늘의 모험은 아직 시작되지 않았다
          </p>
          <Link
            href="/quests"
            className="mt-3 inline-block text-xs text-[--color-accent] underline-offset-4 hover:underline"
          >
            퀘스트 목록 보기
          </Link>
        </section>
      )}

      {/* ── 하단 안내 ── */}
      <section className="flex flex-col gap-1 text-center text-[10px] text-[--color-text-faint]">
        <span>{nextUnlockHint}</span>
      </section>

      <form action="/api/auth/logout" method="post" className="text-center">
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

function getNextUnlockHint(level: number, streakDays: number): string {
  if (streakDays < 3)
    return `${3 - streakDays}일 연속 달성 시 스트릭 보너스 해금`;
  if (level < 3) return "Lv.3 달성 시 Story 퀘스트 해금";
  if (level < 5) return "Lv.5 달성 시 새로운 칭호 해금";
  if (level < 10) return "Lv.10 달성 시 마스터 뱃지 해금";
  return "새로운 도전을 계속하세요";
}
