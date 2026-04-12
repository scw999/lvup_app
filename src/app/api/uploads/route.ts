import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/auth";

// POST /api/uploads — R2 직접 업로드
//
// TECH_SPEC 11 — MVP에서는 Workers 바인딩을 통한 직접 업로드.
// Workers body limit (6MB)으로 대부분 사진 커버 가능.
// Phase 2에서 presigned URL 방식으로 전환 예정.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  // multipart/form-data 처리
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "MULTIPART_REQUIRED" },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "INVALID_FORM_DATA" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "INVALID_FILE_TYPE" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
  }

  // Generate unique key
  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const key = `${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { env } = await getCloudflareContext({ async: true });

  if (!env.BUCKET) {
    return NextResponse.json(
      { error: "R2_NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  await env.BUCKET.put(key, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  });

  // R2 public URL — needs custom domain or public bucket access.
  // For MVP, construct the URL from the bucket's public access.
  // Users will need to enable public access on the R2 bucket.
  const fileUrl = `/api/uploads/${key}`;

  return NextResponse.json({ fileUrl, key }, { status: 201 });
}
