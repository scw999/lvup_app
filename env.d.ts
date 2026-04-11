/// <reference types="@cloudflare/workers-types" />

// LV UP — Cloudflare 바인딩 타입
// 이 파일은 수동 관리되는 폴백이다. 실제 동기화는
//   npm run cf-typegen
// 으로 생성되는 cloudflare-env.d.ts가 우선한다.
declare global {
  interface CloudflareEnv {
    DB: D1Database;
    BUCKET: R2Bucket;
    ASSETS: Fetcher;
    APP_URL: string;
    NODE_ENV: string;
    AUTH_SECRET: string;
  }
}

export {};
