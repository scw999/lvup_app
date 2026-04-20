"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CLASS_LABEL: Record<string, string> = {
  builder: "제작자",
  creator: "창작자",
  leader: "주도자",
  explorer: "탐구자",
  supporter: "조율자",
};

const CLASS_COLOR: Record<string, string> = {
  builder: "#6366f1",
  creator: "#a855f7",
  leader: "#f59e0b",
  explorer: "#22c55e",
  supporter: "#3b82f6",
};

const GOAL_LABEL: Record<string, string> = {
  habit: "습관 만들기",
  project: "프로젝트 시작",
  income: "수익 만들기",
  team: "새로운 사람 만나기",
};

type Profile = {
  nickname: string;
  email: string;
  classCode: string | null;
  firstGoal: string | null;
  level: number;
  title: string;
  streakDays: number;
  createdAt: string;
  roleTags: { code: string; name: string }[];
};

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [changingClass, setChangingClass] = useState(false);
  const [classError, setClassError] = useState("");

  useEffect(() => {
    fetch("/api/settings/profile")
      .then((r) => r.json() as Promise<Profile>)
      .then((data) => {
        setProfile(data);
        setNicknameInput(data.nickname);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSaveNickname() {
    if (!nicknameInput.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nicknameInput.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        if (data.error === "NICKNAME_LENGTH") {
          setSaveError("닉네임은 2~20자여야 합니다");
        } else {
          setSaveError("저장에 실패했습니다");
        }
        setSaving(false);
        return;
      }
      const { nickname } = (await res.json()) as { nickname: string };
      setProfile((prev) => (prev ? { ...prev, nickname } : prev));
      setEditingNickname(false);
    } catch {
      setSaveError("저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  }

  async function handleClassChange(code: string) {
    if (!profile || code === profile.classCode) { setChangingClass(false); return; }
    setClassError("");
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classCode: code }),
      });
      if (!res.ok) { setClassError("클래스 변경에 실패했습니다"); return; }
      setProfile((prev) => (prev ? { ...prev, classCode: code } : prev));
      setChangingClass(false);
    } catch {
      setClassError("클래스 변경에 실패했습니다");
    }
  }

  async function handleLogout() {
    setLogoutLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold tracking-wider">설정</h1>
        <div className="py-16 text-center text-sm text-[--color-text-faint]">로딩 중...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold tracking-wider">설정</h1>
        <div className="py-8 text-center text-sm text-[--color-text-faint]">
          프로필을 불러올 수 없습니다
        </div>
      </main>
    );
  }

  const classColor = profile.classCode ? (CLASS_COLOR[profile.classCode] ?? "#6366f1") : "#6366f1";
  const joinedDate = new Date(profile.createdAt + (profile.createdAt.includes("T") ? "" : "T00:00:00"));
  const joinedStr = `${joinedDate.getFullYear()}년 ${joinedDate.getMonth() + 1}월 ${joinedDate.getDate()}일`;

  return (
    <main className="flex flex-col gap-5 pb-8">
      <h1 className="text-lg font-semibold tracking-wider">설정</h1>

      {/* 프로필 카드 */}
      <section
        className="system-frame overflow-hidden p-5"
        style={{ background: `radial-gradient(ellipse at top, ${classColor}10 0%, var(--color-surface) 70%)` }}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="system-text">PROFILE</span>
          {profile.classCode && (
            <span
              className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wider"
              style={{ borderColor: `${classColor}60`, color: classColor }}
            >
              {CLASS_LABEL[profile.classCode] ?? profile.classCode}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[--color-text]">
              {profile.nickname}
            </span>
            <span className="font-mono text-sm" style={{ color: classColor }}>
              Lv.{profile.level}
            </span>
          </div>
          <span className="text-sm text-[--color-text-muted]">{profile.title}</span>
          <span className="mt-1 text-xs text-[--color-text-faint]">{profile.email}</span>
        </div>

        <div className="mt-4 flex gap-4 text-xs text-[--color-text-faint]">
          {profile.streakDays > 0 && (
            <span>&#128293; {profile.streakDays}일 연속</span>
          )}
          <span>가입: {joinedStr}</span>
        </div>
      </section>

      {/* 닉네임 수정 */}
      <section className="system-frame p-5">
        <p className="mb-3 text-[10px] tracking-[0.2em] text-[--color-text-faint]">NICKNAME</p>

        {editingNickname ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              maxLength={20}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2.5 text-sm text-[--color-text] outline-none focus:border-[--color-accent]"
              placeholder="닉네임 (2~20자)"
              autoFocus
            />
            {saveError && <p className="text-xs text-red-400">{saveError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSaveNickname}
                disabled={saving || nicknameInput.trim().length < 2}
                className="flex-1 rounded-lg bg-[--color-accent] py-2.5 text-xs font-medium text-white transition-colors hover:bg-[--color-accent-hover] disabled:opacity-40"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
              <button
                onClick={() => {
                  setEditingNickname(false);
                  setNicknameInput(profile.nickname);
                  setSaveError("");
                }}
                className="flex-1 rounded-lg border border-[--color-border] py-2.5 text-xs text-[--color-text-muted] transition-colors hover:border-[--color-text-faint]"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[--color-text]">{profile.nickname}</span>
            <button
              onClick={() => setEditingNickname(true)}
              className="text-xs text-[--color-accent] hover:underline"
            >
              변경
            </button>
          </div>
        )}
      </section>

      {/* 클래스 / 첫 목표 */}
      <section className="system-frame p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] tracking-[0.2em] text-[--color-text-faint]">CHARACTER</p>
          {!changingClass && (
            <button
              onClick={() => { setChangingClass(true); setClassError(""); }}
              className="text-[11px] text-[--color-accent] hover:underline"
            >
              클래스 변경
            </button>
          )}
        </div>

        {changingClass ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[--color-text-faint]">새 클래스를 선택하세요</p>
            {Object.entries(CLASS_LABEL).map(([code, label]) => (
              <button
                key={code}
                onClick={() => handleClassChange(code)}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors"
                style={
                  profile.classCode === code
                    ? { borderColor: `${CLASS_COLOR[code]}60`, backgroundColor: `${CLASS_COLOR[code]}10` }
                    : { borderColor: "var(--color-border)" }
                }
              >
                <span className="text-sm font-medium" style={{ color: CLASS_COLOR[code] }}>{label}</span>
                {profile.classCode === code && (
                  <span className="text-[10px] text-[--color-text-faint]">현재</span>
                )}
              </button>
            ))}
            {classError && <p className="text-xs text-red-400">{classError}</p>}
            <button
              onClick={() => setChangingClass(false)}
              className="mt-1 text-xs text-[--color-text-faint] hover:text-[--color-text-muted]"
            >
              취소
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[--color-text-faint]">클래스</span>
              <span className="text-sm font-medium" style={{ color: classColor }}>
                {profile.classCode ? (CLASS_LABEL[profile.classCode] ?? profile.classCode) : "—"}
              </span>
            </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[--color-text-faint]">첫 목표</span>
            <span className="text-sm text-[--color-text]">
              {profile.firstGoal ? (GOAL_LABEL[profile.firstGoal] ?? profile.firstGoal) : "—"}
            </span>
          </div>
          {profile.roleTags.length > 0 && (
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs text-[--color-text-faint]">역할 태그</span>
              <div className="flex flex-wrap justify-end gap-1.5">
                {profile.roleTags.map((t) => (
                  <span
                    key={t.code}
                    className="rounded-full border border-[--color-border] px-2 py-0.5 text-[11px] text-[--color-text-muted]"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          </div>
        )}
      </section>

      {/* 로그아웃 */}
      <section className="system-frame p-5">
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="w-full rounded-lg border border-red-500/30 py-3 text-sm text-red-400 transition-colors hover:border-red-400/60 hover:bg-red-500/5 disabled:opacity-50"
        >
          {logoutLoading ? "로그아웃 중..." : "로그아웃"}
        </button>
      </section>
    </main>
  );
}
