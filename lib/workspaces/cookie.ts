/**
 * Cookie naming the user's active workspace. Read during request-time workspace
 * resolution (lib/workspaces/context); written ONLY by the switch-workspace
 * server action so a switch always pairs with a full navigation (client stores
 * cache workspace-scoped data). An invalid/stale value is harmless — resolution
 * falls back to the user's first membership.
 */
export const ACTIVE_WORKSPACE_COOKIE = "ignis-workspace";
