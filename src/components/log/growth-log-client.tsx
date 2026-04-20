"use client";

import { useEffect, useState } from "react";
import { Heatmap } from "./heatmap";
import { DayDetailModal } from "./day-detail-modal";

type HeatmapDay = {
  date: string;
  xpEarned: number;
  questsCompleted: number;
};

type LogEntry = {
  id: string;
  date: string;
  questsCompleted: number;
  xpEarned: number;
  vitalityDelta: number;
  focusDelta: number;
  executionDelta: number;
  knowledgeDelta: number;
  relationshipDelta: number;
  influenceDelta: number;
  levelAtEnd: number;
  summaryText: string | null;
};

export function GrowthLogClient({ emptyMessage }: { emptyMessage: string }) {
  const [heatmapDays, setHeatmapDays] = useState<HeatmapDay[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/log/heatmap?weeks=12").then((r) => r.json()),
      fetch("/api/log?days=30").then((r) => r.json()),
    ]).then(([heatmap, logData]) => {
      setHeatmapDays(
        (heatmap as { days: HeatmapDay[] }).days,
      );
      setLogs((logData as { logs: LogEntry[] }).logs);
      setLoading(false);
    });
  }, []);

  // 주간 요약
  const thisWeekXp = logs
    .filter((l) => {
      const d = new Date(l.date);
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    })
    .reduce((sum, l) => sum + l.xpEarned, 0);

  const thisWeekQuests = logs
    .filter((l) => {
      const d = new Date(l.date);
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    })
    .reduce((sum, l) => sum + l.questsCompleted, 0);

  const selectedLog = selectedDate
    ? logs.find((l) => l.date === selectedDate) ?? null
    : null;

  if (loading) {
    return (
      <main className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold tracking-wider">성장 로그</h1>
        <div className="py-16 text-center text-sm text-[--color-text-faint]">
          로딩 중...
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-wider">성장 로그</h1>

      {/* 주간 요약 카드 */}
      <section className="flex gap-3">
        <div className="flex-1 rounded-xl border border-[--color-border] bg-[--color-surface] p-4 text-center">
          <p className="text-[10px] tracking-wider text-[--color-text-faint]">
            이번 주 XP
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-[--color-accent]">
            {thisWeekXp}
          </p>
        </div>
        <div className="flex-1 rounded-xl border border-[--color-border] bg-[--color-surface] p-4 text-center">
          <p className="text-[10px] tracking-wider text-[--color-text-faint]">
            이번 주 퀘스트
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-[--color-text]">
            {thisWeekQuests}
          </p>
        </div>
      </section>

      {/* 히트맵 */}
      <section>
        <p className="mb-3 text-[10px] tracking-[0.2em] text-[--color-text-faint]">
          ACTIVITY
        </p>
        <Heatmap days={heatmapDays} onDayClick={setSelectedDate} />
      </section>

      {/* 최근 로그 리스트 */}
      <section>
        <p className="mb-3 text-[10px] tracking-[0.2em] text-[--color-text-faint]">
          RECENT
        </p>
        {logs.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm leading-relaxed text-[--color-text-muted]">
            {emptyMessage}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {logs.slice(0, 14).map((log) => (
              <li key={log.id}>
                <button
                  onClick={() => setSelectedDate(log.date)}
                  className="flex w-full items-center justify-between rounded-lg border border-[--color-border] bg-[--color-surface] px-4 py-3 text-left transition-colors hover:border-[--color-accent]/30"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[--color-text-muted]">
                        {formatDate(log.date)}
                      </span>
                      <span className="text-xs text-[--color-text-faint]">
                        Lv.{log.levelAtEnd}
                      </span>
                    </div>
                    <StatDots log={log} />
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[--color-text-faint]">
                      {log.questsCompleted}건
                    </span>
                    <span className="font-mono text-xs text-[--color-accent]">
                      +{log.xpEarned} XP
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 일별 상세 모달 */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          log={selectedLog}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </main>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const STAT_COLORS: Record<string, string> = {
  vitalityDelta: "#f97316",
  focusDelta: "#0891b2",
  executionDelta: "#6366f1",
  knowledgeDelta: "#a855f7",
  relationshipDelta: "#84cc16",
  influenceDelta: "#eab308",
};
const STAT_SHORT: Record<string, string> = {
  vitalityDelta: "VIT", focusDelta: "FOC", executionDelta: "EXE",
  knowledgeDelta: "KNO", relationshipDelta: "REL", influenceDelta: "INF",
};

function StatDots({ log }: { log: LogEntry }) {
  const keys = ["vitalityDelta","focusDelta","executionDelta","knowledgeDelta","relationshipDelta","influenceDelta"] as const;
  const active = keys.filter((k) => (log[k as keyof LogEntry] as number) > 0);
  if (active.length === 0) return null;
  return (
    <div className="flex items-center gap-1">
      {active.map((k) => (
        <span
          key={k}
          className="rounded px-1 py-0.5 font-mono text-[9px] font-bold"
          style={{ backgroundColor: `${STAT_COLORS[k]}20`, color: STAT_COLORS[k] }}
          title={`${STAT_SHORT[k]} +${log[k as keyof LogEntry]}`}
        >
          {STAT_SHORT[k]}
        </span>
      ))}
    </div>
  );
}
