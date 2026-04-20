import { NextResponse } from "next/server";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { growthLog } from "@/lib/db/schema";

type StatKey = "vitalityDelta" | "focusDelta" | "executionDelta" | "knowledgeDelta" | "relationshipDelta" | "influenceDelta";

const STAT_LABEL: Record<StatKey, string> = {
  vitalityDelta: "체력",
  focusDelta: "집중력",
  executionDelta: "실행력",
  knowledgeDelta: "지식력",
  relationshipDelta: "관계력",
  influenceDelta: "전파력",
};

function getDiagnosis(
  thisXp: number,
  lastXp: number,
  streak: number,
  activeDays: number,
): string {
  if (thisXp === 0) {
    return "이번 주는 조용했어. 멈춘 것도 기록이야. 다음 주엔 한 발짝만 더.";
  }
  if (streak >= 7) {
    return `${streak}일 연속. 루틴이 자리잡고 있어. 이 흐름이 진짜 너야.`;
  }
  if (lastXp === 0 && thisXp > 0) {
    return "지난주 침묵 후 다시 움직였어. 다시 시작하는 자만이 결국 도달해.";
  }
  if (thisXp >= lastXp * 1.5) {
    return "가속 중. 이 흐름을 기억해두면 좋아. 다음 주도 이 속도로.";
  }
  if (thisXp > lastXp) {
    return "지난주보다 더 많이 움직였어. 조금씩 나아가는 것, 그게 전부야.";
  }
  if (activeDays >= 5) {
    return "꾸준함. 폭발하지 않아도 괜찮아. 5일 이상 나온 것 자체가 실력이야.";
  }
  return "이번 주도 너는 여기 있었어. 그것만으로 충분해.";
}

// GET /api/report/weekly — PRD v4 7일 진단 리포트
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const thisStart = new Date(today); thisStart.setDate(today.getDate() - 6);
  const lastStart = new Date(today); lastStart.setDate(today.getDate() - 13);
  const lastEnd   = new Date(today); lastEnd.setDate(today.getDate() - 7);

  const db = await getDb();

  const [thisWeekRows, lastWeekRows] = await Promise.all([
    db.select().from(growthLog).where(
      and(eq(growthLog.userId, user.id), gte(growthLog.date, fmt(thisStart)))
    ),
    db.select().from(growthLog).where(
      and(
        eq(growthLog.userId, user.id),
        gte(growthLog.date, fmt(lastStart)),
        lte(growthLog.date, fmt(lastEnd)),
      )
    ),
  ]);

  // 이번 주 집계
  const thisXp = thisWeekRows.reduce((s, r) => s + r.xpEarned, 0);
  const thisQuests = thisWeekRows.reduce((s, r) => s + r.questsCompleted, 0);
  const thisActiveDays = thisWeekRows.length;

  // 스탯 변화 집계
  const statKeys: StatKey[] = [
    "vitalityDelta", "focusDelta", "executionDelta",
    "knowledgeDelta", "relationshipDelta", "influenceDelta",
  ];
  const statTotals: Record<StatKey, number> = {
    vitalityDelta: 0, focusDelta: 0, executionDelta: 0,
    knowledgeDelta: 0, relationshipDelta: 0, influenceDelta: 0,
  };
  for (const row of thisWeekRows) {
    for (const k of statKeys) {
      statTotals[k] += row[k];
    }
  }

  // 가장 많이 오른 스탯
  let topStatKey: StatKey = "executionDelta";
  let topStatVal = 0;
  for (const k of statKeys) {
    if (statTotals[k] > topStatVal) {
      topStatVal = statTotals[k];
      topStatKey = k;
    }
  }

  // 지난 주 집계
  const lastXp = lastWeekRows.reduce((s, r) => s + r.xpEarned, 0);
  const lastQuests = lastWeekRows.reduce((s, r) => s + r.questsCompleted, 0);

  const diagnosisMessage = getDiagnosis(thisXp, lastXp, user.streakDays, thisActiveDays);

  return NextResponse.json({
    thisWeek: {
      xp: thisXp,
      quests: thisQuests,
      activeDays: thisActiveDays,
      statBreakdown: Object.fromEntries(
        statKeys.map((k) => [k.replace("Delta", ""), statTotals[k]])
      ),
    },
    lastWeek: {
      xp: lastXp,
      quests: lastQuests,
    },
    topStat: topStatVal > 0
      ? { key: topStatKey.replace("Delta", ""), label: STAT_LABEL[topStatKey], delta: topStatVal }
      : null,
    streakDays: user.streakDays,
    diagnosisMessage,
  });
}
