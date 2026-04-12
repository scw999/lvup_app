"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// LV UP — 하단 네비게이션 (PRD 16.1)
// 탭 3개: 상태창 / 퀘스트 / 로그
// Phase 2 추가 예정: 길드, 인벤토리

const NAV_ITEMS = [
  { href: "/status", label: "상태창", icon: StatusIcon },
  { href: "/quests", label: "퀘스트", icon: QuestIcon },
  { href: "/log", label: "로그", icon: LogIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[--color-border] bg-[--color-bg]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center gap-1 py-3 text-[10px] tracking-wider transition-colors ${
                active
                  ? "text-[--color-accent]"
                  : "text-[--color-text-faint] hover:text-[--color-text-muted]"
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-[--color-accent]" style={{ boxShadow: "0 0 8px var(--color-accent-glow)" }} />
              )}
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Minimal SVG icons — no external dependency

function StatusIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M7 10h6M10 7v6" />
    </svg>
  );
}

function QuestIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5h12M4 10h8M4 15h10" />
    </svg>
  );
}

function LogIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M3 8h14M8 3v14" />
    </svg>
  );
}
