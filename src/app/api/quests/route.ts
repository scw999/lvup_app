import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { quests } from "@/lib/db/schema";
import { QUEST_TYPES, QUEST_DIFFICULTIES, MAIN_STAT_TYPES } from "@/lib/db/schema";
import type { QuestType, QuestStatus, QuestDifficulty, MainStatType } from "@/lib/db/schema";
import { DIFFICULTY_REWARDS } from "@/lib/quests/rewards";
import { newQuestId } from "@/lib/utils/id";

// GET /api/quests — TECH_SPEC 8.4
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.classCode) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type") as QuestType | null;
  const statusFilter = (searchParams.get("status") ?? "active") as QuestStatus;

  const db = await getDb();

  const conditions = [
    eq(quests.userId, user.id),
    eq(quests.status, statusFilter),
  ];
  if (typeFilter && QUEST_TYPES.includes(typeFilter)) {
    conditions.push(eq(quests.type, typeFilter));
  }

  const rows = await db
    .select()
    .from(quests)
    .where(and(...conditions))
    .orderBy(quests.createdAt);

  return NextResponse.json({ quests: rows });
}

// POST /api/quests — 커스텀 퀘스트 생성
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.classCode) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: {
    title?: string;
    description?: string;
    type?: string;
    difficulty?: string;
    mainStatType?: string;
    estimatedMinutes?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { title, description, difficulty, mainStatType, estimatedMinutes } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "TITLE_REQUIRED" }, { status: 400 });
  }
  if (!difficulty || !QUEST_DIFFICULTIES.includes(difficulty as QuestDifficulty)) {
    return NextResponse.json({ error: "INVALID_DIFFICULTY" }, { status: 400 });
  }
  if (!mainStatType || !MAIN_STAT_TYPES.includes(mainStatType as MainStatType)) {
    return NextResponse.json({ error: "INVALID_STAT_TYPE" }, { status: 400 });
  }

  const diff = difficulty as QuestDifficulty;
  const rewards = DIFFICULTY_REWARDS[diff];

  const db = await getDb();
  const id = newQuestId();

  await db.insert(quests).values({
    id,
    userId: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    type: "custom",
    difficulty: diff,
    mainStatType: mainStatType as MainStatType,
    xpRewardBase: rewards.xpRewardBase,
    statReward: rewards.statReward,
    estimatedMinutes: estimatedMinutes ?? null,
  });

  return NextResponse.json({ id }, { status: 201 });
}
