import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, type AuthUser } from "@/lib/auth";
import { ACTIVE_WORKSPACE_COOKIE } from "./cookie";
import {
  ensurePersonalWorkspace,
  listUserWorkspaces,
  type WorkspaceSummary,
} from "./service";

/** The verified caller of the current request: session user + active workspace. */
export type WorkspaceContext = {
  user: AuthUser;
  /** The workspace every domain query in this request must be scoped to. */
  workspace: WorkspaceSummary;
  /** All workspaces the user belongs to (feeds the sidebar switcher). */
  memberships: WorkspaceSummary[];
};

/**
 * Session user + active workspace, or null when the request is anonymous.
 * The active workspace is the `ignis-workspace` cookie when it names a
 * workspace the user belongs to, else the first membership — created
 * just-in-time for brand-new (or pre-workspace) accounts. Memoized per
 * request, so layouts, pages and route handlers can all call it freely.
 */
export const getActiveWorkspace = cache(
  async (): Promise<WorkspaceContext | null> => {
    const session = await getSession();
    if (!session) return null;
    let memberships = await listUserWorkspaces(session.user.id);
    if (memberships.length === 0) {
      memberships = [
        await ensurePersonalWorkspace(session.user.id, session.user.name),
      ];
    }
    const preferred = (await cookies()).get(ACTIVE_WORKSPACE_COOKIE)?.value;
    const workspace =
      memberships.find((w) => w.id === preferred) ?? memberships[0];
    return { user: session.user, workspace, memberships };
  },
);

/**
 * Like {@link getActiveWorkspace} but anonymous requests are redirected to
 * /login. Use in server components and server actions; API route handlers
 * should null-check getActiveWorkspace and respond 401 instead (a redirect is
 * the wrong shape for fetch callers).
 */
export async function requireWorkspace(): Promise<WorkspaceContext> {
  const ctx = await getActiveWorkspace();
  if (!ctx) redirect("/login");
  return ctx;
}
