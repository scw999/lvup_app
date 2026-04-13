import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import {
  quests,
  verifications,
  questMedia,
  userStats,
  users,
  levelEvents,
} from "@/lib/db/schema";
import type { MainStatType } from "@/lib/db/schema";
import { calculateQuestReward } from "@/lib/rewards/calculate";
import { checkLevelUp } from "@/lib/rewards/levels";
import { getLevelUpMessage } from "@/lib/rewards/narratives";
import { newVerificationId, newQuestMediaId, newGrowthLogId, newLevelEventId } from "@/lib/utils/id";

// POST /api/verifications — TECH_SPEC 8.6
// 단일 트랜잭션: verification → quest 완료 → 보상 → stats → xp/level → growth_log → level_events
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.classCode) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: {
    questId?: string;
    note?: string;
    representativeImageUrl?: string;
    additionalImageUrls?: string[];
    linkUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { questId, note, representativeImageUrl, additionalImageUrls, linkUrl } = body;

  if (!questId) {
    return NextResponse.json({ error: "QUEST_ID_REQUIRED" }, { status: 400 });
  }

  const db = await getDb();

  // 퀘스트 조회 + 소유권 + 상태 확인
  const quest = await db
    .select()
    .from(quests)
    .where(and(eq(quests.id, questId), eq(quests.userId, user.id)))
    .get();

  if (!quest) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (quest.status === "completed") {
    return NextResponse.json({ error: "ALREADY_COMPLETED" }, { status: 409 });
  }

  // 보상 계산
  const reward = calculateQuestReward({
    quest,
    hasNote: !!note && note.trim().length >= 5,
    hasRepresentativeImage: !!representativeImageUrl,
    additionalImageCount: additionalImageUrls?.length ?? 0,
    hasLink: !!linkUrl,
    streakDays: user.streakDays,
  });

  // 레벨업 판정
  const levelResult = checkLevelUp(user.xp, reward.xpTotal, user.level);

  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const verificationId = newVerificationId();
  const textOnly = !representativeImageUrl ? 1 : 0;
  const statType = reward.statType as MainStatType;

  // ── 순차 처리 (D1 batch에서 raw SQL 비호환 이슈로 분리) ──

  // 1. verification 생성
  await db.insert(verifications).values({
    id: verificationId,
    questId,
    userId: user.id,
    note: note?.trim() || null,
    representativeImageUrl: representativeImageUrl || null,
    linkUrl: linkUrl || null,
    textOnly,
    xpBaseEarned: reward.xpBase,
    xpEvidenceEarned: reward.xpEvidence,
    xpBonusEarned: reward.xpBonus,
    xpTotalEarned: reward.xpTotal,
    narrativeMessage: reward.narrativeMessage,
  });

  // 2. quest 완료 처리
  await db
    .update(quests)
    .set({ status: "completed", completedAt: now })
    .where(eq(quests.id, questId));

  // 3. user xp / level / title 반영
  await db
    .update(users)
    .set({
      xp: levelResult.newXp,
      xpToNext: levelResult.newXpToNext,
      level: levelResult.newLevel,
      title: levelResult.newTitle,
      lastActiveDate: today,
      updatedAt: now,
    })
    .where(eq(users.id, user.id));

  // 4. user_stats 증가 — 동적 컬럼을 raw SQL로 처리
  await db.run(sql`
    UPDATE user_stats
    SET ${sql.raw(statType)} = ${sql.raw(statType)} + ${reward.statDelta},
        updated_at = ${now}
    WHERE user_id = ${user.id}
  `);

  // 5. growth_log upsert
  await db.run(sql`
    INSERT INTO growth_log (id, user_id, date, quests_completed, xp_earned,
      ${sql.raw(`${statType}_delta`)}, level_at_end, created_at)
    VALUES (${newGrowthLogId()}, ${user.id}, ${today}, 1, ${reward.xpTotal},
      ${reward.statDelta}, ${levelResult.newLevel}, ${now})
    ON CONFLICT (user_id, date) DO UPDATE SET
      quests_completed = quests_completed + 1,
      xp_earned = xp_earned + ${reward.xpTotal},
      ${sql.raw(`${statType}_delta`)} = ${sql.raw(`${statType}_delta`)} + ${reward.statDelta},
      level_at_end = ${levelResult.newLevel}
  `);

  // 6. 추가 이미지 (batch 외 — 개수 가변)
  if (additionalImageUrls && additionalImageUrls.length > 0) {
    const mediaValues = additionalImageUrls.map((url, i) => ({
      id: newQuestMediaId(),
      verificationId,
      imageUrl: url,
      sortOrder: i,
    }));
    await db.insert(questMedia).values(mediaValues);
  }

  // 7. 레벨업 이벤트
  let levelUpMessage: string | null = null;
  if (levelResult.leveledUp) {
    levelUpMessage = getLevelUpMessage();
    await db.insert(levelEvents).values({
      id: newLevelEventId(),
      userId: user.id,
      fromLevel: user.level,
      toLevel: levelResult.newLevel,
      newTitle: levelResult.newTitle,
      triggeredByVerificationId: verificationId,
    });
  }

  // 8. 첫 인증 여부 확인 (화면 5a: 덕훌 1화 연결)
  const verificationCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(verifications)
    .where(eq(verifications.userId, user.id))
    .get();
  const isFirstVerification = (verificationCount?.count ?? 0) === 1;

  // 9. 스트릭 업데이트 (간단 처리: 어제와 비교)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let newStreak = 1;
  if (user.lastActiveDate === today) {
    newStreak = user.streakDays; // 이미 오늘 활동함
  } else if (user.lastActiveDate === yesterdayStr) {
    newStreak = user.streakDays + 1;
  }
  // else: 연속 끊김 → 1로 리셋

  if (newStreak !== user.streakDays) {
    await db
      .update(users)
      .set({ streakDays: newStreak })
      .where(eq(users.id, user.id));
  }

  // 화면 5a: 첫 인증 시 특별 서사 메시지
  const narrativeMessage = isFirstVerification
    ? "너의 상태창이 열렸다. 이제 너의 이야기가 시작된다."
    : reward.narrativeMessage;

  return NextResponse.json({
    success: true,
    reward: {
      xpBase: reward.xpBase,
      xpEvidence: reward.xpEvidence,
      xpBonus: reward.xpBonus,
      xpTotal: reward.xpTotal,
      statType: reward.statType,
      statDelta: reward.statDelta,
      leveledUp: levelResult.leveledUp,
      newLevel: levelResult.leveledUp ? levelResult.newLevel : null,
      newTitle: levelResult.leveledUp ? levelResult.newTitle : null,
      narrativeMessage,
      levelUpMessage,
      isFirstVerification,
    },
  });
}
