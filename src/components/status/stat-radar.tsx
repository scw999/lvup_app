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

const CX = 150;
const CY = 150;
const R = 105;

// 눈금 단계: 15, 30, 45, 60
const GRID_STEPS = [
  { scale: 0.25, label: "15" },
  { scale: 0.5, label: "30" },
  { scale: 0.75, label: "45" },
  { scale: 1, label: "60" },
];

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
  const maxVal = 60;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 300" className="h-72 w-72">
        {/* 배경 채우기 — 최외곽 영역 */}
        <polygon
          points={makeGridPolygon(1)}
          fill="rgba(255,255,255,0.02)"
          stroke="none"
        />

        {/* 그리드 ��금선 — 잘 보이도록 */}
        {GRID_STEPS.map(({ scale }) => (
          <polygon
            key={scale}
            points={makeGridPolygon(scale)}
            fill="none"
            stroke={scale === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}
            strokeWidth={scale === 1 ? "1.5" : "0.8"}
            strokeDasharray={scale === 1 ? "none" : "3 3"}
          />
        ))}

        {/* 축 라인 */}
        {STATS.map((_, i) => {
          const angle = (360 / 6) * i;
          const [x, y] = polarToXY(angle, R);
          return (
            <line
              key={i}
              x1={CX} y1={CY} x2={x} y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.8"
            />
          );
        })}

        {/* 눈금 값 (우측 축에 표시) */}
        {GRID_STEPS.map(({ scale, label }) => {
          const [x, y] = polarToXY(0, R * scale); // 0도 = 우측
          return (
            <text
              key={label}
              x={x + 8} y={y + 1}
              fill="rgba(255,255,255,0.25)"
              fontSize="8"
              fontFamily="var(--font-mono)"
            >
              {label}
            </text>
          );
        })}

        {/* 데이터 영역 — 채우기 + 테두리 */}
        <polygon
          points={makePolygon(values, maxVal)}
          fill="var(--color-accent)"
          fillOpacity="0.15"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#area-glow)"
        />

        {/* 데이터 점 */}
        {values.map((v, i) => {
          const angle = (360 / 6) * i;
          const r = (Math.min(v, maxVal) / maxVal) * R;
          const [x, y] = polarToXY(angle, r);
          return (
            <circle
              key={i}
              cx={x} cy={y} r="4.5"
              fill={STATS[i].color}
              stroke="var(--color-bg)"
              strokeWidth="1.5"
              filter="url(#dot-glow)"
            />
          );
        })}

        {/* 스탯 라벨 (외곽) */}
        {STATS.map((s, i) => {
          const angle = (360 / 6) * i;
          const [x, y] = polarToXY(angle, R + 24);
          return (
            <text
              key={s.key}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={s.color}
              fontSize="11"
              fontWeight="500"
              fontFamily="var(--font-sans)"
            >
              {s.label}
            </text>
          );
        })}

        {/* 수치 라벨 (점 옆) */}
        {values.map((v, i) => {
          const angle = (360 / 6) * i;
          const r = (Math.min(v, maxVal) / maxVal) * R;
          const labelR = Math.max(r - 16, 12);
          const [x, y] = polarToXY(angle, labelR);
          return (
            <text
              key={`v-${i}`}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-text)"
              fontSize="13"
              fontWeight="bold"
              fontFamily="var(--font-mono)"
            >
              {v}
            </text>
          );
        })}

        <defs>
          <filter id="dot-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="area-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
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
