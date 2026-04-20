import { NextResponse } from "next/server";
import { eq, gte } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { growthLog, users } from "@/lib/db/schema";
import type { ClassCode } from "@/lib/db/schema";

// 클래스별 스탯 가중치 — 높을수록 해당 클래스와 친화적
const CLASS_WEIGHTS: Record<ClassCode, Partial<Record<string, number>>> = {
  builder:   { execution: 2, focus: 1.5, knowledge: 0.5 },
  creator:   { influence: 2, knowledge: 1.5, focus: 0.5 },
  leader:    { execution: 2, relationship: 1.5, influence: 0.5 },
  explorer:  { knowledge: 2, focus: 1.5, vitality: 0.5 },
  supporter: { relationship: 2, vitality: 1.5, knowledge: 0.5 },
};

const CLASS_LABEL: Record<ClassCode, string> = {
  builder: "제작자", creator: "창작자", leader: "주도자",
  explorer: "탐구자", supporter: "조율자",
};

const CLASS_DESC: Record<ClassCode, string> = {
  builder:   "손으로 만들고 구현하는 자. 실행력과 집중력으로 세계를 짓는다.",
  creator:   "표현하고 창조하는 자. 전파력과 지식력으로 흔적을 남긴다.",
  leader:    "방향을 잡고 끌고 가는 자. 실행력과 관계력으로 팀을 이끈다.",
  explorer:  "배우고 조사하고 밝혀내는 자. 지식력과 집중력으로 진실에 다가간다.",
  supporter: "돕고 연결하고 팀을 살리는 자. 관계력과 체력으로 팀을 받친다.",
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const db = await getDb();

  // 가입일 조회
  const fullUser = await db.select({ createdAt: users.createdAt })
    .from(users).where(eq(users.id, user.id)).get();
  if (!fullUser) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  // 가입 후 7일 이상 경과 확인
  const signupDate = new Date(fullUser.createdAt);
  const daysSinceSignup = Math.floor((Date.now() - signupDate.getTime()) / 86_400_000);
  if (daysSinceSignup < 7) {
    return NextResponse.json({ ready: false, daysLeft: 7 - daysSinceSignup });
  }

  // 첫 14일간 growthLog 조회
  const since = new Date(signupDate);
  since.setDate(since.getDate() + 14);
  const rows = await db.select().from(growthLog)
    .where(eq(growthLog.userId, user.id));

  // 충분한 데이터 여부 (3회 이상 인증)
  const totalQuests = rows.reduce((s, r) => s + r.questsCompleted, 0);
  if (totalQuests < 3) {
    return NextResponse.json({ ready: false, insufficient: true });
  }

  // 스탯 합산
  const totals: Record<string, number> = {
    vitality: 0, focus: 0, execution: 0,
    knowledge: 0, relationship: 0, influence: 0,
  };
  for (const row of rows) {
    totals.vitality    += row.vitalityDelta;
    totals.focus       += row.focusDelta;
    totals.execution   += row.executionDelta;
    totals.knowledge   += row.knowledgeDelta;
    totals.relationship += row.relationshipDelta;
    totals.influence   += row.influenceDelta;
  }

  // 클래스별 점수 계산
  const scores: Record<ClassCode, number> = {
    builder: 0, creator: 0, leader: 0, explorer: 0, supporter: 0,
  };
  for (const [cls, weights] of Object.entries(CLASS_WEIGHTS) as [ClassCode, Partial<Record<string, number>>][]) {
    for (const [stat, w] of Object.entries(weights)) {
      scores[cls] += (totals[stat] ?? 0) * (w ?? 1);
    }
  }

  // 가장 높은 클래스
  const diagnosedClass = (Object.entries(scores) as [ClassCode, number][])
    .sort(([, a], [, b]) => b - a)[0][0];

  // 상위 스탯 2개
  const topStats = Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .filter(([, v]) => v > 0)
    .map(([k]) => k);

  return NextResponse.json({
    ready: true,
    diagnosedClass,
    diagnosedLabel: CLASS_LABEL[diagnosedClass],
    diagnosedDesc: CLASS_DESC[diagnosedClass],
    currentClass: user.classCode,
    currentLabel: user.classCode ? CLASS_LABEL[user.classCode as ClassCode] : null,
    topStats,
    totalQuests,
  });
}
