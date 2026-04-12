"use client";

import { useState } from "react";
import { VerifyQuestModal } from "./verify-quest-modal";
import { RewardOverlay } from "./reward-overlay";

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
};

export function QuestVerifyButton({
  questId,
  questTitle,
  isCompleted,
  completedAt,
  xpBase,
}: {
  questId: string;
  questTitle: string;
  isCompleted: boolean;
  completedAt: string | null;
  xpBase: number;
}) {
  const [showVerify, setShowVerify] = useState(false);
  const [reward, setReward] = useState<RewardData | null>(null);
  const [completed, setCompleted] = useState(isCompleted);
  const [quickCompleting, setQuickCompleting] = useState(false);

  if (completed) {
    return (
      <div className="system-frame border-emerald-500/20 p-4 text-center">
        <p className="text-sm text-emerald-400">임무 완료</p>
        {completedAt && (
          <p className="mt-1 text-[10px] text-[--color-text-faint]">
            {new Date(completedAt).toLocaleDateString("ko-KR")}
          </p>
        )}
      </div>
    );
  }

  // 빠른 완료 (사진 없이, 수행 XP만)
  async function handleQuickComplete() {
    setQuickCompleting(true);
    try {
      const res = await fetch("/api/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId }),
      });
      if (!res.ok) {
        setQuickCompleting(false);
        return;
      }
      const { reward: r } = (await res.json()) as { reward: RewardData };
      setReward(r);
      setCompleted(true);
    } catch {
      setQuickCompleting(false);
    }
  }

  return (
    <>
      {/* 2단계 액션 */}
      <div className="flex flex-col gap-3">
        {/* 메인: 사진 인증 (증빙 XP 보너스) */}
        <button
          onClick={() => setShowVerify(true)}
          className="system-frame glow-soft w-full py-4 text-center text-sm font-medium text-[--color-accent] transition-all hover:bg-[--color-accent]/5 active:scale-[0.98]"
        >
          사진 인증하기
          <span className="ml-2 text-[10px] text-[--color-xp]">+증빙 XP</span>
        </button>

        {/* 서브: 빠른 완료 (수행 XP만) */}
        <button
          onClick={handleQuickComplete}
          disabled={quickCompleting}
          className="w-full rounded-xl border border-[--color-border] py-3 text-center text-xs text-[--color-text-muted] transition-all hover:border-[--color-text-faint] hover:text-[--color-text] active:scale-[0.98] disabled:opacity-50"
        >
          {quickCompleting ? "처리 중..." : `완료 체크만 하기 (+${xpBase} XP)`}
        </button>
      </div>

      {showVerify && (
        <VerifyQuestModal
          questId={questId}
          questTitle={questTitle}
          onClose={() => setShowVerify(false)}
          onVerified={(r) => {
            setShowVerify(false);
            setReward(r);
            setCompleted(true);
          }}
        />
      )}

      {reward && (
        <RewardOverlay
          reward={reward}
          onDismiss={() => setReward(null)}
        />
      )}
    </>
  );
}
