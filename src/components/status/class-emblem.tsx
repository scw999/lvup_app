import React from "react";
// LV UP — 클래스 엠블럼 (SVG)
// 각 클래스의 시각적 아이덴티티

import type { ClassCode } from "@/lib/db/schema";

export function ClassEmblem({
  classCode,
  color,
  size = 48,
}: {
  classCode: ClassCode;
  color: string;
  size?: number;
}) {
  const Icon = EMBLEMS[classCode];
  return (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{
        width: size,
        height: size,
        background: `${color}10`,
        border: `1px solid ${color}30`,
        boxShadow: `0 0 16px ${color}15`,
      }}
    >
      <Icon color={color} size={size * 0.55} />
    </div>
  );
}

type IconProps = { color: string; size: number };

// 제작자 — 망치/도구
function BuilderIcon({ color, size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

// 창작자 — 펜/별
function CreatorIcon({ color, size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// 주도자 — 깃발
function LeaderIcon({ color, size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

// 탐구자 — 나침반
function ExplorerIcon({ color, size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={`${color}30`} />
    </svg>
  );
}

// 조율자 — 연결된 손/하트
function SupporterIcon({ color, size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const EMBLEMS: Record<ClassCode, (props: IconProps) => React.ReactElement> = {
  builder: BuilderIcon,
  creator: CreatorIcon,
  leader: LeaderIcon,
  explorer: ExplorerIcon,
  supporter: SupporterIcon,
};
