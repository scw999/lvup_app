import Link from "next/link";

const CLASSES = [
  { code: "builder", label: "제작자", sub: "손으로 만드는 자", color: "#6366f1", stats: ["실행력", "집중력"] },
  { code: "creator", label: "창작자", sub: "표현하고 창조하는 자", color: "#a855f7", stats: ["전파력", "지식력"] },
  { code: "leader", label: "주도자", sub: "방향을 잡고 끌고 가는 자", color: "#f59e0b", stats: ["실행력", "관계력"] },
  { code: "explorer", label: "탐구자", sub: "배우고 조사하고 밝혀내는 자", color: "#22c55e", stats: ["지식력", "집중력"] },
  { code: "supporter", label: "조율자", sub: "돕고 연결하고 팀을 살리는 자", color: "#3b82f6", stats: ["관계력", "체력"] },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "즉각적인 보상",
    desc: "인증 후 0.5초 안에 XP와 서사적 피드백. 숫자가 아닌 이야기로 성장을 느낀다.",
  },
  {
    icon: "📊",
    title: "나만의 상태창",
    desc: "체력·집중력·실행력·지식력·관계력·전파력. 6가지 스탯이 실제 행동에 따라 오른다.",
  },
  {
    icon: "🔥",
    title: "스트릭 루프",
    desc: "어제보다 한 발 더. 연속 수행이 쌓일수록 상태창에 불꽃이 살아난다.",
  },
  {
    icon: "🌐",
    title: "활동 피드",
    desc: "나와 같은 클래스의 사람들이 오늘 무엇을 했는지. 비교가 아닌 동기부여.",
  },
];

