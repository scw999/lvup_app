import { eq, and } from "drizzle-orm";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { quests } from "@/lib/db/schema";
import { QuestListClient } from "@/components/quests/quest-list-client";

export const metadata: Metadata = {
  title: "퀘스트",
};

// /quests — PRD 16.2 화면 3
// Server Component: initial data load, then client handles tabs + create modal
export default async function QuestsPage() {
  const user = await requireOnboardedUser();
  const db = await getDb();

  const activeQuests = await db
    .select()
    .from(quests)
    .where(and(eq(quests.userId, user.id), eq(quests.status, "active")))
    .orderBy(quests.createdAt);

  return <QuestListClient initialQuests={activeQuests} />;
}
