import type { ClassCode, MainStatType, QuestDifficulty } from "@/lib/db/schema";

// LV UP — 퀘스트 자동 보충 풀
//
// 기준: TECH_SPEC 19 / PRD Part 20.1
// 온보딩 starter 3개를 완료한 후에도 계속 퀘스트가 공급되도록
// 클래스별로 6~8개의 보충 퀘스트를 정의한다.
// 선택 알고리즘: 단순 랜덤. Phase 2에서 레벨/선호도 기반으로 고도화.

export type ReplenishmentQuest = {
  title: string;
  mainStatType: MainStatType;
  difficulty: QuestDifficulty;
  estimatedMinutes: number;
};

const POOL: Record<ClassCode, readonly ReplenishmentQuest[]> = {
  builder: [
    { title: "30분 동안 한 가지 작업에만 집중하기", mainStatType: "focus", difficulty: "normal", estimatedMinutes: 30 },
    { title: "오늘 작업한 것 사진 한 장 남기기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 5 },
    { title: "미루던 작업 15분만 시작하기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 15 },
    { title: "작업 진행상황 한 줄 정리하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
    { title: "오늘 배운 기술 하나 기록하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 10 },
    { title: "결과물 스크린샷 찍어서 아카이빙하기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 5 },
    { title: "45분 집중 작업 세션 완주하기", mainStatType: "focus", difficulty: "hard", estimatedMinutes: 45 },
    { title: "작업 중 막힌 부분 해결법 찾기", mainStatType: "knowledge", difficulty: "normal", estimatedMinutes: 20 },
  ],
  creator: [
    { title: "오늘 영감을 준 것 하나 기록하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
    { title: "15분 창작 시간 갖기", mainStatType: "focus", difficulty: "normal", estimatedMinutes: 15 },
    { title: "작품 한 조각 완성하기", mainStatType: "execution", difficulty: "normal", estimatedMinutes: 30 },
    { title: "창작물 사진/스크린샷 남기기", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 5 },
    { title: "오늘의 창작 테마 정하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
    { title: "누군가에게 작업 과정 보여주기", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 10 },
    { title: "완성된 창작물 한 곳에 공유하기", mainStatType: "influence", difficulty: "normal", estimatedMinutes: 15 },
    { title: "참고 레퍼런스 3개 수집하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 10 },
  ],
  leader: [
    { title: "오늘 팀/프로젝트 진행 상황 점검하기", mainStatType: "execution", difficulty: "easy", estimatedMinutes: 10 },
    { title: "한 명에게 피드백 또는 응원 메시지 보내기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 5 },
    { title: "다음 마일스톤 구체화하기", mainStatType: "execution", difficulty: "normal", estimatedMinutes: 20 },
    { title: "오늘 대화에서 배운 것 한 줄 정리하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
    { title: "누군가의 고민에 15분 투자하기", mainStatType: "relationship", difficulty: "normal", estimatedMinutes: 15 },
    { title: "팀원/파트너 근황 확인하기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 5 },
    { title: "프로젝트 리스크 하나 찾고 대응책 세우기", mainStatType: "knowledge", difficulty: "normal", estimatedMinutes: 20 },
    { title: "오늘 리더로서 한 결정 기록하기", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 5 },
  ],
  explorer: [
    { title: "관심 주제 관련 글 하나 읽기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 15 },
    { title: "오늘 배운 것 세 줄 요약하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 10 },
    { title: "새로운 도구/방법 하나 시도해보기", mainStatType: "execution", difficulty: "normal", estimatedMinutes: 30 },
    { title: "모르던 개념 하나 찾아보기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 10 },
    { title: "탐구 결과 메모로 남기기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
    { title: "비슷한 사례 두 개 비교 분석하기", mainStatType: "knowledge", difficulty: "normal", estimatedMinutes: 25 },
    { title: "오늘의 인사이트 한 줄 정리하기", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 5 },
    { title: "새로운 분야 15분 탐색하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 15 },
  ],
  supporter: [
    { title: "누군가에게 진심 어린 응원 남기기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 5 },
    { title: "주변 사람의 고민 들어주기", mainStatType: "relationship", difficulty: "normal", estimatedMinutes: 20 },
    { title: "도움이 된 자료 한 개 공유하기", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 5 },
    { title: "오늘 대화에서 배운 점 기록하기", mainStatType: "knowledge", difficulty: "easy", estimatedMinutes: 5 },
    { title: "감사 인사 한 번 전하기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 5 },
    { title: "팀 분위기 개선을 위한 행동 하나 하기", mainStatType: "relationship", difficulty: "normal", estimatedMinutes: 15 },
    { title: "좋은 콘텐츠 한 가지 추천하기", mainStatType: "influence", difficulty: "easy", estimatedMinutes: 10 },
    { title: "관계에서 놓쳤던 것 반성하고 개선 결심하기", mainStatType: "relationship", difficulty: "easy", estimatedMinutes: 10 },
  ],
};

// 보충 퀘스트 1개 랜덤 선택
export function pickReplenishmentQuest(classCode: ClassCode): ReplenishmentQuest {
  const pool = POOL[classCode];
  return pool[Math.floor(Math.random() * pool.length)];
}
