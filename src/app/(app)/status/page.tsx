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
import { StatRadar } from "@/components/status/stat-radar";
import { ClassEmblem } from "@/components/status/class-emblem";

export const metadata: Metadata = { title: "상태창" };

const STAT_COLOR: Record<MainStatType, string> = {
  vitality: "var(--color-vitality)",
  focus: "var(--color-focus)",
  execution: "var(--color-execution)",
  knowledge: "var(--color-knowledge)",
  relationship: "var(--color-relationship)",
  influence: "var(--color-influence)",
};

const STAT_ORDER: MainStatType[] = [
  "vitality", "focus", "execution", "knowledge", "relationship", "influence",
];

// 스탯 바 퍼센트 (max 100 기준으로 시각화, 실제 상한 없음)
function statPercent(val: number): number {
  return Math.min(100, Math.round((val / 60) * 100));
}

export default async function StatusPage() {
  const user = await requireOnboardedUser();
  const classInfo = CLASS_INFO_BY_CODE[user.classCode as ClassCode];
  const db = await getDb();

  const stats = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .get();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
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
    .where(and(eq(growthLog.userId, user.id), gte(growthLog.date, sevenDaysAgo.toISOString().slice(0, 10))))
    .get();

  const delta7d: Record<MainStatType, number> = {
    vitality: deltaRow?.vitality ?? 0, focus: deltaRow?.focus ?? 0,
    execution: deltaRow?.execution ?? 0, knowledge: deltaRow?.knowledge ?? 0,
    relationship: deltaRow?.relationship ?? 0, influence: deltaRow?.influence ?? 0,
  };

  const mainQuest = await db
    .select({
      id: quests.id, title: quests.title, mainStatType: quests.mainStatType,
      xpRewardBase: quests.xpRewardBase, statReward: quests.statReward,
      estimatedMinutes: quests.estimatedMinutes, difficulty: quests.difficulty,
    })
    .from(quests)
    .where(and(eq(quests.userId, user.id), eq(quests.status, "active")))
    .orderBy(quests.createdAt)
    .limit(1)
    .get();

  const xpPct = user.xpToNext > 0 ? Math.min(100, Math.round((user.xp / user.xpToNext) * 100)) : 0;

  return (
    <main className="flex flex-col gap-6 pb-8">
      {/* ── 캐릭터 헤더 — 클래스 컬러 그라디언트 배경 ── */}
      <section
        className="system-frame relative overflow-hidden p-6"
        style={{
          background: `radial-gradient(ellipse at top, ${classInfo.color}08 0%, var(--color-surface) 70%)`,
        }}
      >
        {/* 시스템 타이틀바 */}
        <div className="mb-4 flex items-center justify-between">
          <span className="system-text">STATUS WINDOW</span>
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10px] tracking-[0.2em]"
            style={{ borderColor: `${classInfo.color}60`, color: classInfo.color }}
          >
            {classInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ClassEmblem classCode={user.classCode as ClassCode} color={classInfo.color} size={52} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{user.nickname}</h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-mono text-sm" style={{ color: classInfo.color }}>
                Lv.{user.level}
              </span>
              <span className="text-sm text-[--color-text-muted]">{user.title}</span>
            </div>
          </div>
        </div>

        {/* XP 바 */}
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between">
            <span className="system-label">EXPERIENCE</span>
            <span className="font-mono text-[11px] text-[--color-text-muted]">
              {user.xp} / {user.xpToNext}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="xp-bar-fill h-full rounded-full"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>

        {/* 스트릭 */}
        {user.streakDays > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="streak-flame text-sm">&#128293;</span>
            <span className="font-mono text-xs text-[--color-vitality]">
              {user.streakDays}일 연속
            </span>
          </div>
        )}
      </section>

      {/* ── 레이더 차트 ── */}
      {stats && (
        <section className="system-frame p-5">
          <div className="mb-2 text-center">
            <span className="system-text">ABILITY CHART</span>
          </div>
          <StatRadar stats={{
            vitality: stats.vitality, focus: stats.focus,
            execution: stats.execution, knowledge: stats.knowledge,
            relationship: stats.relationship, influence: stats.influence,
          }} />
        </section>
      )}

      {/* ── 6스탯 그리드 — 시스템 창 ── */}
      {stats && (
        <section className="system-frame p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="system-text">MAIN STATS</span>
            <span className="system-label">7일 변화</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {STAT_ORDER.map((key) => {
              const val = stats[key] as number;
              const d = delta7d[key];
              const color = STAT_COLOR[key];
              return (
                <div key={key} className="stat-card p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                      />
                      <span className="text-[11px] text-[--color-text-muted]">
                        {STAT_LABELS[key]}
                      </span>
                    </div>
                    {d > 0 && (
                      <span className="font-mono text-[10px] text-emerald-400">+{d}</span>
                    )}
                  </div>
                  <div className="font-mono text-3xl font-bold leading-none" style={{ color }}>
                    {val}
                  </div>
                  {/* 스탯 바 */}
                  <div className="stat-bar-track mt-2">
                    <div
                      className="stat-bar-fill"
                      style={{ width: `${statPercent(val)}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-[--color-text-faint]">
                    {getStatDescriptor(val)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 메인 퀘스트 ── */}
      {mainQuest ? (
        <Link href={`/quests/${mainQuest.id}`} className="block">
          <section className="system-frame glow-soft overflow-hidden p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm">&#9889;</span>
              <span className="system-text" style={{ color: "var(--color-accent)" }}>
                TODAY&apos;S QUEST
              </span>
            </div>
            <h2 className="text-lg font-semibold leading-snug">
              &ldquo;{mainQuest.title}&rdquo;
            </h2>
            <div className="mt-3 flex items-center gap-4 text-xs text-[--color-text-muted]">
              {mainQuest.estimatedMinutes && (
                <span className="font-mono">{mainQuest.estimatedMinutes}분</span>
              )}
              <span className="font-mono text-[--color-xp]">+{mainQuest.xpRewardBase} XP</span>
              <span
                className="font-mono"
                style={{ color: STAT_COLOR[mainQuest.mainStatType as MainStatType] }}
              >
                {STAT_LABELS[mainQuest.mainStatType as MainStatType]} +{mainQuest.statReward}
              </span>
            </div>
            <div className="mt-4 rounded-lg bg-[--color-accent]/10 py-2.5 text-center text-xs font-medium text-[--color-accent]">
              인증하러 가기
            </div>
          </section>
        </Link>
      ) : (
        <section className="system-frame p-6 text-center">
          <p className="text-sm text-[--color-text-faint]">
            &mdash; 오늘의 모험은 아직 시작되지 않았다 &mdash;
          </p>
          <Link
            href="/quests"
            className="mt-3 inline-block text-xs text-[--color-accent] underline-offset-4 hover:underline"
          >
            퀘스트 목록 열기
          </Link>
        </section>
      )}

      {/* ── 하단 시스템 메시지 ── */}
      <div className="text-center">
        <p className="system-label" style={{ letterSpacing: "0.1em" }}>
          {getNextUnlockHint(user.level, user.streakDays)}
        </p>
      </div>
    </main>
  );
}

function getNextUnlockHint(level: number, streakDays: number): string {
  if (streakDays < 3) return `// ${3 - streakDays}일 연속 달성 시 스트릭 보너스 해금`;
  if (level < 3) return "// Lv.3 도달 시 Story 퀘스트 해금";
  if (level < 5) return "// Lv.5 도달 시 새로운 칭호 부여";
  if (level < 10) return "// Lv.10 도달 시 마스터 뱃지 해금";
  return "// 시스템: 각성한 자의 여정은 계속된다";
}
