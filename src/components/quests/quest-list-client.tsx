"use client";

import { useState } from "react";
import Link from "next/link";
import type { Quest, MainStatType, QuestDifficulty } from "@/lib/db/schema";
import { CreateQuestModal } from "./create-quest-modal";

const STAT_COLOR: Record<MainStatType, string> = {
  vitality: "var(--color-vitality)", focus: "var(--color-focus)",
  execution: "var(--color-execution)", knowledge: "var(--color-knowledge)",
  relationship: "var(--color-relationship)", influence: "var(--color-influence)",
};

const STAT_LABEL: Record<MainStatType, string> = {
  vitality: "VIT", focus: "FOC", execution: "EXE",
  knowledge: "KNO", relationship: "REL", influence: "INF",
};

const DIFF_LABEL: Record<QuestDifficulty, string> = {
  easy: "E", normal: "N", hard: "H", epic: "S",
};
const DIFF_FULL: Record<QuestDifficulty, string> = {
  easy: "Easy", normal: "Normal", hard: "Hard", epic: "Epic",
};
const DIFF_COLOR: Record<QuestDifficulty, string> = {
  easy: "#22c55e", normal: "#3b82f6", hard: "#f97316", epic: "#a855f7",
};

type Tab = "daily" | "custom";

export function QuestListClient({ initialQuests }: { initialQuests: Quest[] }) {
  const [tab, setTab] = useState<Tab>("daily");
  const [showCreate, setShowCreate] = useState(false);
  const [questList, setQuestList] = useState(initialQuests);

  const filtered = questList.filter((q) => {
    if (tab === "daily") return q.type === "daily" || q.type === "story";
    return q.type === "custom" || q.type === "project";
  });

  return (
    <main className="flex flex-col gap-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-wider">퀘스트</h1>
        <span className="system-label">{filtered.length} ACTIVE</span>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 rounded-lg bg-[--color-surface] p-1">
        {(["daily", "custom"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-2.5 text-xs tracking-wider transition-all active:scale-95 ${
              tab === t
                ? "bg-[--color-accent]/10 text-[--color-accent] font-medium"
                : "text-[--color-text-faint] hover:text-[--color-text-muted]"
            }`}
          >
            {t === "daily" ? "Daily" : "Custom"}
          </button>
        ))}
      </div>

      {/* Custom 탭 생성 버튼 */}
      {tab === "custom" && (
        <button
          onClick={() => setShowCreate(true)}
          className="system-frame flex w-full items-center justify-center gap-2 py-4 text-sm text-[--color-accent] transition-all hover:bg-[--color-accent]/5 active:scale-[0.98]"
        >
          <span className="text-lg leading-none">+</span>
          새 퀘스트 생성
        </button>
      )}

      {/* 퀘스트 리스트 */}
      {filtered.length === 0 ? (
        <div className="system-frame py-16 text-center">
          <p className="text-sm text-[--color-text-faint]">
            {tab === "daily"
              ? "&#8212; 할당된 임무가 없습니다 &#8212;"
              : "&#8212; 나만의 퀘스트를 만들어보세요 &#8212;"}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {filtered.map((q, i) => {
            const statType = q.mainStatType as MainStatType;
            const diff = q.difficulty as QuestDifficulty;
            return (
              <li key={q.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <Link
                  href={`/quests/${q.id}`}
                  className="quest-card flex items-center gap-4 p-4 pl-6"
                  style={{ "--quest-color": STAT_COLOR[statType] } as React.CSSProperties}
                >
                  {/* 난이도 뱃지 */}
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                    style={{
                      backgroundColor: `${DIFF_COLOR[diff]}15`,
                      color: DIFF_COLOR[diff],
                      border: `1px solid ${DIFF_COLOR[diff]}30`,
                    }}
                    title={DIFF_FULL[diff]}
                  >
                    {DIFF_LABEL[diff]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-medium">{q.title}</h3>
                    <div className="mt-1.5 flex items-center gap-3">
                      {q.estimatedMinutes && (
                        <span className="font-mono text-[10px] text-[--color-text-faint]">
                          {q.estimatedMinutes}m
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-[--color-xp]">
                        +{q.xpRewardBase}xp
                      </span>
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: STAT_COLOR[statType] }}
                      >
                        {STAT_LABEL[statType]}+{q.statReward}
                      </span>
                    </div>
                  </div>

                  {/* 화살표 */}
                  <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0 text-[--color-text-faint]">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {showCreate && (
        <CreateQuestModal
          onClose={() => setShowCreate(false)}
          onCreated={(q) => {
            setQuestList((prev) => [...prev, q]);
            setShowCreate(false);
            setTab("custom");
          }}
        />
      )}
    </main>
  );
}
