"use client";

// LV UP — GitHub 잔디 스타일 캘린더 히트맵 (자체 구현)
// PRD 16.2 화면 6

type HeatmapDay = {
  date: string;
  xpEarned: number;
  questsCompleted: number;
};

const WEEKDAY_LABELS = ["", "월", "", "수", "", "금", ""];

function getIntensity(xp: number): number {
  if (xp === 0) return 0;
  if (xp <= 10) return 1;
  if (xp <= 25) return 2;
  if (xp <= 50) return 3;
  return 4;
}

const INTENSITY_COLORS = [
  "bg-[--color-surface-alt]", // 0 — no activity
  "bg-[--color-accent]/20",   // 1
  "bg-[--color-accent]/40",   // 2
  "bg-[--color-accent]/70",   // 3
  "bg-[--color-accent]",      // 4
];

export function Heatmap({
  days,
  onDayClick,
}: {
  days: HeatmapDay[];
  onDayClick: (date: string) => void;
}) {
  // Build 12-week grid (84 days)
  const today = new Date();
  const dayMap = new Map(days.map((d) => [d.date, d]));

  // Build grid: 7 rows (Sun..Sat) × N columns (weeks)
  const weeks: { date: string; xp: number }[][] = [];

  // Start from 12 weeks ago, aligned to Sunday
  const start = new Date(today);
  start.setDate(start.getDate() - 83); // 12 weeks = 84 days
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay());

  let current = new Date(start);
  let currentWeek: { date: string; xp: number }[] = [];

  while (current <= today) {
    const dateStr = current.toISOString().slice(0, 10);
    const entry = dayMap.get(dateStr);
    currentWeek.push({ date: dateStr, xp: entry?.xpEarned ?? 0 });

    if (current.getDay() === 6) {
      // Saturday — end of week
      weeks.push(currentWeek);
      currentWeek = [];
    }

    current = new Date(current);
    current.setDate(current.getDate() + 1);
  }
  // Push partial last week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]">
        {/* Weekday labels */}
        <div className="flex flex-col gap-[3px] pr-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="flex h-[13px] w-[13px] items-center justify-center text-[8px] text-[--color-text-faint]"
            >
              {label}
            </div>
          ))}
        </div>
        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => {
              const intensity = getIntensity(day.xp);
              const isFuture = day.date > today.toISOString().slice(0, 10);
              return (
                <button
                  key={day.date}
                  onClick={() => !isFuture && onDayClick(day.date)}
                  title={`${day.date}: ${day.xp} XP`}
                  disabled={isFuture}
                  className={`h-[13px] w-[13px] rounded-sm transition-colors ${
                    isFuture
                      ? "bg-transparent"
                      : INTENSITY_COLORS[intensity]
                  } ${!isFuture && intensity > 0 ? "hover:ring-1 hover:ring-[--color-accent]" : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="mt-2 flex items-center justify-end gap-1">
        <span className="mr-1 text-[8px] text-[--color-text-faint]">적음</span>
        {INTENSITY_COLORS.map((cls, i) => (
          <div key={i} className={`h-[10px] w-[10px] rounded-sm ${cls}`} />
        ))}
        <span className="ml-1 text-[8px] text-[--color-text-faint]">많음</span>
      </div>
    </div>
  );
}
