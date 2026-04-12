"use client";

// LV UP — 6스탯 레이더 차트 (SVG)
// RPG 캐릭터 시트 느낌의 육각형 능력치 시각화

import type { MainStatType } from "@/lib/db/schema";

const STATS: { key: MainStatType; label: string; color: string }[] = [
  { key: "vitality", label: "체력", color: "var(--color-vitality)" },
  { key: "focus", label: "집중", color: "var(--color-focus)" },
  { key: "execution", label: "실행", color: "var(--color-execution)" },
  { key: "knowledge", label: "지식", color: "var(--color-knowledge)" },
  { key: "relationship", label: "관계", color: "var(--color-relationship)" },
  { key: "influence", label: "전파", color: "var(--color-influence)" },
];

const CX = 120;
const CY = 120;
const R = 90; // max radius

function polarToXY(angle: number, radius: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function makePolygon(values: number[], maxVal: number): string {
  return values
    .map((v, i) => {
      const angle = (360 / 6) * i;
      const r = (Math.min(v, maxVal) / maxVal) * R;
      const [x, y] = polarToXY(angle, r);
      return `${x},${y}`;
    })
    .join(" ");
}

function makeGridPolygon(scale: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (360 / 6) * i;
    const [x, y] = polarToXY(angle, R * scale);
    return `${x},${y}`;
  }).join(" ");
}

export function StatRadar({
  stats,
}: {
  stats: Record<MainStatType, number>;
}) {
  const values = STATS.map((s) => stats[s.key]);
  const maxVal = 60; // visual max

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 240 240" className="h-52 w-52">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={makeGridPolygon(scale)}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="0.5"
            opacity={scale === 1 ? 0.4 : 0.2}
          />
        ))}

        {/* Axis lines */}
        {STATS.map((_, i) => {
          const angle = (360 / 6) * i;
          const [x, y] = polarToXY(angle, R);
          return (
            <line
              key={i}
              x1={CX} y1={CY} x2={x} y2={y}
              stroke="var(--color-border)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          );
        })}

        {/* Filled area */}
        <polygon
          points={makePolygon(values, maxVal)}
          fill="var(--color-accent)"
          fillOpacity="0.12"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Data points with glow */}
        {values.map((v, i) => {
          const angle = (360 / 6) * i;
          const r = (Math.min(v, maxVal) / maxVal) * R;
          const [x, y] = polarToXY(angle, r);
          return (
            <circle
              key={i}
              cx={x} cy={y} r="3"
              fill={STATS[i].color}
              filter="url(#glow)"
            />
          );
        })}

        {/* Labels */}
        {STATS.map((s, i) => {
          const angle = (360 / 6) * i;
          const [x, y] = polarToXY(angle, R + 18);
          return (
            <text
              key={s.key}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={s.color}
              fontSize="9"
              fontFamily="var(--font-sans)"
            >
              {s.label}
            </text>
          );
        })}

        {/* Value labels */}
        {values.map((v, i) => {
          const angle = (360 / 6) * i;
          const r = (Math.min(v, maxVal) / maxVal) * R;
          const labelR = Math.max(r + 12, 20);
          const [x, y] = polarToXY(angle, labelR);
          return (
            <text
              key={`v-${i}`}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-text)"
              fontSize="10"
              fontWeight="bold"
              fontFamily="var(--font-mono)"
            >
              {v}
            </text>
          );
        })}

        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
