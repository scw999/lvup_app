import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import {
  quests,
  userRoleTags,
  userStats,
  users,
  type MainStatType,
} from "@/lib/db/schema";
import { CLASS_STAT_WEIGHTS, STAT_BONUS_PER_AXIS } from "@/lib/onboarding/stat-weights";
import { ROLE_TAG_BY_CODE } from "@/lib/onboarding/role-tags";
import { validateOnboarding } from "@/lib/onboarding/validation";
import { DIFFICULTY_REWARDS } from "@/lib/quests/rewards";
import { getStarterQuests } from "@/lib/quests/starter";
import { newQuestId, newRoleTagId } from "@/lib/utils/id";

// POST /api/onboarding/complete
// TECH_SPEC 8.2 — 온보딩 완료 및 초기 상태 생성
//
// 처리:
//   1) users UPDATE (class_code, first_goal, title, updated_at)
//   2) user_stats UPDATE (강한 축 2개에 +2)
//   3) user_role_tags INSERT (1~3개)
//   4) quests INSERT (starter 3개)
//
// 원칙:
//   - Idempotency: user.classCode가 이미 세팅돼 있으면 400 (재진입 차단)
//   - Atomicity: drizzle-d1 `db.batch([...])`로 단일 RPC
//     batch의 readonly tuple 타입 요구를 충족하려면 배열을 한 번에 구성.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { message: "세계 밖에서 오셨습니다. 먼저 로그인해 주세요." } },
      { status: 401 },
    );
  }

  if (user.classCode !== null) {
    return NextResponse.json(
      { error: { message: "이미 온보딩이 완료되었습니다." } },
      { status: 400 },
    );
  }

  const rawBody = await request.json().catch(() => ({}));
  const parsed = validateOnboarding(rawBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const db = await getDb();

  const [axisA, axisB] = CLASS_STAT_WEIGHTS[parsed.classCode];
  const statPatch: Partial<Record<MainStatType, ReturnType<typeof sql>>> = {
    [axisA]: sql`${sql.identifier(axisA)} + ${STAT_BONUS_PER_AXIS}`,
  };
  // 같은 스탯이 두 번 지정되는 일은 설계상 없지만 안전하게 분리.
  if (axisB !== axisA) {
    statPatch[axisB] = sql`${sql.identifier(axisB)} + ${STAT_BONUS_PER_AXIS}`;
  } else {
    statPatch[axisA] = sql`${sql.identifier(axisA)} + ${STAT_BONUS_PER_AXIS * 2}`;
  }

  const starter = getStarterQuests(parsed.classCode, parsed.firstGoal);
  const questRows = starter.map((q) => {
    const reward = DIFFICULTY_REWARDS[q.difficulty];
    return {
      id: newQuestId(),
      userId: user.id,
      title: q.title,
      description: null,
      type: "daily" as const,
      difficulty: q.difficulty,
      mainStatType: q.mainStatType,
      xpRewardBase: reward.xpRewardBase,
      statReward: reward.statReward,
      status: "active" as const,
      estimatedMinutes: q.estimatedMinutes,
    };
  });

  const roleTagRows = parsed.roleTags.map((code) => {
    const info = ROLE_TAG_BY_CODE[code];
    return {
      id: newRoleTagId(),
      userId: user.id,
      tagCode: code,
      // tagName은 서버 룩업. 클라이언트가 보내지 않음 (스푸핑 방지).
      tagName: info.name,
    };
  });

  // drizzle-d1 batch는 Readonly<[U, ...U[]]> 타입을 요구한다.
  // dynamic length 배열을 이 타입으로 캐스팅.
  const stmts = [
    db
      .update(users)
      .set({
        classCode: parsed.classCode,
        firstGoal: parsed.firstGoal,
        title: "입장한 자",
        updatedAt: sql`(datetime('now'))`,
      })
      .where(eq(users.id, user.id)),
    db
      .update(userStats)
      .set({
        ...statPatch,
        updatedAt: sql`(datetime('now'))`,
      })
      .where(eq(userStats.userId, user.id)),
    ...roleTagRows.map((r) => db.insert(userRoleTags).values(r)),
    ...questRows.map((q) => db.insert(quests).values(q)),
  ];

  // batch는 "한 개 이상"을 요구. stmts는 최소 1(users) + 1(stats) + 1(role) + 3(quests) = 6 고정.
  await db.batch(
    stmts as unknown as readonly [
      (typeof stmts)[number],
      ...(typeof stmts)[number][],
    ],
  );

  return NextResponse.json(
    {
      success: true,
      createdQuestIds: questRows.map((q) => q.id),
      firstQuestId: questRows[0].id,
    },
    { status: 201 },
  );
}
