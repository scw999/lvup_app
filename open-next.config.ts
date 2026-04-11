import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sprint 1: 최소 구성. ISR/tagCache 미사용.
// 나중에 ISR이 필요해지면 r2IncrementalCache를 도입하고
// wrangler.toml에 NEXT_INC_CACHE_R2_BUCKET 바인딩 추가.
export default defineCloudflareConfig({});
