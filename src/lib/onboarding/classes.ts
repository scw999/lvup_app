import type { ClassCode } from "@/lib/db/schema";

// LV UP — 5 클래스 메타데이터 (PRD Part 6.1)
//
// 클래스는 "성향"이며 직군이 아니다. 온보딩 wizard에서 카드 UI를 그릴 때,
// /status에서 사용자의 현재 클래스를 표시할 때 참조한다.

export type ClassInfo = {
  code: ClassCode;
  label: string; // 한국어 표기
  tagline: string; // 한 줄 설명 (PRD 6.1 "설명")
  strongAxesLabel: string; // "실행력·집중력" 같은 사람 친화 표현
  color: string; // PRD 6.1 "컬러" — Tailwind 토큰과 별개
};

export const CLASS_INFO: readonly ClassInfo[] = [
  {
    code: "builder",
    label: "제작자",
    tagline: "손으로 만들고 구현하는 사람",
    strongAxesLabel: "실행력 · 집중력",
    color: "#6366f1", // 인디고
  },
  {
    code: "creator",
    label: "창작자",
    tagline: "표현하고 창조하는 사람",
    strongAxesLabel: "전파력 · 지식력",
    color: "#a855f7", // 보랏빛
  },
  {
    code: "leader",
    label: "주도자",
    tagline: "방향을 잡고 끌고 가는 사람",
    strongAxesLabel: "실행력 · 관계력",
    color: "#eab308", // 황금빛
  },
  {
    code: "explorer",
    label: "탐구자",
    tagline: "배우고 조사하고 밝혀내는 사람",
    strongAxesLabel: "지식력 · 집중력",
    color: "#0891b2", // 청록
  },
  {
    code: "supporter",
    label: "조율자",
    tagline: "돕고 연결하고 팀을 살리는 사람",
    strongAxesLabel: "관계력 · 체력",
    color: "#84cc16", // 연두
  },
] as const;

export const CLASS_INFO_BY_CODE: Readonly<Record<ClassCode, ClassInfo>> =
  Object.freeze(
    Object.fromEntries(CLASS_INFO.map((c) => [c.code, c])) as Record<
      ClassCode,
      ClassInfo
    >,
  );
