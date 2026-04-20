"use client";

import { useState } from "react";
import { ShareCardModal } from "./share-card-modal";

type Props = {
  nickname: string;
  classCode: string | null;
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  streakDays: number;
  stats: Record<string, number> | null;
};

export function ShareTrigger(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-[--color-border] px-3 py-1.5 text-[11px] text-[--color-text-faint] transition hover:border-[--color-text-faint] hover:text-[--color-text-muted]"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="2" r="1.5"/>
          <circle cx="9" cy="10" r="1.5"/>
          <circle cx="2" cy="6" r="1.5"/>
          <path d="M3.5 5.1L7.5 3M3.5 6.9L7.5 9"/>
        </svg>
        공유
      </button>

      {open && <ShareCardModal {...props} onClose={() => setOpen(false)} />}
    </>
  );
}
