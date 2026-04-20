import type { ClassCode } from "@/lib/db/schema";

// LV UP — 레벨/칭호 계산 (TECH_SPEC 9.6, PRD 11.4)

export function getXpToNext(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// PRD 11.4 — 5클래스 × 10레벨 = 50개 칭호.
// Builder 라인은 v2 단선형 칭호를 이어받음(PRD 명시).
// Creator/Leader/Explorer/Supporter는 PRD가 "작가 작성 예정"으로 둔 자리 —
// 아래는 클래스 키워드(빛/길/지도/다리)와 공통 10단계 의미 구조
// (입장→자각→첫 걸음→지속→방향→가속→불꽃→영향→방식→각성)에 맞춘 v1 드래프트.
// 작가의 최종 카피로 교체될 자리.
const TITLES: Record<ClassCode, Record<number, string>> = {
  builder: {
    1: "입장한 자",
    2: "자각한 자",
    3: "첫 걸음을 뗀 자",
    4: "흔들리지 않는 자",
    5: "길을 찾은 자",
    6: "가속하는 자",
    7: "불꽃을 품은 자",
    8: "빛을 나누는 자",
    9: "길을 만드는 자",
    10: "각성한 자",
  },
  creator: {
    1: "첫 빛을 품은 자",
    2: "자기 색을 본 자",
    3: "첫 표현을 남긴 자",
    4: "꺾이지 않는 색을 가진 자",
    5: "자기 톤을 찾은 자",
    6: "물드는 손을 가진 자",
    7: "빛을 다루는 자",
    8: "타인의 어둠을 비추는 자",
    9: "자기 화풍을 만드는 자",
    10: "스스로 빛이 된 자",
  },
  leader: {
    1: "방향을 묻는 자",
    2: "나침반을 든 자",
    3: "첫 깃발을 세운 자",
    4: "흔들리지 않는 깃발을 든 자",
    5: "길을 가리키는 자",
    6: "함께 달리게 만드는 자",
    7: "결단의 무게를 아는 자",
    8: "팀을 끌고 가는 자",
    9: "자기 길을 내는 자",
    10: "길의 기준이 된 자",
  },
  explorer: {
    1: "첫 지도를 펼친 자",
    2: "물음을 품은 자",
    3: "첫 발자국을 남긴 자",
    4: "깊이를 견디는 자",
    5: "길 없는 곳을 걷는 자",
    6: "보이지 않는 것을 보는 자",
    7: "진실에 가까이 간 자",
    8: "지도를 다시 그리는 자",
    9: "자기 방식으로 묻는 자",
    10: "끝없는 탐색에 든 자",
  },
  supporter: {
    1: "곁에 머무는 자",
    2: "타인을 본 자",
    3: "첫 다리를 놓은 자",
    4: "흔들리지 않는 손을 가진 자",
    5: "조율하는 자",
    6: "팀을 살리는 자",
    7: "보이지 않게 받치는 자",
    8: "사람을 잇는 자",
    9: "자기 방식으로 살리는 자",
    10: "함께를 가능하게 한 자",
  },
};

export function getTitleByLevel(
  level: number,
  classCode?: ClassCode | null,
): string {
  const capped = Math.min(Math.max(level, 1), 10);
  const pool = classCode ? TITLES[classCode] : TITLES.builder;
  return pool[capped] ?? pool[10];
}

export function checkLevelUp(
  currentXp: number,
  xpToAdd: number,
  currentLevel: number,
  classCode?: ClassCode | null,
): {
  leveledUp: boolean;
  newLevel: number;
  newTitle: string;
  newXp: number;
  newXpToNext: number;
} {
  let xp = currentXp + xpToAdd;
  let level = currentLevel;
  let xpToNext = getXpToNext(level);

  while (xp >= xpToNext && level < 99) {
    xp -= xpToNext;
    level += 1;
    xpToNext = getXpToNext(level);
  }

  return {
    leveledUp: level > currentLevel,
    newLevel: level,
    newTitle: getTitleByLevel(level, classCode),
    newXp: xp,
    newXpToNext: xpToNext,
  };
}
