"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ClassCode, FirstGoal } from "@/lib/db/schema";
import { CLASS_INFO } from "@/lib/onboarding/classes";
import { FIRST_GOAL_INFO } from "@/lib/onboarding/first-goals";
import { MAX_ROLE_TAGS, MIN_ROLE_TAGS, ROLE_TAGS } from "@/lib/onboarding/role-tags";

// LV UP — 온보딩 4-step wizard (클라이언트)
//
// Step 1 인트로 → 2 클래스 선택 → 3 역할 태그 + 첫 목표 → 4 생성 연출.
// 상태는 모두 로컬 useState. 3 → 4 전환 시점에 API 호출과 3초 minimum delay를
// 병렬 실행해서 체감 지연 = max(3초, API RTT).

type WizardProps = {
  nickname: string;
};

type Step = 1 | 2 | 3 | 4 | 5;

const MIN_REVEAL_MS = 3000;

export function OnboardingWizard({ nickname }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [classCode, setClassCode] = useState<ClassCode | null>(null);
  const [roleTags, setRoleTags] = useState<string[]>([]);
  const [firstGoal, setFirstGoal] = useState<FirstGoal | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [firstQuestId, setFirstQuestId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggleRoleTag(code: string) {
    setRoleTags((prev) => {
      if (prev.includes(code)) return prev.filter((c) => c !== code);
      if (prev.length >= MAX_ROLE_TAGS) return prev;
      return [...prev, code];
    });
  }

  function pickClass(code: ClassCode) {
    setClassCode(code);
    setStep(3);
  }

  const canSubmitStep3 =
    roleTags.length >= MIN_ROLE_TAGS &&
    roleTags.length <= MAX_ROLE_TAGS &&
    firstGoal !== null;

  function handleSubmit() {
    if (!classCode || !firstGoal) return;
    setFormError(null);
    setStep(4);

    const apiPromise = fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classCode, roleTags, firstGoal }),
    });
    const minDelay = new Promise((resolve) => setTimeout(resolve, MIN_REVEAL_MS));

    startTransition(async () => {
      try {
        const [res] = await Promise.all([apiPromise, minDelay]);
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: { message?: string };
          };
          // 이미 온보딩된 케이스 (재진입 방지). 조용히 /status로.
          if (res.status === 400 && body.error?.message?.includes("이미")) {
            router.replace("/status");
            return;
          }
          setFormError(
            body.error?.message ?? "상태창 생성에 실패했다. 다시 시도하라.",
          );
          setStep(3);
          return;
        }
        const data = (await res.json().catch(() => ({}))) as {
          firstQuestId?: string;
        };
        setFirstQuestId(data.firstQuestId ?? null);
        setStep(5);
      } catch {
        setFormError("세계와의 연결이 불안정하다. 다시 시도하라.");
        setStep(3);
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center">
      {step === 1 && <StepIntro nickname={nickname} onStart={() => setStep(2)} />}

      {step === 2 && <StepClass onPick={pickClass} />}

      {step === 3 && (
        <StepTagsAndGoal
          roleTags={roleTags}
          firstGoal={firstGoal}
          onToggleTag={toggleRoleTag}
          onPickGoal={setFirstGoal}
          onSubmit={handleSubmit}
          canSubmit={canSubmitStep3}
          formError={formError}
        />
      )}

      {step === 4 && <StepReveal />}

      {step === 5 && (
        <StepHarp
          nickname={nickname}
          classCode={classCode}
          firstQuestId={firstQuestId}
          onEnter={() => router.replace(firstQuestId ? "/quests" : "/status")}
        />
      )}
    </div>
  );
}

// ── Step 1 ────────────────────────────────────────────────────
function StepIntro({
  nickname,
  onStart,
}: {
  nickname: string;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-8 inline-block rounded-full border border-[--color-border] px-4 py-1.5 text-xs tracking-[0.2em] text-[--color-text-muted]">
        CHAPTER 0
      </span>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {nickname}, 당신의 세계가 곧 열린다.
      </h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-[--color-text-muted] sm:text-base">
        60초 안에 당신이 어떤 사람인지 세계에 알려 달라.
        <br />
        상태창은 그 답을 바탕으로 만들어진다.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-12 rounded-full bg-[--color-accent] px-8 py-4 text-base font-semibold text-white transition hover:bg-[--color-accent-hover]"
      >
        시작
      </button>
    </div>
  );
}

