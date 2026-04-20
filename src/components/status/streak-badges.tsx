const MILESTONES = [
  { days: 3, label: "3일", icon: "🌱", color: "#22c55e" },
  { days: 7, label: "7일", icon: "🔥", color: "#f97316" },
  { days: 14, label: "14일", icon: "⚡", color: "#6366f1" },
  { days: 30, label: "30일", icon: "💎", color: "#a855f7" },
  { days: 60, label: "60일", icon: "👑", color: "#f59e0b" },
  { days: 100, label: "100일", icon: "🌟", color: "#ec4899" },
];

export function StreakBadges({ streakDays }: { streakDays: number }) {
  const reached = MILESTONES.filter((m) => streakDays >= m.days);
  const next = MILESTONES.find((m) => streakDays < m.days);

  if (reached.length === 0 && !next) return null;

  return (
    <section className="system-frame p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="system-text">STREAK BADGES</span>
        {next && (
          <span className="text-[10px] text-[--color-text-faint]">
            다음: {next.label} ({next.days - streakDays}일 남음)
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {MILESTONES.map((m) => {
          const unlocked = streakDays >= m.days;
          return (
            <div
              key={m.days}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all"
              style={
                unlocked
                  ? { borderColor: `${m.color}60`, backgroundColor: `${m.color}10` }
                  : { borderColor: "var(--color-border)", opacity: 0.35 }
              }
            >
              <span className={unlocked ? "" : "grayscale"}>{m.icon}</span>
              <span
                className="font-mono text-xs font-medium"
                style={{ color: unlocked ? m.color : "var(--color-text-faint)" }}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>

      {streakDays === 0 && (
        <p className="mt-3 text-[11px] text-[--color-text-faint]">
          오늘 첫 퀘스트를 완료하면 스트릭이 시작됩니다
        </p>
      )}
    </section>
  );
}
