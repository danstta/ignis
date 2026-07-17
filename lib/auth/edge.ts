/**
 * Edge-safe auth helpers for `proxy.ts`. Kept separate from `lib/auth/index.ts`
 * because that module pulls in `next/headers` and the full provider, which
 * don't belong in middleware. Part of the `lib/auth` seam.
 */

import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";

/**
 * Optimistic session check: cookie presence only, no DB call (middleware runs
 * on every request). Sensitive code paths must still call `requireUser()`.
 */
export function hasSessionCookie(req: NextRequest): boolean {
  return getSessionCookie(req) !== null;
}
