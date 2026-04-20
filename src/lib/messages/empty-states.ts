// LV UP — 빈 상태 메시지 풀
// PRD Part 17.4 + Part 11.6 (empty_state 카테고리)
//
// 원칙: 빈 화면도 세계관이 있다. 채근하지 않고, 같은 빈 화면이라도
// 컨텍스트(가입 직후/한밤/한 달 침묵 등)에 따라 다른 톤이 붙는다.
// HARP 톤 — 관찰자/동행/수용. "지금 행동하세요" 같은 명령조 금지.

export type EmptyStateContext =
  | "first_visit_after_signup"
  | "one_week_silence"
  | "one_month_silence"
  | "midnight_visit"
  | "early_morning_visit"
  | "no_main_quest"
  | "no_quests_daily"
  | "no_quests_custom"
  | "no_growth_log";

const POOL: Record<EmptyStateContext, readonly string[]> = {
  first_visit_after_signup: [
    "너의 세계가 열렸다. 천천히 둘러봐도 좋아.",
    "첫 화면은 비어 있다. 비어 있는 게 정상이다.",
    "여기서 너의 이야기가 시작된다. 서두를 필요는 없어.",
  ],
  one_week_silence: [
    "기다리고 있었어. 다시 와줘서 다행이야.",
    "비어 있던 한 주도 너의 일부였다.",
    "어디에 있었든, 지금 너는 여기 있다. 그걸로 충분해.",
  ],
  one_month_silence: [
    "오래 비어 있던 자리. 다시 너에게 돌려준다.",
    "한 달은 길지만, 다시 시작하는 데는 한 줄이면 된다.",
    "기록은 남아 있어. 너는 이어 쓰면 돼.",
  ],
  midnight_visit: [
    "한밤의 모험가, 무엇이 너를 깨웠는가.",
    "다른 사람이 자는 시간에도 너는 한 줄을 적었다.",
    "이 시간에 깨어 있는 건 외로운 일이다. 옆에 있을게.",
  ],
  early_morning_visit: [
    "새벽의 빛은 가장 먼저 일어난 자에게 닿는다.",
    "오늘의 첫 발걸음을 너의 것으로 만들었다.",
    "다른 세계가 깨어나기 전에 너는 한 칸을 움직였다.",
  ],
  no_main_quest: [
    "오늘의 모험은 아직 시작되지 않았다.",
    "퀘스트가 비어 있다. 뭐든 한 줄이면 시작이다.",
    "오늘 너에게 어떤 행동이 필요한지, 너만 안다.",
    "비어 있는 자리도 하나의 상태다. 채울지 말지는 너의 선택.",
  ],
  no_quests_daily: [
    "할당된 임무가 없다. 그것도 하나의 상태다.",
    "오늘은 자유 시간이다. 무엇으로 채울까.",
    "주어진 길이 없을 때, 사람은 자기 길을 본다.",
  ],
  no_quests_custom: [
    "너만의 퀘스트는 너만 만들 수 있다.",
    "남이 정해준 길이 아니라, 네가 정한 길로 한 칸.",
    "여기는 비어 있어야 한다. 네가 채우기 전까지는.",
  ],
  no_growth_log: [
    "기록은 행동의 다음에 온다. 한 번만 인증해도 여기 채워진다.",
    "비어 있는 캘린더는 가능성의 다른 이름이다.",
  ],
};

function pick<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getEmptyStateMessage(ctx: EmptyStateContext): string {
  return pick(POOL[ctx]);
}

// 빈 화면 진입 시 시간대로 컨텍스트 추론.
// 한국 표준시 기준: 0~5시 = 한밤, 5~7시 = 새벽. 이 외엔 null(일반 톤 유지).
export function getTimeBasedEmptyState(
  now: Date = new Date(),
): EmptyStateContext | null {
  const hour = now.getHours();
  if (hour >= 0 && hour < 5) return "midnight_visit";
  if (hour >= 5 && hour < 7) return "early_morning_visit";
  return null;
}

// 마지막 활동일로부터 침묵 컨텍스트 추론.
// 7일 미만 = null, 7~29일 = one_week_silence, 30일+ = one_month_silence.
// 가입 직후(lastActiveDate가 null/오늘인 신규)는 first_visit_after_signup.
export function getSilenceEmptyState(
  lastActiveDate: string | null,
  today: string = new Date().toISOString().slice(0, 10),
): EmptyStateContext | null {
  if (!lastActiveDate) return "first_visit_after_signup";
  const last = new Date(lastActiveDate + "T00:00:00Z").getTime();
  const now = new Date(today + "T00:00:00Z").getTime();
  const days = Math.floor((now - last) / 86_400_000);
  if (days >= 30) return "one_month_silence";
  if (days >= 7) return "one_week_silence";
  return null;
}
