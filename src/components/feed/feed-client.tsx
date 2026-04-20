"use client";

import { useEffect, useState, useCallback } from "react";
import { VerificationCard, type FeedItem } from "./verification-card";

type FeedResponse = {
  items: FeedItem[];
  hasMore: boolean;
  nextOffset: number;
};

export function FeedClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);

  const fetchFeed = useCallback(async (offset: number, append: boolean) => {
    if (offset === 0) setLoading(true); else setLoadingMore(true);
    try {
      const res = await fetch(`/api/feed?offset=${offset}`);
      const data = (await res.json()) as FeedResponse;
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setHasMore(data.hasMore);
      setNextOffset(data.nextOffset);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchFeed(0, false); }, [fetchFeed]);

  if (loading) {
    return (
      <main className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold tracking-wider">활동 피드</h1>
        <div className="py-16 text-center text-sm text-[--color-text-faint]">로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-wider">활동 피드</h1>
        <span className="system-label">공개 인증</span>
      </div>

      {items.length === 0 ? (
        <div className="system-frame py-16 text-center">
          <p className="text-sm leading-relaxed text-[--color-text-muted]">
            아직 공개된 인증이 없다.
          </p>
          <p className="mt-2 text-xs text-[--color-text-faint]">
            퀘스트를 인증하면 여기에 표시된다.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <VerificationCard key={item.id} item={item} isLoggedIn={isLoggedIn} />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => fetchFeed(nextOffset, true)}
              disabled={loadingMore}
              className="w-full rounded-xl border border-[--color-border] py-3 text-sm text-[--color-text-muted] transition-colors hover:border-[--color-accent]/30 hover:text-[--color-text] disabled:opacity-50"
            >
              {loadingMore ? "불러오는 중..." : "더 보기"}
            </button>
          )}
        </>
      )}
    </main>
  );
}
