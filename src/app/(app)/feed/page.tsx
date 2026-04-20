import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { FeedClient } from "@/components/feed/feed-client";

export const metadata: Metadata = { title: "활동 피드" };

export default async function FeedPage() {
  const user = await getCurrentUser();
  return <FeedClient isLoggedIn={!!user} />;
}
