"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "lvup_first_guide_dismissed";

const STEPS = [
  {
    icon: "⚔️",
    label: "퀘스트 선택",
    desc: "매일 새로운 퀘스트가 주어진다. 탭에서 확인하라.",
  },
  {
    icon: "📸",
    label: "행동 인증",
    desc: "사진이나 텍스트로 완료를 증명하면 XP와 스탯이 올라간다.",
  },
  {
    icon: "📊",
    label: "상태창 성장",
    desc: "쌓인 기록이 이 창을 채운다. 행동이 곧 데이터다.",
  },
];

export function FirstVisitGuide({ fresh }: { fresh: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fresh) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, [fresh]);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="system-frame p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[--color-accent]">하프</span>
          <span className="text-[10px] tracking-widest text-[--color-text-faint]">SYSTEM GUIDE</span>
        </div>
        <button
          onClick={dismiss}
          aria-label="닫기"
          className="text-[--color-text-faint] hover:text-[--color-text-muted]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <p className="mb-4 text-sm text-[--color-text-muted]">
        상태창이 생성됐다. 처음이라면 순서대로 따라라.
      </p>

      <div className="flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface] font-mono text-xs text-[--color-accent]">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-semibold">{s.icon} {s.label}</p>
              <p className="mt-0.5 text-xs text-[--color-text-faint]">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/quests"
        onClick={dismiss}
        className="mt-5 block w-full rounded-xl bg-[--color-accent]/15 py-3 text-center text-sm font-semibold text-[--color-accent] transition hover:bg-[--color-accent]/25"
      >
        퀘스트 목록 열기 →
      </Link>

      <p className="mt-3 text-center text-[10px] text-[--color-text-faint]">— 하프</p>
    </div>
  );
}
