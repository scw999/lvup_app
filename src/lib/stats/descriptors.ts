import type { MainStatType } from "@/lib/db/schema";

// LV UP — 스탯 해석 문구 (PRD 5.3 + 5.4)
//
// "해석 문구는 단순 숫자보다 100배 강력하다" — PRD 5.4
// 같은 값이라도 7일 추세에 따라 다른 톤이 붙는다.
//   값 18 + ▲5 → "회복 단계"   (낮은 값이 오르고 있음)
//   값 18 + ▲0 → "잠잠함"       (낮은 값이 정체)
//   값 31 + ▲7 → "가속 중"      (중간 값이 빠르게 오름)
//   값 31 + ▲1 → "꾸준함"       (중간 값이 천천히 오름)

const STAT_LABELS: Record<MainStatType, string> = {
  vitality: "체력",
  focus: "집중력",
  execution: "실행력",
  knowledge: "지식력",
  relationship: "관계력",
  influence: "전파력",
};

type Tier = "high" | "mid" | "low" | "start";

function tierOf(value: number): Tier {
  if (value >= 40) return "high";
  if (value >= 25) return "mid";
  if (value >= 13) return "low";
  return "start";
}

// 톤 매트릭스 — tier × 추세
const DESCRIPTORS: Record<Tier, { rising: string; steady: string; flat: string }> = {
  high:  { rising: "압도적",   steady: "강력함",     flat: "고지에서" },
  mid:   { rising: "가속 중",  steady: "꾸준함",     flat: "안정적" },
  low:   { rising: "회복 단계", steady: "다지는 중", flat: "잠잠함" },
  start: { rising: "첫 불씨",  steady: "시작 단계", flat: "시작 전" },
};

export function getStatDescriptor(value: number, delta7d?: number): string {
  const tier = tierOf(value);
  const d = delta7d ?? 0;
  if (d >= 5) return DESCRIPTORS[tier].rising;
  if (d >= 1) return DESCRIPTORS[tier].steady;
  return DESCRIPTORS[tier].flat;
}

export function getStatLabel(stat: MainStatType): string {
  return STAT_LABELS[stat];
}

export { STAT_LABELS };
