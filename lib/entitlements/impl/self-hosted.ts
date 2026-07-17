import type { Entitlements } from "..";

/**
 * Self-hosted implementation: every workspace is unlimited. The cloud overlay
 * replaces this file with a lookup against subscription state, keyed by the
 * workspace id the seam passes in.
 */
export const getWorkspaceEntitlements: (
  workspaceId: string,
) => Promise<Entitlements> = async () => ({
  plan: "self-hosted",
  maxRunsPerMonth: null,
  maxStorageBytes: null,
  maxSeats: null,
});
