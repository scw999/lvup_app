import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// next dev 프로세스에 wrangler.toml의 CF 바인딩(D1, R2 등)을 주입한다.
// 이 호출이 없으면 개발 서버에서 getCloudflareContext()가 비어 있다.
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
