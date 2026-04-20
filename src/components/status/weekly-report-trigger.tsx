"use client";

import { useState } from "react";
import { WeeklyReportModal } from "@/components/report/weekly-report-modal";

export function WeeklyReportTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full system-frame p-4 flex items-center justify-between hover:bg-[--color-surface] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📊</span>
          <div className="text-left">
            <p className="text-sm font-medium">7일 진단 리포트</p>
            <p className="text-[11px] text-[--color-text-faint] mt-0.5">WEEKLY DIAGNOSIS</p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-[--color-text-faint]">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </button>

      {open && <WeeklyReportModal onClose={() => setOpen(false)} />}
    </>
  );
}
