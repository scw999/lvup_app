import {
  CLASS_CODES,
  FIRST_GOALS,
  type ClassCode,
  type FirstGoal,
} from "@/lib/db/schema";
import {
  ROLE_TAG_CODES,
  MIN_ROLE_TAGS,
  MAX_ROLE_TAGS,
} from "./role-tags";

// LV UP — 온보딩 입력 검증
//
// src/lib/auth/validation.ts 와 동일한 판별 유니언 스타일을 쓴다.

export type ValidationError = {
  message: string;
  fields: Record<string, string>;
};

function readField(input: unknown, key: string): unknown {
  if (input && typeof input === "object" && key in input) {
    return (input as Record<string, unknown>)[key];
  }
  return undefined;
}

export type OnboardingInput = {
  classCode: ClassCode;
  roleTags: string[];
  firstGoal: FirstGoal;
};

const CLASS_CODE_SET = new Set<string>(CLASS_CODES);
const FIRST_GOAL_SET = new Set<string>(FIRST_GOALS);

export function validateOnboarding(
  input: unknown,
): { ok: true } & OnboardingInput | { ok: false; error: ValidationError } {
  const fields: Record<string, string> = {};

  const rawClassCode = readField(input, "classCode");
  const rawRoleTags = readField(input, "roleTags");
  const rawFirstGoal = readField(input, "firstGoal");

  // classCode
  let classCode: ClassCode | null = null;
  if (typeof rawClassCode !== "string" || !rawClassCode) {
    fields.classCode = "클래스를 선택해 주세요.";
  } else if (!CLASS_CODE_SET.has(rawClassCode)) {
    fields.classCode = "허용되지 않은 클래스입니다.";
  } else {
    classCode = rawClassCode as ClassCode;
  }

  // firstGoal
  let firstGoal: FirstGoal | null = null;
  if (typeof rawFirstGoal !== "string" || !rawFirstGoal) {
    fields.firstGoal = "첫 목표를 선택해 주세요.";
  } else if (!FIRST_GOAL_SET.has(rawFirstGoal)) {
    fields.firstGoal = "허용되지 않은 첫 목표입니다.";
  } else {
    firstGoal = rawFirstGoal as FirstGoal;
  }

  // roleTags — 배열, 1~3개, 유효 code, 중복 제거
  let roleTags: string[] = [];
  if (!Array.isArray(rawRoleTags)) {
    fields.roleTags = "역할 태그를 선택해 주세요.";
  } else {
    const deduped = Array.from(
      new Set(
        rawRoleTags.filter((t): t is string => typeof t === "string" && t.length > 0),
      ),
    );

    if (deduped.length < MIN_ROLE_TAGS) {
      fields.roleTags = `역할 태그를 최소 ${MIN_ROLE_TAGS}개 선택해 주세요.`;
    } else if (deduped.length > MAX_ROLE_TAGS) {
      fields.roleTags = `역할 태그는 최대 ${MAX_ROLE_TAGS}개까지 선택할 수 있습니다.`;
    } else if (deduped.some((code) => !ROLE_TAG_CODES.has(code))) {
      fields.roleTags = "허용되지 않은 역할 태그가 포함되어 있습니다.";
    } else {
      roleTags = deduped;
    }
  }

  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      error: { message: "입력을 다시 확인해 주세요.", fields },
    };
  }

  return { ok: true, classCode: classCode!, roleTags, firstGoal: firstGoal! };
}
