import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/auth";

// GET /api/uploads/:key — R2에서 이미지 읽어 반환
// MVP 단순 구현. Phase 2에서 R2 커스텀 도메인(CDN)으로 전환.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { key } = await params;
  const objectKey = key.join("/");

  const { env } = await getCloudflareContext({ async: true });
  if (!env.BUCKET) {
    return NextResponse.json({ error: "R2_NOT_CONFIGURED" }, { status: 500 });
  }

  const object = await env.BUCKET.get(objectKey);
  if (!object) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType ?? "application/octet-stream",
  );
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new NextResponse(object.body as ReadableStream, { headers });
}
