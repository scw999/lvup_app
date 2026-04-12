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
}: {
  questId: string;
  questTitle: string;
  isCompleted: boolean;
  completedAt: string | null;
}) {
  const [showVerify, setShowVerify] = useState(false);
  const [reward, setReward] = useState<RewardData | null>(null);
  const [completed, setCompleted] = useState(isCompleted);

  if (completed) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
        <p className="text-sm text-emerald-400">완료된 퀘스트</p>
        {completedAt && (
          <p className="mt-1 text-[10px] text-[--color-text-faint]">
            {new Date(completedAt).toLocaleDateString("ko-KR")}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowVerify(true)}
        className="w-full rounded-xl bg-[--color-accent] py-4 text-sm font-medium text-white transition-colors hover:bg-[--color-accent-hover]"
      >
        인증하기
      </button>

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
