import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { quests } from "@/lib/db/schema";
import type { MainStatType, QuestDifficulty } from "@/lib/db/schema";
import { QuestVerifyButton } from "@/components/quests/quest-detail-client";

const STAT_COLOR_VAR: Record<MainStatType, string> = {
  vitality: "var(--color-vitality)",
  focus: "var(--color-focus)",
  execution: "var(--color-execution)",
  knowledge: "var(--color-knowledge)",
  relationship: "var(--color-relationship)",
  influence: "var(--color-influence)",
};

const STAT_LABEL: Record<MainStatType, string> = {
  vitality: "체력",
  focus: "집중력",
  execution: "실행력",
  knowledge: "지식력",
  relationship: "관계력",
  influence: "전파력",
};

const TYPE_LABEL: Record<string, string> = {
  daily: "Daily",
  story: "Story",
  custom: "Custom",
  project: "Project",
};

const DIFFICULTY_LABEL: Record<QuestDifficulty, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
  epic: "Epic",
};

// PRD 16.2 화면 4 — 퀘스트 상세
export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireOnboardedUser();
  const { id } = await params;
  const db = await getDb();

  const quest = await db
    .select()
    .from(quests)
    .where(and(eq(quests.id, id), eq(quests.userId, user.id)))
    .get();

  if (!quest) notFound();

  const statType = quest.mainStatType as MainStatType;
  const diff = quest.difficulty as QuestDifficulty;
  const isCompleted = quest.status === "completed";

  return (
    <main className="flex flex-col gap-8">
      {/* 뒤로 */}
      <Link
        href="/quests"
        className="inline-flex items-center gap-1 text-xs text-[--color-text-faint] hover:text-[--color-text-muted]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 4L6 8l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        돌아가기
      </Link>

      {/* 메타 태그 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-[--color-border] px-2 py-0.5 text-[10px] text-[--color-text-muted]">
          {TYPE_LABEL[quest.type] ?? quest.type}
        </span>
        <span className="rounded border border-[--color-border] px-2 py-0.5 text-[10px] text-[--color-text-muted]">
          {DIFFICULTY_LABEL[diff]}
        </span>
        {quest.estimatedMinutes && (
          <span className="text-[10px] text-[--color-text-faint]">
            {quest.estimatedMinutes}분
          </span>
        )}
      </div>

      {/* 제목 + 설명 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{quest.title}</h1>
        {quest.description && (
          <p className="mt-3 text-sm leading-relaxed text-[--color-text-muted]">
            {quest.description}
          </p>
        )}
      </div>

      {/* 보상 미리보기 */}
      <section className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5">
        <p className="mb-3 text-[10px] tracking-[0.2em] text-[--color-text-faint]">
          REWARD
        </p>
        <div className="flex items-center gap-6">
          <div>
            <span className="font-mono text-2xl font-bold text-[--color-accent]">
              +{quest.xpRewardBase}
            </span>
            <span className="ml-1 text-xs text-[--color-text-muted]">XP</span>
          </div>
          <div>
            <span
              className="font-mono text-2xl font-bold"
              style={{ color: STAT_COLOR_VAR[statType] }}
            >
              +{quest.statReward}
            </span>
            <span className="ml-1 text-xs text-[--color-text-muted]">
              {STAT_LABEL[statType]}
            </span>
          </div>
        </div>
      </section>

      {/* 인증하기 / 완료 상태 */}
      <QuestVerifyButton
        questId={quest.id}
        questTitle={quest.title}
        isCompleted={isCompleted}
        completedAt={quest.completedAt}
      />
    </main>
  );
}
