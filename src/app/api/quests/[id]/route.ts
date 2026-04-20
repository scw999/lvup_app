import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { quests } from "@/lib/db/schema";

// PATCH /api/quests/:id — 상태 변경 (archive)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || !user.classCode) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;
  let body: { status?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }

  const { status } = body;
  if (status !== "archived") {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  const db = await getDb();
  const quest = await db.select().from(quests).where(and(eq(quests.id, id), eq(quests.userId, user.id))).get();
  if (!quest) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (quest.status === "completed") return NextResponse.json({ error: "CANNOT_ARCHIVE_COMPLETED" }, { status: 409 });

  await db.update(quests).set({ status: "archived" }).where(eq(quests.id, id));
  return NextResponse.json({ success: true });
}

// DELETE /api/quests/:id — custom/archived 퀘스트만 삭제 가능
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const db = await getDb();
  const quest = await db.select().from(quests).where(and(eq(quests.id, id), eq(quests.userId, user.id))).get();
  if (!quest) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (quest.type === "daily" && quest.status === "active") {
    return NextResponse.json({ error: "CANNOT_DELETE_ACTIVE_DAILY" }, { status: 409 });
  }

  await db.delete(quests).where(eq(quests.id, id));
  return NextResponse.json({ success: true });
}

// GET /api/quests/:id — TECH_SPEC 8.4
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || !user.classCode) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;
  const db = await getDb();

  const quest = await db
    .select()
    .from(quests)
    .where(and(eq(quests.id, id), eq(quests.userId, user.id)))
    .get();

  if (!quest) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ quest });
}
