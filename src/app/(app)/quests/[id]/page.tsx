import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { quests } from "@/lib/db/schema";
import type { MainStatType, QuestDifficulty } from "@/lib/db/schema";
import { QuestVerifyButton } from "@/components/quests/quest-detail-client";

const STAT_COLOR: Record<MainStatType, string> = {
  vitality: "var(--color-vitality)", focus: "var(--color-focus)",
  execution: "var(--color-execution)", knowledge: "var(--color-knowledge)",
  relationship: "var(--color-relationship)", influence: "var(--color-influence)",
};
const STAT_LABEL: Record<MainStatType, string> = {
  vitality: "체력", focus: "집중력", execution: "실행력",
  knowledge: "지식력", relationship: "관계력", influence: "전파력",
};
const DIFF_LABEL: Record<QuestDifficulty, string> = {
  easy: "Easy", normal: "Normal", hard: "Hard", epic: "Epic",
};
const DIFF_COLOR: Record<QuestDifficulty, string> = {
  easy: "#22c55e", normal: "#3b82f6", hard: "#f97316", epic: "#a855f7",
};
const TYPE_LABEL: Record<string, string> = {
  daily: "Daily Quest", story: "Story Quest", custom: "Custom Quest", project: "Project Quest",
};

// 퀘스트 타입별 플레이버 텍스트
const FLAVOR: Record<string, Record<MainStatType, string>> = {
  daily: {
    vitality: "몸을 움직이는 자만이 내일을 보장받는다.",
    focus: "산만한 세상에서 한 점에 머무는 것은 가장 어려운 기술이다.",
    execution: "생각만으로는 세계가 변하지 않는다.",
    knowledge: "배움은 어제의 자신을 추월하는 가장 확실한 방법이다.",
    relationship: "혼자 가면 빠르고, 함께 가면 멀리 간다.",
    influence: "전하는 자가 가장 깊이 배운다.",
  },
  custom: {
    vitality: "스스로 정한 회복의 의식.",
    focus: "스스로 설계한 몰입의 시간.",
    execution: "스스로 세운 목표는 가장 강한 동력이 된다.",
    knowledge: "스스로 찾은 질문이 가장 깊은 답을 낳는다.",
    relationship: "스스로 만든 연결이 가장 오래 간다.",
    influence: "스스로 시작한 전파가 가장 진정성 있다.",
  },
};

export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireOnboardedUser();
  const { id } = await params;
  const db = await getDb();

  const quest = await db
    .select().from(quests)
    .where(and(eq(quests.id, id), eq(quests.userId, user.id)))
    .get();
  if (!quest) notFound();

  const statType = quest.mainStatType as MainStatType;
  const diff = quest.difficulty as QuestDifficulty;
  const flavorPool = FLAVOR[quest.type] ?? FLAVOR.daily;

  return (
    <main className="flex flex-col gap-6 pb-8">
      {/* 뒤로 */}
      <Link
        href="/quests"
        className="inline-flex items-center gap-1 text-xs text-[--color-text-faint] hover:text-[--color-text-muted]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        돌아가기
      </Link>

      {/* 미션 브리핑 */}
      <section className="system-frame overflow-hidden">
        {/* 타이틀바 */}
        <div className="flex items-center justify-between border-b border-[--color-border] px-5 py-3">
          <span className="system-text">{TYPE_LABEL[quest.type] ?? "QUEST"}</span>
          <div className="flex items-center gap-2">
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: `${DIFF_COLOR[diff]}15`, color: DIFF_COLOR[diff] }}
            >
              {DIFF_LABEL[diff]}
            </span>
            {quest.estimatedMinutes && (
              <span className="font-mono text-[10px] text-[--color-text-faint]">
                {quest.estimatedMinutes}m
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          {/* 제목 */}
          <h1 className="text-xl font-bold tracking-tight leading-snug">
            {quest.title}
          </h1>

          {/* 플레이버 텍스트 */}
          <p className="mt-3 text-[13px] italic leading-relaxed text-[--color-text-faint]">
            &ldquo;{flavorPool[statType]}&rdquo;
          </p>

          {quest.description && (
            <p className="mt-4 text-sm leading-relaxed text-[--color-text-muted]">
              {quest.description}
            </p>
          )}

          {/* 보상 */}
          <div className="mt-6 flex gap-4">
            <div className="flex-1 rounded-lg bg-white/[0.03] p-3 text-center">
              <p className="system-label mb-1">XP</p>
              <p className="font-mono text-xl font-bold text-[--color-xp]">
                +{quest.xpRewardBase}
              </p>
            </div>
            <div className="flex-1 rounded-lg bg-white/[0.03] p-3 text-center">
              <p className="system-label mb-1">{STAT_LABEL[statType]}</p>
              <p className="font-mono text-xl font-bold" style={{ color: STAT_COLOR[statType] }}>
                +{quest.statReward}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 인증 버튼 */}
      <QuestVerifyButton
        questId={quest.id}
        questTitle={quest.title}
        isCompleted={quest.status === "completed"}
        completedAt={quest.completedAt}
        xpBase={quest.xpRewardBase}
      />
    </main>
  );
}
