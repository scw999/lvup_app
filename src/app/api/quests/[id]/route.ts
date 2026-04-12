import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { quests } from "@/lib/db/schema";

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