const STAT_DEMO = [
  { label: "실행력", val: 31, color: "#6366f1", pct: 52 },
  { label: "집중력", val: 24, color: "#0891b2", pct: 40 },
  { label: "체력", val: 18, color: "#f97316", pct: 30 },
  { label: "지식력", val: 22, color: "#a855f7", pct: 37 },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[--color-bg] text-[--color-text]">
      {/* ── 히어로 ── */}
      <section className="relative flex flex-col items-center px-6 pb-20 pt-24 text-center">
        {/* 배경 그라디언트 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, #6366f140, transparent)",
          }}
        />

        <span className="relative mb-8 inline-block rounded-full border border-[--color-border] px-4 py-1.5 text-xs tracking-[0.2em] text-[--color-text-muted]">
          SEASON ZERO · 2026
        </span>

        <h1 className="relative bg-gradient-to-br from-white to-[#666] bg-clip-text text-[clamp(3.5rem,14vw,7rem)] font-black leading-none tracking-tight text-transparent">
          LV UP
        </h1>

        <p className="relative mt-6 max-w-md text-lg leading-relaxed text-[--color-text-muted]">
          현실에서 행동한 모든 것이,
          <br />
          당신의 상태창이 된다.
        </p>

        <p className="relative mt-3 max-w-sm text-sm text-[--color-text-faint]">
          자기 인생의 CEO가 되는 사람들의 세계
        </p>

        <div className="relative mt-12 flex flex-col items-center gap-3">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-[--color-accent] px-8 py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            상태창 열기
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-[--color-text-faint] underline-offset-4 hover:text-[--color-text-muted] hover:underline"
          >
            이미 세계에 있는 경우 · 로그인
          </Link>
        </div>
      </section>

      {/* ── 상태창 미리보기 ── */}
      <section className="mx-auto w-full max-w-sm px-6 pb-16">
        <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] text-[--color-text-faint] tracking-[0.15em]">STATUS WINDOW</p>
              <p className="mt-1 text-lg font-bold">제작자 · Lv.5</p>
              <p className="text-xs text-[--color-text-muted]">길을 찾은 자</p>
            </div>
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold text-white"
              style={{ borderColor: "#6366f1", backgroundColor: "#6366f115" , color: "#6366f1" }}
            >
              J
            </div>
          </div>

          {/* XP 바 */}
          <div className="mb-4">
            <div className="mb-1 flex justify-between">
              <span className="text-[10px] tracking-widest text-[--color-text-faint]">EXPERIENCE</span>
              <span className="font-mono text-[10px] text-[--color-text-muted]">340 / 759</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-[--color-accent]" style={{ width: "45%" }} />
            </div>
          </div>

          {/* 스탯 */}
          <div className="flex flex-col gap-2.5">
            {STAT_DEMO.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-14 text-xs text-[--color-text-faint]">{s.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                  />
                </div>
                <span className="w-6 text-right font-mono text-xs" style={{ color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-[--color-text-faint]">
          이게 당신의 상태창이 될 수 있습니다
        </p>
      </section>

      {/* ── 5대 클래스 ── */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-lg">
          <p className="mb-2 text-center font-mono text-[10px] tracking-[0.2em] text-[--color-text-faint]">
            CHOOSE YOUR CLASS
          </p>
          <h2 className="mb-8 text-center text-2xl font-bold">
            어떤 방식으로 성장하나요?
          </h2>
          <div className="flex flex-col gap-2">
            {CLASSES.map((c) => (
              <div
                key={c.code}
                className="flex items-center gap-4 rounded-xl border border-[--color-border] bg-[--color-surface] px-4 py-3"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${c.color}15`, color: c.color }}
                >
                  <span className="text-sm font-bold">{c.label[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: c.color }}>
                      {c.label}
                    </span>
                    <span className="text-[10px] text-[--color-text-faint] truncate">{c.sub}</span>
                  </div>
                  <div className="mt-1 flex gap-1.5">
                    {c.stats.map((s) => (
                      <span
                        key={s}
                        className="rounded px-1.5 py-0.5 text-[10px]"
                        style={{ backgroundColor: `${c.color}15`, color: c.color }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 핵심 기능 ── */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-lg">
          <p className="mb-2 text-center font-mono text-[10px] tracking-[0.2em] text-[--color-text-faint]">
            HOW IT WORKS
          </p>
          <h2 className="mb-8 text-center text-2xl font-bold">
            행동 → 인증 → 성장
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-[--color-border] bg-[--color-surface] p-4"
              >
                <span className="text-2xl">{f.icon}</span>
                <p className="mt-2 text-sm font-semibold">{f.title}</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[--color-text-faint]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 루프 시각화 ── */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-md rounded-2xl border border-[--color-border] bg-[--color-surface] p-6">
          <p className="mb-6 text-center font-mono text-[10px] tracking-[0.2em] text-[--color-text-faint]">
            CORE LOOP
          </p>
          <div className="flex flex-col gap-3">
            {[
              ["1", "행동한다", "퀘스트를 수행한다", "var(--color-accent)"],
              ["2", "인증한다", "사진·메모로 기록을 남긴다", "#a855f7"],
              ["3", "보상받는다", "XP와 서사 메시지가 온다", "#f59e0b"],
              ["4", "성장한다", "상태창 스탯이 실제로 오른다", "#22c55e"],
              ["5", "다음으로", "더 강한 퀘스트가 열린다", "var(--color-vitality)"],
            ].map(([num, title, sub, color]) => (
              <div key={num} className="flex items-start gap-4">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {num}
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-[--color-text-faint]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 최종 CTA ── */}
      <section className="px-6 pb-24 text-center">
        <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-[--color-text-faint]">
          FREE · NO CREDIT CARD REQUIRED
        </p>
        <h2 className="mb-3 text-2xl font-bold">지금 상태창을 열어보세요</h2>
        <p className="mb-8 text-sm text-[--color-text-faint]">
          클래스를 고르면 첫 퀘스트가 바로 시작됩니다
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-full bg-[--color-accent] px-10 py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
        >
          상태창 열기 →
        </Link>
      </section>

      {/* ── 푸터 ── */}
      <footer className="border-t border-[--color-border] px-6 py-6 text-center">
        <p className="font-mono text-[10px] text-[--color-text-faint] tracking-widest">
          LV UP · SEASON ZERO · 2026 · lvup.world
        </p>
      </footer>
    </main>
  );
}
