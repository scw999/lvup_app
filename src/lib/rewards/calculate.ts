import type { MainStatType, Quest } from "@/lib/db/schema";
import { getNarrativeMessage } from "./narratives";

// LV UP — 보상 계산 (TECH_SPEC 9.1~9.5)

export type RewardInput = {
  quest: Pick<Quest, "xpRewardBase" | "mainStatType" | "statReward">;
  hasNote: boolean;
  hasRepresentativeImage: boolean;
  additionalImageCount: number;
  hasLink: boolean;
  streakDays: number;
  isFirstVerification?: boolean;
  isComeback?: boolean;
};

export type RewardResult = {
  xpBase: number;
  xpEvidence: number;
  xpBonus: number; // Phase 2, MVP = 0
  xpTotal: number;
  statType: MainStatType;
  statDelta: number;
  narrativeMessage: string;
};

// TECH_SPEC 9.4 — 증빙 XP 규칙
function calcEvidenceXp(input: RewardInput): number {
  let xp = 0;
  if (input.hasNote) xp += 2;
  if (input.hasRepresentativeImage) xp += 3;
  if (input.additionalImageCount >= 2) xp += 2;
  if (input.hasLink) xp += 2;
  return Math.min(xp, 9); // 최대 +9
}

// TECH_SPEC 9.5 — 연속 수행 보너스 (base XP에만 적용)
function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 100) return 1.75;
  if (streakDays >= 30) return 1.5;
  if (streakDays >= 7) return 1.25;
  if (streakDays >= 2) return 1.1;
  return 1.0;
}

export function calculateQuestReward(input: RewardInput): RewardResult {
  const streakMul = getStreakMultiplier(input.streakDays);
  const xpBase = Math.round(input.quest.xpRewardBase * streakMul);
  const xpEvidence = calcEvidenceXp(input);
  const xpBonus = 0; // Phase 2
  const xpTotal = xpBase + xpEvidence + xpBonus;

  const statType = input.quest.mainStatType as MainStatType;
  const statDelta = input.quest.statReward;

  return {
    xpBase,
    xpEvidence,
    xpBonus,
    xpTotal,
    statType,
    statDelta,
    narrativeMessage: getNarrativeMessage(statType, {
      streakDays: input.streakDays,
      isFirstVerification: input.isFirstVerification,
      isComeback: input.isComeback,
    }),
  };
}
