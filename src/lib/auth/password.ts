// LV UP — 비밀번호 해싱 (PBKDF2 + SHA-256 + Web Crypto)
//
// 왜 PBKDF2인가:
//   - Web Crypto가 네이티브 지원 → workerd / Node 런타임 모두에서 동일하게 동작
//   - bcrypt/argon2는 native bindings라 Workers Edge 환경에서 문제가 잦음
//   - MVP 기준 보안 수준으로 충분 (2^17 iterations)
//
// 저장 포맷: `{salt_hex}:{hash_hex}` — 마이그레이션 비용 없이 파라미터 교체 가능.

const ITERATIONS = 131_072; // 2^17
const KEY_LENGTH_BITS = 256;
const SALT_LENGTH_BYTES = 16;

// Uint8Array를 명시적으로 ArrayBuffer 기반으로 생성한다.
// TS 5.7+에서 Uint8Array의 기본 타입이 Uint8Array<ArrayBufferLike>이 되었고,
// 이는 workers-types의 BufferSource (ArrayBuffer만 허용)와 호환되지 않는다.
function allocBytes(length: number): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new ArrayBuffer(length));
}

function toHex(bytes: Uint8Array<ArrayBuffer>): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = allocBytes(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function pbkdf2(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  const passwordBytes = new TextEncoder().encode(password);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBytes as BufferSource,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH_BITS,
  );
  return new Uint8Array(derived);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = allocBytes(SALT_LENGTH_BYTES);
  crypto.getRandomValues(salt);
  const hash = await pbkdf2(password, salt);
  return `${toHex(salt)}:${toHex(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = fromHex(saltHex);
  const expected = fromHex(hashHex);
  const actual = await pbkdf2(password, salt);
  return timingSafeEqual(expected, actual);
}

function timingSafeEqual(
  a: Uint8Array<ArrayBuffer>,
  b: Uint8Array<ArrayBuffer>,
): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
