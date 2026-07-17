/**
 * App-facing entitlements API — the seam between the app and the billing
 * provider. Mirrors the `lib/auth` seam: app code imports ONLY from
 * `@/lib/entitlements`; the plan-resolution implementation lives in
 * `lib/entitlements/impl/` and is swappable (self-hosted unlimited here; a
 * subscription-backed impl in the cloud overlay) without touching any caller.
 *
 * Enforcement helpers live in `./enforce` and are re-exported here so callers
 * have a single import site.
 */

import { getWorkspaceEntitlements } from "./impl/self-hosted";

export {
  EntitlementLimitError,
  assertRunQuota,
  assertStorageQuota,
  assertSeatQuota,
} from "./enforce";

/**
 * Plan limits for one workspace. `null` means unlimited — the self-hosted
 * default for every limit, so a forked deployment never hits a wall.
 */
export type Entitlements = {
  /** Plan identifier, e.g. "self-hosted"; the cloud overlay maps its tiers here. */
  plan: string;
  /** Workflow runs allowed per calendar month (UTC), or null for unlimited. */
  maxRunsPerMonth: number | null;
  /** Total stored asset bytes allowed, or null for unlimited. */
  maxStorageBytes: number | null;
  /** Workspace members allowed, or null for unlimited. */
  maxSeats: number | null;
};

/** The workspace's current plan limits. */
export async function getEntitlements(
  workspaceId: string,
): Promise<Entitlements> {
  return getWorkspaceEntitlements(workspaceId);
}
