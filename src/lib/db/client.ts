import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

// LV UP — D1 클라이언트 헬퍼
//
// 사용 예:
//   import { getDb } from "@/lib/db/client";
//   const db = await getDb();
//   const rows = await db.select().from(users).limit(1);
//
// 런타임 동작:
//   - 프로덕션: Workers 런타임의 env.DB 바인딩을 그대로 사용
//   - `next dev`: initOpenNextCloudflareForDev가 wrangler의 로컬 D1
//     (.wrangler/state/v3/d1/)을 env.DB로 주입
//
// wrangler.toml의 [[d1_databases]] 블록이 주석 해제되어 있어야 env.DB가 존재한다.
export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });

  if (!env.DB) {
    throw new Error(
      "D1 바인딩(env.DB)을 찾을 수 없습니다. wrangler.toml의 [[d1_databases]] " +
        "블록이 주석 해제되어 있고 `npx wrangler d1 create lvup-db` 후 " +
        "database_id가 설정되어 있는지 확인하세요.",
    );
  }

  return drizzle(env.DB, { schema });
}

export type Db = Awaited<ReturnType<typeof getDb>>;
