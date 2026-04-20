"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CLASS_INFO_BY_CODE } from "@/lib/onboarding/classes";
import type { ClassCode, MainStatType } from "@/lib/db/schema";

const STAT_COLOR: Record<string, string> = {
  vitality: "var(--color-vitality)",
  focus: "var(--color-focus)",
  execution: "var(--color-execution)",
  knowledge: "var(--color-knowledge)",
  relationship: "var(--color-relationship)",
  influence: "var(--color-influence)",
};

const STAT_LABEL: Record<string, string> = {
  vitality: "체력", focus: "집중력", execution: "실행력",
  knowledge: "지식력", relationship: "관계력", influence: "전파력",
};

const STAT_ORDER = ["vitality", "focus", "execution", "knowledge", "relationship", "influence"];

type ProfileData = {
  id: string;
  nickname: string;
  classCode: string;
  level: number;
  title: string;
  streakDays: number;
  roleTags: { code: string; name: string }[];
  stats: Record<string, number> | null;
  publicVerificationCount: number;
  recentVerifications: {
    id: string;
    representativeImageUrl: string | null;
    xpTotalEarned: number;
    createdAt: string;
    questTitle: string;
    questMainStatType: string;
  }[];
};

function StatBar({ label, val, color }: { label: string; val: number; color: string }) {
  const pct = Math.min(100, Math.round((val / 60) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-xs text-[--color-text-faint]">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[--color-surface]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-6 text-right font-mono text-xs" style={{ color }}>{val}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/profile/${userId}`)
      .then((r) => r.json() as Promise<ProfileData>)
      .then((d) => { setProfile(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <main className="flex items-center justify-center py-24">
        <p className="text-sm text-[--color-text-faint]">불러오는 중...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex items-center justify-center py-24">
        <p className="text-sm text-[--color-text-faint]">플레이어를 찾을 수 없습니다</p>
      </main>
    );
  }

  const classInfo = CLASS_INFO_BY_CODE[profile.classCode as ClassCode];

  return (
    <main className="flex flex-col gap-5 pb-8">
      {/* 헤더 */}
      <section
        className="system-frame relative overflow-hidden p-6"
        style={{ background: `radial-gradient(ellipse at top, ${classInfo.color}10 0%, var(--color-surface) 70%)` }}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="system-text">PLAYER PROFILE</span>
          <span
            className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-[0.15em]"
            style={{ borderColor: `${classInfo.color}60`, color: classInfo.color }}
          >
            {classInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 text-xl font-bold"
            style={{ borderColor: classInfo.color, color: classInfo.color, backgroundColor: `${classInfo.color}15` }}
          >
            {profile.nickname[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{profile.nickname}</h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-mono text-sm font-semibold" style={{ color: classInfo.color }}>
                Lv.{profile.level}
              </span>
              <span className="text-sm text-[--color-text-muted]">{profile.title}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          {profile.streakDays > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🔥</span>
              <span className="font-mono text-xs text-[--color-vitality]">{profile.streakDays}일 연속</span>
            </div>
          )}
          <span className="font-mono text-xs text-[--color-text-faint]">
            인증 <span className="text-[--color-text-muted] font-semibold">{profile.publicVerificationCount}</span>회
          </span>
        </div>

        {profile.roleTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.roleTags.map((t) => (
              <span
                key={t.code}
                className="rounded-full border px-2 py-0.5 text-[10px] tracking-wide"
                style={{ borderColor: `${classInfo.color}40`, color: classInfo.color }}
              >
                {t.name}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 스탯 */}
      {profile.stats && (
        <section className="system-frame p-5">
          <p className="system-text mb-4">MAIN STATS</p>
          <div className="flex flex-col gap-3">
            {STAT_ORDER.map((key) => (
              <StatBar
                key={key}
                label={STAT_LABEL[key]}
                val={profile.stats![key] ?? 0}
                color={STAT_COLOR[key]}
              />
            ))}
          </div>
        </section>
      )}

      {/* 최근 인증 갤러리 */}
      {profile.recentVerifications.length > 0 && (
        <section className="system-frame p-5">
          <p className="system-text mb-4">RECENT ACTIVITY</p>
          <div className="grid grid-cols-3 gap-1.5">
            {profile.recentVerifications.map((v) => (
              <button
                key={v.id}
                onClick={() => v.representativeImageUrl && setExpandedImage(v.representativeImageUrl)}
                className="relative aspect-square overflow-hidden rounded-lg bg-[--color-surface]"
              >
                {v.representativeImageUrl ? (
                  <Image
                    src={v.representativeImageUrl}
                    alt={v.questTitle}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: STAT_COLOR[v.questMainStatType] ?? "var(--color-accent)" }}
                    />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                  <span className="font-mono text-[9px] text-white/80">+{v.xpTotalEarned} XP</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {profile.recentVerifications.length === 0 && (
        <section className="system-frame p-6 text-center">
          <p className="text-sm text-[--color-text-faint]">아직 공개된 활동이 없습니다</p>
        </section>
      )}

      {/* 이미지 전체 화면 */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setExpandedImage(null)}
        >
          <Image src={expandedImage} alt="인증 이미지" fill className="object-contain" />
        </div>
      )}
    </main>
  );
}
