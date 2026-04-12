"use client";

import { useEffect } from "react";

// Service Worker 등록 — PWA 홈 화면 추가 + 오프라인 기본 대응
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return null;
}
