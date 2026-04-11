import type { FirstGoal } from "@/lib/db/schema";

// LV UP — 첫 목표 4 카드 메타데이터
//
// 온보딩 step 3에서 사용자가 선택하는 "지금 당신이 LV UP을 쓰는 이유".
// 스키마의 FIRST_GOALS = ["habit","project","income","team"] 와 1:1.

export type FirstGoalInfo = {
  code: FirstGoal;
  label: string;
  tagline: string;
};

export const FIRST_GOAL_INFO: readonly FirstGoalInfo[] = [
  {
    code: "habit",
    label: "습관 만들기",
    tagline: "매일 반복할 작은 행동을 내 안에 새긴다",
  },
  {
    code: "project",
    label: "프로젝트 시작",
    tagline: "오늘 손을 움직여 한 조각을 만든다",
  },
  {
    code: "income",
    label: "수익 만들기",
    tagline: "내가 가진 것을 세상에 내보낸다",
  },
  {
    code: "team",
    label: "새로운 사람 만나기",
    tagline: "함께 걸을 수 있는 사람을 찾는다",
  },
] as const;

export const FIRST_GOAL_INFO_BY_CODE: Readonly<Record<FirstGoal, FirstGoalInfo>> =
  Object.freeze(
    Object.fromEntries(FIRST_GOAL_INFO.map((g) => [g.code, g])) as Record<
      FirstGoal,
      FirstGoalInfo
    >,
  );
