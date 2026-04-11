// LV UP — 역할 태그 마스터 리스트 (PRD Part 7.1)
//
// 클래스는 성향이고 역할 태그는 실무 역할이다. 1~3개 선택.
// Phase 1 MVP는 enum 고정. 사용자 제안 태그는 Phase 2.

export type RoleTag = {
  code: string;
  name: string;
};

export const ROLE_TAGS: readonly RoleTag[] = [
  { code: "planning", name: "기획" },
  { code: "design", name: "디자인" },
  { code: "development", name: "개발" },
  { code: "marketing", name: "마케팅" },
  { code: "operation", name: "운영" },
  { code: "research", name: "리서치" },
  { code: "analysis", name: "분석" },
  { code: "writing", name: "글쓰기" },
  { code: "editing", name: "편집" },
  { code: "architecture", name: "설계" },
  { code: "sales", name: "세일즈" },
  { code: "education", name: "교육" },
  { code: "communication", name: "커뮤니케이션" },
] as const;

export const ROLE_TAG_CODES: ReadonlySet<string> = new Set(
  ROLE_TAGS.map((t) => t.code),
);

export const ROLE_TAG_BY_CODE: Readonly<Record<string, RoleTag>> = Object.freeze(
  Object.fromEntries(ROLE_TAGS.map((t) => [t.code, t])),
);

export const MIN_ROLE_TAGS = 1;
export const MAX_ROLE_TAGS = 3;
