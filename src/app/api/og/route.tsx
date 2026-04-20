import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

const CLASS_COLOR: Record<string, string> = {
  builder: "#6366f1", creator: "#a855f7", leader: "#f59e0b",
  explorer: "#22c55e", supporter: "#3b82f6",
};
const CLASS_LABEL: Record<string, string> = {
  builder: "제작자", creator: "창작자", leader: "주도자",
  explorer: "탐구자", supporter: "조율자",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const nickname = searchParams.get("nickname") ?? "플레이어";
  const classCode = searchParams.get("class") ?? "builder";
  const level = searchParams.get("level") ?? "1";
  const title = searchParams.get("title") ?? "입장한 자";
  const type = searchParams.get("type") ?? "default"; // "default" | "share"

  const color = CLASS_COLOR[classCode] ?? "#6366f1";
  const classLabel = CLASS_LABEL[classCode] ?? classCode;

  if (type === "share") {
    // 상태창 공유용 — 개인화 카드
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px", height: "630px",
            background: `radial-gradient(ellipse 80% 60% at 20% 20%, ${color}25, #0a0a0a 60%)`,
            display: "flex", flexDirection: "column",
            justifyContent: "center", padding: "80px",
            fontFamily: "sans-serif",
          }}
        >
          {/* 워터마크 */}
          <div style={{ position: "absolute", top: "40px", right: "60px", fontSize: "14px", color: "#444", letterSpacing: "0.2em" }}>
            LV UP · STATUS
          </div>

          {/* 메인 콘텐츠 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: `${color}20`, border: `2px solid ${color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px", fontWeight: "bold", color,
              }}>
                {nickname.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "48px", fontWeight: "900", color: "#fff" }}>{nickname}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    padding: "4px 14px", borderRadius: "999px",
                    border: `1px solid ${color}60`, color, fontSize: "16px",
                  }}>
                    {classLabel}
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "700", color }}>Lv.{level}</div>
                  <div style={{ fontSize: "18px", color: "#888" }}>{title}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 */}
          <div style={{ position: "absolute", bottom: "40px", left: "80px", right: "80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: "900", color: "#fff", letterSpacing: "-0.02em" }}>LV UP</div>
            <div style={{ fontSize: "14px", color: "#444" }}>lvup.world</div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  // 기본 랜딩 OG
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px", height: "630px",
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, #6366f130, #0a0a0a 60%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "sans-serif", textAlign: "center",
        }}
      >
        <div style={{ fontSize: "120px", fontWeight: "900", color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>
          LV UP
        </div>
        <div style={{ marginTop: "24px", fontSize: "28px", color: "#999", maxWidth: "700px", lineHeight: 1.5 }}>
          현실에서 행동한 모든 것이, 당신의 상태창이 된다.
        </div>
        <div style={{ marginTop: "48px", fontSize: "16px", color: "#555", letterSpacing: "0.2em" }}>
          SEASON ZERO · 2026 · lvup.world
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
