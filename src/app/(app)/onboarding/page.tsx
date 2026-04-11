import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "세계 입장",
};

// LV UP — 온보딩 페이지 (server component)
//
// 게이트:
//   - 쿠키 없음/세션 만료 → requireCurrentUser가 throw → (app) layout에서 /login redirect
//   - 이미 온보딩 완료 (classCode != null) → /status로 역방향 redirect
export default async function OnboardingPage() {
  const user = await requireCurrentUser();
  if (user.classCode !== null) {
    redirect("/status");
  }

  return <OnboardingWizard nickname={user.nickname} />;
}
