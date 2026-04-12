"use client";

import { useState } from "react";
import Link from "next/link";
import type { Quest, MainStatType, QuestDifficulty } from "@/lib/db/schema";
import { CreateQuestModal } from "./create-quest-modal";

// 스탯 & 난이도 표시 상수
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

const DIFFICULTY_LABEL: Record<QuestDifficulty, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
  epic: "Epic",
};

const DIFFICULTY_COLOR: Record<QuestDifficulty, string> = {
  easy: "text-emerald-400 border-emerald-400/30",
  normal: "text-blue-400 border-blue-400/30",
  hard: "text-orange-400 border-orange-400/30",
  epic: "text-purple-400 border-purple-400/30",
};

type Tab = "daily" | "custom";

export function QuestListClient({
  initialQuests,
}: {
  initialQuests: Quest[];
}) {
  const [tab, setTab] = useState<Tab>("daily");
  const [showCreate, setShowCreate] = useState(false);
  const [questList, setQuestList] = useState(initialQuests);

  const filtered = questList.filter((q) => {
    if (tab === "daily") return q.type === "daily" || q.type === "story";
    return q.type === "custom" || q.type === "project";
  });

  const handleCreated = (newQuest: Quest) => {
    setQuestList((prev) => [...prev, newQuest]);
    setShowCreate(false);
    setTab("custom");
  };

  return (
    <main className="flex flex-col gap-6">
      {/* 탭 */}
      <div className="flex gap-1 rounded-lg bg-[--color-surface] p-1">
        {(["daily", "custom"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-2 text-xs tracking-wider transition-all active:scale-95 ${
              tab === t
                ? "bg-[--color-surface-alt] text-[--color-text] shadow-sm"
                : "text-[--color-text-faint] hover:text-[--color-text-muted]"
            }`}
          >
            {t === "daily" ? "Daily" : "Custom"}
          </button>
        ))}
      </div>

      {/* Custom 탭 — 상단에 큰 생성 버튼 */}
      {tab === "custom" && (
        <button
          onClick={() => setShowCreate(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[--color-accent]/40 bg-[--color-accent]/5 py-4 text-sm text-[--color-accent] transition-all hover:border-[--color-accent] hover:bg-[--color-accent]/10 active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          새 퀘스트 만들기
        </button>
      )}

      {/* 퀘스트 카드 리스트 */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-[--color-text-faint]">
            {tab === "daily"
              ? "활성 퀘스트가 없습니다"
              : "아직 커스텀 퀘스트가 없습니다"}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((q) => (
            <li key={q.id}>
              <Link
                href={`/quests/${q.id}`}
                className="flex items-start gap-4 rounded-xl border border-[--color-border] bg-[--color-surface] p-4 transition-all hover:border-[--color-accent]/30 active:scale-[0.98]"
              >
                {/* 스탯 색 점 */}
                <span
                  className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      STAT_COLOR_VAR[q.mainStatType as MainStatType],
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{q.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] ${
                        DIFFICULTY_COLOR[q.difficulty as QuestDifficulty]
                      }`}
                    >
                      {DIFFICULTY_LABEL[q.difficulty as QuestDifficulty]}
                    </span>
                    {q.estimatedMinutes && (
                      <span className="text-[10px] text-[--color-text-faint]">
                        {q.estimatedMinutes}분
                      </span>
                    )}
                    <span className="text-[10px] text-[--color-text-faint]">
                      +{q.xpRewardBase} XP
                    </span>
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          STAT_COLOR_VAR[q.mainStatType as MainStatType],
                      }}
                    >
                      {STAT_LABEL[q.mainStatType as MainStatType]}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showCreate && (
        <CreateQuestModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </main>
  );
}