// ── Step 2 ────────────────────────────────────────────────────
function StepClass({ onPick }: { onPick: (code: ClassCode) => void }) {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          당신은 어떤 사람인가
        </h2>
        <p className="mt-2 text-sm text-[--color-text-muted]">
          카드를 탭하면 즉시 선택된다.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {CLASS_INFO.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => onPick(c.code)}
            className="group flex flex-col items-start gap-2 rounded-xl border border-[--color-border] bg-[--color-surface] p-5 text-left transition hover:border-[--color-accent] hover:bg-[--color-surface-alt]"
            style={{ borderLeft: `3px solid ${c.color}` }}
          >
            <span className="text-lg font-bold" style={{ color: c.color }}>
              {c.label}
            </span>
            <span className="text-sm text-[--color-text]">{c.tagline}</span>
            <span className="text-xs text-[--color-text-faint]">
              {c.strongAxesLabel}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 3 ────────────────────────────────────────────────────
function StepTagsAndGoal({
  roleTags,
  firstGoal,
  onToggleTag,
  onPickGoal,
  onSubmit,
  canSubmit,
  formError,
}: {
  roleTags: string[];
  firstGoal: FirstGoal | null;
  onToggleTag: (code: string) => void;
  onPickGoal: (g: FirstGoal) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  formError: string | null;
}) {
  return (
    <div className="w-full space-y-10">
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            당신의 역할은
          </h2>
          <span className="text-xs text-[--color-text-faint]">
            {roleTags.length}/{MAX_ROLE_TAGS}
          </span>
        </div>
        <p className="mb-4 text-xs text-[--color-text-muted]">
          {MIN_ROLE_TAGS}~{MAX_ROLE_TAGS}개 선택
        </p>
        <div className="flex flex-wrap gap-2">
          {ROLE_TAGS.map((tag) => {
            const selected = roleTags.includes(tag.code);
            const disabled = !selected && roleTags.length >= MAX_ROLE_TAGS;
            return (
              <button
                key={tag.code}
                type="button"
                onClick={() => onToggleTag(tag.code)}
                disabled={disabled}
                className={[
                  "rounded-full border px-4 py-2 text-sm transition",
                  selected
                    ? "border-[--color-accent] bg-[--color-accent]/20 text-[--color-text]"
                    : "border-[--color-border] bg-[--color-surface] text-[--color-text-muted] hover:border-[--color-text-faint]",
                  disabled && "cursor-not-allowed opacity-40",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          지금 필요한 것은
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIRST_GOAL_INFO.map((g) => {
            const selected = firstGoal === g.code;
            return (
              <button
                key={g.code}
                type="button"
                onClick={() => onPickGoal(g.code)}
                className={[
                  "flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition",
                  selected
                    ? "border-[--color-accent] bg-[--color-accent]/10"
                    : "border-[--color-border] bg-[--color-surface] hover:border-[--color-text-faint]",
                ].join(" ")}
              >
                <span className="text-base font-semibold">{g.label}</span>
                <span className="text-xs text-[--color-text-muted]">
                  {g.tagline}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {formError && (
        <div
          role="alert"
          className="rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200"
        >
          {formError}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mx-auto block rounded-full bg-[--color-accent] px-10 py-4 text-base font-semibold text-white transition hover:bg-[--color-accent-hover] disabled:cursor-not-allowed disabled:opacity-40"
      >
        상태창 열기
      </button>
    </div>
  );
}

// ── Step 4 ────────────────────────────────────────────────────
function StepReveal() {
  const lines = [
    "// loading class spec...",
    "// binding first stats...",
    "// forging first quests...",
  ];
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        상태창을 생성하는 중
      </h2>
      <p className="mt-3 text-sm text-[--color-text-muted]">
        세계가 당신의 자리를 찾고 있다.
      </p>
      <ul className="mt-12 space-y-2 font-[family-name:var(--font-mono)] text-sm text-[--color-text-faint]">
        {lines.map((line, i) => (
          <li
            key={line}
            className="opacity-0"
            style={{
              animation: "scanline 0.8s ease-out forwards",
              animationDelay: `${i * 0.8}s`,
            }}
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Step 5 ────────────────────────────────────────────────────
const HARP_MESSAGES: Record<ClassCode, string> = {
  builder:
    "드디어 나타났군. 나는 하프 — 이 세계에서 네 기록을 맡은 존재다.\n\n제작자의 상태창이 생성됐다. 네가 만들어낼 것들이 여기에 쌓일 것이다.\n\n첫 번째 퀘스트가 준비됐다. 시작하라.",
  creator:
    "왔군. 나는 하프 — 네 여정의 기록자다.\n\n창작자의 상태창이 살아났다. 네가 표현해낼 것들이 이 안에 새겨질 것이다.\n\n첫 번째 퀘스트가 기다리고 있다.",
  leader:
    "좋아. 나는 하프 — 이 세계의 관찰자다.\n\n주도자가 입장했다. 방향을 잡는 자의 상태창은 행동으로만 채워진다.\n\n첫 번째 퀘스트로 증명하라.",
  explorer:
    "흥미롭군. 나는 하프 — 네 탐구를 기록하는 존재다.\n\n탐구자의 상태창이 초기화됐다. 배울수록 이 창은 깊어질 것이다.\n\n첫 번째 퀘스트를 확인해봐라.",
  supporter:
    "반갑다. 나는 하프 — 이 세계에서 네 곁에 있을 기록자다.\n\n조율자의 상태창이 열렸다. 연결하고 도울수록 이 창은 빛날 것이다.\n\n첫 번째 퀘스트가 준비됐다.",
};

function StepHarp({
  nickname,
  classCode,
  firstQuestId,
  onEnter,
}: {
  nickname: string;
  classCode: ClassCode | null;
  firstQuestId: string | null;
  onEnter: () => void;
}) {
  const info = classCode ? CLASS_INFO.find((c) => c.code === classCode) : null;
  const message = classCode ? HARP_MESSAGES[classCode] : HARP_MESSAGES.builder;

  return (
    <div className="flex w-full max-w-lg flex-col items-start">
      {/* HARP identity bar */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold"
          style={info ? { borderColor: `${info.color}60`, color: info.color, backgroundColor: `${info.color}15` } : {}}
        >
          하
        </div>
        <div>
          <p className="text-sm font-semibold">하프</p>
          <p className="text-[10px] tracking-widest text-[--color-text-faint]">SYSTEM GUIDE · HARP</p>
        </div>
      </div>

      {/* Message bubble */}
      <div className="system-frame w-full p-5">
        {message.split("\n\n").map((para, i) => (
          <p key={i} className={`text-sm leading-relaxed ${i > 0 ? "mt-4" : ""} ${i === message.split("\n\n").length - 1 ? "text-[--color-text-muted]" : "text-[--color-text]"}`}>
            {para}
          </p>
        ))}
        <p className="mt-5 text-right text-xs text-[--color-text-faint]">— 하프</p>
      </div>

      {/* Class badge */}
      {info && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span
            className="rounded-full border px-3 py-1 font-medium tracking-wider"
            style={{ borderColor: `${info.color}50`, color: info.color }}
          >
            {info.label}
          </span>
          <span className="text-[--color-text-faint]">클래스로 등록됨</span>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onEnter}
        className="mt-8 w-full rounded-xl py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
        style={info ? { backgroundColor: info.color } : { backgroundColor: "var(--color-accent)" }}
      >
        {firstQuestId ? "첫 퀘스트 시작하기" : "세계로 입장"}
      </button>

      <p className="mt-3 w-full text-center text-[11px] text-[--color-text-faint]">
        {nickname}의 상태창이 생성됐다
      </p>
    </div>
  );
}
