"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// PRD 16.2 화면 5 — 보상 연출
// 전체 화면 오버레이, 어둠에서 빛이 모이는 연출.

const STAT_LABEL: Record<string, string> = {
  vitality: "체력",
  focus: "집중력",
  execution: "실행력",
  knowledge: "지식력",
  relationship: "관계력",
  influence: "전파력",
};

const STAT_COLOR: Record<string, string> = {
  vitality: "var(--color-vitality)",
  focus: "var(--color-focus)",
  execution: "var(--color-execution)",
  knowledge: "var(--color-knowledge)",
  relationship: "var(--color-relationship)",
  influence: "var(--color-influence)",
};

type RewardData = {
  xpBase: number;
  xpEvidence: number;
  xpBonus: number;
  xpTotal: number;
  statType: string;
  statDelta: number;
  leveledUp: boolean;
  newLevel: number | null;
  newTitle: string | null;
  narrativeMessage: string;
  levelUpMessage: string | null;
  isFirstVerification?: boolean;
  newQuestUnlocked?: string | null;
  streakMilestone?: number | null;
};

export function RewardOverlay({
  reward,
  onDismiss,
}: {
  reward: RewardData;
  onDismiss: () => void;
}) {
  const [phase, setPhase] = useState(0);
  // phase 0: fade in
  // phase 1: show XP
  // phase 2: show narrative
  // phase 3: show stat
  // phase 4: show level up (if applicable)
  // phase 5: show buttons

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(reward.leveledUp ? 4 : 5), 2600),
      ...(reward.leveledUp ? [setTimeout(() => setPhase(5), 3800)] : []),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reward.leveledUp]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 transition-opacity duration-500"
      style={{ opacity: phase >= 0 ? 1 : 0 }}
    >
      <div className="flex max-w-sm flex-col items-center gap-6 px-6 text-center">
        {/* sparkles */}
        <div
          className="text-2xl transition-all duration-700"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "scale(1)" : "scale(0.5)",
          }}
        >
          &#10022; &#10022; &#10022;
        </div>

        {/* XP */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <span className="font-mono text-5xl font-bold text-[--color-accent]">
            +{reward.xpTotal}
          </span>
          <span className="ml-2 text-lg text-[--color-text-muted]">XP</span>
          {reward.xpEvidence > 0 && (
            <p className="mt-1 text-xs text-[--color-text-faint]">
              기본 {reward.xpBase} + 증빙 {reward.xpEvidence}
            </p>
          )}
        </div>

        {/* Narrative message */}
        <p
          className="max-w-xs text-sm leading-relaxed text-[--color-text-muted] transition-all duration-700"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(16px)",
          }}
        >
          &ldquo;{reward.narrativeMessage}&rdquo;
        </p>

        {/* Stat increase */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <span
            className="font-mono text-2xl font-bold"
            style={{ color: STAT_COLOR[reward.statType] }}
          >
            {STAT_LABEL[reward.statType]} +{reward.statDelta}
          </span>
        </div>

        {/* Level up */}
        {reward.leveledUp && (
          <div
            className="rounded-xl border border-[--color-accent]/40 bg-[--color-accent]/10 px-6 py-4 transition-all duration-700"
            style={{
              opacity: phase >= 4 ? 1 : 0,
              transform: phase >= 4 ? "scale(1)" : "scale(0.8)",
            }}
          >
            <p className="text-lg font-bold text-[--color-accent]">
              LEVEL UP!
            </p>
            <p className="mt-1 text-sm text-[--color-text]">
              Lv.{reward.newLevel} — {reward.newTitle}
            </p>
            {reward.levelUpMessage && (
              <p className="mt-2 text-xs text-[--color-text-muted]">
                &ldquo;{reward.levelUpMessage}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* 화면 5a: 첫 인증 — 덕훌 1화 연결 */}
        {reward.isFirstVerification && (
          <div
            className="w-full max-w-xs transition-all duration-700"
            style={{
              opacity: phase >= 5 ? 1 : 0,
              transform: phase >= 5 ? "translateY(0)" : "translateY(12px)",
            }}
          >
            <div className="rounded-xl border border-[--color-border-glow] bg-[--color-surface]/80 px-5 py-4 text-center">
              <p className="text-sm leading-relaxed text-[--color-text-muted]">
                덕훌도 같은 자리에서 시작했어요.
              </p>
              <a
                href="https://lvup.world/story/deokul/1"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[--color-accent] transition-colors hover:text-[--color-accent-hover]"
              >
                덕훌의 1화 읽기
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 3l4 4-4 4" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* 스트릭 milestone */}
        {reward.streakMilestone && (
          <div
            className="w-full max-w-xs rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-4 text-center transition-all duration-700"
            style={{
              opacity: phase >= 5 ? 1 : 0,
              transform: phase >= 5 ? "translateY(0)" : "translateY(12px)",
            }}
          >
            <p className="text-2xl">🔥</p>
            <p className="mt-1 font-mono text-lg font-bold text-orange-400">
              {reward.streakMilestone}일 연속 달성!
            </p>
            <p className="mt-1 text-xs text-[--color-text-faint]">
              {reward.streakMilestone >= 100
                ? "전설의 영역에 들어섰다"
                : reward.streakMilestone >= 30
                ? "한 달을 흔들리지 않았다"
                : reward.streakMilestone >= 14
                ? "루틴이 몸에 새겨지고 있다"
                : reward.streakMilestone >= 7
                ? "한 주를 끊기지 않았다"
                : "불꽃이 타오르기 시작했다"}
            </p>
          </div>
        )}

        {/* 새 퀘스트 해금 알림 */}
        {reward.newQuestUnlocked && (
          <div
            className="w-full max-w-xs rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-center transition-all duration-500"
            style={{
              opacity: phase >= 5 ? 1 : 0,
              transform: phase >= 5 ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <p className="text-[10px] tracking-wider text-emerald-400">NEW QUEST UNLOCKED</p>
            <p className="mt-0.5 text-xs text-[--color-text-muted]">{reward.newQuestUnlocked}</p>
          </div>
        )}

        {/* Buttons */}
        <div
          className="flex gap-3 transition-all duration-500"
          style={{
            opacity: phase >= 5 ? 1 : 0,
            transform: phase >= 5 ? "translateY(0)" : "translateY(12px)",
          }}
        >
          <Link
            href="/quests"
            className="rounded-lg border border-[--color-border] px-5 py-2.5 text-xs text-[--color-text-muted] transition-colors hover:border-[--color-accent]"
          >
            다음 퀘스트
          </Link>
          <Link
            href="/status"
            onClick={onDismiss}
            className="rounded-lg bg-[--color-accent] px-5 py-2.5 text-xs text-white transition-colors hover:bg-[--color-accent-hover]"
          >
            상태창으로
          </Link>
        </div>
      </div>
    </div>
  );
}
