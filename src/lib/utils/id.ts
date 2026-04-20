// LV UP — ID 생성 유틸
// TECH_SPEC 6.5 — prefix를 붙여 디버깅 편의를 확보한다.

function randomId(): string {
  // Web Crypto: workerd / Node 20+ 공통 지원
  const bytes = new Uint8Array(new ArrayBuffer(16));
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("");
}

export function newUserId(): string {
  return `usr_${randomId()}`;
}

export function newSessionId(): string {
  return `ses_${randomId()}`;
}

export function newQuestId(): string {
  return `qst_${randomId()}`;
}

export function newVerificationId(): string {
  return `vrf_${randomId()}`;
}

export function newRoleTagId(): string {
  return `rtg_${randomId()}`;
}

export function newQuestMediaId(): string {
  return `qmd_${randomId()}`;
}

export function newGrowthLogId(): string {
  return `glg_${randomId()}`;
}

export function newLevelEventId(): string {
  return `lvl_${randomId()}`;
}

export function newBadgeId(): string {
  return `bdg_${randomId()}`;
}

export function newUserBadgeId(): string {
  return `ubd_${randomId()}`;
}

export function newVerdictId(): string {
  return `vrd_${randomId()}`;
}
