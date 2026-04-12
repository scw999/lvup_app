// LV UP — 레벨업 계산 (TECH_SPEC 9.6)

export function getXpToNext(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

const TITLES: Record<number, string> = {
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
};

export function getTitleByLevel(level: number): string {
  return TITLES[Math.min(level, 10)] ?? "각성한 자";
}

export function checkLevelUp(
  currentXp: number,
  xpToAdd: number,
  currentLevel: number,
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
    newTitle: getTitleByLevel(level),
    newXp: xp,
    newXpToNext: xpToNext,
  };
}
