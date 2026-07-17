"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACTIVE_WORKSPACE_COOKIE,
  createWorkspaceWithOwner,
  requireWorkspace,
} from "@/lib/workspaces";

async function setActiveWorkspaceCookie(workspaceId: string) {
  (await cookies()).set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/**
 * Switch the active workspace, then land on the dashboard. The redirect
 * remounts every workspace-scoped page/layout, flushing client state that was
 * hydrated from the previous workspace.
 */
export async function switchWorkspaceAction(workspaceId: string) {
  const ctx = await requireWorkspace();
  if (!ctx.memberships.some((m) => m.id === workspaceId)) {
    throw new Error("You are not a member of that workspace");
  }
  await setActiveWorkspaceCookie(workspaceId);
  redirect("/");
}

/** Create a workspace owned by the caller and switch into it. */
export async function createWorkspaceAction(name: string) {
  const ctx = await requireWorkspace();
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) throw new Error("Workspace name is required");
  if (trimmed.length > 80) throw new Error("Workspace name is too long");
  const ws = await createWorkspaceWithOwner(ctx.user.id, trimmed);
  await setActiveWorkspaceCookie(ws.id);
  redirect("/");
}
