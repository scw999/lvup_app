import type { Config } from "drizzle-kit";

// LV UP — Drizzle Kit 설정
//
// - 마이그레이션 SQL 생성: `npm run db:generate` → migrations/ 폴더에 0000_*.sql 생성
// - D1 적용(로컬):       `npx wrangler d1 migrations apply lvup-db --local`
// - D1 적용(프로덕션):   `npx wrangler d1 migrations apply lvup-db --remote`
//
// drizzle-kit은 SQL 생성만 담당하고, D1 네트워크 조작은 wrangler에 위임한다.
// 따라서 CF 크리덴셜은 이 파일에 필요 없다.
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  verbose: true,
  strict: true,
} satisfies Config;
