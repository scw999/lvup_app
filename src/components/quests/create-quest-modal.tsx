"use client";

import { useState } from "react";
import type {
  Quest,
  MainStatType,
  QuestDifficulty,
} from "@/lib/db/schema";

const STAT_OPTIONS: { value: MainStatType; label: string }[] = [
  { value: "vitality", label: "체력" },
  { value: "focus", label: "집중력" },
  { value: "execution", label: "실행력" },
  { value: "knowledge", label: "지식력" },
  { value: "relationship", label: "관계력" },
  { value: "influence", label: "전파력" },
];

const DIFFICULTY_OPTIONS: { value: QuestDifficulty; label: string; desc: string }[] = [
  { value: "easy", label: "Easy", desc: "10 XP" },
  { value: "normal", label: "Normal", desc: "20 XP" },
  { value: "hard", label: "Hard", desc: "40 XP" },
  { value: "epic", label: "Epic", desc: "80 XP" },
];

export function CreateQuestModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (quest: Quest) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("normal");
  const [mainStatType, setMainStatType] = useState<MainStatType>("execution");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("퀘스트 이름을 입력하세요");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          difficulty,
          mainStatType,
          estimatedMinutes: estimatedMinutes
            ? parseInt(estimatedMinutes, 10)
            : undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "생성 실패");
        setSubmitting(false);
        return;
      }

      const { id } = (await res.json()) as { id: string };

      // Fetch the full quest to pass back
      const questRes = await fetch(`/api/quests/${id}`);
      const { quest } = (await questRes.json()) as { quest: Quest };
      onCreated(quest);
    } catch {
      setError("네트워크 오류");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      {/* modal */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-[--color-border] bg-[--color-bg] p-6 sm:rounded-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wider">
            커스텀 퀘스트
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[--color-text-faint] hover:text-[--color-text-muted]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Title */}
        <label className="mb-4 block">
          <span className="mb-1 block text-[10px] tracking-wider text-[--color-text-faint]">
            퀘스트 이름
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-text] outline-none focus:border-[--color-accent]"
            placeholder="오늘 할 일을 적으세요"
            maxLength={100}
            autoFocus
          />
        </label>

        {/* Description */}
        <label className="mb-4 block">
          <span className="mb-1 block text-[10px] tracking-wider text-[--color-text-faint]">
            설명 (선택)
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-text] outline-none focus:border-[--color-accent]"
            rows={2}
            maxLength={300}
          />
        </label>

        {/* Difficulty */}
        <fieldset className="mb-4">
          <legend className="mb-2 text-[10px] tracking-wider text-[--color-text-faint]">
            난이도
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDifficulty(opt.value)}
                className={`rounded-lg border py-2 text-center text-[10px] transition-colors ${
                  difficulty === opt.value
                    ? "border-[--color-accent] bg-[--color-accent]/10 text-[--color-accent]"
                    : "border-[--color-border] text-[--color-text-faint] hover:border-[--color-text-faint]"
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="mt-0.5 opacity-60">{opt.desc}</div>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Stat type */}
        <fieldset className="mb-4">
          <legend className="mb-2 text-[10px] tracking-wider text-[--color-text-faint]">
            연결 스탯
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {STAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMainStatType(opt.value)}
                className={`rounded-lg border py-2 text-center text-xs transition-colors ${
                  mainStatType === opt.value
                    ? "border-[--color-accent] bg-[--color-accent]/10 text-[--color-accent]"
                    : "border-[--color-border] text-[--color-text-faint] hover:border-[--color-text-faint]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Estimated time */}
        <label className="mb-5 block">
          <span className="mb-1 block text-[10px] tracking-wider text-[--color-text-faint]">
            예상 시간 (분, 선택)
          </span>
          <input
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            className="w-24 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-text] outline-none focus:border-[--color-accent]"
            min={1}
            max={480}
          />
        </label>

        {error && (
          <p className="mb-3 text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[--color-accent] py-3 text-sm font-medium text-white transition-colors hover:bg-[--color-accent-hover] disabled:opacity-50"
        >
          {submitting ? "생성 중..." : "���스트 생성"}
        </button>
      </form>
    </div>
  );
}
