import type { QuestDifficulty } from "@/lib/db/schema";

// LV UP — 난이도별 XP/스탯 보상 테이블
//
// 기준:
//   - PRD 8.2 난이도 표: easy 5~10 / normal 10~25 / hard 25~60 / epic 60~200
//   - 스키마 주석 "stat_reward 난이도별 1/2/3/5"
//
// Sprint 2는 starter 퀘스트 시드에만 사용되고, Sprint 4의 실제 보상 계산기도
// 동일 파일을 재사용하도록 한 곳에 중앙화.

export const DIFFICULTY_REWARDS: Readonly<
  Record<QuestDifficulty, { xpRewardBase: number; statReward: number }>
> = Object.freeze({
  easy: { xpRewardBase: 10, statReward: 1 },
  normal: { xpRewardBase: 20, statReward: 2 },
  hard: { xpRewardBase: 40, statReward: 3 },
  epic: { xpRewardBase: 80, statReward: 5 },
});
