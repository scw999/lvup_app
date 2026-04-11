"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

// LV UP — 가입/로그인 공용 폼
// 세계관 톤을 유지하기 위해 에러 메시지도 "~했다" 스타일로 번역한다.

type AuthFormProps = {
  mode: "signup" | "login";
};

type FieldErrors = Partial<Record<"email" | "password" | "nickname", string>>;

function copyFor(mode: "signup" | "login") {
  if (mode === "signup") {
    return {
      title: "세계에 입장한다",
      subtitle: "상태창을 여는 자만이 다음을 본다.",
      submit: "상태창 열기",
      submitPending: "문을 여는 중…",
      switchPrompt: "이미 입장한 적이 있다면",
      switchLabel: "로그인",
      switchHref: "/login",
      endpoint: "/api/auth/signup",
    } as const;
  }
  return {
    title: "다시 돌아왔다",
    subtitle: "세계는 당신을 기억하고 있다.",
    submit: "들어가기",
    submitPending: "인증 중…",
    switchPrompt: "아직 입장한 적이 없다면",
    switchLabel: "가입하기",
    switchHref: "/signup",
    endpoint: "/api/auth/login",
  } as const;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const t = copyFor(mode);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string> = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };
    if (mode === "signup") {
      payload.nickname = String(formData.get("nickname") ?? "").trim();
    }

    startTransition(async () => {
      try {
        const res = await fetch(t.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const body = (await res.json().catch(() => ({}))) as {
          error?: { message?: string; fields?: FieldErrors };
        };

        if (!res.ok) {
          setFormError(body.error?.message ?? "문이 열리지 않았다. 잠시 후 다시 시도하라.");
          if (body.error?.fields) setFieldErrors(body.error.fields);
          return;
        }

        router.push("/status");
        router.refresh();
      } catch {
        setFormError("세계와의 연결이 불안정하다. 다시 시도하라.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-[--color-border] bg-[--color-surface] p-8"
      noValidate
    >
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-[--color-text-muted]">{t.subtitle}</p>
      </div>

      <Field
        name="email"
        type="email"
        label="이메일"
        placeholder="you@example.com"
        autoComplete="email"
        error={fieldErrors.email}
        required
      />

      {mode === "signup" && (
        <Field
          name="nickname"
          type="text"
          label="닉네임"
          placeholder="세계에서 불릴 이름"
          autoComplete="nickname"
          error={fieldErrors.nickname}
          required
        />
      )}

      <Field
        name="password"
        type="password"
        label="비밀번호"
        placeholder="최소 8자"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        error={fieldErrors.password}
        minLength={8}
        required
      />

      {formError && (
        <div
          role="alert"
          className="rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200"
        >
          {formError}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-full bg-[--color-accent] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[--color-accent-hover] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? t.submitPending : t.submit}
      </button>

      <div className="text-center text-xs text-[--color-text-faint]">
        {t.switchPrompt}{" "}
        <Link
          href={t.switchHref}
          className="text-[--color-text-muted] underline-offset-4 hover:text-[--color-text] hover:underline"
        >
          {t.switchLabel}
        </Link>
      </div>
    </form>
  );
}

type FieldProps = {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  minLength?: number;
};

function Field(props: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-[--color-text-muted]">{props.label}</span>
      <input
        name={props.name}
        type={props.type}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        required={props.required}
        minLength={props.minLength}
        className="rounded-md border border-[--color-border] bg-[--color-surface-alt] px-3 py-2.5 text-sm text-[--color-text] placeholder:text-[--color-text-faint] focus:border-[--color-accent] focus:outline-none"
      />
      {props.error && (
        <span className="text-xs text-red-300">{props.error}</span>
      )}
    </label>
  );
}
