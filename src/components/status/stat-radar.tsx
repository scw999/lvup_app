"use client";

// LV UP — 6스탯 레이더 차트 (SVG) v2
// RPG 상태창 — 스탯별 색상 구분 + 높은 가독성 + 몰입감

import type { MainStatType } from "@/lib/db/schema";

const STATS: { key: MainStatType; label: string; color: string }[] = [
  { key: "vitality", label: "체력", color: "var(--color-vitality)" },
  { key: "focus", label: "집중", color: "var(--color-focus)" },
  { key: "execution", label: "실행", color: "var(--color-execution)" },
  { key: "knowledge", label: "지식", color: "var(--color-knowledge)" },
  { key: "relationship", label: "관계", color: "var(--color-relationship)" },
  { key: "influence", label: "전파", color: "var(--color-influence)" },
];

// 각 스탯의 실제 hex 값 (SVG gradient에 CSS var 사용 불가)
const STAT_HEX: Record<MainStatType, string> = {
  vitality: "#f97316",
  focus: "#0891b2",
  execution: "#6366f1",
  knowledge: "#a855f7",
  relationship: "#84cc16",
  influence: "#eab308",
};

const CX = 180;
const CY = 180;
const R = 120;
const MAX_VAL = 60;

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

function makePolygon(values: number[]): string {
  return values
    .map((v, i) => {
      const angle = (360 / 6) * i;
      const r = (Math.min(v, MAX_VAL) / MAX_VAL) * R;
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

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 360 360" className="w-full max-w-[340px]">
        <defs>
          {/* 스탯별 색상을 섞는 방사형 그라디언트 */}
          {STATS.map((s, i) => {
            const angle = (360 / 6) * i;
            const [x, y] = polarToXY(angle, R);
            return (
              <radialGradient
                key={`rg-${s.key}`}
                id={`stat-glow-${s.key}`}
                cx={x / 360}
                cy={y / 360}
                r="0.5"
              >
                <stop offset="0%" stopColor={STAT_HEX[s.key]} stopOpacity="0.4" />
                <stop offset="100%" stopColor={STAT_HEX[s.key]} stopOpacity="0" />
              </radialGradient>
            );
          })}

          {/* 데이터 영역 그라디언트: 6색 혼합 */}
          <linearGradient id="data-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={STAT_HEX.vitality} stopOpacity="0.25" />
            <stop offset="20%" stopColor={STAT_HEX.focus} stopOpacity="0.2" />
            <stop offset="40%" stopColor={STAT_HEX.execution} stopOpacity="0.25" />
            <stop offset="60%" stopColor={STAT_HEX.knowledge} stopOpacity="0.2" />
            <stop offset="80%" stopColor={STAT_HEX.relationship} stopOpacity="0.25" />
            <stop offset="100%" stopColor={STAT_HEX.influence} stopOpacity="0.2" />
          </linearGradient>

          {/* 부드러운 점 글로우 */}
          <filter id="dot-glow-v2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 배경: 각 꼭짓점 방향 은은한 글로우 */}
        {STATS.map((s) => (
          <circle
            key={`bg-${s.key}`}
            cx={CX}
            cy={CY}
            r={R + 20}
            fill={`url(#stat-glow-${s.key})`}
            opacity="0.3"
          />
        ))}

        {/* 그리드 눈금선 */}
        {GRID_STEPS.map(({ scale }) => (
          <polygon
            key={scale}
            points={makeGridPolygon(scale)}
            fill="none"
            stroke={scale === 1 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}
            strokeWidth={scale === 1 ? "1.2" : "0.7"}
          />
        ))}

        {/* 축 라인 — 스탯 색상 힌트 */}
        {STATS.map((s, i) => {
          const angle = (360 / 6) * i;
          const [x, y] = polarToXY(angle, R);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke={STAT_HEX[s.key]}
              strokeWidth="0.5"
              strokeOpacity="0.25"
            />
          );
        })}

        {/* 눈금 숫자 (좌측 축에, 더 크고 밝게) */}
        {GRID_STEPS.map(({ scale, label }) => {
          // 90도 위치(상단)의 축을 따라 표시
          const [, y] = polarToXY(0, R * scale);
          return (
            <text
              key={label}
              x={CX + R * scale + 6}
              y={CY + 3}
              fill="rgba(255,255,255,0.3)"
              fontSize="9"
              fontFamily="var(--font-mono)"
            >
              {label}
            </text>
          );
        })}

        {/* 데이터 영역 — 그라디언트 채우기 */}
        <polygon
          points={makePolygon(values)}
          fill="url(#data-fill)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* 스탯별 영역 경계선 세그먼트 (각 변이 해당 스탯 색상) */}
        {values.map((v, i) => {
          const nextI = (i + 1) % 6;
          const angle1 = (360 / 6) * i;
          const angle2 = (360 / 6) * nextI;
          const r1 = (Math.min(v, MAX_VAL) / MAX_VAL) * R;
          const r2 = (Math.min(values[nextI], MAX_VAL) / MAX_VAL) * R;
          const [x1, y1] = polarToXY(angle1, r1);
          const [x2, y2] = polarToXY(angle2, r2);
          // 두 스탯 색상의 평균적인 색 (시작 스탯 색)
          return (
            <line
              key={`edge-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={STAT_HEX[STATS[i].key]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.7"
            />
          );
        })}

        {/* 데이터 점 — 스탯별 색상 */}
        {values.map((v, i) => {
          const angle = (360 / 6) * i;
          const r = (Math.min(v, MAX_VAL) / MAX_VAL) * R;
          const [x, y] = polarToXY(angle, r);
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r="5"
              fill={STAT_HEX[STATS[i].key]}
              stroke="#0a0a0a"
              strokeWidth="2"
              filter="url(#dot-glow-v2)"
            />
          );
        })}

        {/* 외곽 라벨: 스탯명 + 수치 (한곳에 모아서 표시) */}
        {STATS.map((s, i) => {
          const val = values[i];
          const angle = (360 / 6) * i;
          const [x, y] = polarToXY(angle, R + 36);
          // 상단/하단에 따라 y 오프셋 조정
          const isTop = y < CY;
          const isBottom = y > CY;
          return (
            <g key={s.key}>
              {/* 스탯 이름 */}
              <text
                x={x}
                y={isBottom ? y - 2 : isTop ? y + 2 : y - 6}
                textAnchor="middle"
                dominantBaseline={isBottom ? "hanging" : isTop ? "auto" : "auto"}
                fill={STAT_HEX[s.key]}
                fontSize="12"
                fontWeight="600"
                fontFamily="var(--font-sans)"
              >
                {s.label}
              </text>
              {/* 수치 — 이름 아래/위에 배치 */}
              <text
                x={x}
                y={isBottom ? y + 14 : isTop ? y + 16 : y + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.85)"
                fontSize="14"
                fontWeight="bold"
                fontFamily="var(--font-mono)"
              >
                {val}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
