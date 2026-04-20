"use client";

import { useState } from "react";
import Link from "next/link";

const CLASS_LABEL: Record<string, string> = {
  builder: "제작자", creator: "창작자", leader: "주도자",
  explorer: "탐구자", supporter: "조율자",
};

const CLASS_COLOR: Record<string, string> = {
  builder: "#6366f1", creator: "#a855f7", leader: "#f59e0b",
  explorer: "#22c55e", supporter: "#3b82f6",
};

const STAT_COLOR: Record<string, string> = {
  vitality: "var(--color-vitality)", focus: "var(--color-focus)",
  execution: "var(--color-execution)", knowledge: "var(--color-knowledge)",
  relationship: "var(--color-relationship)", influence: "var(--color-influence)",
};

const STAT_LABEL: Record<string, string> = {
  vitality: "체력", focus: "집중력", execution: "실행력",
  knowledge: "지식력", relationship: "관계력", influence: "전파력",
};

export type FeedItem = {
  id: string;
  userId: string;
  note: string | null;
  representativeImageUrl: string | null;
  linkUrl: string | null;
  xpTotalEarned: number;
  narrativeMessage: string | null;
  createdAt: string;
  questTitle: string;
  questMainStatType: string;
  nickname: string;
  classCode: string | null;
  level: number;
  verdictCount: number;
  myVerdict: boolean;
};

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}일 전`;
  return new Date(isoStr).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export function VerificationCard({
  item,
  isLoggedIn,
}: {
  item: FeedItem;
  isLoggedIn: boolean;
}) {
  const [count, setCount] = useState(item.verdictCount);
  const [active, setActive] = useState(item.myVerdict);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const color = item.classCode ? (CLASS_COLOR[item.classCode] ?? "#6366f1") : "#6366f1";
  const initial = item.nickname.charAt(0).toUpperCase();

  async function handleVerdict() {
    if (!isLoggedIn || loading) return;
    setLoading(true);
    const prev = active;
    setActive(!prev);
    setCount((c) => (prev ? c - 1 : c + 1));
    try {
      const res = await fetch("/api/verdicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId: item.id }),
      });
      if (!res.ok) {
        setActive(prev);
        setCount((c) => (prev ? c + 1 : c - 1));
      }
    } catch {
      setActive(prev);
      setCount((c) => (prev ? c + 1 : c - 1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[--color-border] bg-[--color-surface]">
      {/* 헤더: 유저 정보 */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* 아바타 → 프로필 링크 */}
        <Link href={`/profile/${item.userId}`} className="shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {initial}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${item.userId}`} className="text-sm font-medium truncate hover:underline underline-offset-2">
              {item.nickname}
            </Link>
            <span
              className="shrink-0 rounded-full border px-1.5 py-px text-[10px] tracking-wider"
              style={{ borderColor: `${color}50`, color }}
            >
              {item.classCode ? (CLASS_LABEL[item.classCode] ?? item.classCode) : "—"}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-[--color-text-faint]">
              Lv.{item.level}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="text-[11px]"
              style={{ color: STAT_COLOR[item.questMainStatType] ?? "var(--color-text-faint)" }}
            >
              {STAT_LABEL[item.questMainStatType] ?? item.questMainStatType}
            </span>
            <span className="text-[10px] text-[--color-text-faint]">·</span>
            <span className="text-[11px] text-[--color-text-faint] truncate">
              {item.questTitle}
            </span>
          </div>
        </div>
        <span className="shrink-0 text-[10px] text-[--color-text-faint]">
          {timeAgo(item.createdAt)}
        </span>
      </div>

      {/* 인증 이미지 */}
      {item.representativeImageUrl && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="block w-full"
        >
          <img
            src={item.representativeImageUrl}
            alt="인증 사진"
            className="h-52 w-full object-cover"
          />
        </button>
      )}

      {/* 메모 */}
      {item.note && (
        <div className="px-4 pt-3">
          <p className="text-sm leading-relaxed text-[--color-text-muted]">{item.note}</p>
        </div>
      )}

      {/* 서사 메시지 */}
      {item.narrativeMessage && (
        <div className="px-4 pt-2">
          <p className="text-[12px] italic leading-relaxed text-[--color-text-faint]">
            &ldquo;{item.narrativeMessage}&rdquo;
          </p>
        </div>
      )}

      {/* 푸터: XP + 박수 */}
      <div className="flex items-center justify-between px-4 py-3 mt-1">
        <span className="font-mono text-xs text-[--color-xp]">+{item.xpTotalEarned} XP</span>
        <button
          onClick={handleVerdict}
          disabled={!isLoggedIn || loading}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all active:scale-95 ${
            active
              ? "border-[--color-accent]/50 bg-[--color-accent]/10 text-[--color-accent]"
              : "border-[--color-border] text-[--color-text-faint] hover:border-[--color-accent]/30 hover:text-[--color-text-muted]"
          } disabled:cursor-default`}
          title={isLoggedIn ? "박수 보내기" : "로그인 후 박수 가능"}
        >
          <span className="text-sm leading-none">{active ? "👏" : "🤝"}</span>
          <span className="font-mono">{count > 0 ? count : ""}</span>
          <span>{active ? "박수" : "인정"}</span>
        </button>
      </div>

      {/* 이미지 확대 */}
      {expanded && item.representativeImageUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setExpanded(false)}
        >
          <img
            src={item.representativeImageUrl}
            alt="인증 사진 확대"
            className="max-h-[90dvh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </article>
  );
}
