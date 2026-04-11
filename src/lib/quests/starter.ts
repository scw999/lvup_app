import type {
  ClassCode,
  FirstGoal,
  MainStatType,
  QuestDifficulty,
} from "@/lib/db/schema";

// LV UP — 온보딩 완료 시 시드되는 starter 퀘스트 (TECH_SPEC Section 19)
//
// 5 클래스 × 4 첫 목표 = 20 조합 전부를 이번 스프린트에 채운다.
// TECH_SPEC 19의 12개 구체 정의는 문구 그대로 복사,
// 나머지 8개(Leader habit/income, Explorer habit/income/team, Supporter habit/project/income)는
// 같은 3-step 패턴(easy 정의 → normal 실행 → easy 흔적)으로 확장.

export type StarterQuest = {
  title: string;
  mainStatType: MainStatType;
  difficulty: QuestDifficulty;
  estimatedMinutes: number;
};

type StarterKey = `${ClassCode}_${FirstGoal}`;

export const STARTER_QUEST_MAP: Record<
  StarterKey,
  readonly [StarterQuest, StarterQuest, StarterQuest]
> = {
  // ── Builder ─────────────────────────────────────────────
  builder_project: [
    { title: "오늘 만들 것 한 줄 정의하기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 5 },
    { title: "20분 집중 작업하기", mainStatType: "focus", difficulty: "normal", estimatedMinutes: 20 },
    { title: "작업 결과 이미지 남기기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 5 },
  ],
  builder_habit: [
    { title: "매일 할 작업 시간 정하기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 5 },
    { title: "오늘 작업 환경 정리하기", mainStatType: "focus", difficulty: "easy", estimatedMinutes: 10 },
    { title: "첫 결과물 한 조각 만들기", mainStatType: "execution", difficulty: "normal", estimatedMinutes: 30 },
  ],
  builder_income: [
    { title: "팔 수 있는 것 한 가지 정의하기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 10 },
    { title: "오늘 1시간 만들기 작업", mainStatType: "execution", difficulty: "normal", estimatedMinutes: 60 },
    { title: "첫 결과물 사진 남기기", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 5 },
  ],
  builder_team: [
    { title: "함께 작업하고 싶은 사람 한 명 정하기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 5 },
    { title: "자기소개 한 줄 정리하기", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 10 },
    { title: "오늘 만든 것 누군가에게 보여주기", mainStatType: "relationship", difficulty: "normal", estimatedMinutes: 15 },
  ],

  // ── Creator ─────────────────────────────────────────────
  creator_project: [
    { title: "오늘 표현할 주제 정하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
    { title: "15분 창작하기", mainStatType: "focus", difficulty: "normal", estimatedMinutes: 15 },
    { title: "결과물 일부 공유하기", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 5 },
  ],
  creator_habit: [
    { title: "매일 영감 1개 기록하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
    { title: "작은 작품 한 개 만들기", mainStatType: "execution", difficulty: "normal", estimatedMinutes: 30 },
    { title: "만든 것에 대한 한 줄 메모", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 5 },
  ],
  creator_income: [
    { title: "팔 수 있는 작품 형태 정의하기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 10 },
    { title: "첫 샘플 만들기", mainStatType: "execution", difficulty: "normal", estimatedMinutes: 45 },
    { title: "누군가에게 피드백 받기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 10 },
  ],
  creator_team: [
    { title: "좋아하는 작가/창작자 1명 찾기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 10 },
    { title: "그들에게 한 줄 메시지 쓰기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 10 },
    { title: "자기 작품 한 점 공유하기", mainStatType: "influence", difficulty: "normal", estimatedMinutes: 15 },
  ],

  // ── Leader ──────────────────────────────────────────────
  leader_project: [
    { title: "프로젝트 한 줄 정의", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 5 },
    { title: "첫 마일스톤 정하기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 10 },
    { title: "도와줄 사람 한 명 찾기", mainStatType: "relationship", difficulty: "normal", estimatedMinutes: 15 },
  ],
  leader_team: [
    { title: "함께할 목표 정리하기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 10 },
    { title: "팀 조건 한 줄로 정의하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
    { title: "오늘 한 번 대화 시도하기", mainStatType: "relationship", difficulty: "normal", estimatedMinutes: 15 },
  ],
  // ↓ 신규: TECH_SPEC 19.3 "(나머지 조합은 위 패턴 따라 추가)"
  leader_habit: [
    { title: "오늘 이끌 한 가지 정하기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 5 },
    { title: "20분 동안 계획 다듬기", mainStatType: "execution", difficulty: "normal", estimatedMinutes: 20 },
    { title: "한 사람에게 오늘의 방향 공유하기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 10 },
  ],
  leader_income: [
    { title: "제안할 가치 한 줄로 정의하기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 10 },
    { title: "제안 초안 30분 쓰기", mainStatType: "execution", difficulty: "normal", estimatedMinutes: 30 },
    { title: "한 사람에게 제안 보여주기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 15 },
  ],

  // ── Explorer ────────────────────────────────────────────
  explorer_project: [
    { title: "비슷한 사례 3개 조사하기", mainStatType: "knowledge", difficulty: "normal", estimatedMinutes: 30 },
    { title: "핵심 인사이트 1개 정리하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 10 },
    { title: "오늘 배운 것 기록하기", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 5 },
  ],
  // ↓ 신규: TECH_SPEC 19.4 "(나머지 조합 추가)"
  explorer_habit: [
    { title: "오늘 살필 질문 한 개 정하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
    { title: "20분 동안 자료 찾아 읽기", mainStatType: "focus", difficulty: "normal", estimatedMinutes: 20 },
    { title: "배운 것 한 줄로 기록하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
  ],
  explorer_income: [
    { title: "팔릴 만한 정보 영역 정의하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 10 },
    { title: "30분 동안 시장 조사하기", mainStatType: "focus", difficulty: "normal", estimatedMinutes: 30 },
    { title: "오늘 발견한 사실 한 줄 남기기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
  ],
  explorer_team: [
    { title: "같이 파고들 주제 정하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 10 },
    { title: "20분 동안 관련 분야 탐색하기", mainStatType: "knowledge", difficulty: "normal", estimatedMinutes: 20 },
    { title: "함께 이야기할 사람 한 명 찾기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 10 },
  ],

  // ── Supporter ───────────────────────────────────────────
  supporter_team: [
    { title: "누군가에게 응원/피드백 남기기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 10 },
    { title: "대화 정리하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
    { title: "오늘 관계 행동 기록하기", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 5 },
  ],
  // ↓ 신규: TECH_SPEC 19.5 "(나머지 조합 추가)"
  supporter_habit: [
    { title: "오늘 돌볼 관계 한 명 정하기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 5 },
    { title: "20분 동안 내 상태 점검하기", mainStatType: "vitality", difficulty: "normal", estimatedMinutes: 20 },
    { title: "누군가에게 안부 한 줄 보내기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 5 },
  ],
  supporter_project: [
    { title: "도울 수 있는 일 한 가지 정하기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 10 },
    { title: "30분 동안 누군가의 일 정리해주기", mainStatType: "relationship", difficulty: "normal", estimatedMinutes: 30 },
    { title: "오늘 도운 흔적 기록하기", mainStatType: "vitality", difficulty: "easy", estimatedMinutes: 5 },
  ],
  supporter_income: [
    { title: "내가 도울 수 있는 것 한 줄 정의하기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 10 },
    { title: "30분 동안 누군가의 문제 듣기", mainStatType: "relationship", difficulty: "normal", estimatedMinutes: 30 },
    { title: "오늘 나눈 대화 정리하기", mainStatType: "vitality", difficulty: "easy", estimatedMinutes: 5 },
  ],
};

// supporter의 team 조합이 TECH_SPEC 19.5에 "influence"로 끝나 있으나
// supporter의 강한 축은 relationship/vitality이다. TECH_SPEC 문구를 존중하여
// 원문대로 둔다 (문서 편차 기록: Sprint 2 plan TECH_SPEC 편차 섹션 참조).

export function getStarterQuests(
  classCode: ClassCode,
  firstGoal: FirstGoal,
): readonly [StarterQuest, StarterQuest, StarterQuest] {
  return STARTER_QUEST_MAP[`${classCode}_${firstGoal}`];
}
