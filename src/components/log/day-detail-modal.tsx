"use client";

// LV UP — 일별 성장 상세 모달

const STAT_LABELS: [string, string][] = [
  ["vitalityDelta", "체력"],
  ["focusDelta", "집중력"],
  ["executionDelta", "실행력"],
  ["knowledgeDelta", "지식력"],
  ["relationshipDelta", "관계력"],
  ["influenceDelta", "전파력"],
];

type LogEntry = {
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

export function DayDetailModal({
  date,
  log,
  onClose,
}: {
  date: string;
  log: LogEntry | null;
  onClose: () => void;
}) {
  const d = new Date(date + "T00:00:00");
  const formatted = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-[--color-border] bg-[--color-bg] p-6 sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{formatted}</h2>
          <button
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

        {!log ? (
          <p className="py-8 text-center text-sm text-[--color-text-faint]">
            이 날은 아직 모험이 없었다
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* 요약 */}
            <div className="flex gap-4">
              <div className="flex-1 rounded-lg bg-[--color-surface] p-3 text-center">
                <p className="text-[10px] text-[--color-text-faint]">퀘스트</p>
                <p className="font-mono text-lg font-bold">
                  {log.questsCompleted}
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-[--color-surface] p-3 text-center">
                <p className="text-[10px] text-[--color-text-faint]">XP</p>
                <p className="font-mono text-lg font-bold text-[--color-accent]">
                  +{log.xpEarned}
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-[--color-surface] p-3 text-center">
                <p className="text-[10px] text-[--color-text-faint]">레벨</p>
                <p className="font-mono text-lg font-bold">{log.levelAtEnd}</p>
              </div>
            </div>

            {/* 스탯 변화 */}
            <div>
              <p className="mb-2 text-[10px] tracking-[0.2em] text-[--color-text-faint]">
                STAT CHANGES
              </p>
              <div className="grid grid-cols-3 gap-2">
                {STAT_LABELS.map(([key, label]) => {
                  const val = log[key as keyof LogEntry] as number;
                  if (val === 0) return null;
                  return (
                    <div
                      key={key}
                      className="rounded-lg bg-[--color-surface] px-3 py-2 text-center"
                    >
                      <p className="text-[10px] text-[--color-text-faint]">
                        {label}
                      </p>
                      <p className="font-mono text-sm font-bold text-emerald-400">
                        +{val}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {log.summaryText && (
              <p className="text-sm text-[--color-text-muted]">
                {log.summaryText}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
