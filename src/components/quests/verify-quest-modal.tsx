"use client";

import { useState, useRef } from "react";

type RewardData = {
  xpBase: number;
  xpEvidence: number;
  xpBonus: number;
  xpTotal: number;
  statType: string;
  statDelta: number;
  leveledUp: boolean;
  newLevel: number | null;
  newTitle: string | null;
  narrativeMessage: string;
  levelUpMessage: string | null;
};

export function VerifyQuestModal({
  questId,
  questTitle,
  onClose,
  onVerified,
}: {
  questId: string;
  questTitle: string;
  onClose: () => void;
  onVerified: (reward: RewardData) => void;
}) {
  const [note, setNote] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("JPG, PNG, WebP만 가능합니다");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("10MB 이하만 가능합니다");
      return;
    }

    setError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const canSubmit = !!imageFile;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) {
      setError("사진을 첨부해주세요");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      let representativeImageUrl: string | undefined;

      // 1. 이미지 업로드
      if (imageFile) {
        setUploadProgress("이미지 업로드 중...");
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const data = (await uploadRes.json()) as { error?: string };
          throw new Error(data.error ?? "업로드 실패");
        }

        const { fileUrl } = (await uploadRes.json()) as { fileUrl: string };
        representativeImageUrl = fileUrl;
      }

      // 2. 인증 제출
      setUploadProgress("인증 처리 중...");
      const verifyRes = await fetch("/api/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId,
          note: note.trim() || undefined,
          representativeImageUrl,
          linkUrl: linkUrl.trim() || undefined,
        }),
      });

      if (!verifyRes.ok) {
        const data = (await verifyRes.json()) as { error?: string };
        throw new Error(data.error ?? "인증 실패");
      }

      const { reward } = (await verifyRes.json()) as { reward: RewardData };
      onVerified(reward);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
      setSubmitting(false);
      setUploadProgress("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 my-auto w-full max-w-md rounded-2xl border border-[--color-border] bg-[--color-bg] p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wider">인증하기</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[--color-text-faint] hover:text-[--color-text-muted]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-xs text-[--color-text-muted]">{questTitle}</p>

        {/* 사진 첨부 */}
        <div className="mb-4">
          <span className="mb-2 block text-[10px] tracking-wider text-[--color-text-faint]">
            사진 <span className="text-red-400">*필수</span>
          </span>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="미리보기"
                className="h-40 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
              >
                <svg width="14" height="14" viewBox="0 0 16 16">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-28 w-full items-center justify-center rounded-lg border border-dashed border-[--color-border] text-sm text-[--color-text-faint] hover:border-[--color-accent] hover:text-[--color-text-muted]"
            >
              + 사진 추가
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 메모 */}
        <label className="mb-4 block">
          <span className="mb-1 block text-[10px] tracking-wider text-[--color-text-faint]">
            메모 (선택, 5자 이상 시 +2 XP)
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full resize-none rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-text] outline-none focus:border-[--color-accent]"
            rows={3}
            placeholder="오늘의 수행을 기록하세요"
            maxLength={500}
          />
        </label>

        {/* 외부 링크 */}
        <label className="mb-5 block">
          <span className="mb-1 block text-[10px] tracking-wider text-[--color-text-faint]">
            외부 링크 (선택, +2 XP)
          </span>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-text] outline-none focus:border-[--color-accent]"
            placeholder="https://..."
          />
        </label>

        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="w-full rounded-lg bg-[--color-accent] py-3 text-sm font-medium text-white transition-colors hover:bg-[--color-accent-hover] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting
            ? uploadProgress || "처리 중..."
            : canSubmit
              ? "인증 제출"
              : "사진을 먼저 첨부하세요"}
        </button>
      </form>
    </div>
  );
}
