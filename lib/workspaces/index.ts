/**
 * Workspaces: the tenancy layer. Server code resolves the caller's active
 * workspace via `requireWorkspace()`/`getActiveWorkspace()` and passes its id
 * into every domain service call. See Plans/saas-architecture.md (Phase B).
 */
export {
  getActiveWorkspace,
  requireWorkspace,
  type WorkspaceContext,
} from "./context";
export {
  createWorkspaceWithOwner,
  ensurePersonalWorkspace,
  listUserWorkspaces,
  type WorkspaceRole,
  type WorkspaceSummary,
} from "./service";
export { ACTIVE_WORKSPACE_COOKIE } from "./cookie";
