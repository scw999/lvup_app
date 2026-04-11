import type { ClassCode, MainStatType } from "@/lib/db/schema";

// LV UP — 클래스별 초기 스탯 편향 (PRD 6.1 "강한 축" + PRD 22.2 예시)
//
// user_stats 행은 signup 시 이미 모든 스탯을 10으로 생성해둔 상태이므로,
// 온보딩 완료 시 이 테이블이 가리키는 2개 축에 각각 +2 UPDATE 한다.
// 결과: Builder라면 execution=12, focus=12, 나머지는 10.

export const CLASS_STAT_WEIGHTS: Readonly<
  Record<ClassCode, readonly [MainStatType, MainStatType]>
> = Object.freeze({
  builder: ["execution", "focus"] as const, // 실행력·집중력
  creator: ["influence", "knowledge"] as const, // 전파력·지식력
  leader: ["execution", "relationship"] as const, // 실행력·관계력
  explorer: ["knowledge", "focus"] as const, // 지식력·집중력
  supporter: ["relationship", "vitality"] as const, // 관계력·체력
});

export const STAT_BONUS_PER_AXIS = 2;
