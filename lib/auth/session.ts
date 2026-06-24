/**
 * Minimal HMAC-signed session token. Runtime-agnostic (Web Crypto only) so it
 * works in both the edge `proxy.ts` and Node route handlers / server actions.
 *
 * Token format: `<payloadB64Url>.<signatureB64Url>` where payload is `{ exp }`.
 */

export const COOKIE_NAME = "da_session";

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const b64 =
    s.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(sig));
}

export async function createToken(
  secret: string,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<string> {
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ exp: Date.now() + ttlMs })),
  );
  const sig = await sign(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyToken(
  secret: string,
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await sign(secret, payload);
  if (!safeEqual(sig, expected)) return false;
  try {
    const { exp } = JSON.parse(decoder.decode(fromBase64Url(payload)));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}
