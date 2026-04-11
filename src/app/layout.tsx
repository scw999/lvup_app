import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

// JetBrains Mono — 수치 표시(XP, 레벨, 스탯)용
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LV UP — 현실을 게임처럼",
    template: "%s · LV UP",
  },
  description:
    "LV UP은 현실에서 행동한 것을 인증하면 상태창의 레벨과 능력치로 남는 성장 RPG형 웹앱입니다.",
  applicationName: "LV UP",
  authors: [{ name: "LV UP", url: "https://lvup.world" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "LV UP — 현실을 게임처럼",
    description:
      "현실에서 행동한 모든 것이, 당신의 상태창이 된다. 자기 인생의 CEO가 되는 사람들의 세계.",
    url: "https://lvup.world",
    siteName: "LV UP",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={jetbrainsMono.variable}>
      <head>
        {/* Pretendard — Korean sans. 공식 CDN(jsdelivr) 가변 폰트 버전 */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
