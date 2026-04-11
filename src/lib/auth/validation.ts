// LV UP — Auth 입력 검증
//
// zod를 Sprint 1에서 바로 도입하지는 않고, 최소 수작업 검증만 둔다.
// (TECH_SPEC 12.2는 zod "권장"이며 MVP 기준 필수는 아님.)

export type ValidationError = {
  message: string;
  fields: Record<string, string>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readField(input: unknown, key: string): unknown {
  if (input && typeof input === "object" && key in input) {
    return (input as Record<string, unknown>)[key];
  }
  return undefined;
}

export function validateSignup(
  input: unknown,
): { ok: true; email: string; password: string; nickname: string }
  | { ok: false; error: ValidationError } {
  const fields: Record<string, string> = {};

  const rawEmail = readField(input, "email");
  const rawPassword = readField(input, "password");
  const rawNickname = readField(input, "nickname");

  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  const password = typeof rawPassword === "string" ? rawPassword : "";
  const nickname = typeof rawNickname === "string" ? rawNickname.trim() : "";

  if (!email) fields.email = "이메일을 입력해 주세요.";
  else if (!EMAIL_RE.test(email)) fields.email = "올바른 이메일 형식이 아닙니다.";

  if (!password) fields.password = "비밀번호를 입력해 주세요.";
  else if (password.length < 8)
    fields.password = "비밀번호는 8자 이상이어야 합니다.";
  else if (password.length > 128)
    fields.password = "비밀번호가 너무 깁니다.";

  if (!nickname) fields.nickname = "닉네임을 입력해 주세요.";
  else if (nickname.length < 2)
    fields.nickname = "닉네임은 2자 이상이어야 합니다.";
  else if (nickname.length > 20)
    fields.nickname = "닉네임은 20자 이하여야 합니다.";

  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      error: { message: "입력을 다시 확인해 주세요.", fields },
    };
  }

  return { ok: true, email, password, nickname };
}

export function validateLogin(
  input: unknown,
): { ok: true; email: string; password: string }
  | { ok: false; error: ValidationError } {
  const fields: Record<string, string> = {};

  const rawEmail = readField(input, "email");
  const rawPassword = readField(input, "password");

  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  const password = typeof rawPassword === "string" ? rawPassword : "";

  if (!email) fields.email = "이메일을 입력해 주세요.";
  else if (!EMAIL_RE.test(email)) fields.email = "올바른 이메일 형식이 아닙니다.";

  if (!password) fields.password = "비밀번호를 입력해 주세요.";

  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      error: { message: "입력을 다시 확인해 주세요.", fields },
    };
  }

  return { ok: true, email, password };
}
