import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getEmptyStateMessage } from "@/lib/messages/empty-states";
import { GrowthLogClient } from "@/components/log/growth-log-client";

export const metadata: Metadata = {
  title: "성장 로그",
};

// /log — PRD 16.2 화면 6
export default async function LogPage() {
  await requireOnboardedUser();
  const emptyMessage = getEmptyStateMessage("no_growth_log");
  return <GrowthLogClient emptyMessage={emptyMessage} />;
}
