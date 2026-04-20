"use client";

import { useEffect, useState } from "react";

const CLASS_COLOR: Record<string, string> = {
  builder: "#6366f1", creator: "#a855f7", leader: "#f59e0b",
  explorer: "#22c55e", supporter: "#3b82f6",
};

const STAT_LABEL: Record<string, string> = {
  vitality: "체력", focus: "집중력", execution: "실행력",
  knowledge: "지식력", relationship: "관계력", influence: "전파력",
};

type DiagnosisData = {
  ready: boolean;
  diagnosedClass: string;
  diagnosedLabel: string;
  diagnosedDesc: string;
  currentClass: string | null;
  currentLabel: string | null;
  topStats: string[];
  totalQuests: number;
};

const STORAGE_KEY = "lvup_diagnosis_dismissed";

export function ClassDiagnosisTrigger({ currentClass }: { currentClass: string | null }) {
  const [data, setData] = useState<DiagnosisData | null>(null);
  const [dismissed, setDismissed] = useState(true); // 기본 숨김

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = localStorage.getItem(STORAGE_KEY);
    if (prev) return; // 이미 처리됨

    fetch("/api/diagnosis/class")
      .then((r) => r.json() as Promise<DiagnosisData | { ready: false }>)
      .then((d) => {
        if (!d.ready) return;
        const full = d as DiagnosisData;
        // 이미 같은 클래스면 조용히 무시
        if (full.diagnosedClass === full.currentClass) {
          localStorage.setItem(STORAGE_KEY, "same");
          return;
        }
        setData(full);
        setDismissed(false);
      })
      .catch(() => {});
  }, []);

  function dismiss(action: "change" | "keep" | "later") {
    if (action !== "later") {
      localStorage.setItem(STORAGE_KEY, action);
    }
    setDismissed(true);
    if (action === "change" && data) {
      fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classCode: data.diagnosedClass }),
      }).catch(() => {});
    }
  }

  if (dismissed || !data) return null;

  const diagColor = CLASS_COLOR[data.diagnosedClass] ?? "#6366f1";
  const isSameClass = data.diagnosedClass === currentClass;

  if (isSameClass) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70" onClick={() => dismiss("later")} />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-[--color-border] bg-[--color-bg] p-6 sm:rounded-2xl">
        {/* 헤더 */}
        <div className="mb-1 text-center">
          <p className="font-mono text-[10px] tracking-[0.2em] text-[--color-text-faint]">
            7일 진단 · CLASS DIAGNOSIS
          </p>
          <h2 className="mt-2 text-lg font-bold">지난 7일간 너를 봤어</h2>
        </div>

        {/* 관찰 데이터 */}
        <div className="mt-5 rounded-xl border border-[--color-border] bg-[--color-surface] p-4">
          <p className="text-[11px] text-[--color-text-faint] mb-2">네가 가장 자주 키운 능력:</p>
          <div className="flex flex-wrap gap-2">
            {data.topStats.map((s) => (
              <span
                key={s}
                className="rounded-full border px-2.5 py-1 text-xs font-medium"
                style={{ borderColor: `${diagColor}50`, color: diagColor, backgroundColor: `${diagColor}10` }}
              >
                {STAT_LABEL[s] ?? s}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-[--color-text-faint]">
            {data.totalQuests}개 퀘스트 기록 분석 완료
          </p>
        </div>

        {/* 진단 결과 */}
        <div
          className="mt-4 rounded-xl border p-4"
          style={{ borderColor: `${diagColor}40`, backgroundColor: `${diagColor}08` }}
        >
          <p className="text-[11px] tracking-[0.15em]" style={{ color: diagColor }}>
            DIAGNOSIS
          </p>
          <p className="mt-1 text-base font-bold" style={{ color: diagColor }}>
            이건 {data.diagnosedLabel}의 패턴이야
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[--color-text-muted]">
            {data.diagnosedDesc}
          </p>
        </div>

        {/* 현재 클래스 */}
        {data.currentLabel && (
          <p className="mt-3 text-center text-xs text-[--color-text-faint]">
            가입 시 선택한 클래스: <span className="text-[--color-text-muted]">{data.currentLabel}</span>
          </p>
        )}

        {/* 선택지 */}
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={() => dismiss("change")}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
            style={{ backgroundColor: diagColor }}
          >
            {data.diagnosedLabel}로 바꿀게
          </button>
          <button
            onClick={() => dismiss("keep")}
            className="w-full rounded-xl border border-[--color-border] py-3 text-sm text-[--color-text-muted] transition hover:border-[--color-text-faint]"
          >
            {data.currentLabel} 유지할게
          </button>
          <button
            onClick={() => dismiss("later")}
            className="py-2 text-xs text-[--color-text-faint] hover:text-[--color-text-muted]"
          >
            아직 더 탐색할게
          </button>
        </div>
      </div>
    </div>
  );
}
