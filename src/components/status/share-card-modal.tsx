"use client";

import { useState } from "react";

const CLASS_COLOR: Record<string, string> = {
  builder: "#6366f1", creator: "#a855f7", leader: "#f59e0b",
  explorer: "#22c55e", supporter: "#3b82f6",
};
const CLASS_LABEL: Record<string, string> = {
  builder: "제작자", creator: "창작자", leader: "주도자",
  explorer: "탐구자", supporter: "조율자",
};
const STAT_COLOR: Record<string, string> = {
  vitality: "#f97316", focus: "#0891b2", execution: "#6366f1",
  knowledge: "#a855f7", relationship: "#84cc16", influence: "#eab308",
};
const STAT_LABEL: Record<string, string> = {
  vitality: "체력", focus: "집중력", execution: "실행력",
  knowledge: "지식력", relationship: "관계력", influence: "전파력",
};
const STAT_ORDER = ["vitality", "focus", "execution", "knowledge", "relationship", "influence"];

type Props = {
  nickname: string;
  classCode: string | null;
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  streakDays: number;
  stats: Record<string, number> | null;
  onClose: () => void;
};

export function ShareCardModal({ nickname, classCode, level, title, xp, xpToNext, streakDays, stats, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const color = classCode ? (CLASS_COLOR[classCode] ?? "#6366f1") : "#6366f1";
  const xpPct = xpToNext > 0 ? Math.min(100, Math.round((xp / xpToNext) * 100)) : 0;

  const topStats = stats
    ? STAT_ORDER
        .map((k) => ({ key: k, val: stats[k] ?? 0 }))
        .sort((a, b) => b.val - a.val)
        .slice(0, 3)
    : [];

  const shareText = `LV UP · ${CLASS_LABEL[classCode ?? ""] ?? "플레이어"} Lv.${level} "${title}"\n${topStats.map((s) => `${STAT_LABEL[s.key]} ${s.val}`).join(" · ")}\nlvup.world`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: "https://lvup.world" });
      } catch {
        // cancelled
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-[--color-border] bg-[--color-bg] p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-[0.2em] text-[--color-text-faint]">SHARE STATUS</p>
          <button onClick={onClose} className="text-[--color-text-faint] hover:text-[--color-text-muted]">
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* 공유 카드 */}
        <div
          id="share-card"
          className="rounded-2xl border p-5"
          style={{
            borderColor: `${color}30`,
            background: `radial-gradient(ellipse at top left, ${color}15 0%, #0a0a0a 60%)`,
          }}
        >
          {/* 상단 */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em] text-[--color-text-faint]">LV UP · STATUS</p>
              <h3 className="mt-1.5 text-xl font-bold">{nickname}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wider"
                  style={{ borderColor: `${color}60`, color }}
                >
                  {CLASS_LABEL[classCode ?? ""] ?? "—"}
                </span>
                <span className="font-mono text-sm font-semibold" style={{ color }}>
                  Lv.{level}
                </span>
              </div>
              <p className="mt-1 text-xs text-[--color-text-muted]">{title}</p>
            </div>
            {streakDays > 0 && (
              <div className="text-right">
                <span className="text-xl">🔥</span>
                <p className="font-mono text-xs text-[--color-vitality]">{streakDays}일</p>
              </div>
            )}
          </div>

          {/* XP 바 */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between">
              <span className="text-[9px] tracking-widest text-[--color-text-faint]">EXP</span>
              <span className="font-mono text-[9px] text-[--color-text-faint]">{xpPct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5">
              <div className="h-full rounded-full" style={{ width: `${xpPct}%`, backgroundColor: color }} />
            </div>
          </div>

          {/* 탑 스탯 */}
          {topStats.length > 0 && (
            <div className="mt-4 flex gap-3">
              {topStats.map((s) => (
                <div key={s.key} className="flex-1 rounded-lg bg-white/[0.04] p-2.5 text-center">
                  <p className="text-[9px] tracking-wide" style={{ color: STAT_COLOR[s.key] }}>
                    {STAT_LABEL[s.key]}
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold" style={{ color: STAT_COLOR[s.key] }}>
                    {s.val}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 워터마크 */}
          <p className="mt-4 text-right font-mono text-[9px] tracking-widest text-[--color-text-faint]">
            lvup.world
          </p>
        </div>

        {/* 공유 버튼 */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleNativeShare}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
            style={{ backgroundColor: color }}
          >
            공유하기
          </button>
          <button
            onClick={handleCopy}
            className="rounded-xl border border-[--color-border] px-4 py-3 text-sm text-[--color-text-muted] transition hover:border-[--color-text-faint]"
          >
            {copied ? "복사됨 ✓" : "텍스트 복사"}
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-[--color-text-faint]">
          스크린샷으로 저장하면 카드 이미지로 공유할 수 있습니다
        </p>
      </div>
    </div>
  );
}
