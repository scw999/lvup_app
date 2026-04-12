import type { MainStatType } from "@/lib/db/schema";

// LV UP — 스탯 해석 문구 (PRD 5.3 + 5.4)
//
// 스탯 값에 따라 사용자에게 보여줄 해석 문구를 반환한다.
// "해석 문구는 단순 숫자보다 100배 강력하다" — PRD 5.4

const STAT_LABELS: Record<MainStatType, string> = {
  vitality: "체력",
  focus: "집중력",
  execution: "실행력",
  knowledge: "지식력",
  relationship: "관계력",
  influence: "전파력",
};

// 구간별 해석 — PRD 5.3 예시 기반
const THRESHOLDS: readonly { min: number; descriptor: string }[] = [
  { min: 50, descriptor: "압도적" },
  { min: 40, descriptor: "강력함" },
  { min: 30, descriptor: "가속 중" },
  { min: 20, descriptor: "꾸준함" },
  { min: 15, descriptor: "안정적" },
  { min: 12, descriptor: "회복 단계" },
  { min: 0, descriptor: "시작 전" },
];

export function getStatDescriptor(value: number): string {
  for (const t of THRESHOLDS) {
    if (value >= t.min) return t.descriptor;
  }
  return "시작 전";
}

export function getStatLabel(stat: MainStatType): string {
  return STAT_LABELS[stat];
}

export { STAT_LABELS };
