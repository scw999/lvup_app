import Link from "next/link";

// LV UP 랜딩 페이지
// 원본 backup/index.html의 구조를 존중하되, "상태창 열기" CTA를 추가하여
// Sprint 1의 핵심 목표(회원가입 → 상태창 진입)로 유도한다.
//
// 디자인 원칙:
//   - 단일 CTA (TECH_SPEC 12.1 / PRD의 LiFE RPG 분석)
//   - 세계관 톤 유지 ("world initializing...")
//   - 밝은 SaaS 스타일 금지

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <span className="mb-8 inline-block rounded-full border border-[--color-border] px-4 py-1.5 text-xs tracking-[0.2em] text-[--color-text-muted]">
          SEASON ZERO · 2026
        </span>

        <h1 className="bg-gradient-to-br from-white to-[#888] bg-clip-text text-[clamp(3rem,12vw,6rem)] font-black leading-none tracking-tight text-transparent">
          LV UP
        </h1>

        <p className="mt-6 max-w-md text-base leading-relaxed text-[--color-text-muted] sm:text-lg">
          현실에서 행동한 모든 것이,
          <br />
          당신의 상태창이 된다.
        </p>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-[--color-text-faint] sm:text-base">
          자기 인생의 CEO가 되는 사람들의 세계.
        </p>

        <div className="mt-12 flex flex-col items-center gap-3">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-[--color-accent] px-8 py-4 text-base font-semibold text-white transition hover:bg-[--color-accent-hover]"
          >
            상태창 열기
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-[--color-text-faint] underline-offset-4 hover:text-[--color-text-muted] hover:underline"
          >
            이미 세계에 있는 경우 · 로그인
          </Link>
        </div>

        <div className="mt-24 font-[family-name:var(--font-mono)] text-xs text-[--color-text-faint]">
          {"// world initializing... //"}
        </div>
      </div>
    </main>
  );
}
