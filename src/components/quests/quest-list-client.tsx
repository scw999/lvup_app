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

type Tab = "daily" | "custom" | "done";

type Props = {
  initialQuests: Quest[];
  emptyMessages: { daily: string; custom: string };
};

export function QuestListClient({ initialQuests, emptyMessages }: Props) {
  const [tab, setTab] = useState<Tab>("daily");
  const [showCreate, setShowCreate] = useState(false);
  const [questList, setQuestList] = useState(initialQuests);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [loadingDone, setLoadingDone] = useState(false);

  async function loadCompleted() {
    if (loadingDone || completedQuests.length > 0) return;
    setLoadingDone(true);
    try {
      const res = await fetch("/api/quests?status=completed");
      const data = (await res.json()) as { quests: Quest[] };
      setCompletedQuests(data.quests.slice(0, 20));
    } catch { /* ignore */ }
    setLoadingDone(false);
  }

  async function archiveQuest(id: string) {
    try {
      await fetch(`/api/quests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      setQuestList((prev) => prev.filter((q) => q.id !== id));
    } catch { /* ignore */ }
  }

  async function deleteQuest(id: string) {
    try {
      await fetch(`/api/quests/${id}`, { method: "DELETE" });
      setQuestList((prev) => prev.filter((q) => q.id !== id));
    } catch { /* ignore */ }
  }

  const filtered = questList.filter((q) => {
    if (tab === "daily") return (q.type === "daily" || q.type === "story") && q.status === "active";
    if (tab === "custom") return (q.type === "custom" || q.type === "project") && q.status === "active";
    return false;
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
        {(["daily", "custom", "done"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === "done") loadCompleted(); }}
            className={`flex-1 rounded-md py-2.5 text-xs tracking-wider transition-all active:scale-95 ${
              tab === t
                ? "bg-[--color-accent]/10 text-[--color-accent] font-medium"
                : "text-[--color-text-faint] hover:text-[--color-text-muted]"
            }`}
          >
            {t === "daily" ? "Daily" : t === "custom" ? "Custom" : "완료"}
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

      {/* 완료 탭 */}
      {tab === "done" && (
        loadingDone ? (
          <div className="py-12 text-center text-sm text-[--color-text-faint]">불러오는 중...</div>
        ) : completedQuests.length === 0 ? (
          <div className="system-frame py-16 text-center">
            <p className="text-sm text-[--color-text-muted]">완료한 퀘스트가 없습니다</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {completedQuests.map((q) => {
              const statType = q.mainStatType as MainStatType;
              return (
                <li key={q.id} className="flex items-center gap-3 rounded-lg border border-[--color-border] bg-[--color-surface] px-4 py-3 opacity-60">
                  <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: STAT_COLOR[statType] }} />
                  <span className="flex-1 truncate text-sm text-[--color-text-muted] line-through">{q.title}</span>
                  <span className="font-mono text-[10px] text-[--color-accent]">+{q.xpRewardBase}xp</span>
                </li>
              );
            })}
          </ul>
        )
      )}

      {/* 활성 퀘스트 리스트 */}
      {tab !== "done" && (filtered.length === 0 ? (
        <div className="system-frame py-16 text-center">
          <p className="px-6 text-sm leading-relaxed text-[--color-text-muted]">
            {tab === "daily" ? emptyMessages.daily : emptyMessages.custom}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {filtered.map((q, i) => {
            const statType = q.mainStatType as MainStatType;
            const diff = q.difficulty as QuestDifficulty;
            const isCustom = q.type === "custom" || q.type === "project";
            return (
              <li key={q.id} className="animate-fade-in group relative" style={{ animationDelay: `${i * 50}ms` }}>
                <Link
                  href={`/quests/${q.id}`}
                  className="quest-card flex items-center gap-4 p-4 pl-6"
                  style={{ "--quest-color": STAT_COLOR[statType] } as React.CSSProperties}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                    style={{ backgroundColor: `${DIFF_COLOR[diff]}15`, color: DIFF_COLOR[diff], border: `1px solid ${DIFF_COLOR[diff]}30` }}
                    title={DIFF_FULL[diff]}
                  >
                    {DIFF_LABEL[diff]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-medium">{q.title}</h3>
                    <div className="mt-1.5 flex items-center gap-3">
                      {q.estimatedMinutes && (
                        <span className="font-mono text-[10px] text-[--color-text-faint]">{q.estimatedMinutes}m</span>
                      )}
                      <span className="font-mono text-[10px] text-[--color-xp]">+{q.xpRewardBase}xp</span>
                      <span className="font-mono text-[10px]" style={{ color: STAT_COLOR[statType] }}>
                        {STAT_LABEL[statType]}+{q.statReward}
                      </span>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0 text-[--color-text-faint]">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </Link>
                {/* 관리 버튼 (custom만) */}
                {isCustom && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden gap-1 group-hover:flex">
                    <button
                      onClick={(e) => { e.preventDefault(); archiveQuest(q.id); }}
                      className="rounded px-2 py-1 text-[10px] text-[--color-text-faint] hover:bg-[--color-surface-alt] hover:text-[--color-text-muted]"
                      title="보관"
                    >
                      보관
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); if (confirm("삭제할까요?")) deleteQuest(q.id); }}
                      className="rounded px-2 py-1 text-[10px] text-red-400/60 hover:bg-red-500/10 hover:text-red-400"
                      title="삭제"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ))}

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
