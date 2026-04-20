"use client";

import { useEffect, useState } from "react";

const STAT_LABELS: [string, string][] = [
  ["vitalityDelta", "체력"],
  ["focusDelta", "집중력"],
  ["executionDelta", "실행력"],
  ["knowledgeDelta", "지식력"],
  ["relationshipDelta", "관계력"],
  ["influenceDelta", "전파력"],
];

const STAT_COLOR: Record<string, string> = {
  vitality: "var(--color-vitality)",
  focus: "var(--color-focus)",
  execution: "var(--color-execution)",
  knowledge: "var(--color-knowledge)",
  relationship: "var(--color-relationship)",
  influence: "var(--color-influence)",
};

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

type VerificationEntry = {
  id: string;
  questTitle: string;
  questMainStatType: string;
  note: string | null;
  representativeImageUrl: string | null;
  linkUrl: string | null;
  xpTotalEarned: number;
  xpBaseEarned: number;
  xpEvidenceEarned: number;
  narrativeMessage: string | null;
  createdAt: string;
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
  const [verifs, setVerifs] = useState<VerificationEntry[]>([]);
  const [loadingVerifs, setLoadingVerifs] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const d = new Date(date + "T00:00:00");
  const formatted = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

  useEffect(() => {
    fetch(`/api/log/verifications?date=${date}`)
      .then((r) => r.json() as Promise<{ verifications: VerificationEntry[] }>)
      .then((data) => {
        setVerifs(data.verifications ?? []);
        setLoadingVerifs(false);
      })
      .catch(() => setLoadingVerifs(false));
  }, [date]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative z-10 flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-[--color-border] bg-[--color-bg] sm:rounded-2xl">
          {/* 헤더 */}
          <div className="flex shrink-0 items-center justify-between border-b border-[--color-border] px-6 py-4">
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

          <div className="overflow-y-auto p-6">
            {!log ? (
              <p className="py-8 text-center text-sm text-[--color-text-faint]">
                이 날은 아직 모험이 없었다
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                {/* 요약 */}
                <div className="flex gap-3">
                  <div className="flex-1 rounded-lg bg-[--color-surface] p-3 text-center">
                    <p className="text-[10px] text-[--color-text-faint]">퀘스트</p>
                    <p className="font-mono text-lg font-bold">{log.questsCompleted}</p>
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
                {STAT_LABELS.some(([key]) => (log[key as keyof LogEntry] as number) > 0) && (
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
                            <p className="text-[10px] text-[--color-text-faint]">{label}</p>
                            <p className="font-mono text-sm font-bold text-emerald-400">+{val}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 인증 갤러리 */}
                <div>
                  <p className="mb-3 text-[10px] tracking-[0.2em] text-[--color-text-faint]">
                    VERIFICATIONS
                  </p>
                  {loadingVerifs ? (
                    <p className="text-xs text-[--color-text-faint]">불러오는 중...</p>
                  ) : verifs.length === 0 ? (
                    <p className="text-xs text-[--color-text-faint]">인증 기록 없음</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {verifs.map((v) => (
                        <div
                          key={v.id}
                          className="overflow-hidden rounded-xl border border-[--color-border] bg-[--color-surface]"
                        >
                          {/* 퀘스트 타이틀 */}
                          <div className="flex items-center justify-between px-4 py-2.5">
                            <span
                              className="max-w-[75%] truncate text-xs font-medium"
                              style={{ color: STAT_COLOR[v.questMainStatType] ?? "var(--color-text)" }}
                            >
                              {v.questTitle}
                            </span>
                            <span className="font-mono text-[10px] text-[--color-xp]">
                              +{v.xpTotalEarned} XP
                            </span>
                          </div>

                          {/* 인증 이미지 */}
                          {v.representativeImageUrl && (
                            <button
                              type="button"
                              onClick={() => setExpandedImage(v.representativeImageUrl!)}
                              className="block w-full"
                            >
                              <img
                                src={v.representativeImageUrl}
                                alt="인증 사진"
                                className="h-48 w-full object-cover"
                              />
                            </button>
                          )}

                          {/* 메모 / 링크 */}
                          {(v.note || v.linkUrl) && (
                            <div className="px-4 py-3">
                              {v.note && (
                                <p className="text-xs leading-relaxed text-[--color-text-muted]">
                                  {v.note}
                                </p>
                              )}
                              {v.linkUrl && (
                                <a
                                  href={v.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1.5 block truncate text-[11px] text-[--color-accent] hover:underline"
                                >
                                  {v.linkUrl}
                                </a>
                              )}
                            </div>
                          )}

                          {/* 서사 메시지 */}
                          {v.narrativeMessage && (
                            <div className="border-t border-[--color-border]/50 px-4 py-2.5">
                              <p className="text-[11px] italic leading-relaxed text-[--color-text-faint]">
                                &ldquo;{v.narrativeMessage}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {log.summaryText && (
                  <p className="text-sm text-[--color-text-muted]">{log.summaryText}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 이미지 확대 오버레이 */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          onClick={() => setExpandedImage(null)}
        >
          <img
            src={expandedImage}
            alt="인증 사진 확대"
            className="max-h-[90dvh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
}
