"use client";

import { useEffect, useState } from "react";

const STAT_COLOR: Record<string, string> = {
  vitality: "var(--color-vitality)",
  focus: "var(--color-focus)",
  execution: "var(--color-execution)",
  knowledge: "var(--color-knowledge)",
  relationship: "var(--color-relationship)",
  influence: "var(--color-influence)",
};

const STAT_LABEL: Record<string, string> = {
  vitality: "체력", focus: "집중력", execution: "실행력",
  knowledge: "지식력", relationship: "관계력", influence: "전파력",
};

type WeeklyReport = {
  thisWeek: {
    xp: number;
    quests: number;
    activeDays: number;
    statBreakdown: Record<string, number>;
  };
  lastWeek: { xp: number; quests: number };
  topStat: { key: string; label: string; delta: number } | null;
  streakDays: number;
  diagnosisMessage: string;
};

function Diff({ a, b }: { a: number; b: number }) {
  const diff = a - b;
  if (diff === 0) return <span className="text-[--color-text-faint] text-xs">±0</span>;
  return (
    <span className={`text-xs font-mono ${diff > 0 ? "text-emerald-400" : "text-red-400"}`}>
      {diff > 0 ? "+" : ""}{diff}
    </span>
  );
}

export function WeeklyReportModal({ onClose }: { onClose: () => void }) {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/report/weekly")
      .then((r) => r.json() as Promise<WeeklyReport>)
      .then((d) => { setReport(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-[--color-border] bg-[--color-bg] sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[--color-border] px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold">7일 진단 리포트</h2>
            <p className="mt-0.5 text-[10px] text-[--color-text-faint] tracking-wider">WEEKLY DIAGNOSIS</p>
          </div>
          <button onClick={onClose} className="text-[--color-text-faint] hover:text-[--color-text-muted]">
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {loading ? (
            <p className="py-12 text-center text-sm text-[--color-text-faint]">분석 중...</p>
          ) : !report ? (
            <p className="py-12 text-center text-sm text-[--color-text-faint]">데이터를 불러올 수 없습니다</p>
          ) : (
            <div className="flex flex-col gap-5">
              {/* 진단 메시지 */}
              <div className="rounded-xl border border-[--color-accent]/20 bg-[--color-accent]/5 px-5 py-4">
                <p className="text-[10px] tracking-[0.15em] text-[--color-accent] mb-2">DIAGNOSIS</p>
                <p className="text-sm leading-relaxed text-[--color-text-muted]">
                  &ldquo;{report.diagnosisMessage}&rdquo;
                </p>
              </div>

              {/* 이번 주 vs 지난 주 */}
              <div>
                <p className="mb-3 text-[10px] tracking-[0.2em] text-[--color-text-faint]">THIS WEEK</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-3 text-center">
                    <p className="text-[10px] text-[--color-text-faint] mb-1">XP</p>
                    <p className="font-mono text-xl font-bold text-[--color-accent]">{report.thisWeek.xp}</p>
                    <div className="mt-1"><Diff a={report.thisWeek.xp} b={report.lastWeek.xp} /></div>
                  </div>
                  <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-3 text-center">
                    <p className="text-[10px] text-[--color-text-faint] mb-1">퀘스트</p>
                    <p className="font-mono text-xl font-bold">{report.thisWeek.quests}</p>
                    <div className="mt-1"><Diff a={report.thisWeek.quests} b={report.lastWeek.quests} /></div>
                  </div>
                  <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-3 text-center">
                    <p className="text-[10px] text-[--color-text-faint] mb-1">활동일</p>
                    <p className="font-mono text-xl font-bold">{report.thisWeek.activeDays}</p>
                    <p className="mt-1 text-[10px] text-[--color-text-faint]">/ 7일</p>
                  </div>
                </div>
              </div>

              {/* 스트릭 */}
              {report.streakDays > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-[--color-border] bg-[--color-surface] px-4 py-3">
                  <span className="text-xl">🔥</span>
                  <div>
                    <p className="text-sm font-medium">{report.streakDays}일 연속 수행 중</p>
                    <p className="text-xs text-[--color-text-faint]">끊기지 않은 불꽃</p>
                  </div>
                </div>
              )}

              {/* 가장 많이 오른 스탯 */}
              {report.topStat && (
                <div>
                  <p className="mb-3 text-[10px] tracking-[0.2em] text-[--color-text-faint]">TOP STAT THIS WEEK</p>
                  <div
                    className="flex items-center justify-between rounded-xl border px-4 py-3"
                    style={{
                      borderColor: `${STAT_COLOR[report.topStat.key]}30`,
                      background: `${STAT_COLOR[report.topStat.key]}08`,
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: STAT_COLOR[report.topStat.key] }}>
                      {report.topStat.label}
                    </span>
                    <span className="font-mono text-lg font-bold" style={{ color: STAT_COLOR[report.topStat.key] }}>
                      +{report.topStat.delta}
                    </span>
                  </div>
                </div>
              )}

              {/* 스탯 전체 */}
              <div>
                <p className="mb-3 text-[10px] tracking-[0.2em] text-[--color-text-faint]">STAT GROWTH</p>
                <div className="flex flex-col gap-2">
                  {Object.entries(report.thisWeek.statBreakdown)
                    .filter(([, v]) => v > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([key, val]) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-16 text-xs text-[--color-text-faint]">{STAT_LABEL[key] ?? key}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-[--color-surface]">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (val / (report.topStat?.delta ?? 1)) * 100)}%`,
                              backgroundColor: STAT_COLOR[key] ?? "var(--color-accent)",
                            }}
                          />
                        </div>
                        <span
                          className="w-8 text-right font-mono text-xs"
                          style={{ color: STAT_COLOR[key] ?? "var(--color-text)" }}
                        >
                          +{val}
                        </span>
                      </div>
                    ))}
                  {Object.values(report.thisWeek.statBreakdown).every((v) => v === 0) && (
                    <p className="text-xs text-[--color-text-faint]">이번 주 스탯 변화 없음</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
